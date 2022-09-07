import styles from './Writer.module.css';
import React, {useRef, useState} from 'react';
export function Writer() {
  const [text, setText] = useState('');
  const editor = useRef<HTMLDivElement>(null);
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(true);
  return (
    <div className={styles.container}>
      <div
        ref={editor}
        className={styles.editor}
        contentEditable={true}
        spellCheck={true}
        onKeyDown={handleTabIndent}
        onPaste={handlePaste}
        onClick={handlePlaceholder}
        onInput={handleTextChange}
      >
        {isPlaceholderVisible && (
          <span className={styles.placeholder}>
            <p>Comece a escrever aqui...</p>
            <p>
              Esse editor de texto tem o objetivo de lhe ajudar a compor uma
              história sem muitas repetições. Ele lhe informará a quantia de
              caracteres atuais, e a quantidade de palavras.
            </p>
          </span>
        )}
      </div>
      <button className={styles.checkBtn} onClick={handleTextCheck}>
        Verificar
      </button>
      <div className={styles.info}>
        <p> {text.length} caracteres</p>
        <p> {text.split(' ').length - 1} palavras</p>
      </div>
    </div>
  );
  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, text);
  }
  function handleTabIndent(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  }
  function handlePlaceholder() {
    setIsPlaceholderVisible(false);
  }
  function handleTextChange(e: React.FormEvent<HTMLDivElement>) {
    setText(e.currentTarget.innerText);
  }
  function handleTextCheck() {
    // split text into paragraphs
    const paragraphs: string[] = text
      .split('\n')
      .filter(paragraph => paragraph !== '');
    const highLightedText = paragraphs.map(paragraph => {
      console.log(paragraph);
      // maintain tab indentation
      const words = paragraph
        .split(/\s+/)
        .filter(word => word !== '')
        .map((word, index) => {
          // if last index add indentation
          if (index === 0) return '&nbsp;&nbsp;&nbsp;&nbsp;' + word;
          return word;
        });
      // check for words repeated more than 3 times
      const repeatedWords = words.filter(
        (word, index, array) =>
          array.indexOf(word) !== index &&
          array.indexOf(word, index + 1) !== -1 &&
          array.indexOf(word, index + 2) !== -1
      );

      // highlight repeated words
      const connectors = [
        'e',
        'é',
        'a',
        'o',
        'que',
        'de',
        'do',
        'da',
        'em',
        'ou',
        'com',
        'um'
      ];
      const ponctuations = [
        '.',
        ',',
        '!',
        '?',
        ':',
        ';',
        '-',
        '–',
        '—',
        '...',
        '…',
        '“',
        '”',
        '"',
        "'",
        '(',
        ')',
        '[',
        ']',
        '{',
        '}',
        '«',
        '»'
      ];
      const highlightedRepeated = words.map(word => {
        if (repeatedWords.includes(word)) {
          if (connectors.includes(word)) return word;
          return `<span class="${styles.highlighted}">${word}</span>`;
        }
        return word;
      });
      const highlightedConnectors = highlightedRepeated.map(word => {
        if (connectors.includes(word)) {
          return `<span class="${styles.highlightedConnector}">${word}</span>`;
        }
        return word;
      });
      console.log(highlightedConnectors);
      const highlightedPonctuations = highlightedConnectors.map(word => {
        // get possible ponctuation
        const possiblePonctuation = word[word.length - 1];
        // if word ends with ponctuation maintain it and color only the ponctuation
        if (ponctuations.includes(possiblePonctuation)) {
          const isRepeated = repeatedWords.includes(
            word.substring(0, word.length - 1)
          )
            ? `<span class=${styles.highlighted}>${word.substring(
                0,
                word.length - 1
              )}</span>`
            : word.substring(0, word.length - 1);

          return `${isRepeated}<span class="${styles.highlightedPonctuation}">${possiblePonctuation}</span>`;
        }
        return word;
      });
      const highlightedParagraph = highlightedPonctuations.join(' ');

      return highlightedParagraph;
    });
    // set text to highLightedText
    editor.current!.innerHTML = highLightedText.join('<br><br>');
  }
}
