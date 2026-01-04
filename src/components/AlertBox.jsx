import React, { useEffect, useState } from "react";
import { useAlertContext } from "../context/AlertContext";
import { CircleAlert, X } from "lucide-react";

const AlertBox = () => {
  const [mounted, setMounted] = useState(false);
  const { alert, hideAlert } = useAlertContext();
  let alertTimeout = null;

  useEffect(() => {
    if (alert.visible && !mounted) {
      setMounted(true);
      alertTimeout = setTimeout(() => {
        setMounted(false);
        hideAlert();
      }, 1000);
    }
    return () => clearTimeout(alertTimeout);
  }, [alert?.visible]);
  const handleClose = () => {
    setMounted(false);
    clearTimeout(alertTimeout);
    hideAlert();
  };
  if (!alert.visible) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={
        `fixed inset-x-4 top-4 z-50 flex justify-center  transform transition-all duration-220 ease-in-out border-danger` +
        (mounted
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-32 scale-70")
      }
    >
      <div className="ea-card w-full max-w-md sm:max-w-lg bg-gradient-to-br from-gray-900/95 to-gray-800/95  text-theme-primary rounded-xl border shadow-rose-400/30 shadow-lg  border-pink500/90 p-4 sm:p-5 transform">
        <div className="relative flex gap-3 items-start">
          <div className="flex-shrink-0 mt-0.5">
            <CircleAlert className="text-pink" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm sm:text-base text-theme-primary font-bold">
                  {alert.heading || "Error"}
                </p>
                <p className="mt-1 text-sm sm:text-sm text-theme-primary leading-snug">
                  {alert.message || "An unexpected error occurred."}
                </p>
              </div>

              <button
                onClick={handleClose}
                aria-label="Dismiss error"
                className="ml-3 p-1.5 rounded-xl border-2 border-transparent text-accent-primary100 hover:border-accent-primary/90 hover:border-2 active:scale-95 transition hover:cursor-pointer"
              >
                <X />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertBox;
