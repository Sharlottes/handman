import { ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import GameManager from "@/core/GameManager";

import GameEmbedManager from "./GameEmbedManager";

@Discord()
abstract class GameCommands {
  @Slash({
    name: "start",
    description: "start new game",
  })
  async startGame(
    @SlashOption({
      name: "answer",
      description: "correct answer",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    correctAnswer: string,
    @SlashOption({
      name: "word-amount",
      description: "additional",
      type: ApplicationCommandOptionType.Number,
      required: false,
    })
    wordAmount: number | undefined,
    interaction: Discord.CommandInteraction
  ) {
    const game = GameManager.startGame(correctAnswer, wordAmount);
    interaction.reply(`the game successfully created. id: ${game.id}`);
  }

  @Slash({
    name: "tryword",
    description: "try a word",
  })
  async tryWord(
    @SlashOption({
      name: "word",
      description: "the word you try",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    word: string,
    interaction: Discord.CommandInteraction
  ) {
    if (!interaction.channel?.isThread()) {
      interaction.reply(
        "Error: the command is invalid outside of the thread channel."
      );
      return;
    }
    const gameId = interaction.channel.name.split(" - ")[1];
    const game = GameManager.games[gameId];
    if (!game) {
      interaction.reply("Error: this game is not found.");
      return;
    }
    word = /\d/g.test(word) ? String.fromCodePoint(+word) : [...word][0];

    try {
      const found = game.try(word);
      interaction.reply({
        content: `someone tried "${word}", and that was ${
          found ? "correct" : "incorrect"
        }!`,
        ephemeral: true,
      });
    } catch (e: unknown) {
      interaction.reply({ content: "ERROR: " + e, ephemeral: true });
      return;
    }
  }

  @Slash({
    name: "list",
    description: "get game list",
  })
  async getGameList(interaction: Discord.CommandInteraction) {
    const gameIds = Object.keys(GameManager.games);
    interaction.reply(
      gameIds.map((id) => "* " + id + "\n").join("") || "cannot find any games"
    );
  }
}
