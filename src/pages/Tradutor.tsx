import {InputBoxes} from '../components/InputBoxes/InputBoxes';
import HeaderStyle from './Header.module.css';
export function Tradutor() {
  return (
    <div
      style={{
        flex: 1
      }}
    >
      <h1 className={HeaderStyle.header}>TRADUTOR DE SUBTRATO</h1>
      <InputBoxes />
    </div>
  );
}
