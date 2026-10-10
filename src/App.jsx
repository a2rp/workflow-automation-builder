import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { makeId, makeRunForWorkflow, initialRuns, initialWorkflows, makeStarterNodes } from "./data.js";
import AppRoutes from "./AppRoutes.jsx";
import Dialog from "./components/dialog";
import Footer from "./components/footer";
import Header from "./components/header";
import Toast from "./components/toast";
import styles from "./App.module.css";

const triggerChoices = ["New form submission", "New webhook event", "Scheduled time", "New record in an app"];

const App = () => {
    const [workflows, setWorkflows] = useState(initialWorkflows);
    const [runs, setRuns] = useState(initialRuns);
    const [toast, setToast] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newTrigger, setNewTrigger] = useState(triggerChoices[0]);
    const navigate = useNavigate();
    const location = useLocation();
    const inEditor = location.pathname.startsWith("/builder/");

    const showToast = useCallback((message, type = "success") => {
        setToast({ id: Date.now(), message, type });
    }, []);
    const dismissToast = useCallback(() => setToast(null), []);

    const createWorkflow = useCallback((name, triggerTitle = triggerChoices[0], sourceTemplate) => {
        const id = makeId("flow");
        const nodes = sourceTemplate
            ? sourceTemplate.nodes.map((node) => ({ ...node, id: makeId("step") }))
            : makeStarterNodes(triggerTitle).map((node) => ({ ...node, id: makeId("step") }));
        const workflow = {
            id,
            name: name.trim(),
            status: "Draft",
            updatedAt: new Date().toISOString(),
            runs: 0,
            owner: "You",
            nodes,
        };
        setWorkflows((current) => [workflow, ...current]);
        setCreateOpen(false);
        setNewName("");
        navigate(`/builder/${id}`);
        return workflow;
    }, [navigate]);

    const updateWorkflow = useCallback((updated) => {
        setWorkflows((current) => current.map((workflow) => workflow.id === updated.id
            ? { ...updated, updatedAt: new Date().toISOString() }
            : workflow));
    }, []);

    const setWorkflowStatus = useCallback((id, status) => {
        setWorkflows((current) => current.map((workflow) => workflow.id === id
            ? { ...workflow, status, updatedAt: new Date().toISOString() }
            : workflow));
        const workflow = workflows.find((item) => item.id === id);
        showToast(`${workflow?.name ?? "Workflow"} ${status === "Active" ? "activated" : "paused"}.`);
    }, [showToast, workflows]);

    const removeWorkflow = useCallback((id) => {
        const workflow = workflows.find((item) => item.id === id);
        setWorkflows((current) => current.filter((item) => item.id !== id));
        setRuns((current) => current.filter((run) => run.workflowId !== id));
        showToast(`${workflow?.name ?? "Workflow"} and its run history were removed.`);
        navigate("/workflows");
    }, [navigate, showToast, workflows]);

    const cloneWorkflow = useCallback((id) => {
        const original = workflows.find((item) => item.id === id);
        if (!original) return;
        const copy = {
            ...original,
            id: makeId("flow"),
            name: `${original.name} copy`,
            status: "Draft",
            runs: 0,
            updatedAt: new Date().toISOString(),
            nodes: original.nodes.map((node) => ({ ...node, id: makeId("step") })),
        };
        setWorkflows((current) => [copy, ...current]);
        showToast(`${copy.name} is ready to edit.`);
        navigate(`/builder/${copy.id}`);
    }, [navigate, showToast, workflows]);

    const createFromTemplate = useCallback((template) => {
        const workflow = createWorkflow(template.name, undefined, template);
        showToast(`${workflow.name} was added as a draft.`);
    }, [createWorkflow, showToast]);

    const addRun = useCallback((workflow, requestedStatus = "Success") => {
        if (!workflow?.nodes.length) {
            showToast("Add at least one step before testing this workflow.", "warning");
            return null;
        }
        const run = makeRunForWorkflow(workflow, requestedStatus);
        setRuns((current) => [run, ...current]);
        setWorkflows((current) => current.map((item) => item.id === workflow.id
            ? { ...item, runs: item.runs + 1, updatedAt: new Date().toISOString() }
            : item));
        showToast("Test run completed with sample data. No connected service was called.", "info");
        return run;
    }, [showToast]);

    const submitNewWorkflow = () => {
        if (!newName.trim()) {
            showToast("Enter a name for your workflow.", "warning");
            return;
        }
        createWorkflow(newName, newTrigger);
    };

    return (
        <div className={`${styles.appShell} ${inEditor ? styles.editorShell : ""}`}>
            <Header onNewWorkflow={() => setCreateOpen(true)} />
            <main className={styles.mainContent} id="main-content">
                <AppRoutes
                    addRun={addRun}
                    cloneWorkflow={cloneWorkflow}
                    createFromTemplate={createFromTemplate}
                    openCreateWorkflow={() => setCreateOpen(true)}
                    removeWorkflow={removeWorkflow}
                    runs={runs}
                    setWorkflowStatus={setWorkflowStatus}
                    showToast={showToast}
                    updateWorkflow={updateWorkflow}
                    workflows={workflows}
                />
            </main>
            {!inEditor && <Footer />}
            <Toast onDismiss={dismissToast} toast={toast} />
            {createOpen && (
                <Dialog
                    confirmDisabled={!newName.trim()}
                    confirmLabel="Create workflow"
                    description="Start with a trigger. You can add and configure steps in the builder."
                    onClose={() => setCreateOpen(false)}
                    onConfirm={submitNewWorkflow}
                    title="New workflow"
                >
                    <form className={styles.createForm} onSubmit={(event) => { event.preventDefault(); submitNewWorkflow(); }}>
                        <label htmlFor="workflow-name">Workflow name</label>
                        <input autoComplete="off" autoFocus id="workflow-name" maxLength={70} onChange={(event) => setNewName(event.target.value)} placeholder="For example, Route new leads" value={newName} />
                        <label htmlFor="workflow-trigger">Start when</label>
                        <select id="workflow-trigger" onChange={(event) => setNewTrigger(event.target.value)} value={newTrigger}>
                            {triggerChoices.map((choice) => <option key={choice}>{choice}</option>)}
                        </select>
                        <button aria-hidden="true" className={styles.hiddenSubmit} tabIndex={-1} type="submit">Create</button>
                        <p>Changes are kept in this browser session only. Refreshing resets the demo data.</p>
                    </form>
                </Dialog>
            )}
        </div>
    );
};

export default App;