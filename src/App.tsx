import { InputBoxes } from './components/InputBoxes';
import styles from './App.module.css';
export function App() {
  return (
    <div>
      <h1 className={styles.header}>TRADUTOR DE SUBTRATO</h1>  
      <InputBoxes></InputBoxes>
    </div>
  );
}
