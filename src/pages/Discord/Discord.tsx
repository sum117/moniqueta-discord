import styles from './Discord.module.css';
import HeaderStyle from '../Header.module.css';

export function Discord() {
  return (
    <div className={styles.wrapper}>
      <h1 className={HeaderStyle.header}>DISCORD</h1>
      <iframe
        className={styles.discordIFrame}
        src="https://discord.com/widget?id=976870103125733388&theme=dark"
        width="350"
        height="500"
        allowTransparency={true}
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
      ></iframe>
    </div>
  );
}