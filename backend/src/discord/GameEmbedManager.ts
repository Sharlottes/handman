// Game state를 embed에 render하기 위한 매니저

import Game from "@/core/Game";
import { EmbedBuilder } from "discord.js";
import { isUnicodeEqual } from "@/utils/isUnicodeEqual";
import GameManager from "@/core/GameManager";

class GameEmbed {
  embed!: Discord.EmbedBuilder;
  message?: Discord.Message;

  constructor(
    readonly game: Game,
    readonly channel: Discord.TextBasedChannel
  ) {
    this.updateEmbed();
  }

  async send() {
    this.updateEmbed();
    if (this.message) {
      this.message.edit({ embeds: [this.embed] });
    } else {
      this.message = await this.channel.send({ embeds: [this.embed] });
    }
  }

  updateEmbed() {
    this.embed = new EmbedBuilder({
      title: "Hangman Game",
      description: this.game.correctAnswerWords
        .map(
          (answerUni) =>
            this.game.correctWords.find((correctedUni) =>
              isUnicodeEqual(answerUni, correctedUni)
            )
              ? String.fromCharCode(...answerUni)
              : "\\_" // be careful of discord's markdown.
        )
        .join(""),
      fields: [
        {
          name: "words",
          value: this.game.words
            .map((unicode) => String.fromCharCode(...unicode))
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

class GameEmbedManager {
  gameEmbeds: Record<string, GameEmbed> = {};

  createGameEmbed(game: Game, channel: Discord.TextBasedChannel) {
    const gameEmbed = new GameEmbed(game, channel);
    this.gameEmbeds[game.id] = gameEmbed;
    GameManager.once("GAME_ENDED", async (id, isWin) => {
      const message = await channel.send({
        content: `Game End - ${
          isWin ? "You win!" : "lose!"
        }\nThe embed will be removed after 5 seconds`,
      });
      setTimeout(() => {
        gameEmbed.message?.delete();
        message.delete();
      }, 5 * 1000);
      delete this.gameEmbeds[id];
    });
    return gameEmbed;
  }
}

export default new GameEmbedManager();
