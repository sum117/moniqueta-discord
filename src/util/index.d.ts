import { Client, Message, MessageEmbed, Snowflake } from 'discord.js';

/**
 * Gera uma string com o tempo formatado de forma legível.
 * @param ms O tempo em milisegundos para ser formatado.
 */
export declare function msToTime(ms: number): string;
/**
 * Gera uma barra de status para o bot.
 * @param current A quantia atual do preenchimento da barra de status
 * @param total A quantidade total que a barra de status deve ser preenchida
 * @param fill O caracter que deve ser usado para preencher a barra de status
 * @param empty O caracter que deve ser usado para preencher a barra de status quando não houver nada para preencher
 */
export declare function statusBar(current: number, total: number, fill: string, empty: string, width?: number): string;
/**
 * Formata uma string em um título.
 * @param string string a ser formatada
 */
export declare function title(string: string): string;
/**
 * Atualiza o contador de membros do servidor.
 * @param moniqueta O cliente do bot
 * @param guild Um id de servidor do Discord
 */
export declare async function updateMemberCounter(moniqueta: Client, guild: Snowflake | string): Promise<void>;
/**
 * Registra os comandos slash no bot.
 * @param moniqueta - Um cliente do Discord
 * @param guild - Um id de servidor do Discord
 */
export declare async function registerSlashCommands(moniqueta: Client, guild: Snowflake | string): Promise<void>;
/**
 * Roda os comandos do bot. Deve ser colocado nos eventos.
 * @param event O nome do evento que executou este comando
 * @param args Os argumentos do evento. Variam de um para outro
 */
export declare async function loadCommands(event: string, ...args: any): Promise<void>;
/**
 * Reage a uma mensagem com uma matriz de emojis.
 * @param msg a mensagem a ser reagida
 * @param emojis a matriz de emojis a serem usados
 */
export declare async function bulkEmoji(msg: Message, emojis: Array<string>): Promise<Message>;
/**
 * Inicializa os eventos necessários para o funcionamento dos comandos.
 * @param moniqueta O cliente do bot
 * @param events os eventos que serão utilizados pelo bot
 */
export declare async function loadEvents(
  moniqueta: Client,
  events: Array<{ name: string; once: boolean }> | Map<string, Function<(queue: any, ...args: any) => void>>
): Promise<void>;

export declare async function embedComponent(
  description: string,
  fields?: [{ name: string; value: string }]
): Promise<MessageEmbed>;

export declare function delay(n: number): Promise<void>;

export * as misc from './misc.js';
