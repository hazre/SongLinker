import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import Vibrant from 'node-vibrant';

// const removeButton = new ButtonBuilder().setCustomId('remove').setLabel('Delete').setStyle(ButtonStyle.Danger);
// const buttonRow = new ActionRowBuilder().addComponents(removeButton);
const supportedPlatfrom = {
  soundcloud: {
    name: 'Soundcloud',
    emoji: '1133229419771732130',
  },
  tidal: {
    name: 'Tidal',
    emoji: '1133229418802860103',
  },
  youtubeMusic: {
    name: 'Youtube',
    emoji: '1133230856429899817',
  },
  spotify: {
    name: 'Spotify',
    emoji: '1133229422816788560',
  },
  appleMusic: {
    name: 'Apple Music',
    emoji: '1133229421432680509',
  },
};

const linkType = {
  song: 'Track',
  album: 'Album',
};

export async function sendLink(message, link, artist) {
  //const collectorFilter = (i) => i.user.id === message.author.id;

  const buttonRow = new ActionRowBuilder();
  Object.values(link.linksByPlatform).forEach((platfrom, i) => {
    platfrom.name = Object.keys(link.linksByPlatform)[i];
    if (!Object.keys(supportedPlatfrom).includes(platfrom.name)) return;
    if (platfrom.name === 'spotify') {
      platfrom.name + '?go=1&nd=1';
    }
    const btn = new ButtonBuilder().setURL(platfrom.url).setLabel(supportedPlatfrom[platfrom.name].name).setStyle(ButtonStyle.Link).setEmoji({ id: supportedPlatfrom[platfrom.name].emoji });
    buttonRow.addComponents(btn);
  });

  // const btn = new ButtonBuilder().setURL(link.pageUrl).setLabel('Others').setStyle(ButtonStyle.Link).setEmoji({ name: '🔗' });
  // buttonRow.addComponents(btn);

  const embedcolor = await Vibrant.from(link.thumbnail).getPalette();

  const embedmessage = new EmbedBuilder()
    .setDescription(`**${linkType[link.type]}:** ${link.title}\n **Artist:** ${link.artist.join(', ')}`)
    .setAuthor({ name: `${link.title} - ${link.artist.join(', ')}`, url: link.pageUrl, iconURL: artist.image })
    .setImage(link.thumbnail)
    .setFooter({ text: `Shared by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
    // @ts-ignore
    .setColor(embedcolor.Vibrant?.hex ?? 'DarkButNotBlack');

  message.reply({
    embeds: [embedmessage],
    allowedMentions: { repliedUser: false },
    failIfNotExists: true,
    components: [buttonRow],
  });
  // .then(async (sentMessage) => {
  //   try {
  //     const confirmation = await sentMessage.awaitMessageComponent({ filter: collectorFilter, time: 30000 });
  //     if (confirmation.customId === 'remove') {
  //       await sentMessage.delete();
  //     }
  //   } catch (e) {
  //     await sentMessage.edit({ components: [sentMessage.components.slice(0)] });
  //   }
  // });
}
