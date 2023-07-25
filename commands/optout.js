import { SlashCommand } from 'slash-create';
import bot from '../index.js';

export default class extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'optout',
      description: 'Opt out of automatic song links.',
    });
  }

  async run(ctx) {
    await ctx.defer({ ephemeral: true });

    if (bot.optOutDB.fetch((u) => u.user === ctx.user.id)) {
      bot.optOutDB.remove((u) => u.user === ctx.user.id);
      ctx.sendFollowUp('You have opted back into automatic song links on your messages globally.\nTo opt back out, just run this command again.');
      return;
    }

    bot.optOutDB.create({ user: ctx.user.id });

    ctx.sendFollowUp('You have opted out of automatic song links on your messages globally.\nTo opt back in, just run this command again.');
  }
}
