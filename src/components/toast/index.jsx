import { useEffect } from "react";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import styles from "./styles.module.css";

const toastIcons = {
    success: FiCheckCircle,
    error: FiAlertCircle,
    info: FiInfo,
    warning: FiAlertCircle,
};

const Toast = ({ toast, onDismiss }) => {
    useEffect(() => {
        if (!toast) return undefined;
        const timer = window.setTimeout(onDismiss, 4200);
        return () => window.clearTimeout(timer);
    }, [toast, onDismiss]);

    if (!toast) return null;
    const Icon = toastIcons[toast.type] ?? FiInfo;

    return (
        <div className={`${styles.toast} ${styles[toast.type] ?? ""}`} role="status" aria-live="polite">
            <Icon aria-hidden="true" className={styles.icon} />
            <p>{toast.message}</p>
            <button aria-label="Dismiss notification" className={styles.close} onClick={onDismiss} type="button">
                <FiX aria-hidden="true" />
            </button>
        </div>
    );
};

export default Toast;