
export type ToastKind = "success" | "info" | "warning";

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
