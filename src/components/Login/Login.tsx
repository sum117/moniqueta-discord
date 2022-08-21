import styles from './Login.module.css';
import { FaDoorOpen } from 'react-icons/fa';
import { useState } from 'react';
export function Login() {
  const [login, setLogin] = useState(false);
  const LoginIcon = ({ icon }: { [key: string]: any }) => (
    <div className={styles.loginIcon}>{icon}</div>
  );

  if (!login) handleLogin();

  return (
    <div>
      <div className={styles.container}>
        <a
          id="login"
          href="https://discord.com/api/oauth2/authorize?client_id=987919485367369749&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Flogin&response_type=code&scope=guilds%20identify"
        >
          <LoginIcon icon={<FaDoorOpen size="28" />} />
        </a>
      </div>
      {window.location.href === 'http://localhost:5173/' ? (
        <div className={styles.loggedIn}>
          <div>
            <h1>Bem vindo, Masôriano!</h1>
          </div>
          <div>
            <h1>Bem vindo, Masôriano!</h1>
          </div>
        </div>
      ) : undefined}
    </div>
  );

  function handleLogin() {
    if (!window.location.href.includes('code')) return;
    const data = {
      client_id: '987919485367369749',
      client_secret: 'umaeJ0_itADBpFXnLoWJhzRQlJd8EBuh',
      grant_type: 'authorization_code',
      code: window.location.href.split('=')[1],
      redirect_uri: 'http://localhost:5173/login',
    };
    let apiEndpoint = 'https://discord.com/api/oauth2/';
    let access_token = window.sessionStorage.getItem('access_token') as unknown;
    let user_object = window.sessionStorage.getItem('user_object') as unknown;
    if (access_token && user_object) return;

    return fetch(apiEndpoint + 'token', {
      method: 'POST',
      body: new URLSearchParams(data),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then(async (postRes) => {
      apiEndpoint = 'https://discord.com/api/';
      const loginJSON = await postRes.json();
      sessionStorage.setItem(
        'access_token',
        JSON.stringify(loginJSON.access_token),
      );
      fetch(apiEndpoint + 'users/@me', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + loginJSON.access_token,
        },
      }).then(async (getIdentifyRes) => {
        await delay(1000);
        const userJSON = await getIdentifyRes.json();
        fetch(apiEndpoint + 'users/@me/guilds', {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + loginJSON.access_token,
          },
        }).then(async (getGuildRes) => {
          await delay(1000);
          const guildJSON = await getGuildRes.json();
          sessionStorage.setItem(
            'user_object',
            JSON.stringify({ user: userJSON, guild: guildJSON }),
          );
          window.location.pathname = 'http://localhost:5173';

          type userObject = {
            user: {
              id: string;
              username: string;
              avatar: string;
              discriminator: string;
            };
            guilds: Array<{ id: string; name: string; owner: boolean }>;
          };
          const storage: userObject = JSON.parse(
            window.sessionStorage.getItem('user_object') as any,
          );
          if (
            storage.guilds.find((guild) => guild.id === '976870103125733388')
          ) {
            setLogin(true);
          } else {
            setLogin(false);
          }
        });
      });
    });

    async function delay(time: number) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }
  }
}
