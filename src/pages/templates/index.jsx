import { useMemo, useState } from "react";
import { FiArrowRight, FiCheck, FiGitBranch, FiPlus, FiSearch, FiZap } from "react-icons/fi";
import Dialog from "../../components/dialog";
import { templates } from "../../data.js";
import styles from "./styles.module.css";

const categories = ["All templates", "Sales", "Customer success", "Finance", "Productivity", "Support"];
const TemplatesPage = ({ createFromTemplate }) => {
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All templates");
    const [preview, setPreview] = useState(null);
    const filtered = useMemo(() => templates.filter((item) => {
        const matchesCategory = category === "All templates" || item.category === category;
        const matchesQuery = (item.name + " " + item.category + " " + item.description + " " + item.apps.join(" ")).toLowerCase().includes(query.toLowerCase());
        return matchesCategory && matchesQuery;
    }), [category, query]);

    return (
        <div className={styles.templatesPage}>
            <main className={styles.content}>
                <header className={styles.pageHeader}><div><p className={styles.overline}>Start with a pattern</p><h1>Workflow templates</h1><p className={styles.intro}>Pick a useful starting point, then tailor every step to your process.</p></div><span className={styles.templateCount}><FiZap aria-hidden="true" />{templates.length} ready-to-edit templates</span></header>
                <section className={styles.templateTools}>
                    <label className={styles.searchBox}><FiSearch aria-hidden="true" /><input aria-label="Search workflow templates" onChange={(event) => setQuery(event.target.value)} placeholder="Search templates or apps" value={query} /></label>
                    <div aria-label="Filter templates by category" className={styles.categoryFilters} role="group">
                        {categories.map((item) => <button aria-pressed={category === item} className={category === item ? styles.activeCategory : ""} key={item} onClick={() => setCategory(item)} type="button">{item}</button>)}
                    </div>
                </section>
                {filtered.length ? <section aria-label="Available templates" className={styles.templateGrid}>
                    {filtered.map((template, index) => <article className={styles.templateCard} key={template.id}>
                        <div className={styles.flowPreview + " " + styles["tone" + (index % 4)]}>
                            <div className={styles.previewStamp}><FiGitBranch aria-hidden="true" /><span>{template.category}</span></div>
                            <div aria-hidden="true" className={styles.previewNodes}>{template.nodes.map((node, nodeIndex) => <span className={styles.previewNode} key={template.id + "-" + nodeIndex}><i>{node.type === "trigger" ? "↯" : node.type === "condition" ? "◇" : node.type === "delay" ? "◷" : "↗"}</i>{node.app}</span>)}</div>
                            <span className={styles.stepCount}>{template.nodes.length} steps</span>
                        </div>
                        <div className={styles.cardBody}><h2>{template.name}</h2><p>{template.description}</p><div className={styles.appList}><span>Uses</span>{template.apps.map((app) => <span className={styles.appTag} key={app}>{app}</span>)}</div><div className={styles.cardActions}><button className={styles.previewButton} onClick={() => setPreview(template)} type="button">Preview flow <FiArrowRight aria-hidden="true" /></button><button aria-label={"Use " + template.name + " template"} className={styles.useButton} onClick={() => createFromTemplate(template)} type="button"><FiPlus aria-hidden="true" />Use template</button></div></div>
                    </article>)}
                </section> : <div className={styles.emptyState}><FiSearch aria-hidden="true" /><h2>No templates match</h2><p>Try a different search or category.</p><button onClick={() => { setQuery(""); setCategory("All templates"); }} type="button">Clear filters</button></div>}
                <p className={styles.note}><FiCheck aria-hidden="true" />Templates are editable examples. App connections and automated actions are not live in this frontend demo.</p>
            </main>
            {preview && <Dialog description={preview.description} hideConfirm onClose={() => setPreview(null)} title={preview.name}>
                <div className={styles.previewDialog}><span className={styles.categoryBadge}>{preview.category}</span><ol>{preview.nodes.map((node, index) => <li key={preview.id + "-preview-" + index}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{node.title}</strong><small>{node.app} · {node.detail}</small></div></li>)}</ol><button className={styles.previewUse} onClick={() => createFromTemplate(preview)} type="button"><FiPlus aria-hidden="true" />Use this template</button></div>
            </Dialog>}
        </div>
    );
};

export default TemplatesPage;