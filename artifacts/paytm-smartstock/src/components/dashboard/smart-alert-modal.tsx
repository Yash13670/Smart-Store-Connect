import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StockAlert, useApproveLoan } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Volume2, MessageCircle, Wallet, CheckCircle2, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  alert: StockAlert | null;
  onClose: () => void;
}

type Step = "VOICE_ALERT" | "WHATSAPP" | "LOAN" | "SUCCESS";

export function SmartAlertModal({ alert, onClose }: Props) {
  const [step, setStep] = useState<Step>("VOICE_ALERT");
  const { mutate: approveLoan, isPending: loanPending } = useApproveLoan();
  const queryClient = useQueryClient();

  // Reset step when new alert comes in
  useEffect(() => {
    if (alert) setStep("VOICE_ALERT");
  }, [alert]);

  if (!alert) return null;

  const handleOrderYes = () => {
    setStep("WHATSAPP");
  };

  const handleSendWhatsApp = () => {
    if (alert.needsLoan) {
      setStep("LOAN");
    } else {
      setStep("SUCCESS");
    }
  };

  const handleApproveLoan = () => {
    approveLoan({ data: { amount: alert.orderCost || 0 } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
        setStep("SUCCESS");
      }
    });
  };

  const handleClose = () => {
    setStep("VOICE_ALERT");
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Close button */}
          {step !== "SUCCESS" && (
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <AnimatePresence mode="wait">
            {step === "VOICE_ALERT" && (
              <motion.div 
                key="voice"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-8 text-center"
              >
                <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center relative mb-6">
                  <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping" />
                  <Volume2 className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-3 text-gray-900">Smart Alert</h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Only <span className="font-bold text-rose-500">{alert.currentStock} units</span> of {alert.productName} left. <br/>
                  Reorder {alert.reorderQty} units now?
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={handleClose}
                    className="flex-1 py-3.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Not Now
                  </button>
                  <button 
                    onClick={handleOrderYes}
                    className="flex-1 py-3.5 rounded-xl font-semibold text-white paytm-gradient shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                  >
                    Yes, Reorder
                  </button>
                </div>
              </motion.div>
            )}

            {step === "WHATSAPP" && (
              <motion.div 
                key="whatsapp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-[#efeae2] flex flex-col h-[400px]"
              >
                <div className="bg-[#00a884] text-white p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <PackageCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold">Distributor (Rahul)</h4>
                    <p className="text-xs text-white/80">Online</p>
                  </div>
                </div>
                
                <div className="flex-1 p-4 flex flex-col justify-end">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0, originBottom: 1, originRight: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#d9fdd3] p-4 rounded-2xl rounded-tr-none self-end max-w-[85%] shadow-sm relative"
                  >
                    <p className="text-[#111b21] leading-relaxed">
                      Hi Rahul, please send <strong className="text-primary">{alert.reorderQty} units</strong> of {alert.productName} to the shop tomorrow morning.
                    </p>
                    <span className="text-[10px] text-gray-500 absolute bottom-1 right-2">Just now</span>
                  </motion.div>
                </div>

                <div className="p-4 bg-white/90 backdrop-blur">
                  <button 
                    onClick={handleSendWhatsApp}
                    className="w-full py-3.5 bg-[#00a884] hover:bg-[#018f6f] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" /> Send WhatsApp
                  </button>
                </div>
              </motion.div>
            )}

            {step === "LOAN" && (
              <motion.div 
                key="loan"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-8 text-center"
              >
                <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                  <Wallet className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-3">Insufficient Balance</h3>
                <p className="text-gray-600 mb-6">
                  Your wallet has {formatCurrency(alert.walletBalance || 0)}. 
                  The order costs <strong>{formatCurrency(alert.orderCost || 0)}</strong>.
                </p>
                
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-8 text-left">
                  <h4 className="font-bold text-indigo-900 mb-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Instant Paytm Loan
                  </h4>
                  <p className="text-sm text-indigo-700">Pre-approved zero-interest credit for 7 days to cover your inventory costs.</p>
                </div>

                <button 
                  onClick={handleApproveLoan}
                  disabled={loanPending}
                  className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-primary shadow-lg shadow-indigo-200 hover:shadow-xl transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {loanPending ? "Approving..." : `Approve ${formatCurrency(alert.orderCost || 0)} Loan`}
                </button>
              </motion.div>
            )}

            {step === "SUCCESS" && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 text-center flex flex-col items-center justify-center h-[400px]"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                >
                  <CheckCircle2 className="w-24 h-24 text-emerald-500 mb-6" />
                </motion.div>
                <h3 className="text-2xl font-display font-bold mb-2">Order Completed!</h3>
                <p className="text-gray-500 mb-8">Stock will arrive tomorrow. Inventory predictions updated automatically.</p>
                
                <button 
                  onClick={handleClose}
                  className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors"
                >
                  Back to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Temporary icon to appease imports
function PackageCheck(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m16 16 2 2 4-4"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
}
function Sparkles(props: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>
}
