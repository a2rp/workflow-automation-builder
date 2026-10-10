import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowDown, FiArrowLeft, FiArrowUp, FiBell, FiZap, FiCheck, FiClock, FiGitBranch, FiPlay, FiPlus, FiSave, FiTrash2, FiActivity } from "react-icons/fi";
import Dialog from "../../components/dialog";
import { nodeTypes, makeId } from "../../data.js";
import styles from "./styles.module.css";

const appChoices = ["Webhook", "Schedule", "Webflow", "HubSpot", "Slack", "Stripe", "Gmail", "Customer.io", "Linear", "Asana", "PostgreSQL", "Rules", "Wait"];
const iconByType = { trigger: FiZap, condition: FiGitBranch, action: FiPlay, delay: FiClock };
const defaultNode = (type) => ({
    id: makeId("step"),
    type,
    app: type === "trigger" ? "Webhook" : type === "condition" ? "Rules" : type === "delay" ? "Wait" : "Slack",
    title: type === "trigger" ? "New webhook event" : type === "condition" ? "Check a condition" : type === "delay" ? "Wait for a while" : "Send a notification",
    detail: type === "trigger" ? "Start when an event arrives" : type === "condition" ? "Continue when the rule matches" : type === "delay" ? "Pause before the next step" : "Send a message to your team",
    config: type === "trigger" ? "Incoming event" : type === "condition" ? "Choose a value to check" : type === "delay" ? "15 minutes" : "#general",
});

const BuilderPage = ({ workflows, updateWorkflow, addRun, setWorkflowStatus, showToast }) => {
    const { workflowId } = useParams();
    const workflow = workflows.find((item) => item.id === workflowId);
    const [selectedNodeId, setSelectedNodeId] = useState(workflow?.nodes[0]?.id ?? null);
    const [deleteNode, setDeleteNode] = useState(null);
    const [savedAt, setSavedAt] = useState("All changes saved");
    const selectedNode = useMemo(() => workflow?.nodes.find((node) => node.id === selectedNodeId) ?? workflow?.nodes[0], [selectedNodeId, workflow]);


    if (!workflow) {
        return <div className={styles.missingFlow}><FiGitBranch aria-hidden="true" /><h1>Workflow not found</h1><p>It may have been removed from this demo workspace.</p><Link to="/workflows">Back to workflows</Link></div>;
    }

    const update = (next) => {
        updateWorkflow(next);
        setSavedAt("Unsaved changes");
    };

    const updateNode = (id, changes) => {
        update({ ...workflow, nodes: workflow.nodes.map((node) => node.id === id ? { ...node, ...changes } : node) });
    };

    const addStep = (type) => {
        if (type === "trigger" && workflow.nodes.some((node) => node.type === "trigger")) {
            showToast("A workflow can have one trigger. Add a condition or action instead.", "warning");
            return;
        }
        const node = defaultNode(type);
        update({ ...workflow, nodes: [...workflow.nodes, node] });
        setSelectedNodeId(node.id);
        showToast(`${nodeTypes.find((item) => item.type === type)?.label ?? "Step"} added to the workflow.`);
    };

    const moveNode = (id, direction) => {
        const currentIndex = workflow.nodes.findIndex((node) => node.id === id);
        const targetIndex = currentIndex + direction;
        if (currentIndex < 0 || targetIndex < 0 || targetIndex >= workflow.nodes.length) return;
        const nodes = [...workflow.nodes];
        [nodes[currentIndex], nodes[targetIndex]] = [nodes[targetIndex], nodes[currentIndex]];
        update({ ...workflow, nodes });
    };

    const removeSelectedNode = () => {
        if (!deleteNode) return;
        const nodes = workflow.nodes.filter((node) => node.id !== deleteNode.id);
        update({ ...workflow, nodes });
        setSelectedNodeId(nodes[0]?.id ?? null);
        showToast(`${deleteNode.title} was removed.`);
        setDeleteNode(null);
    };

    const handleSave = () => {
        updateWorkflow(workflow);
        setSavedAt("Saved just now");
        showToast("Workflow changes saved for this session.", "success");
    };

    const handlePublish = () => {
        const nextStatus = workflow.status === "Active" ? "Paused" : "Active";
        setWorkflowStatus(workflow.id, nextStatus);
        setSavedAt("All changes saved");
    };

    const handleTestRun = () => {
        const run = addRun(workflow);
        if (run) setSavedAt("Test completed");
    };

    const activeType = selectedNode?.type ?? "trigger";
    const TypeIcon = iconByType[activeType] ?? FiPlay;

    return (
        <div className={styles.builderPage}>
            <div className={styles.editorToolbar}>
                <div className={styles.breadcrumbs}><Link aria-label="Back to workflows" to="/workflows"><FiArrowLeft aria-hidden="true" /></Link><span>Workflows</span><span className={styles.crumbSlash}>/</span><strong>Builder</strong></div>
                <div className={styles.workflowTitle}><span className={styles.titleMark}><FiGitBranch aria-hidden="true" /></span><input aria-label="Workflow name" maxLength={70} onChange={(event) => update({ ...workflow, name: event.target.value })} value={workflow.name} /><span className={`${styles.statusLabel} ${styles[workflow.status.toLowerCase()]}`}><i />{workflow.status}</span></div>
                <div className={styles.editorActions}>
                    <span className={styles.saveState}><FiCheck aria-hidden="true" />{savedAt}</span>
                    <button className={styles.saveButton} onClick={handleSave} type="button"><FiSave aria-hidden="true" />Save</button>
                    <button className={styles.testButton} onClick={handleTestRun} type="button"><FiPlay aria-hidden="true" />Test run</button>
                    <button className={styles.publishButton} onClick={handlePublish} type="button">{workflow.status === "Active" ? "Pause" : "Publish"}</button>
                </div>
            </div>

            <div className={styles.editorLayout}>
                <aside aria-label="Add workflow steps" className={styles.stepPalette}>
                    <div className={styles.paletteHeading}><span>Build</span><strong>Step library</strong></div>
                    <p>Click a step to add it to the flow.</p>
                    <div className={styles.stepOptions}>
                        {nodeTypes.map((item) => {
                            const Icon = iconByType[item.type] ?? FiActivity;
                            const disabled = item.type === "trigger" && workflow.nodes.some((node) => node.type === "trigger");
                            return <button aria-label={`Add ${item.label}`} className={`${styles.stepOption} ${styles[`option${item.type}`]}`} disabled={disabled} key={item.type} onClick={() => addStep(item.type)} type="button"><span><Icon aria-hidden="true" /></span><span><strong>{item.label}</strong><small>{item.hint}</small></span><FiPlus aria-hidden="true" className={styles.optionPlus} /></button>;
                        })}
                    </div>
                    <div className={styles.paletteTip}><FiActivity aria-hidden="true" /><p>Connectors are shown as a sample. External apps are not connected in this demo.</p></div>
                    <Link className={styles.paletteHistory} to="/runs"><FiActivityIcon />View run history</Link>
                </aside>

                <section aria-label="Workflow canvas" className={styles.canvasArea}>
                    <div className={styles.canvasTopline}><div><strong>{workflow.name}</strong><span>{workflow.nodes.length} {workflow.nodes.length === 1 ? "step" : "steps"}</span></div><button aria-label="Add a step" className={styles.canvasAddButton} onClick={() => addStep("action")} type="button"><FiPlus aria-hidden="true" />Add step</button></div>
                    <div className={styles.canvasScroll}>
                        <div className={styles.canvas}>
                            <div className={styles.canvasLabel}><span>Flow begins here</span><FiArrowDown aria-hidden="true" /></div>
                            {workflow.nodes.map((node, index) => {
                                const Icon = iconByType[node.type] ?? FiPlay;
                                const selected = selectedNodeId === node.id;
                                return <div className={styles.nodeGroup} key={node.id}>
                                    <button aria-pressed={selected} className={`${styles.nodeCard} ${styles[node.type]} ${selected ? styles.selected : ""}`} onClick={() => setSelectedNodeId(node.id)} type="button">
                                        <span className={styles.nodeIcon}><Icon aria-hidden="true" /></span>
                                        <span className={styles.nodeCopy}><small>{node.app} <i /> {node.type}</small><strong>{node.title}</strong><span>{node.detail}</span></span>
                                        <span className={styles.nodeNumber}>{String(index + 1).padStart(2, "0")}</span>
                                    </button>
                                    {index < workflow.nodes.length - 1 && <div aria-hidden="true" className={styles.connector}><span /></div>}
                                </div>;
                            })}
                            <button className={styles.canvasAdd} onClick={() => addStep("action")} type="button"><FiPlus aria-hidden="true" />Add another step</button>
                            {!workflow.nodes.length && <div className={styles.emptyCanvas}><FiGitBranch aria-hidden="true" /><h2>Your workflow is empty</h2><p>Add a trigger to choose what starts it.</p></div>}
                            <div className={styles.canvasFootnote}><FiBell aria-hidden="true" /> Sample workflow preview. No outside service will receive data.</div>
                        </div>
                    </div>
                </section>

                <aside aria-label="Selected step settings" className={styles.inspector}>
                    {selectedNode ? <>
                        <div className={styles.inspectorHeader}><span className={`${styles.inspectorIcon} ${styles[activeType]}`}><TypeIcon aria-hidden="true" /></span><div><strong>Step settings</strong><small>{selectedNode.app} - {selectedNode.type}</small></div><button aria-label="Remove selected step" className={styles.removeButton} disabled={selectedNode.type === "trigger"} onClick={() => setDeleteNode(selectedNode)} type="button"><FiTrash2 aria-hidden="true" /></button></div>
                        <div className={styles.inspectorForm}>
                            <label htmlFor="step-title">Step name</label>
                            <input id="step-title" maxLength={80} onChange={(event) => updateNode(selectedNode.id, { title: event.target.value })} value={selectedNode.title} />
                            <label htmlFor="step-app">App or step type</label>
                            <select id="step-app" onChange={(event) => updateNode(selectedNode.id, { app: event.target.value })} value={selectedNode.app}>{appChoices.map((app) => <option key={app}>{app}</option>)}</select>
                            <label htmlFor="step-detail">What happens</label>
                            <textarea id="step-detail" onChange={(event) => updateNode(selectedNode.id, { detail: event.target.value })} rows="3" value={selectedNode.detail} />
                            <label htmlFor="step-config">Sample value</label>
                            <input id="step-config" onChange={(event) => updateNode(selectedNode.id, { config: event.target.value })} value={selectedNode.config} />
                            <p className={styles.helperText}>Configuration is saved in this session. Real credentials and external actions are not used.</p>
                        </div>
                        <div className={styles.orderControls}><span>Step order</span><button aria-label="Move step up" disabled={workflow.nodes.findIndex((node) => node.id === selectedNode.id) === 0} onClick={() => moveNode(selectedNode.id, -1)} type="button"><FiArrowUp aria-hidden="true" />Move up</button><button aria-label="Move step down" disabled={workflow.nodes.findIndex((node) => node.id === selectedNode.id) === workflow.nodes.length - 1} onClick={() => moveNode(selectedNode.id, 1)} type="button"><FiArrowDown aria-hidden="true" />Move down</button></div>
                    </> : <div className={styles.noSelection}><FiGitBranch aria-hidden="true" /><h2>Select a step</h2><p>Choose a node on the canvas to edit its settings.</p></div>}
                </aside>
            </div>
            {deleteNode && <Dialog danger confirmLabel="Remove step" description={`Remove ${deleteNode.title} from this workflow?`} onClose={() => setDeleteNode(null)} onConfirm={removeSelectedNode} title="Remove this step?">
                <p className={styles.deleteCopy}>This step and its sample configuration will be removed from the current workflow.</p>
            </Dialog>}
        </div>
    );
};

const FiActivityIcon = () => <FiActivity aria-hidden="true" />;

export default BuilderPage;