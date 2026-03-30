import { useState, useCallback } from "react";
import { StockAlert } from "@workspace/api-client-react";

export function useSmartAlert() {
  const [activeAlert, setActiveAlert] = useState<StockAlert | null>(null);

  const triggerAlert = useCallback((alert: StockAlert) => {
    if (alert.triggered) {
      setActiveAlert(alert);
    }
  }, []);

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  return {
    activeAlert,
    triggerAlert,
    dismissAlert,
  };
}
