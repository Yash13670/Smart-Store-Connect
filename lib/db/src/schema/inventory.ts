import { pgTable, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  currentStock: integer("current_stock").notNull().default(0),
  reorderThreshold: integer("reorder_threshold").notNull().default(10),
  maxStock: integer("max_stock").notNull().default(100),
  price: real("price").notNull(),
  unit: text("unit").notNull().default("units"),
});

export const insertProductSchema = createInsertSchema(productsTable);
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

export const transactionsTable = pgTable("transactions", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => productsTable.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
  total: real("total").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable);
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;

export const walletTable = pgTable("wallet", {
  id: text("id").primaryKey().default("main"),
  balance: real("balance").notNull().default(5000),
  currency: text("currency").notNull().default("INR"),
});
