import { toast } from "react-toastify";
import type { ToastContent } from "react-toastify";

export const AUTO_CLOSE = 2000;
export const UNDO_CLOSE = 5000; // give people time to click Undo

export type ToastKind = "success" | "info" | "warning";

/**
 * One toast per id. If it's already on screen it is updated in place
 * (and its timer restarts), so rapid clicks don't stack duplicates.
 */
export function notify(
  toastId: string,
  type: ToastKind,
  content: ToastContent,
  autoClose = AUTO_CLOSE,
) {
  if (toast.isActive(toastId)) {
    toast.update(toastId, { render: content, type, autoClose });
  } else {
    toast(content, { toastId, type, autoClose });
  }
}

/** Toast body with an Undo button. */
export function UndoMessage({
  message,
  onUndo,
  closeToast,
}: {
  message: string;
  onUndo: () => void;
  closeToast?: () => void; // injected by react-toastify
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        type="button"
        onClick={() => {
          onUndo();
          closeToast?.();
        }}
        style={{
          padding: "2px 10px",
          border: "1px solid currentColor",
          borderRadius: 6,
          background: "transparent",
          color: "inherit",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Undo
      </button>
    </div>
  );
}
