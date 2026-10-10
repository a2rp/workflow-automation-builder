import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiActivity, FiArrowRight, FiClock, FiCopy, FiGitBranch, FiMoreHorizontal, FiPause, FiPlay, FiPlus, FiSearch, FiTrash2, FiZap } from "react-icons/fi";
import Dialog from "../../components/dialog";
import { formatRelativeTime } from "../../data.js";
import { getWorkflowName } from "../../utils.js";
import styles from "./styles.module.css";

const statusClass = (status) => status.toLowerCase().replaceAll(" ", "-");

const WorkflowPage = ({ workflows, runs, openCreateWorkflow, cloneWorkflow, setWorkflowStatus, removeWorkflow }) => {
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All statuses");
    const [sortBy, setSortBy] = useState("Recently updated");
    const [openMenu, setOpenMenu] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [selectedRun, setSelectedRun] = useState(null);
    const menusRef = useRef(null);

    useEffect(() => {
        const closeOnOutside = (event) => {
            if (menusRef.current && !menusRef.current.contains(event.target)) setOpenMenu(null);
        };
        const closeOnEscape = (event) => event.key === "Escape" && setOpenMenu(null);
        document.addEventListener("pointerdown", closeOnOutside);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutside);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, []);

    const filteredWorkflows = useMemo(() => {
        const filtered = workflows.filter((workflow) => {
            const matchesQuery = `${workflow.name} ${workflow.nodes[0]?.app ?? ""} ${workflow.nodes[0]?.title ?? ""}`.toLowerCase().includes(query.toLowerCase());
            const matchesStatus = statusFilter === "All statuses" || workflow.status === statusFilter;
            return matchesQuery && matchesStatus;
        });
        return filtered.sort((a, b) => sortBy === "Name" ? a.name.localeCompare(b.name) : new Date(b.updatedAt) - new Date(a.updatedAt));
    }, [query, sortBy, statusFilter, workflows]);

    const activeCount = workflows.filter((workflow) => workflow.status === "Active").length;
    const totalRuns = workflows.reduce((sum, workflow) => sum + workflow.runs, 0);
    const successfulRuns = runs.filter((run) => run.status === "Success").length;
    const successRate = runs.length ? Math.round((successfulRuns / runs.length) * 100) : 0;
    const recentRuns = runs.slice(0, 4);

    return (
        <div className={styles.workflowsPage}>
            <main className={styles.content}>
                <header className={styles.pageHeader}>
                    <div>
                        <p className={styles.overline}>Your workspace</p>
                        <h1>Workflows</h1>
                        <p className={styles.intro}>Build small automations that take repetitive work off your plate.</p>
                    </div>
                    <button className={styles.createButton} onClick={openCreateWorkflow} type="button"><FiPlus aria-hidden="true" /> Create workflow</button>
                </header>

                <section aria-label="Workflow activity" className={styles.statsStrip}>
                    <div className={styles.stat}><span className={styles.statIcon}><FiGitBranch aria-hidden="true" /></span><span><small>Active workflows</small><strong>{activeCount}</strong></span><span className={styles.statNote}>of {workflows.length} total</span></div>
                    <div className={styles.stat}><span className={`${styles.statIcon} ${styles.statIconLime}`}><FiZap aria-hidden="true" /></span><span><small>Runs logged</small><strong>{totalRuns.toLocaleString()}</strong></span><span className={styles.statNote}>across your workspace</span></div>
                    <div className={styles.stat}><span className={`${styles.statIcon} ${styles.statIconBlue}`}><FiActivity aria-hidden="true" /></span><span><small>Recent success rate</small><strong>{successRate}%</strong></span><span className={styles.statNote}>from {runs.length} sample runs</span></div>
                </section>

                <div className={styles.workspaceGrid}>
                    <section className={styles.workflowPanel} aria-labelledby="workflow-list-title">
                        <div className={styles.panelHeader}>
                            <div><h2 id="workflow-list-title">All workflows</h2><p>Open a flow to review or change its steps.</p></div>
                            <span className={styles.countPill}>{filteredWorkflows.length} shown</span>
                        </div>
                        <div className={styles.filters}>
                            <label className={styles.searchBox}>
                                <FiSearch aria-hidden="true" />
                                <input aria-label="Search workflows" onChange={(event) => setQuery(event.target.value)} placeholder="Search workflows" value={query} />
                            </label>
                            <label className={styles.selectWrap}>
                                <span className={styles.visuallyHidden}>Filter by workflow status</span>
                                <select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option>All statuses</option><option>Active</option><option>Paused</option><option>Draft</option></select>
                            </label>
                            <label className={styles.selectWrap}>
                                <span className={styles.visuallyHidden}>Sort workflows</span>
                                <select onChange={(event) => setSortBy(event.target.value)} value={sortBy}><option>Recently updated</option><option>Name</option></select>
                            </label>
                        </div>

                        {filteredWorkflows.length ? (
                            <div className={styles.workflowRows} ref={menusRef}>
                                {filteredWorkflows.map((workflow) => {
                                    const flowRuns = runs.filter((run) => run.workflowId === workflow.id).length;
                                    return (
                                        <article className={styles.workflowRow} key={workflow.id}>
                                            <div className={styles.flowIdentity}>
                                                <span className={styles.flowMark}><FiGitBranch aria-hidden="true" /></span>
                                                <div><h3><Link to={`/builder/${workflow.id}`}>{workflow.name}</Link></h3><p>{workflow.nodes[0]?.app ?? "New trigger"} <span> - </span> {workflow.nodes[0]?.title ?? "Start with a trigger"}</p></div>
                                            </div>
                                            <div aria-label={`${workflow.nodes.length} workflow steps`} className={styles.miniFlow}>
                                                {workflow.nodes.slice(0, 4).map((node) => <span className={`${styles.miniNode} ${styles[`mini${node.type}`]}`} key={node.id} title={node.title}>{node.app.slice(0, 2).toUpperCase()}</span>)}
                                                {workflow.nodes.length > 4 && <span className={styles.moreSteps}>+{workflow.nodes.length - 4}</span>}
                                            </div>
                                            <div className={styles.rowMeta}><span className={`${styles.statusBadge} ${styles[statusClass(workflow.status)]}`}><i />{workflow.status}</span><small><FiActivity aria-hidden="true" />{flowRuns} recent runs</small></div>
                                            <div className={styles.rowUpdated}><small>Updated</small><span>{formatRelativeTime(workflow.updatedAt)}</span></div>
                                            <div className={styles.rowActions}>
                                                <Link aria-label={`Open ${workflow.name} in the builder`} className={styles.openButton} to={`/builder/${workflow.id}`}><FiArrowRight aria-hidden="true" /></Link>
                                                <button aria-expanded={openMenu === workflow.id} aria-label={`More actions for ${workflow.name}`} className={styles.moreButton} onClick={() => setOpenMenu(openMenu === workflow.id ? null : workflow.id)} type="button"><FiMoreHorizontal aria-hidden="true" /></button>
                                                {openMenu === workflow.id && <div className={styles.actionMenu} role="menu">
                                                    <Link onClick={() => setOpenMenu(null)} role="menuitem" to={`/builder/${workflow.id}`}><FiGitBranch aria-hidden="true" />Open builder</Link>
                                                    <button onClick={() => { setWorkflowStatus(workflow.id, workflow.status === "Active" ? "Paused" : "Active"); setOpenMenu(null); }} role="menuitem" type="button">{workflow.status === "Active" ? <FiPause aria-hidden="true" /> : <FiPlay aria-hidden="true" />}{workflow.status === "Active" ? "Pause workflow" : "Activate workflow"}</button>
                                                    <button onClick={() => { cloneWorkflow(workflow.id); setOpenMenu(null); }} role="menuitem" type="button"><FiCopy aria-hidden="true" />Duplicate</button>
                                                    <button className={styles.deleteAction} onClick={() => { setDeleteTarget(workflow); setOpenMenu(null); }} role="menuitem" type="button"><FiTrash2 aria-hidden="true" />Delete workflow</button>
                                                </div>}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className={styles.emptyState}><span><FiSearch aria-hidden="true" /></span><h3>No workflows match</h3><p>Try another search or status filter.</p><button onClick={() => { setQuery(""); setStatusFilter("All statuses"); }} type="button">Clear filters</button></div>
                        )}
                        <div className={styles.panelFooter}><span>{workflows.length} workflows in this workspace</span><Link to="/templates">Browse templates <FiArrowRight aria-hidden="true" /></Link></div>
                    </section>

                    <aside className={styles.activityPanel}>
                        <div className={styles.activityHeader}><div><h2>Latest runs</h2><p>Recent activity across your flows</p></div><Link aria-label="View all run history" to="/runs"><FiArrowRight aria-hidden="true" /></Link></div>
                        <div className={styles.runList}>
                            {recentRuns.map((run) => <button className={styles.runItem} key={run.id} onClick={() => setSelectedRun(run)} type="button">
                                <span className={`${styles.runState} ${styles[statusClass(run.status)]}`}>{run.status === "Success" ? <FiPlay aria-hidden="true" /> : run.status === "Failed" ? <FiZap aria-hidden="true" /> : <FiClock aria-hidden="true" />}</span>
                                <span className={styles.runText}><strong>{getWorkflowName(workflows, run.workflowId)}</strong><small>{run.trigger}</small></span>
                                <span className={styles.runTime}>{formatRelativeTime(run.startedAt)}</span>
                            </button>)}
                        </div>
                        <Link className={styles.viewRuns} to="/runs">Open run history <FiArrowRight aria-hidden="true" /></Link>
                    </aside>
                </div>
                <p className={styles.demoNote}>Demo workspace. Runs use sample data only; connected services are not called.</p>
            </main>

            {deleteTarget && <Dialog danger confirmLabel="Delete workflow" description={`This removes ${deleteTarget.name} and its run history from this demo workspace.`} onClose={() => setDeleteTarget(null)} onConfirm={() => { removeWorkflow(deleteTarget.id); setDeleteTarget(null); }} title="Delete this workflow?">
                <div className={styles.confirmCopy}><strong>{deleteTarget.name}</strong><p>This action cannot be undone in the current session.</p></div>
            </Dialog>}
            {selectedRun && <Dialog description={`${getWorkflowName(workflows, selectedRun.workflowId)}  -  ${formatRelativeTime(selectedRun.startedAt)}  -  ${selectedRun.duration}`} hideConfirm onClose={() => setSelectedRun(null)} title="Run details">
                <div className={styles.runDetails}><p>{selectedRun.trigger}</p><ol>{selectedRun.steps.map((step, index) => <li key={`${selectedRun.id}-${index}`}><span>{index + 1}</span>{step}</li>)}</ol></div>
            </Dialog>}
        </div>
    );
};

export default WorkflowPage;