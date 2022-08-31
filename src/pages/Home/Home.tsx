import {LoggedInComponent} from '../../components/Login/Login';
import {FaLightbulb} from 'react-icons/fa';
import styles from './Home.module.css';
import HeaderStyle from '../Header.module.css';
export function Home({IsLoggedIn}: {IsLoggedIn: boolean}) {
  return (
    <div className={styles.wrapper}>
      <h1 className={HeaderStyle.header}>INÍCIO</h1>
      {IsLoggedIn ? (
        <LoggedInComponent />
      ) : (
        <div className={styles.notLoggedIn}>
          <p>
            <FaLightbulb /> Você não está logado. Seria bom logar apertando no
            ícone da portinha cara.
          </p>
          <p>
            Gostariamos de informar a todos os membros do SDA que a moniqueta
            está em desenvolvimento, e esse website é apenas um produto do nosso
            esforço para isso. Ele irá melhorar, assim como todas as outras
            funções do bot. Agradecemos a compreensão e esperamos que você se
            divirta com nossas ferramentas.
          </p>
        </div>
      )}
    </div>
  );
}
