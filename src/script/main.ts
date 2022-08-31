const lang = new Map([
  ['a', 'չ'],
  ['b', 'ץ'],
  ['c', 'ฬ'],
  ['ç', 'ฬ'],
  ['d', 'ש'],
  ['e', 'א'],
  ['f', 'ย'],
  ['g', 'Շ'],
  ['h', 'ร'],
  ['i', 'г'],
  ['j', 'ợ'],
  ['k', 'ק'],
  ['l', '๏'],
  ['m', 'ภ'],
  ['n', '๓'],
  ['o', 'ɭ'],
  ['p', 'к'],
  ['q', 'ן'],
  ['r', 'เ'],
  ['s', 'ђ'],
  ['t', 'ﻮ'],
  ['u', 'Ŧ'],
  ['v', 'є'],
  ['w', '๔'],
  ['x', 'ς'],
  ['y', '๒'],
  ['z', 'ค'],
  [' ', '']
]);

export default function main(id: string, text: string) {
  if (id === 'traduzir') {
    return text.split('').find(char => [...lang].find(([_k, v]) => v === char))
      ? `${[...text]
          .map(c =>
            c === ' ' ? ' ' : [...lang].find(([_k, v]) => v === c)?.[0]
          )
          .join('')}`
      : '';
  } else if (id === 'codificar') {
    if (
      !text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s']|_/g, '')
        .split('')
        .find(char => [...lang].find(([k]) => k === char))
    ) {
      return '';
    }
    text = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s']|_/g, '')
      .replace(/\s+/g, ' ');

    return `${[...text].map(c => (c === ' ' ? ' ' : lang.get(c))).join('')}`;
  }
  return '';
}