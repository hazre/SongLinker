import { config } from "dotenv";
import {
  Client,
  GatewayIntentBits,
  ActivityType,
  GatewayDispatchEvents,
} from "discord.js";
import Odesli from "odesli.js";
import { sendLink } from "./utils/reply.js";
import { SlashCreator, GatewayServer } from "slash-create";
import { Sequelize, DataTypes } from sequelize;
import commands from "./commands/index.js";

config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'db/songlinker.db',
  logging: false
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    allowedMentions: { parse: [], repliedUser: false }
});
const odesli = new Odesli();
const creator = new SlashCreator({
  applicationID: process.env.DISCORD_ID ?? "",
  publicKey: process.env.DISCORD_PUBKEY ?? "",
  token: process.env.DISCORD_TOKEN ?? "",
});

const OptedOut = sequelize.define('OptedOut', {
    UserID: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
});


(async () => {
    try {
        await sequelize.authenticate();
        console.log('DB Connection established.');

        await sequelize.sync();
        console.log('Models synced.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

client.on("ready", () => {
  client.user.setPresence({
    activities: [{ name: `for music links`, type: ActivityType.Watching }],
    status: 'online',
  });

  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if ((await getOptedOut(message.author.id)).length > 0) return;

    const urls = message.content.match(/(https?:\/\/(music\.apple\.com|open\.spotify\.com|spotify\.link|music\.amazon\.com|tidal\.com|music\.youtube\.com|deezer\.com|music\.yandex\.ru|pandora\.com)\/[^\s]+)/g);

    if (urls) {
        message.channel.sendTyping();
        for (const url of urls) {
            try {
                /** @type {import('./utils/types.js').OdesliResponse} */
                let song = await odesli.fetch(url);
                if (!song) return;

                sendLink(message, song);
            } catch (error) {
                console.error(error);
            }
        }
    }
});

creator
  .withServer(
    new GatewayServer((handler) =>
      client.ws.on(GatewayDispatchEvents.InteractionCreate, handler)
    )
  )
  .registerCommands([commands.optout, commands.songlink, commands.echo])
  // .registerCommandsIn(path.join(path.dirname(fileURLToPath(import.meta.url)), 'commands')) // esm is broken
  .syncCommands();

client.login(process.env.DISCORD_TOKEN);
export default {
  client,
  creator,
  odesli,
  OptedOut
};

async function getOptedOut(userid) {
    // TODO add a caching layer here
    const users = await OptedOut.findAll({ where: { UserID: userid } });

    return users;
}
