import { LoggedInComponent } from '../../components/Login/Login';
import styles from './Home.module.css';
import HeaderStyle from '../Header.module.css';
export function Home({ IsLoggedIn }: { IsLoggedIn: boolean }) {
  return (
    <div className={styles.wrapper}>
      <h1 className={HeaderStyle.header}>INÍCIO</h1>
      {IsLoggedIn ? <LoggedInComponent /> : undefined}
    </div>
  );
}
