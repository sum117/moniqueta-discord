import styles from './Login.module.css';
import {FaBook, FaHandHoldingHeart, FaPeopleCarry} from 'react-icons/fa';
import {useFetch} from '../../script/useFetch';
import {Avatar} from '../Avatar/Avatar';

export function LoggedInComponent() {
  type LoginData = {
    data: {
      letters: number;
      chars: number;
      activeNow: number;
    };
    loading: boolean;
  };
  const {data: statistics, loading} = useFetch(
    'http://localhost:6652/statistics'
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
      <Avatar user_object={sessionStorage.getItem('user_object') as string} />
      <div className={styles.loggedInTools}>
        <header>Agora você pode usar as ferramentas de logado!</header>
        <h1>
          O site está em desenvolvimento. Por favor, aguarde novas atualizações!
          <br />
          Feito com muito amor pela equipe do Masôria 💘!
        </h1>
      </div>
    </>
  );
}