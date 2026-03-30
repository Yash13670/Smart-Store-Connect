import { Router, type IRouter } from "express";
import { db, productsTable, transactionsTable, walletTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { GetInventoryResponse, UpdateInventoryBody, UpdateInventoryParams, CreateTransactionBody, GetPredictionsQueryParams, ApproveLoanBody, GetWalletResponse, ApproveLoanResponse } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

const WEATHER_MULTIPLIERS: Record<string, Record<string, number>> = {
  normal: { milk: 1.0, bread: 1.0, biscuits: 1.0, tea: 1.0 },
  rainy: { milk: 1.4, bread: 1.1, biscuits: 1.1, tea: 1.5 },
  festival: { milk: 1.2, bread: 1.6, biscuits: 1.7, tea: 1.2 },
};

function getStatus(current: number, threshold: number): "safe" | "low" | "critical" {
  if (current <= threshold * 0.5) return "critical";
  if (current <= threshold) return "low";
  return "safe";
}

router.get("/inventory", async (req, res) => {
  const products = await db.select().from(productsTable);
  const result = products.map((p) => ({
    ...p,
    status: getStatus(p.currentStock, p.reorderThreshold),
  }));
  const parsed = GetInventoryResponse.parse(result);
  res.json(parsed);
});

router.patch("/inventory/:productId", async (req, res) => {
  const { productId } = UpdateInventoryParams.parse(req.params);
  const { stock } = UpdateInventoryBody.parse(req.body);

  const [updated] = await db
    .update(productsTable)
    .set({ currentStock: stock })
    .where(eq(productsTable.id, productId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json({ ...updated, status: getStatus(updated.currentStock, updated.reorderThreshold) });
});

router.get("/transactions", async (req, res) => {
  const txns = await db
    .select()
    .from(transactionsTable)
    .orderBy(desc(transactionsTable.timestamp))
    .limit(50);

  res.json(
    txns.map((t) => ({
      ...t,
      timestamp: t.timestamp.toISOString(),
    }))
  );
});

router.post("/transactions", async (req, res) => {
  const { productId, quantity } = CreateTransactionBody.parse(req.body);

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  if (product.currentStock < quantity) {
    res.status(400).json({ error: "Insufficient stock" });
    return;
  }

  const total = product.price * quantity;
  const txnId = randomUUID();

  const [txn] = await db
    .insert(transactionsTable)
    .values({
      id: txnId,
      productId,
      productName: product.name,
      quantity,
      price: product.price,
      total,
      timestamp: new Date(),
    })
    .returning();

  const newStock = product.currentStock - quantity;
  const [updatedProduct] = await db
    .update(productsTable)
    .set({ currentStock: newStock })
    .where(eq(productsTable.id, productId))
    .returning();

  const status = getStatus(newStock, product.reorderThreshold);
  const alertTriggered = status === "low" || status === "critical";

  let alert = null;
  if (alertTriggered) {
    const reorderQty = product.maxStock - newStock;
    const orderCost = reorderQty * product.price;
    const [wallet] = await db.select().from(walletTable);
    const walletBalance = wallet?.balance ?? 0;
    alert = {
      triggered: true,
      productId,
      productName: product.name,
      currentStock: newStock,
      reorderQty,
      orderCost,
      walletBalance,
      needsLoan: orderCost > walletBalance,
    };
  } else {
    alert = { triggered: false };
  }

  res.status(201).json({
    transaction: { ...txn, timestamp: txn.timestamp.toISOString() },
    updatedInventory: { ...updatedProduct, status },
    alert,
  });
});

router.get("/predictions", async (req, res) => {
  const { dayType } = GetPredictionsQueryParams.parse(req.query);
  const multipliers = WEATHER_MULTIPLIERS[dayType ?? "normal"];

  const products = await db.select().from(productsTable);

  const recentTxns = await db
    .select()
    .from(transactionsTable)
    .orderBy(desc(transactionsTable.timestamp))
    .limit(50);

  const predictions = products.map((product) => {
    const productTxns = recentTxns
      .filter((t) => t.productId === product.id)
      .slice(0, 5);

    const burnRate =
      productTxns.length > 0
        ? productTxns.reduce((sum, t) => sum + t.quantity, 0) / productTxns.length
        : 2;

    const weatherMultiplier = multipliers[product.id] ?? 1.0;
    const predictedDemand = Math.ceil(burnRate * weatherMultiplier);

    const confidence = productTxns.length >= 5 ? "High" : productTxns.length >= 2 ? "Medium" : "Low";

    return {
      productId: product.id,
      productName: product.name,
      burnRate: Math.round(burnRate * 10) / 10,
      predictedDemand,
      weatherMultiplier,
      confidence,
    };
  });

  res.json(predictions);
});

router.get("/wallet", async (req, res) => {
  const [wallet] = await db.select().from(walletTable);
  const data = GetWalletResponse.parse(wallet ?? { balance: 5000, currency: "INR" });
  res.json(data);
});

router.post("/wallet/loan", async (req, res) => {
  const { amount } = ApproveLoanBody.parse(req.body);

  let [wallet] = await db.select().from(walletTable);

  if (!wallet) {
    [wallet] = await db
      .insert(walletTable)
      .values({ id: "main", balance: 5000, currency: "INR" })
      .returning();
  }

  const [updated] = await db
    .update(walletTable)
    .set({ balance: wallet.balance + amount })
    .where(eq(walletTable.id, "main"))
    .returning();

  const data = ApproveLoanResponse.parse(updated);
  res.json(data);
});

export default router;
