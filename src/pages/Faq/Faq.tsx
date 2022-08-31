import styles from './Faq.module.css';
import HeaderStyle from '../Header.module.css';
import {useFetch} from '../../script/useFetch';
import {BlogList} from '../../components/BlogList/BlogList';
export function Faq() {
  const {data: posts, loading, error} = useFetch('http://localhost:6652/posts');
  return (
    <div className={styles.wrapper}>
      <h1 className={HeaderStyle.header}>FAQ</h1>
      {loading && <p>Carregando...</p>}
      {error && <p>{error}</p>}
      {posts && <BlogList blogs={posts} />}
    </div>
  );
}
