import { Link } from "react-router-dom";
import { FiArrowLeft, FiGitBranch } from "react-icons/fi";
import styles from "./styles.module.css";

const NotFoundPage = () => (
    <main className={styles.notFound}>
        <span className={styles.mark}><FiGitBranch aria-hidden="true" /></span>
        <p>404 · Page not found</p>
        <h1>This workflow path does not exist.</h1>
        <span className={styles.description}>The link may be old, or the page may have moved.</span>
        <Link to="/workflows"><FiArrowLeft aria-hidden="true" />Back to workflows</Link>
    </main>
);

export default NotFoundPage;