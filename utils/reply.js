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
    name: 'YT Music',
    emoji: '1133230856429899817',
  },
  youtube: {
    name: 'Youtube',
    emoji: '1133499065796149350',
  },
  spotify: {
    name: 'Spotify',
    emoji: '1133229422816788560',
  },
  appleMusic: {
    name: 'Apple',
    emoji: '1133229421432680509',
  },
  pandora: {
    name: 'Pandora',
    emoji: '1133499059483713607',
  },
  deezer: {
    name: 'Deezer',
    emoji: '1133499063812227163',
  },
  amazonMusic: {
    name: 'Amazon',
    emoji: '1133499061291450428',
  },
  yandex: {
    name: 'Yandex',
    emoji: '1133499062629441677',
  },
};

const linkType = {
  song: 'Track',
  album: 'Album',
};

export async function sendLink(message, link, artist) {
  let artist_img = undefined;

  if (artist) {
    artist_img = artist.artists[0].image;
  }

  const embedcolor = await Vibrant.from(link.thumbnail).getPalette();
  const embedmessage = new EmbedBuilder()
    .setDescription(`**${linkType[link.type]}:** ${link.title}\n **Artist:** ${link.artist.join(', ')}`)
    .setAuthor({ name: `${link.title} - ${link.artist.join(', ')}`, url: link.pageUrl, iconURL: artist_img })
    .setImage(link.thumbnail)
    .setFooter({ text: `Shared by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
    // @ts-ignore
    .setColor(embedcolor.Vibrant?.hex ?? 'DarkButNotBlack');

  let buttons = [];
  Object.values(link.linksByPlatform).forEach((platform, i) => {
    platform.name = Object.keys(link.linksByPlatform)[i];
    if (!Object.keys(supportedPlatfrom).includes(platform.name)) return;
    const btn = new ButtonBuilder().setURL(platform.url).setLabel(supportedPlatfrom[platform.name].name).setStyle(ButtonStyle.Link).setEmoji({ id: supportedPlatfrom[platform.name].emoji });
    buttons.push(btn);
  });

  const btn = new ButtonBuilder().setURL(link.pageUrl).setLabel('Others').setStyle(ButtonStyle.Link).setEmoji({ name: '🔗' });
  buttons.push(btn);

  // Group the buttons into chunks of 5
  const buttonGroups = [];
  while (buttons.length) buttonGroups.push(buttons.splice(0, 4));

  // For each group, create an ActionRow and add it to the message components
  const components = buttonGroups.map((group) => {
    const row = new ActionRowBuilder();
    group.forEach((button) => row.addComponents(button));
    return row;
  });

  // If there is more than one group of buttons, we need to send the rest in a second message
  if (components.length > 1) {
    await message.reply({
      embeds: [embedmessage],
      allowedMentions: { repliedUser: false },
      failIfNotExists: true,
      components: [components[0]],
    });

    // Send rest of the messages
    for (let i = 1; i < components.length; i++) {
      await message.channel.send({ components: [components[i]] });
    }
  } else {
    await message.reply({
      embeds: [embedmessage],
      allowedMentions: { repliedUser: false },
      failIfNotExists: true,
      components: components,
    });
  }
}
