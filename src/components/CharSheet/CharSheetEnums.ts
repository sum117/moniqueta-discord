export enum ComponentMessage {
    LoadingState = "<a:loading:1014800574228746291> Carregando...",
    Info = `
Antes de criar o personagem certifique-se de que leu todos os canais da categoria conteúdo. Usar esse método de criação requer um tempo de espera que flutua de 2 a 5 dias por conta das rachaduras somáticas. Informação sobre elas podem ser encontradas na categoria supracitada. Se você não quer aguardar, escolha um personagem no canal SDC-PREMIADOS.

Após a criação do seu personagem você deverá aguardar até o próximo evento de Rachadura Somática, que acontece toda sexta feira ou quando a cota de membros na fila é excedida. Tenha em mente que esse evento também depende da disponibilidade dos administradores. De qualquer forma, nós temos o compromisso de fazer pelo menos um desses eventos por semana.

**Rachadura Somática**

Todas as Somas chegam ao mundo através dela. Desamparadas e imbuídas apenas com conhecimento básico, poucas sobrevivem. Mesmo assim, as Somas já presentes em Imprevia fazem de tudo para resgatá-las, pois sempre existe a pequena chance de uma delas ser a próxima catalisadora da Equação Primordial. Nenhum sacrifício é grande demais.

**Motivos**

1. Introdução épica para todos os nossos jogadores;
2. Sobrecarga administrativa improvável;
3. Amigos instantâneos para novos jogadores;
4. Envolvimento com a história garantido.

Vale a pena esperar!

Um abraço,
sum117
`,
}

export enum SelectorPlaceholder {
    ChooseSum = "Escolha uma Soma",
    ChooseGender = "Escolha um gênero",
    ChoosePhantom = "Escolha um fantasma",
}

export enum SelectorCustomId {
    Sum = "sumSelector",
    Gender = "genderSelector",
    Phantom = "phantomSelector",
}

export enum GenderOptionLabel {
    Male = "Masculino",
    Female = "Feminino",
    LGBTQP = "LGBTQ+",
    NotSpecified = "Não Especificar",
}

export enum GenderOptionValue {
    Male = "male",
    Female = "female",
    LGBTQP = "lgbtqp",
    NotSpecified = "any",
}

export enum GenderOptionEmoji {
    Male = "♂️",
    Female = "♀️",
    LGBTQP = "🏳️‍🌈",
    NotSpecified = "👤",
}

export enum ErrorMessage {
    BrokenOption = "Opção inválida encontrada na hora de gerar os seletores somáticos.",
    SheetAlreadyExists = "Já existe um criador de fichas nesse canal. Para criar outro, primeiro exclua o anterior, administrador.",
    InvalidChannel = "Um canal inválido foi fornecido para o criador de seletores somáticos.",
    DatabaseError = "Um erro ocorreu ao tentar salvar o criador de seletores somáticos no banco de dados. Contate um administrador",
}

export enum Modal {
    CustomId = "characterModal",
    Title = "Ficha de Personagem",
}

export enum ModalCustomId {
    Name = "characterModalName",
    Personality = "characterModalPersonality",
    PhysicalInfo = "characterModalPhysicalInfo",
    Ability = "characterModalAbility",
    Link = "characterModalLink",
}

export enum ModalLabel {
    Name = "Nome",
    Personality = "Personalidade",
    PhysicalInfo = "Características Físicas",
    Ability = "Habilidade",
    Link = "Link de Imagem",
}

export enum ModalPlaceholder {
    Name = "Sachil Es",
    Personality = "Uma pessoa muito complicada...",
    PhysicalInfo = "Busto generoso, corpo forte...",
    Ability = "A habilidade do personagem não irá interferir no combate.",
    Link = "https://i.imgur.com/image.png",
}

export enum ModalButton {
    Open = "Abrir Formulário",
    CustomId = "openCharModal",
}
