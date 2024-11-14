import { config } from 'dotenv';
import { Client, GatewayIntentBits, ActivityType, GatewayDispatchEvents } from 'discord.js';
import Odesli from 'odesli.js';
import { sendLink } from './utils/reply.js';
import { SlashCreator, GatewayServer } from 'slash-create';
import SimplDB from 'simpl.db';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import commands from './commands/index.js';

config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});
const odesli = new Odesli();
const creator = new SlashCreator({
  applicationID: process.env.DISCORD_ID ?? '',
  publicKey: process.env.DISCORD_PUBKEY ?? '',
  token: process.env.DISCORD_TOKEN ?? '',
});

const dbpath = path.resolve('./db/');

// Check if the 'db' directory exists, if not, create it.
if (!fs.existsSync(dbpath)) {
  fs.mkdirSync(dbpath);
}

const db = SimplDB({
  dataFile: path.join(dbpath, 'db.json'),
  collectionsFolder: path.join(dbpath, 'collections'),
});

const optOutDB = db.createCollection('optedout');

client.on('ready', () => {
  client.user?.setPresence({
    activities: [{ name: `for music links`, type: ActivityType.Watching }],
    status: 'online',
  });

  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (optOutDB.fetch((u) => u.user === message.author.id)) {
    return;
  }

  const songUrlRegexList = [/https?:\/\/.*?spotify\.com\/\S*/g, /https?:\/\/music\.amazon\.com\/\S*/g, /https?:\/\/.*?music\.apple\.com\/\S*/g, /https?:\/\/.*?tidal\.com\/\S*/g, /https?:\/\/.*?music\.youtube\.com\/\S*/g, /https?:\/\/.*?deezer\.com\/\S*/g, /https?:\/\/music\.yandex\.ru\/\S*/g, /https?:\/\/.*?pandora\.com\/\S*/g];

  let songUrls = [];
  songUrlRegexList.forEach((regex) => {
    const matched = message.content.match(regex);
    if (matched) songUrls = songUrls.concat(matched);
  });

  if (songUrls.length) {
    message.channel.sendTyping();
    songUrls.forEach(async (songUrl) => {
      try {
        let song = await odesli.fetch(songUrl);
        if (!song) return;

        sendLink(message, song, undefined);
      } catch (error) {
        console.error(error);
      }
    });
  }
});

creator
  .withServer(new GatewayServer((handler) => client.ws.on(GatewayDispatchEvents.InteractionCreate, handler)))
  .registerCommands([commands.optout, commands.songlink, commands.echo])
  // .registerCommandsIn(path.join(path.dirname(fileURLToPath(import.meta.url)), 'commands')) // esm is broken
  .syncCommands();

client.login(process.env.DISCORD_TOKEN);
export default {
  client,
  optOutDB,
  creator,
  odesli,
};
