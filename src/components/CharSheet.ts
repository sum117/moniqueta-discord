import {
  ActionRowBuilder,
  MessageActionRowComponentBuilder,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  Snowflake,
  TextChannel,
  Client,
} from 'discord.js';
import { phantomAssets, sumAssets } from '../resources';
import { HandleServerComponent } from '../../prisma';
import { Util } from '../util/Util';

enum ComponentMessage {
  LoadingState = '<a:loading:1014800574228746291> Carregando...',
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
enum SelectorPlaceholder {
  ChooseSum = 'Escolha uma Soma',
  ChooseGender = 'Escolha um gênero',
  ChoosePhantom = 'Escolha um fantasma',
  InitialItem = 'Escolha um item inicial',
}
enum SelectorCustomId {
  Sum = 'sumSelector',
  Gender = 'genderSelector',
  Phantom = 'phantomSelector',
}
enum GenderOptionLabel {
  Male = 'Masculino',
  Female = 'Feminino',
  LGBTQP = 'LGBTQ+',
  NotSpecified = 'Não Especificar',
}
enum GenderOptionValue {
  Male = 'male',
  Female = 'female',
  LGBTQP = 'lgbtqp',
  NotSpecified = 'any',
}
enum ErrorMessage {
  BrokenOption = 'Opção inválida encontrada na hora de gerar os seletores somáticos.',
  SheetAlreadyExists = 'Já existe um criador de fichas nesse canal. Para criar outro, primeiro exclua o anterior, administrador.',
  InvalidChannel = 'Um canal inválido foi fornecido para o criador de seletores somáticos.',
  DatabaseError = 'Um erro ocorreu ao tentar salvar o criador de seletores somáticos no banco de dados. Contate um administrador',
}
export class CharSheet {
  channelId: string;
  client: Client;
  constructor(channelId: Snowflake, client: Client<boolean>) {
    this.channelId = channelId;
    this.client = client;
  }

  public async generateSheet() {
    const sheetExists = await this._checkIfSheetExists();
    if (sheetExists) return ErrorMessage.SheetAlreadyExists;

    const channel = await this.client.channels.fetch(this.channelId);
    if (channel instanceof TextChannel) {
      const feedback = await channel.send(ComponentMessage.LoadingState);
      await Util.delay(2000);
      if (feedback) {
        const sheet = this._composeSheet();
        if (sheet) {
          const databaseQuery = HandleServerComponent.create(
            'CharSheet',
            this.channelId,
            feedback.id,
          );
          if (!databaseQuery) return ErrorMessage.DatabaseError;
          return feedback.edit({
            content: ComponentMessage.Info,
            components: sheet,
          });
        }
      }
    }
    return ErrorMessage.InvalidChannel;
  }

  private _composeSheet() {
    const generateOptionsFromJson = (
      assets: typeof sumAssets | typeof phantomAssets,
      without: Array<string> | string = [''],
    ) =>
      Object.entries(assets)
        .map((sum) => {
          const key = sum[0];
          const values = sum[1];
          if (without && !(without instanceof Array)) without = [without];
          if (!without.includes(key)) {
            return new SelectMenuOptionBuilder()
              .setLabel(Util.titleCase(key))
              .setDescription(values.description)
              .setEmoji(values.emoji)
              .setValue(key);
          }
        })
        .filter(
          (option) => option instanceof SelectMenuOptionBuilder,
        ) as SelectMenuOptionBuilder[];
    const sumOptions = generateOptionsFromJson(sumAssets, [
      'subtrato',
      'humano',
    ]);
    const phantomOptions = generateOptionsFromJson(phantomAssets, 'tempo');
    if (sumOptions.length < 1 || phantomOptions.length < 1)
      return console.log(ErrorMessage.BrokenOption);
    const selectors = [
      new SelectMenuBuilder()
        .setCustomId(SelectorCustomId.Gender)
        .setPlaceholder(SelectorPlaceholder.ChooseSum)
        .addOptions(sumOptions),
      new SelectMenuBuilder()
        .setCustomId(SelectorCustomId.Phantom)
        .setPlaceholder(SelectorPlaceholder.ChoosePhantom)
        .addOptions(phantomOptions),
      new SelectMenuBuilder()
        .setCustomId(SelectorCustomId.Sum)
        .setPlaceholder(SelectorPlaceholder.ChooseGender)
        .addOptions([
          new SelectMenuOptionBuilder()
            .setLabel(GenderOptionLabel.Male)
            .setValue(GenderOptionValue.Male),
          new SelectMenuOptionBuilder()
            .setLabel(GenderOptionLabel.Female)
            .setValue(GenderOptionValue.Female),
          new SelectMenuOptionBuilder()
            .setLabel(GenderOptionLabel.LGBTQP)
            .setValue(GenderOptionValue.LGBTQP),
          new SelectMenuOptionBuilder()
            .setLabel(GenderOptionLabel.NotSpecified)
            .setValue(GenderOptionValue.NotSpecified),
        ]),
    ];
    const row = selectors.map((selector) =>
      new ActionRowBuilder().addComponents(selector),
    );
    return row as ActionRowBuilder<MessageActionRowComponentBuilder>[];
  }

  private async _checkIfSheetExists() {
    const sheetId = await HandleServerComponent.get('CharSheet');
    if (sheetId) {
      const channel = await this.client.channels.fetch(this.channelId);
      if (channel instanceof TextChannel) {
        const isExistantMessage = async () => {
          try {
            const fetchedMessage = await channel.messages.fetch(
              sheetId.messageId,
            );
            if (fetchedMessage) return true;
          } catch {
            await HandleServerComponent.delete('CharSheet');
            return false;
          }
        };
        if (await isExistantMessage()) {
          return true;
        }
      }
    }
    return false;
  }
}
