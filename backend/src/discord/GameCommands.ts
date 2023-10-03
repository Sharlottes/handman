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
    const gameManager = GameEmbedManager.createGameEmbed(
      game,
      interaction.channel!
    );

    await interaction.deferReply();
    await gameManager.send();
    await interaction.editReply(
      `the game successfully created. id: ${game.id}`
    );
  }

  @Slash({
    name: "tryword",
    description: "try a word",
  })
  async tryWord(
    @SlashOption({
      name: "game-id",
      description: "the id of game where you are playing rn",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    gameId: string,
    @SlashOption({
      name: "word",
      description: "the word you try",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    word: string,
    interaction: Discord.CommandInteraction
  ) {
    const game = GameManager.games[gameId];
    if (!game) {
      interaction.reply("that game is not found.");
      return;
    }
    word = [...word][0];

    let found = false;
    try {
      found = game.try(word);
    } catch (e: unknown) {
      interaction.reply({ content: "ERROR: " + e, ephemeral: true });
      return;
    }

    interaction.reply({
      content: `"${word}" is ${found ? "correct" : "incorrect"}!`,
      ephemeral: true,
    });
    await GameEmbedManager.gameEmbeds[gameId].send();
    const isGameEnd = game.isGameEnd();
    if (isGameEnd !== undefined) {
      GameManager.endGame(game.id, isGameEnd == "win");
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
