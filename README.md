![logo](https://repository-images.githubusercontent.com/508305889/7f961e8d-b953-43ad-8a6f-18aaaabfc5d5)

<div align="center">
    <div>
        <img src="https://img.shields.io/github/stars/sum117/Moniqueta-Discord.js?style=for-the-badge&logo=apache%20spark&logoColor=e4e4e4">
        <a href="https://discord.sumserver.xyz" target="new">
            <img src="https://img.shields.io/discord/956439276357308446?logo=discord&style=for-the-badge&logoColor=e4e4e4&label=Server%20de%20Suporte">
        </a>
    </div>
</div>

# ❤️ Moniqueta (X-Platform Roleplaying Tool)

## 📖 Sumário

<hr/>

- [🫶 Contribuidores](#contribuidores)
- [⚠️ Requerimentos](#️-requerimentos)
    - [🤖 Bot](#-bot)
    - [🌐 Web App](#-web-app)
- [🚀 Começando](#-começando)
    - [⚙️ Configuração](#️-configuração)
        - [Usando `config.json`](#usando-configjson)
        - [Usando Variáveis de Ambiente (Recomendado)](#usando-variáveis-de-ambiente-recomendado)
            - [Windows](#windows)
            - [Linux (Feito em Ubuntu)](#linux-feito-em-ubuntu)
- [📝 Recursos e Comandos](#-recursos-e-comandos)
- [🤝 Contribuindo](#-contribuindo)
- [🚩Em breve](#em-breve)

## 🫶 Contribuidores

<hr/>
<a href="https://github.com/sum117/Moniqueta-Discord.js/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sum117/Moniqueta-Discord.js" />
</a>

## ⚠️ Requerimentos

<hr/>

### 🤖 Bot

1. Token de Bot do Discord
   - **[Guia](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)**
2. Node.js 16+
3. Se estiver utilizando Windows, você deve instalar o Visual Studio Build Tools com a extensão para C++ (Por conta do
   banco de dados padrão da Moniqueta).

### 🌐 Web App

1. Vite Framework para React - **[Guia](https://vitejs.dev/guide/)**

<br>

## 🚀 Começando

<hr/>

Para começar a desenvolver a moniqueta, é relativamente simples:

> ⚠️ **Importante: Se você estiver usando Windows para instalar a Moniqueta com o banco de dados padrão é possível que
você tenha que fazer
algumas [configurações adicionais](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md#Windows)
.**

```sh
git clone https://github.com/sum117/Moniqueta-Discord.js
cd Moniqueta-Discord.js
npm install
```

Após a instalação, você pode tentar rodar o bot com o comando `npm run moniqueta` ou `npm run devMoniqueta` para
atualização automática.

<br>

### ⚙️ Configuração

<br/>

#### Usando `config.json`

Crie um arquivo `config.json` e preencha os valores respectivos:

> ⚠️ **Nunca dê commit no seu token de bot do Discord, adicione o `config.json` ao arquivo `.gitignore` do seu
projeto!**

```json
{
  "TOKEN": "",
  "PREFIX": ""
}
```

<br>

#### Usando Variáveis de Ambiente (Recomendado)

<br>

##### Windows

1. Pressione <kbd>![Windows Key][winlogo]</kbd> + <kbd> R </kbd>
2. Copie e cole, ou digite: `Variáveis de Ambiente` no campo de pesquisa.
3. Pressione <kbd>ENTER</kbd>
4. Clique no botão `Variáveis do Ambiente`: <br> ![ambientVarButton]
5. Clique no botão `Novo`, em Variáveis do Ambiente para o usuário: <br>![newAmbientVarButton]
6. Em `Nome da Variável` coloque `TOKEN`, e no valor, o seu `BOT TOKEN` do Discord.
7. Finalmente, faça o mesmo para o `PREFIX`, salve e reinicie o computador. A moniqueta já conseguirá ler seu Token!

[ambientvarbutton]: https://i.imgur.com/txsDXat.png

[winlogo]: https://i.imgur.com/LYwX4gY.png

[newambientvarbutton]: https://i.imgur.com/nDTq3fp.png

##### Linux (Feito em Ubuntu)

1. No seu terminal linux, use o comando:
   ```sh
   echo 'TOKEN="seu bot token"' >> /etc/environment
   echo 'PREFIX="um prefixo qualquer"' >> /etc/environment
   cd $HOME/Moniqueta-Discord.js
   npm run moniqueta
   ```
2. Pronto, deve funcionar!

## 📝 Recursos e Comandos

<hr/>
No momento a Moniqueta está em desenvolvimento, e possui os seguintes comandos:

> ⚠️ **Nota: O prefixo padrão é $, e Moniqueta tem
alguns [Comandos de Slash](https://support.discord.com/hc/pt-br/articles/1500000368501-Slash-Commands-FAQ) já prontos.**

- ⌨️ Use as ferramentas do playcard!

  _Considerando que você já criou um personagem_

  `/playcard send Olá!` Envia uma mensagem com o cartão de encenação.

  `/playcard edit Na verdade, quis dizer Olá!` Edita a última mensagem enviada pelo usuário.

  `/playcard remove` Deleta a última mensagem enviada pelo usuário.

  `/playcard remove <link de mensagem do Discord>` Remove uma mensagem especificada com link caso ela pertença ao
  usuário.

- 📋 Copie e cole mensagens e todos os seus conteúdos com links!

  `$copy <link de mensagem do Discord>`

- ✂️ Corte imagens e as transforme em ícones com bordas estilo Discord!

  `$icone <cor em hex> <url da imagem com extensão no final>`

  _Exemplo_: `$icone #0001 https://i.imgur.com/8WX8dkZ.jpeg`

- ☢️ Trocide as últimas 100 mensagens do canal com uma bomba nuclear com música e tudo!

  `$nuclear`

  <video
  width="320"
  height="180"
  src="https://user-images.githubusercontent.com/75037449/178625069-a661d585-d22a-42cb-b680-7c35cce49345.mp4"
  type="video/mp4"
  />

- 🪨✂️🧻 Jogue Pedra, Papel e Tesoura com a Moniqueta ou com seus amigos!

  `$rps <menção do usuário>`

## 🤝 Contribuindo

1. [Faça um Fork da Moniqueta](https://github.com/sum117/Moniqueta-Discord.js/fork)
2. Depois, clone-o: `git clone https://github.com/seuUsuarioGit/Moniqueta-Discord.js.git`
3. Crie a branch da sua feature: `git checkout -b minha-feature`
4. Adicione as suas mudanças `git add .`
5. Adicione suas mudanças: `git commit -m "Sua mensagem"`
6. Faça o push para sua branch: `git push origin minha-feature`
7. Depois, termine com um Pull Request dentro do repositório da Moniqueta

## 🚩Em breve

1. Aplicação Standalone React