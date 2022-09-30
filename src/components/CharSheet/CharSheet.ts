import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  MessageActionRowComponentBuilder,
  ModalBuilder,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  Snowflake,
  TextChannel,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';
import {phantomAssets, sumAssets} from '../../resources';
import {HandleServerComponent} from '../../../prisma';
import {Util} from '../../util/Util';
import {
  ComponentMessage,
  GenderOptionEmoji,
  GenderOptionLabel,
  GenderOptionValue,
  Modal,
  ModalButton,
  ModalCustomId,
  ModalLabel,
  ModalPlaceholder,
  SelectorCustomId,
  SelectorPlaceholder
} from './CharSheetEnums';
import {ErrorMessage} from '../../util/ErrorMessage';

export class CharSheet {
  channelId: string;
  client: Client;

  constructor(channelId: Snowflake, client: Client<boolean>) {
    this.channelId = channelId;
    this.client = client;
  }

  public static generateModal() {
    return new ModalBuilder()
      .setCustomId(Modal.CustomId)
      .setTitle(Modal.Title)
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId(ModalCustomId.Name)
            .setLabel(ModalLabel.Name)
            .setPlaceholder(ModalPlaceholder.Name)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(256)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId(ModalCustomId.Personality)
            .setLabel(ModalLabel.Personality)
            .setPlaceholder(ModalPlaceholder.Personality)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(4000)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId(ModalCustomId.PhysicalInfo)
            .setLabel(ModalLabel.PhysicalInfo)
            .setPlaceholder(ModalPlaceholder.PhysicalInfo)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(4000)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId(ModalCustomId.Ability)
            .setLabel(ModalLabel.Ability)
            .setPlaceholder(ModalPlaceholder.Ability)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(4000)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId(ModalCustomId.Link)
            .setLabel(ModalLabel.Link)
            .setPlaceholder(ModalPlaceholder.Link)
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(500)
        )
      );
  }

  public async generateSheet() {
    const sheetExists = await this._checkIfSheetExists();
    if (sheetExists) return ErrorMessage.SheetAlreadyExists;

    const channel = await this.client.channels.fetch(this.channelId);
    if (channel instanceof TextChannel) {
      const feedback = await channel.send(ComponentMessage.LoadingState);
      await Util.delay(2000);
      if (feedback) {
        const sheet = this._composeSelectorButton();
        if (sheet) {
          const databaseQuery = HandleServerComponent.create(
            'CharSheet',
            this.channelId,
            feedback.id
          );
          if (!databaseQuery) return ErrorMessage.DatabaseError;
          return feedback.edit({
            content: ComponentMessage.Info,
            components: sheet
          });
        }
      }
    }
    return ErrorMessage.InvalidChannel;
  }

  private _composeSelectorButton() {
    const generateOptionsFromJson = (
      assets: typeof sumAssets | typeof phantomAssets,
      without: Array<string> | string = ['']
    ) =>
      Object.entries(assets)
        .map(sum => {
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
        .filter(option => {
          return option instanceof SelectMenuOptionBuilder;
        }) as SelectMenuOptionBuilder[];
    const sumOptions = generateOptionsFromJson(sumAssets, ['subtrato', 'humano']);
    const phantomOptions = generateOptionsFromJson(phantomAssets, 'tempo');
    if (sumOptions.length < 1 || phantomOptions.length < 1)
      return console.log(ErrorMessage.BrokenOption);
    const selectors = [
      new SelectMenuBuilder()
        .setCustomId(SelectorCustomId.Sum)
        .setPlaceholder(SelectorPlaceholder.ChooseSum)
        .addOptions(sumOptions),
      new SelectMenuBuilder()
        .setCustomId(SelectorCustomId.Phantom)
        .setPlaceholder(SelectorPlaceholder.ChoosePhantom)
        .addOptions(phantomOptions),
      new SelectMenuBuilder()
        .setCustomId(SelectorCustomId.Gender)
        .setPlaceholder(SelectorPlaceholder.ChooseGender)
        .addOptions([
          new SelectMenuOptionBuilder()
            .setLabel(GenderOptionLabel.Male)
            .setValue(GenderOptionValue.Male)
            .setEmoji(GenderOptionEmoji.Male),
          new SelectMenuOptionBuilder()
            .setLabel(GenderOptionLabel.Female)
            .setValue(GenderOptionValue.Female)
            .setEmoji(GenderOptionEmoji.Female),
          new SelectMenuOptionBuilder()
            .setLabel(GenderOptionLabel.LGBTQP)
            .setValue(GenderOptionValue.LGBTQP)
            .setEmoji(GenderOptionEmoji.LGBTQP),
          new SelectMenuOptionBuilder()
            .setLabel(GenderOptionLabel.NotSpecified)
            .setValue(GenderOptionValue.NotSpecified)
            .setEmoji(GenderOptionEmoji.NotSpecified)
        ])
    ];
    const modalBtn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(ModalButton.CustomId)
        .setLabel(ModalButton.Open)
        .setStyle(ButtonStyle.Primary)
    );
    let row = selectors.map(selector => new ActionRowBuilder().addComponents(selector));
    row.push(modalBtn);
    return row as ActionRowBuilder<MessageActionRowComponentBuilder>[];
  }

  private async _checkIfSheetExists() {
    const sheetId = await HandleServerComponent.get('CharSheet');
    if (sheetId) {
      const channel = await this.client.channels.fetch(this.channelId);
      if (channel instanceof TextChannel) {
        const isExistantMessage = async () => {
          try {
            const fetchedMessage = await channel.messages.fetch(sheetId.messageId);
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
