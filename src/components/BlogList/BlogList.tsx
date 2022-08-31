import {Link} from 'react-router-dom';
import styles from './BlogList.module.css';

export function BlogList({blogs}: {[_key: string]: any}) {
  return (
    <div className={styles.postWrapper}>
      {blogs.map((blog: {id: number; title: string; author: string}) => (
        <div className={styles.blogPreview} key={blog.id}>
          <Link to={`/faq/${blog.id}`}>
            <h2>{blog.title}</h2>
            <p>Escrito por {blog.author}</p>
          </Link>
        </div>
      ))}
    </div>
  );
}