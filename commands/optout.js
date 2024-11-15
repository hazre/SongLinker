import { SlashCommand } from "slash-create";
import bot from "../index.js";

export default class extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: "optout",
      description: "Opt out of automatic song links.",
    });
  }

  /**
   * @param {import('slash-create').CommandContext} ctx
   */
  async run(ctx) {
    await ctx.defer({ ephemeral: true });

    let [user, created] = await bot.OptedOut.findOrCreate({
      where: { UserID: ctx.user.id },
    });
    if (created) {
      ctx.sendFollowUp(
        "You have opted out of automatic song links on your messages globally.\nTo opt back in, just run this command again."
      );
    } else {
      await bot.OptedOut.destroy({ where: { UserID: user.UserID } });
      ctx.sendFollowUp(
        "You have opted back into automatic song links on your messages globally.\nTo opt back out, just run this command again."
      );
    }
  }
}
