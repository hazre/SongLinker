import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

const supportedPlatfrom = {
  soundcloud: {
    name: "Soundcloud",
    emoji: "1133229419771732130",
  },
  tidal: {
    name: "Tidal",
    emoji: "1133229418802860103",
  },
  youtubeMusic: {
    name: "YT Music",
    emoji: "1133230856429899817",
  },
  youtube: {
    name: "Youtube",
    emoji: "1133499065796149350",
  },
  spotify: {
    name: "Spotify",
    emoji: "1133229422816788560",
  },
  appleMusic: {
    name: "Apple",
    emoji: "1133229421432680509",
  },
  pandora: {
    name: "Pandora",
    emoji: "1133499059483713607",
  },
  deezer: {
    name: "Deezer",
    emoji: "1133499063812227163",
  },
  amazonMusic: {
    name: "Amazon",
    emoji: "1133499061291450428",
  },
  yandex: {
    name: "Yandex",
    emoji: "1133499062629441677",
  },
};


/**
 * Send a formatted link message to Discord
 * @param {import('discord.js').Message} message - The Discord message
 * @param {import('odesli.js').Page.Response} link - The formatted link data
 */
export async function sendLink(message, link) {
  // Ignore YouTube playlists
  const hasNonYouTubeEntities = Object.keys(link.entitiesByUniqueId).some(
    (id) => !id.startsWith("YOUTUBE_PLAYLIST::")
  );
  if (
    link.entityUniqueId?.startsWith("YOUTUBE_PLAYLIST::") &&
    !hasNonYouTubeEntities
  ) {
    return;
  }

  const song_title = link.entitiesByUniqueId[link.entityUniqueId].title;
  const song_artist = link.entitiesByUniqueId[link.entityUniqueId].artistName;

  const messageContentLink = link.linksByPlatform.youtube ? link.linksByPlatform.youtube.url : link.pageUrl;

  const messageContent = `[${song_title} - ${song_artist}](${messageContentLink})`

  let buttons = [];
  Object.values(link.linksByPlatform).forEach((platform, i) => {
    platform.name = Object.keys(link.linksByPlatform)[i];
    if (!Object.keys(supportedPlatfrom).includes(platform.name)) return;
    const btn = new ButtonBuilder()
      .setURL(platform.url)
      .setLabel(supportedPlatfrom[platform.name].name)
      .setStyle(ButtonStyle.Link)
      .setEmoji({ id: supportedPlatfrom[platform.name].emoji });
    buttons.push(btn);
  });

  const btn = new ButtonBuilder()
    .setURL(link.pageUrl)
    .setLabel("Others")
    .setStyle(ButtonStyle.Link)
    .setEmoji({ name: "🔗" });
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

  // dismiss message link embed
  message.suppressEmbeds(true);

  // If there is more than one group of buttons, we need to send the rest in a second message
  if (components.length > 1) {
    await message.reply({
      content: messageContent,
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
      content: messageContent,
      allowedMentions: { repliedUser: false },
      failIfNotExists: true,
      components: components,
    });
  }
}
