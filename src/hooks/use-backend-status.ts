import { useState, useEffect, useCallback } from "react";
import api from "@/services/api";

export const useBackendStatus = () => {
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(
    null
  );
  const [isChecking, setIsChecking] = useState(true);

  const checkBackendStatus = useCallback(async () => {
    try {
      // Intentar hacer una petición al endpoint de health check
      const response = await api.get("/health", { timeout: 5000 });
      if (response.data.success) {
        setIsBackendAvailable(true);
        console.log("🌐 Backend is available - Connected to server");
        return true;
      } else {
        setIsBackendAvailable(false);
        console.log("🔌 Backend health check failed, using offline mode");
        return false;
      }
    } catch (error) {
      setIsBackendAvailable(false);
      console.log("🔌 Backend is not available, using offline mode", error.message);
      return false;
    }
  }, []);

  useEffect(() => {
    const performInitialCheck = async () => {
      await checkBackendStatus();
      setIsChecking(false);
    };

    performInitialCheck();

    // Check backend status every 30 seconds if it's currently offline
    const interval = setInterval(async () => {
      if (isBackendAvailable === false) {
        console.log("🔄 Rechecking backend status...");
        await checkBackendStatus();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [checkBackendStatus, isBackendAvailable]);

  return { isBackendAvailable, isChecking, recheckStatus: checkBackendStatus };
};
