import { SlashCommand, CommandOptionType } from 'slash-create';
export default class extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'echo',
      description: 'Echos whatever you send it (for testing)',
      options: [
        {
          name: 'input',
          type: CommandOptionType.STRING,
          description: 'Any content',
          required: true,
        },
      ],
    });
  }

  async run(ctx) {
    await ctx.defer();

    ctx.sendFollowUp(ctx.options.input);
  }
}
