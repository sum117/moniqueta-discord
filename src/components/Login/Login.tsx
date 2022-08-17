import styles from './Login.module.css';
import { FaDoorOpen } from 'react-icons/fa';
import { useState } from 'react';
export function Login() {
  const LoginIcon = ({ icon }: { [key: string]: any }) => (
    <div className={styles.loginIcon}>{icon}</div>
  );
  const [login, setLogin] = useState(false);
  return (
    <div className={styles.container}>
      <a
        onClick={handleLogin}
        href="https://discord.com/api/oauth2/authorize?client_id=987919485367369749&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Flogin&response_type=code&scope=guilds%20identify"
      >
        <LoginIcon icon={<FaDoorOpen size="28" />} />
      </a>
    </div>
  );

  function handleLogin() {
    const data = {
      client_id: '987919485367369749',
      client_secret: 'fTeDJ6e0nnJEJJJwcwhZsWggzVGs7yOc',
      grant_type: 'authorization_code',
      code: window.location.href.split('=')[1],
      redirect_uri: 'http://localhost:5173/login',
    };
    let apiEndpoint = 'https://discord.com/api/oauth2/';
    let access_token = window.sessionStorage.getItem('access_token');
    let user_object = window.sessionStorage.getItem('user_object');

    if (access_token) return;
    if (user_object) return;

    fetch(apiEndpoint + 'token', {
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
        const userJSON = await getIdentifyRes.json();
        fetch(apiEndpoint + 'users/@me/guilds', {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + loginJSON.access_token,
          },
        }).then(async (getGuildRes) => {
          const guildJSON = await getGuildRes.json();
          sessionStorage.setItem(
            'user_object',
            JSON.stringify({ ...userJSON, ...guildJSON }),
          );
          console.log({ ...userJSON, ...guildJSON });
        });
      });
    });
  }
}
