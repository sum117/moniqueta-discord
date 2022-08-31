import {useParams} from 'react-router-dom';
import styles from './BlogDetails.module.css';
import {useFetch} from '../../script/useFetch';

export function BlogDetails() {
  const {id} = useParams();
  const {
    data: post,
    error,
    loading
  } = useFetch('http://localhost:6652/posts/' + id);
  return (
    <div className={styles.wrapper}>
      <div className={styles.post}>
        {loading && <div>Carregando...</div>}
        {error && <div>{error}</div>}
        {post && (
          <article>
            <h2 className={styles.title}>{post['title']}</h2>
            <p>Escrito por {post['author']}</p>
            <div>{post['body']}</div>
          </article>
        )}
      </div>
    </div>
  );
}
