import { InputBoxes } from '../components/InputBoxes/InputBoxes';
import pagesStyles from './Header.module.css';
export function Tradutor() {
  return (
    <div>
      <h1 className={pagesStyles.header}>TRADUTOR DE SUBTRATO</h1>
      <InputBoxes />
    </div>
  );
}
