import styles from './Login.module.css';
import { FaBook, FaPeopleCarry, FaHandHoldingHeart } from 'react-icons/fa';
import { useFetch } from '../../script/useFetch';
import { Avatar } from '../Avatar/Avatar';
import { ProgressBar } from '../ProgressBar/ProgressBar';
export function LoggedInComponent() {
  type LoginData = {
    data: {
      letters: number;
      chars: number;
      activeNow: number;
    };
    loading: boolean;
  };
  const { data: statistics, loading } = useFetch(
    'http://localhost:6652/statistics',
  ) as unknown as LoginData;

  return (
    <>
      <article className={styles.loginWrapper}>
        <h1>Bem Vindo!</h1>
        {loading && <p>Carregando...</p>}
        {statistics && (
          <ul>
            <li>
              <FaBook size="16" />
              <b>Caracteres Enviados: </b> {statistics.letters}
            </li>
            <li>
              <FaPeopleCarry size="16" />
              <b>Número de Personagens: </b> {statistics.chars}
            </li>
            <li>
              <FaHandHoldingHeart size="16" />
              <b>Jogadores Ativos Hoje: </b> {statistics.activeNow}
            </li>
          </ul>
        )}
      </article>
      <div className={styles.userInfo}>
        {!loading && (
          <header>
            <Avatar
              user_object={sessionStorage.getItem('user_object') as string}
            />
            <ProgressBar value={50} max={100} key="progressBar" />
          </header>
        )}
      </div>
    </>
  );
}
