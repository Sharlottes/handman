import { displaySupportedUnicode } from "@/utils/displaySupportedUnicode";
import { EmbedBuilder, AttachmentBuilder, ChannelType } from "discord.js";
import GameManager from "@/core/GameManager";
import Game from "@/core/Game";

import { client } from ".";

// Game state를 embed에 render하기 위한 매니저

const lifeImageAttachments = Array.from(
  { length: 11 },
  (_, i) => new AttachmentBuilder(`assets/images/${i}.jpg`)
);

class GameEmbed {
  embed!: Discord.EmbedBuilder;
  message?: Discord.Message;

  constructor(
    readonly game: Game,
    readonly channel: Discord.ThreadChannel
  ) {
    this.updateEmbed();
    game.on("WORD_TRIED", (word, found) => {
      GameEmbedManager.gameEmbeds[game.id].send();
      channel.send({
        content: `someone tried "${word}", and that was ${
          found ? "correct" : "incorrect"
        }!`,
      });
    });
  }

  async send() {
    this.updateEmbed();
    if (this.message) {
      this.message.edit({
        embeds: [this.embed],
        files: [lifeImageAttachments[10 - this.game.life]],
      });
    } else {
      this.message = await this.channel.send({
        embeds: [this.embed],
        files: [lifeImageAttachments[10 - this.game.life]],
      });
    }
  }

  updateEmbed() {
    this.embed = new EmbedBuilder({
      title: "Hangman Game",
      description: Array.from(this.game.correctAnswerWords)
        .map(
          (answerCharPoint) =>
            this.game.correctWords.has(answerCharPoint)
              ? displaySupportedUnicode(answerCharPoint)
              : "\\_" // be careful of discord's markdown.
        )
        .join(""),
      fields: [
        {
          name: "words",
          value: Array.from(this.game.words)
            .map(
              (wordCharPoint) =>
                "`" + displaySupportedUnicode(wordCharPoint) + "`"
            )
            .join(", "),
          inline: true,
        },
        {
          name: "life",
          value: this.game.life.toString(),
          inline: true,
        },
      ],
    });
  }
}

class GameEmbedManagerClass {
  public gameEmbeds: Record<string, GameEmbed> = {};

  async onGameStarted(gameId: string) {
    const channel = client.guilds.cache
      .get(process.env.TEST_GUILD_ID)
      ?.channels.cache.get(process.env.TEST_CHANNEL_ID);
    if (channel?.type != ChannelType.GuildText) return;
    const threadChannel = await channel.threads.create({
      name: "Hangman Thread - " + gameId,
    });

    this.createGameEmbed(GameManager.games[gameId], threadChannel);
  }

  public createGameEmbed(game: Game, channel: Discord.ThreadChannel) {
    const gameEmbed = new GameEmbed(game, channel);
    this.gameEmbeds[game.id] = gameEmbed;
    game.once("GAME_ENDED", async (isWin) => {
      const message = await channel.send({
        content: `Game End - ${
          isWin ? "You win!" : "lose!"
        }\nThe embed will be removed after 5 seconds`,
      });
      setTimeout(async () => {
        gameEmbed.message?.delete();
        await message.delete();
        channel.delete();
      }, 5 * 1000);
      delete this.gameEmbeds[game.id];
    });
    return gameEmbed;
  }
}

const GameEmbedManager = new GameEmbedManagerClass();
export default GameEmbedManager;
