import { useEffect, useRef } from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import styles from "./styles.module.css";

const Dialog = ({ title, description, children, onClose, onConfirm, confirmLabel = "Confirm", cancelLabel = "Cancel", danger = false, confirmDisabled = false, hideConfirm = false }) => {
    const cancelRef = useRef(null);
    const dialogRef = useRef(null);

    useEffect(() => {
        cancelRef.current?.focus();
        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose();
            if (event.key !== "Tab" || !dialogRef.current) return;
            const focusable = [...dialogRef.current.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]")];
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div className={styles.backdrop} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <section aria-describedby="dialog-description" aria-labelledby="dialog-title" aria-modal="true" className={styles.dialog} ref={dialogRef} role="dialog">
                <header className={styles.header}>
                    <div>
                        <h2 id="dialog-title">{title}</h2>
                        {description && <p id="dialog-description">{description}</p>}
                    </div>
                    <button aria-label="Close dialog" className={styles.close} onClick={onClose} type="button"><FiX aria-hidden="true" /></button>
                </header>
                <div className={styles.body}>{children}</div>
                <footer className={styles.footer}>
                    <button className={styles.secondary} onClick={onClose} ref={cancelRef} type="button">{cancelLabel}</button>
                    {!hideConfirm && <button className={`${styles.primary} ${danger ? styles.danger : ""}`} disabled={confirmDisabled} onClick={onConfirm} type="button">
                        {danger && <FiAlertTriangle aria-hidden="true" />}{confirmLabel}
                    </button>}
                </footer>
            </section>
        </div>
    );
};

export default Dialog;