type SumAssetsProps = {
    [key in | "austera"
        | "perserata"
        | "insanata"
        | "equinocio"
        | "oscuras"
        | "ehrantos"
        | "melancus"
        | "observata"
        | "invidia"
        | "subtrato"
        | "humano"]: {
        color: number;
        emoji: string;
        emojiId: string;
        thumbnail: string;
        description: string;
    };
};
export const sumAssets: SumAssetsProps = {
    austera: {
        color: 10517508,
        emoji: "<:Austeros:982077481702027344>",
        get emojiId() {
            return this.emoji.replace(/[<>]/g, "").split(":")[2];
        },
        get thumbnail() {
            return (
                "https://cdn.discordapp.com/emojis/" + this.emojiId + ".png?size=1024"
            );
        },
        description: "Ordem acima da luz, ordem acima de tudo.",
    },
    perserata: {
        color: 550020,
        emoji: "<:Perserata:982078451513184306>",
        get emojiId() {
            return this.emoji.replace(/[<>]/g, "").split(":")[2];
        },
        get thumbnail() {
            return (
                "https://cdn.discordapp.com/emojis/" + this.emojiId + ".png?size=1024"
            );
        },
        description: "Perseverança e gratidão leva a reinicio de ciclos.",
    },
    insanata: {
        color: 11535364,
        emoji: "<:Insanata:982078436166221874>",
        get emojiId() {
            return this.emoji.replace(/[<>]/g, "").split(":")[2];
        },
        get thumbnail() {
            return (
                "https://cdn.discordapp.com/emojis/" + this.emojiId + ".png?size=1024"
            );
        },
        description: "A insanidade é a única forma de se ver a verdade.",
    },
    equinocio: {
        color: 562180,
        emoji: "<:Equinocio:982082685889564772>",
        get emojiId() {
            return this.emoji.replace(/[<>]/g, "").split(":")[2];
        },
        get thumbnail() {
            return (
                "https://cdn.discordapp.com/emojis/" + this.emojiId + ".png?size=1024"
            );
        },
        description: "A liberdade através da tecnologia.",
    },
    oscuras: {
        color: 3146828,
        emoji: "<:Oscuras:982082685835051078>",
        get emojiId() {
            return this.emoji.replace(/[<>]/g, "").split(":")[2];
        },
        get thumbnail() {
            return (
                "https://cdn.discordapp.com/emojis/" + this.emojiId + ".png?size=1024"
            );
        },
        description: "A verdadeira arma é a escuridão.",
    },
    ehrantos: {
        color: 15236108,
        emoji: "<:Ehrantos:982082685793087578>",
        get emojiId() {
            return this.emoji.replace(/[<>]/g, "").split(":")[2];
        },
        get thumbnail() {
            return (
                "https://cdn.discordapp.com/emojis/" + this.emojiId + ".png?size=1024"
            );
        },
        description: "Evolução através da fé.",
    },
    melancus: {
        color: 328708,
        emoji: "<:Melancus:982082685801472060>",
        get emojiId() {
            return this.emoji.replace(/[<>]/g, "").split(":")[2];
        },
        get thumbnail() {
            return (
                "https://cdn.discordapp.com/emojis/" + this.emojiId + ".png?size=1024"
            );
        },
        description: "Sem sofrimento não há redenção.",
    },
    observata: {
        color: 16777215,
        emoji: "<:Observata:982082685864378418>",
        get emojiId() {
            return this.emoji.replace(/[<>]/g, "").split(":")[2];
        },
        get thumbnail() {
            return (
                "https://cdn.discordapp.com/emojis/" + this.emojiId + ".png?size=1024"
            );
        },
        description: "Testemunha o mundo se ajoelhar perante a ti.",
    },
    invidia: {
        color: 547996,
        emoji: "<:Invidia:982082685503696967>",
        get emojiId() {
            return this.emoji.replace(/[<>]/g, "").split(":")[2];
        },
        get thumbnail() {
            return (
                "https://cdn.discordapp.com/emojis/" + this.emojiId + ".png?size=1024"
            );
        },
        description: "A inveja é a única forma de se ver a verdade.",
    },
    subtrato: {
        color: 8355711,
        emoji: "<:subtratos:1007714304319033394>",
        get emojiId() {
            return this.emoji.replace(/[<>]/g, "").split(":")[2];
        },
        get thumbnail() {
            return (
                "https://cdn.discordapp.com/emojis/" + this.emojiId + ".png?size=1024"
            );
        },
        description: "",
    },
    humano: {
        color: 16493758,
        emoji: "<:humanos:1009521051115466843>",
        get emojiId() {
            return this.emoji.replace(/[<>]/g, "").split(":")[2];
        },
        get thumbnail() {
            return (
                "https://cdn.discordapp.com/emojis/" + this.emojiId + ".png?size=1024"
            );
        },
        description: "",
    },
};
