import {
  FaAutoprefixer,
  FaDiscord,
  FaDoorOpen,
  FaHome,
  FaQuestion
} from 'react-icons/fa';
import styles from './Sidebar.module.css';
import {Link} from 'react-router-dom';

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
      <a href="https://discord.com/api/oauth2/authorize?client_id=987919485367369749&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Flogin&response_type=code&scope=guilds%20identify">
        <SidebarIcon icon={<FaDoorOpen size="28" />} />
      </a>
    </div>
  );
}

const SidebarIcon = ({icon}: {[_key: string]: any}) => (
  <div className={styles.sidebarIcon}>{icon}</div>
);