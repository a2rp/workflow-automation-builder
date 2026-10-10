export const titleCase = (value = "") => value.charAt(0).toUpperCase() + value.slice(1);

export const getWorkflowName = (workflows, workflowId) =>
    workflows.find((workflow) => workflow.id === workflowId)?.name ?? "Deleted workflow";

export const getNodeIconName = (type) => {
    const icons = { trigger: "bolt", condition: "branch", action: "play", delay: "clock" };
    return icons[type] ?? "play";
};

export const formatTime = (value) =>
    new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value));

export const downloadCsv = (rows, filename) => {
    if (!rows.length) return false;
    const escapeValue = (value) => '"' + String(value ?? "").replaceAll('"', '""') + '"';
    const content = rows.map((row) => row.map(escapeValue).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    return true;
};