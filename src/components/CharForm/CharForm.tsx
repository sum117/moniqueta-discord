import styles from './CharForm.module.css';
import {FaImage} from 'react-icons/fa';
import type {ChangeEvent, MouseEvent} from 'react';
import {useState} from 'react';

export function CharForm() {
  const [name, setName] = useState('');
  const [appearance, setAppearance] = useState('');
  const [personality, setPersonality] = useState('');
  const [ability, setAbility] = useState('');
  const [gender, setGender] = useState('');
  const [sum, setSum] = useState('');
  const [phantom, setPhantom] = useState('');
  const [avatar, setAvatar] = useState<ArrayBuffer | string>('');

  interface Skills {
    vitalidade: number | undefined;
    vigor: number | undefined;
    destreza: number | undefined;
    mente: number | undefined;
    forca: number | undefined;
    resistencia: number | undefined;
    primordio: number | undefined;
    elemental: number | undefined;
    profano: number | undefined;
  }

  const [skills, setSkills] = useState<Skills>({} as Skills);
  const char = {
    name,
    appearance,
    personality,
    ability,
    gender,
    sum,
    phantom,
    avatar,
    skills
  };
  const avatarIsSent = avatar ? 'Imagem Recebida!' : 'Foto do Personagem';
  return (
    <div className={styles.container}>
      <form
        className={styles.form}
        onSubmit={e => {
          e.preventDefault();
          console.log(char);
        }}
      >
        <header className={styles.banner}>
          <img alt="Avatar" src="https://github.com/sum117.png" />
        </header>
        <span className={styles.nameAndTitle}>
          <input
            required
            type="text"
            placeholder="Nome"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input hidden type="text" placeholder="Titulo" />
        </span>
        <input
          required
          className={styles.defaultInput}
          value={personality}
          onChange={e => setPersonality(e.target.value)}
          type="text"
          placeholder="Personalidade"
        />
        <input
          required
          className={styles.defaultInput}
          type="text"
          value={ability}
          onChange={e => setAbility(e.target.value)}
          placeholder="Habilidade"
        />
        <input
          required
          className={styles.defaultInput}
          type="text"
          placeholder="Físico"
          value={appearance}
          onChange={e => setAppearance(e.target.value)}
        />
        <span className={styles.sumAndImg}>
          <select required value={sum} onChange={e => setSum(e.target.value)}>
            <option value="" hidden>
              Soma
            </option>
            <option value="austera">Austera</option>
            <option value="oscuras">Oscuras</option>
            <option value="melancus">Melancus</option>
            <option value="insanata">Insanata</option>
            <option value="observata">Observata</option>
            <option value="perserata">Perserata</option>
            <option value="humano">Humano</option>
            <option value="subtrato">Subtrato</option>
            <option value="ehrantos">Ehrantos</option>
            <option value="equinocio">Equinocio</option>
          </select>
          <label>
            <FaImage size={25} /> {avatarIsSent}
            <input
              required
              type="file"
              accept="image/*"
              onChange={async e => {
                let file = await e.target.files?.[0].arrayBuffer();
                if (!file) return setAvatar('Foto do Personagem');
                return setAvatar(file);
              }}
            />
          </label>
        </span>
        <span className={styles.genderItemAttrsPhantom}>
          <select
            value={gender}
            onChange={e => setGender(e.target.value)}
            className={styles.gender}
          >
            <option value="" hidden>
              Gênero
            </option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </select>
          <select
            value={phantom}
            onChange={e => setPhantom(e.target.value)}
            className={styles.phantom}
          >
            <option value="" hidden>
              Fantasma
            </option>
            <option value="azul">Azul</option>
            <option value="branco">Branco</option>
            <option value="vermelho">Vermelho</option>
            <option value="ceifador">Ceifador</option>
            <option value="tempo">Tempo</option>
          </select>
          <input required type="text" placeholder="ID do Item" />
          <span className={styles.attrContainer}>
            <input
              id="vitalidade"
              className={styles.bullet}
              defaultValue={skills?.vitalidade}
              placeholder="❤️‍"
              type="text"
              onChange={handleNewAttribute}
            />
            <input
              id="forca"
              className={styles.bullet}
              defaultValue={skills?.forca}
              placeholder="💪"
              type="text"
              onChange={handleNewAttribute}
            />
            <input
              id="destreza"
              className={styles.bullet}
              defaultValue={skills?.destreza}
              placeholder="🏃"
              type="text"
              onChange={handleNewAttribute}
            />
            <input
              id="vigor"
              className={styles.bullet}
              defaultValue={skills?.vigor}
              placeholder="💦"
              type="text"
              onChange={handleNewAttribute}
            />
            <input
              id="mente"
              className={styles.bullet}
              type="text"
              placeholder="🧠"
              defaultValue={skills?.mente}
              onChange={handleNewAttribute}
            />
            <input
              id="elemental"
              className={styles.bullet}
              type="text"
              placeholder="🔥"
              defaultValue={skills?.elemental}
              onChange={handleNewAttribute}
            />
            <input
              id="profano"
              className={styles.bullet}
              placeholder="💀"
              type="text"
              defaultValue={skills?.profano}
              onChange={handleNewAttribute}
            />
            <input
              id="resistencia"
              className={styles.bullet}
              placeholder="🛡️"
              type="text"
              defaultValue={skills?.resistencia}
              onChange={handleNewAttribute}
            />
            <input
              id="primordio"
              className={styles.bullet}
              placeholder="🔖"
              type="text"
              defaultValue={skills?.primordio}
              onChange={handleNewAttribute}
            />
          </span>
          <span className={styles.submitBtns}>
            <button type="submit">CRIAR</button>
            <button onClick={handleResetButton}>RESETAR</button>
          </span>
        </span>
      </form>
    </div>
  );

  function handleNewAttribute(event: ChangeEvent<HTMLInputElement>) {
    const updatedValue = {[event.target.id]: Number(event.target.value)};
    setSkills(skills => ({...skills, ...updatedValue}));
  }

  function handleResetButton(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    setAvatar('');
    setName('');
    setSum('');
    setSkills({} as Skills);
    setGender('');
    setPhantom('');
    setAppearance('');
    setAbility('');
    setPersonality('');
  }
}