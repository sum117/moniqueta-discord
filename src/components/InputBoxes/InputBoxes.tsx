import styles from './InputBox.module.css';
import {useState} from 'react';
import LinguaSubtrata from '../../script/main';

export function InputBoxes() {
  const [textoCodado, setTextoCodado] = useState('');
  const [textoLegivel, setTextoLegivel] = useState('');
  return (
    <div className={styles.InputBoxes}>
      <textarea
        id="traduzir"
        value={textoLegivel}
        onChange={handleNewContent}
        placeholder="Texto Legível..."
      />
      <textarea
        id="codificar"
        value={textoCodado}
        onChange={handleNewContent}
        placeholder="Texto Codificado..."
      />
    </div>
  );

  function handleNewContent(event: React.ChangeEvent<HTMLTextAreaElement>) {
    let str = event.target.value;
    if (event.target.id === 'traduzir') {
      setTextoLegivel(str);
      setTextoCodado(LinguaSubtrata('codificar', str));
    } else if (event.target.id === 'codificar') {
      setTextoCodado(str);
      setTextoLegivel(LinguaSubtrata('traduzir', str));
    }
  }
}
