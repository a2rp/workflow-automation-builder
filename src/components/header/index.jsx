import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiArrowUpRight, FiGitBranch, FiMenu, FiX } from "react-icons/fi";
import { FaGithub } from "react-icons/fa6";
import styles from "./styles.module.css";

const navigation = [
    { to: "/workflows", label: "Workflows" },
    { to: "/templates", label: "Templates" },
    { to: "/runs", label: "Run history" },
];

const Header = ({ onNewWorkflow }) => {
    const [hidden, setHidden] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const previousScroll = useRef(0);
    const location = useLocation();
    const inEditor = location.pathname.startsWith("/builder/");

    useEffect(() => {
        const handleScroll = () => {
            const current = window.scrollY;
            const movement = current - previousScroll.current;
            if (inEditor || current <= 20) setHidden(false);
            else if (!menuOpen && movement > 5) setHidden(true);
            else if (movement < -5) setHidden(false);
            previousScroll.current = current;
        };
        previousScroll.current = window.scrollY;
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [inEditor, menuOpen]);

    return (
        <header className={`${styles.header} ${hidden && !menuOpen ? styles.hidden : ""} ${inEditor ? styles.editorHeader : ""}`}>
            <div className={styles.inner}>
                <NavLink aria-label="Relayflow workflows" className={styles.brand} to="/workflows">
                    <span aria-hidden="true" className={styles.brandMark}><FiGitBranch /></span>
                    <span className={styles.wordmark}>relayflow<span>.</span></span>
                </NavLink>
                <nav aria-label="Main navigation" className={`${styles.navigation} ${menuOpen ? styles.navigationOpen : ""}`}>
                    {navigation.map((item) => (
                        <NavLink className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`} key={item.to} onClick={() => setMenuOpen(false)} to={item.to}>
                            {item.label}
                        </NavLink>
                    ))}
                    <a className={`${styles.navLink} ${styles.repositoryMobile}`} href="https://github.com/a2rp/workflow-automation-builder" rel="noreferrer" target="_blank">
                        <FaGithub aria-hidden="true" />Repository<FiArrowUpRight aria-hidden="true" />
                    </a>
                </nav>
                <div className={styles.actions}>
                    <a aria-label="Open the public source repository" className={styles.repository} href="https://github.com/a2rp/workflow-automation-builder" rel="noreferrer" target="_blank">
                        <FaGithub aria-hidden="true" /><span>Repository</span><FiArrowUpRight aria-hidden="true" />
                    </a>
                    <button className={styles.newButton} onClick={onNewWorkflow} type="button"><span>+</span> New workflow</button>
                    <button aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} className={styles.menuButton} onClick={() => setMenuOpen((open) => !open)} type="button">
                        {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;