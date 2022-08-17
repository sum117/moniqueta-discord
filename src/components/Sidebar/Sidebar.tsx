import { FaHome, FaQuestion, FaAutoprefixer, FaDiscord } from "react-icons/fa";
import styles from "./Sidebar.module.css";
import { Link } from "react-router-dom";
export function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <Link to="/">
        <SidebarIcon icon={<FaHome size="28" />} />
      </Link>
      <Link to="/tradutor">
        <SidebarIcon icon={<FaAutoprefixer size="28" />} />
      </Link>

      <Link to="/discord">
        <SidebarIcon icon={<FaDiscord size="28" />} />
      </Link>

      <Link to="/faq">
        <SidebarIcon icon={<FaQuestion size="28" />} />
      </Link>
    </div>
  );
}

const SidebarIcon = ({ icon }: { [key: string]: any }) => (
  <div className={styles.sidebarIcon}>{icon}</div>
);
