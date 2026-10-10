import { useMemo, useState } from "react";
import { FiActivity, FiArrowDown, FiCheckCircle, FiClock, FiDownload, FiEye, FiPlay, FiSearch, FiXCircle } from "react-icons/fi";
import Dialog from "../../components/dialog";
import { formatRelativeTime } from "../../data.js";
import { downloadCsv, getWorkflowName } from "../../utils.js";
import styles from "./styles.module.css";

const statusKey = (value) => value.toLowerCase();
const iconForStatus = (status) => status === "Success" ? FiCheckCircle : status === "Failed" ? FiXCircle : FiClock;

const RunsPage = ({ runs, workflows, addRun, showToast }) => {
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All statuses");
    const [workflowFilter, setWorkflowFilter] = useState("All workflows");
    const [selectedRun, setSelectedRun] = useState(null);

    const filteredRuns = useMemo(() => runs.filter((run) => {
        const name = getWorkflowName(workflows, run.workflowId);
        const matchesText = (name + " " + run.trigger + " " + run.id).toLowerCase().includes(query.toLowerCase());
        const matchesStatus = statusFilter === "All statuses" || run.status === statusFilter;
        const matchesWorkflow = workflowFilter === "All workflows" || run.workflowId === workflowFilter;
        return matchesText && matchesStatus && matchesWorkflow;
    }), [query, runs, statusFilter, workflowFilter, workflows]);

    const successCount = runs.filter((run) => run.status === "Success").length;
    const failedCount = runs.filter((run) => run.status === "Failed").length;
    const runningCount = runs.filter((run) => run.status === "Running").length;

    const exportCurrent = () => {
        const rows = [["Run ID", "Workflow", "Status", "Started", "Duration", "Trigger"], ...filteredRuns.map((run) => [run.id, getWorkflowName(workflows, run.workflowId), run.status, new Date(run.startedAt).toISOString(), run.duration, run.trigger])];
        if (!downloadCsv(rows, "relayflow-run-history.csv")) showToast("There are no runs to export.", "warning");
        else showToast(filteredRuns.length + " run records exported as CSV.", "success");
    };

    const rerun = (run) => {
        const workflow = workflows.find((item) => item.id === run.workflowId);
        if (!workflow) {
            showToast("This workflow was deleted, so the run cannot be repeated.", "warning");
            return;
        }
        addRun(workflow);
    };

    return (
        <div className={styles.runsPage}>
            <main className={styles.content}>
                <header className={styles.pageHeader}><div><p className={styles.overline}>Execution monitor</p><h1>Run history</h1><p className={styles.intro}>See what each workflow did, when it ran, and where a step needs attention.</p></div><button className={styles.exportButton} onClick={exportCurrent} type="button"><FiDownload aria-hidden="true" />Export view</button></header>
                <section aria-label="Run totals" className={styles.runStats}>
                    <div><span className={styles.statIcon + " " + styles.successIcon}><FiCheckCircle aria-hidden="true" /></span><span><small>Successful</small><strong>{successCount}</strong></span></div>
                    <div><span className={styles.statIcon + " " + styles.failedIcon}><FiXCircle aria-hidden="true" /></span><span><small>Needs attention</small><strong>{failedCount}</strong></span></div>
                    <div><span className={styles.statIcon + " " + styles.runningIcon}><FiClock aria-hidden="true" /></span><span><small>In progress</small><strong>{runningCount}</strong></span></div>
                    <div><span className={styles.statIcon + " " + styles.totalIcon}><FiActivity aria-hidden="true" /></span><span><small>All runs</small><strong>{runs.length}</strong></span></div>
                </section>
                <section className={styles.runPanel} aria-labelledby="run-table-title">
                    <div className={styles.panelHeader}><div><h2 id="run-table-title">Execution log</h2><p>Run details use sample events. No outside service is contacted.</p></div><span className={styles.resultCount}>{filteredRuns.length} results</span></div>
                    <div className={styles.filters}>
                        <label className={styles.searchBox}><FiSearch aria-hidden="true" /><input aria-label="Search run history" onChange={(event) => setQuery(event.target.value)} placeholder="Search runs or trigger" value={query} /></label>
                        <label className={styles.filterSelect}><span className={styles.visuallyHidden}>Filter by status</span><select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option>All statuses</option><option>Success</option><option>Failed</option><option>Running</option></select></label>
                        <label className={styles.filterSelect}><span className={styles.visuallyHidden}>Filter by workflow</span><select onChange={(event) => setWorkflowFilter(event.target.value)} value={workflowFilter}><option value="All workflows">All workflows</option>{workflows.map((workflow) => <option key={workflow.id} value={workflow.id}>{workflow.name}</option>)}</select></label>
                    </div>
                    {filteredRuns.length ? <div className={styles.tableWrap}><table><thead><tr><th>Run</th><th>Workflow</th><th>Status</th><th>Started</th><th>Duration</th><th>Actions</th></tr></thead><tbody>
                        {filteredRuns.map((run) => {
                            const Icon = iconForStatus(run.status);
                            const workflow = workflows.find((item) => item.id === run.workflowId);
                            return <tr key={run.id}>
                                <td><div className={styles.runCell}><span className={styles.runIcon + " " + styles[statusKey(run.status)]}><Icon aria-hidden="true" /></span><span><strong>{run.id}</strong><small>{run.trigger}</small></span></div></td>
                                <td><span className={styles.workflowName}>{getWorkflowName(workflows, run.workflowId)}</span></td>
                                <td><span className={styles.statusBadge + " " + styles[statusKey(run.status)]}><i />{run.status}</span></td>
                                <td><span className={styles.startedAt}>{formatRelativeTime(run.startedAt)}</span></td>
                                <td><span className={styles.duration}>{run.duration}</span></td>
                                <td><div className={styles.rowActions}><button aria-label={"View details for " + run.id} onClick={() => setSelectedRun(run)} type="button"><FiEye aria-hidden="true" />Details</button><button aria-label={"Repeat " + run.id + " with sample data"} disabled={!workflow} onClick={() => rerun(run)} type="button"><FiPlay aria-hidden="true" />Rerun</button></div></td>
                            </tr>;
                        })}
                    </tbody></table></div> : <div className={styles.emptyState}><FiSearch aria-hidden="true" /><h2>No runs match</h2><p>Adjust your search or filters to see more activity.</p><button onClick={() => { setQuery(""); setStatusFilter("All statuses"); setWorkflowFilter("All workflows"); }} type="button">Clear filters</button></div>}
                    <div className={styles.panelFooter}><span>Showing {filteredRuns.length} of {runs.length} sample runs</span><span><FiArrowDown aria-hidden="true" />Newest first</span></div>
                </section>
            </main>
            {selectedRun && <Dialog description={getWorkflowName(workflows, selectedRun.workflowId) + " · " + formatRelativeTime(selectedRun.startedAt) + " · " + selectedRun.duration} hideConfirm onClose={() => setSelectedRun(null)} title={"Run " + selectedRun.id}>
                <div className={styles.runDetail}><div className={styles.detailStatus + " " + styles[statusKey(selectedRun.status)]}><span className={styles.statusBadge}><i />{selectedRun.status}</span><strong>{selectedRun.trigger}</strong></div><h3>Step results</h3><ol>{selectedRun.steps.map((step, index) => <li key={selectedRun.id + "-step-" + index}><span>{index + 1}</span><p>{step}</p></li>)}</ol><p className={styles.simulationNote}>This is a frontend simulation using sample data. No external app action was performed.</p></div>
            </Dialog>}
        </div>
    );
};

export default RunsPage;