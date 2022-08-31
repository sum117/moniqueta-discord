import styles from './Avatar.module.css';

export function Avatar({user_object}: {user_object: string}) {
  const {
    user: {id, avatar, username, discriminator, banner}
  } = JSON.parse(user_object) as {
    user: {
      id: string;
      avatar: string;
      username: string;
      discriminator: string;
      banner?: string;
    };
  };
  const phrases = [
    'Eu sou o caminho para a verdade, mas acredite... você não quer conhecê-la.',
    'Eu não conheci o início, mesmo que pensem que sim. Não sou Deusa. Sou parte do teatro.',
    'Eles me conhecem por Hera, a Destruidora de mundos.'
  ];
  return (
    <div className={styles.card}>
      <div className={styles.desktopContainer}>
        {banner ? (
          <img
            alt="Banner"
            className={styles.banner}
            src={`https://cdn.discordapp.com/banners/${id}/${banner}.png?size=1024`}
          />
        ) : undefined}
        <img
          className={styles.avatar}
          src={`https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=512`}
          alt="Avatar"
          title="Avatar"
        />
        <small className={styles.desc}>
          {phrases[Math.floor(Math.random() * phrases.length)]}
        </small>
      </div>
      <span>{username + '#' + discriminator} | Escritor SDA</span>
    </div>
  );
}