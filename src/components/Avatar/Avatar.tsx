import styles from './Avatar.module.css';

export function Avatar({ user_object }: { user_object: string }) {
  const {
    user: { id, avatar },
  } = JSON.parse(user_object) as {
    user: {
      id: string;
      avatar: string;
    };
  };
  return (
    <img
      className={styles.avatar}
      src={`https://cdn.discordapp.com/avatars/${id}/${avatar}.png`}
      alt="Avatar"
      title="Avatar"
    />
  );
}
