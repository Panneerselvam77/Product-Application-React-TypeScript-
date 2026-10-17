import { toast } from "react-toastify";
import type { ToastContent } from "react-toastify";

export type ToastKind = "success" | "info" | "warning";

export const AUTO_CLOSE = 2000;
export const UNDO_CLOSE = 5000;

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
