import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {Home, Faq, Tradutor, Discord} from './pages';
import styles from './App.module.css';
import {Sidebar} from './components/Sidebar/Sidebar';
import {BlogDetails} from './components/BlogDetails/BlogDetails';
import {useState} from 'react';
import {CharForm} from './components/CharForm/CharForm';
export function App() {
  const [login, setLogin] = useState(false);
  if (!login) handleLogin();
  return (
    <Router>
      <div className={styles.wrapper}>
        <Sidebar />
        <Routes>
          <Route path="/" element={<Home IsLoggedIn={login} />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/faq/:id" element={<BlogDetails />} />
          <Route path="/tradutor" element={<Tradutor />} />
          <Route path="/discord" element={<Discord />} />
          <Route path="/char-form" element={<CharForm />} />
        </Routes>
      </div>
    </Router>
  );
  function handleLogin() {
    type userObject = {
      user: {
        id: string;
        username: string;
        avatar: string;
        discriminator: string;
      };
      guilds: Array<{id: string; name: string; owner: boolean}>;
    };
    const storage: userObject = JSON.parse(
      window.sessionStorage.getItem('user_object') as any
    );
    let guild = storage?.guilds?.find(
      guild => guild.id === '976870103125733388'
    );
    if (guild) return setLogin(true);
    if (!window.location.href.includes('code')) return;
    const data = {
      client_id: '987919485367369749',
      client_secret: 'umaeJ0_itADBpFXnLoWJhzRQlJd8EBuh',
      grant_type: 'authorization_code',
      code: window.location.href.split('=')[1],
      redirect_uri: 'http://localhost:5173/login'
    };
    let apiEndpoint = 'https://discord.com/api/oauth2/';
    let access_token = window.sessionStorage.getItem('access_token') as unknown;
    let user_object = window.sessionStorage.getItem('user_object') as unknown;
    if (access_token && user_object) return;

    return fetch(apiEndpoint + 'token', {
      method: 'POST',
      body: new URLSearchParams(data),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(async postRes => {
      apiEndpoint = 'https://discord.com/api/';
      const loginJSON = await postRes.json();
      sessionStorage.setItem(
        'access_token',
        JSON.stringify(loginJSON.access_token)
      );
      fetch(apiEndpoint + 'users/@me', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + loginJSON.access_token
        }
      }).then(async getIdentifyRes => {
        const userJSON = await getIdentifyRes.json();
        fetch(apiEndpoint + 'users/@me/guilds', {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + loginJSON.access_token
          }
        }).then(async getGuildRes => {
          const guildJSON = await getGuildRes.json();
          sessionStorage.setItem(
            'user_object',
            JSON.stringify({user: userJSON, guilds: guildJSON})
          );
          window.location.href = 'http://localhost:5173';
        });
      });
    });
  }
}
