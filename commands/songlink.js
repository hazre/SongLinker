import { SlashCommand, CommandOptionType } from "slash-create";
import bot from "../index.js";

export default class extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: "songlink",
      description: "Manually get a song.link.",
      options: [
        {
          name: "url",
          type: CommandOptionType.STRING,
          description:
            "URL to a song/album (On Spotify, Apple Music, Youtube, etc.)",
          required: true,
        },
      ],
    });
  }

  /**
   * @param {import('slash-create').CommandContext} ctx
   */
  async run(ctx) {
    await ctx.defer();

    try {
      /** @type {import('../utils/types.js').OdesliResponse} */
      let song = await bot.odesli.fetch(ctx.options.url);

      ctx.sendFollowUp(song.pageUrl);
    } catch (error) {
      console.error(error);
      ctx.sendFollowUp("Couldn't find a song link for your URL.");
    }
  }
}
