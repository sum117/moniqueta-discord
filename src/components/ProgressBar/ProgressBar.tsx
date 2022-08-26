import styles from './ProgressBar.module.css';

export function ProgressBar({ value, max }: { value: number; max: number }) {
  return (
    <div className={styles.progressBar}>
      <div className={styles.progressBarFill} style={{ width: `${value}%` }} />
    </div>
  );
}
