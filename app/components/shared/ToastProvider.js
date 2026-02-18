"use client";
// Global toast notification system using React Context.
// Usage: const { toast } = useToast(); toast("Message", "success");
import { createContext, useContext, useState, useCallback, useEffect } from "react";

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const TOAST_DURATION = 3500;
const TOAST_STYLES = {
  success: { bg: "#ECFDF5", border: "#A7F3D0", color: "#065F46", icon: "\u2713" },
  error: { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B", icon: "\u2717" },
  info: { bg: "#EFF6FF", border: "#BFDBFE", color: "#1E40AF", icon: "\u2139" },
  warning: { bg: "#FFFBEB", border: "#FDE68A", color: "#92400E", icon: "\u26A0" },
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "info") => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, entering: true }]);
    // Mark as entered (for animation)
    setTimeout(() => setToasts(prev => prev.map(t => t.id === id ? { ...t, entering: false } : t)), 50);
    // Auto dismiss
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, TOAST_DURATION);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast container */}
      {toasts.length > 0 && (
        <div
          style={{
            position: "fixed", bottom: 80, right: 16, zIndex: 9999,
            display: "flex", flexDirection: "column", gap: 8,
            pointerEvents: "none", maxWidth: 360,
          }}
        >
          {toasts.map(t => {
            const s = TOAST_STYLES[t.type] || TOAST_STYLES.info;
            return (
              <div
                key={t.id}
                onClick={() => dismiss(t.id)}
                style={{
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  color: s.color,
                  borderRadius: 12,
                  padding: "10px 16px",
                  fontSize: 13,
                  fontFamily: "'Inter',sans-serif",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  pointerEvents: "auto",
                  cursor: "pointer",
                  opacity: t.entering || t.leaving ? 0 : 1,
                  transform: t.entering ? "translateX(100%)" : t.leaving ? "translateX(100%)" : "translateX(0)",
                  transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
                <span style={{ lineHeight: 1.4 }}>{t.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export default ToastProvider;
