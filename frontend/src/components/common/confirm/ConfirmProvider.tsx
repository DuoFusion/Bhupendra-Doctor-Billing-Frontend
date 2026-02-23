import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { Modal } from "antd";
import { DeleteFilled, ExclamationCircleFilled, SmileFilled } from "@ant-design/icons";

type ConfirmIntent = "danger" | "neutral";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  intent?: ConfirmIntent;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

const defaultOptions: Required<ConfirmOptions> = {
  title: "Please Confirm",
  message: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
  intent: "danger",
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const confirm = useCallback<ConfirmFn>((incomingOptions) => {
    return new Promise<boolean>((resolve) => {
      const merged = { ...defaultOptions, ...incomingOptions };
      const isDanger = merged.intent === "danger";
      const iconNode = isDanger ? (
        <span className="confirm-cartoon-icon confirm-cartoon-danger">
          <DeleteFilled />
          <ExclamationCircleFilled className="confirm-cartoon-badge" />
        </span>
      ) : (
        <span className="confirm-cartoon-icon confirm-cartoon-neutral">
          <SmileFilled />
        </span>
      );

      Modal.confirm({
        centered: true,
        className: "app-confirm-modal",
        title: (
          <div className="app-confirm-heading">
            {iconNode}
            <div className="app-confirm-heading-text">{merged.title}</div>
          </div>
        ),
        content: <div className="app-confirm-content">{merged.message}</div>,
        icon: null,
        okText: merged.confirmText,
        cancelText: merged.cancelText,
        okButtonProps: isDanger ? { danger: true } : { type: "primary" },
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }, []);

  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return context;
};
