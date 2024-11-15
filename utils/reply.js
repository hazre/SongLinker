import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import Vibrant from "node-vibrant";

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

const linkType = {
  song: "Track",
  album: "Album",
};

const platformThumbnailPriority = [
  "SPOTIFY_ALBUM::",
  "SPOTIFY_TRACK::",
  "DEEZER_ALBUM::",
  "DEEZER_TRACK::",
  "TIDAL_ALBUM::",
  "TIDAL_TRACK::",
];

/**
 * Check if a URL is accessible and returns an image
 * @param {string} url - The URL to validate
 * @returns {Promise<boolean>}
 */
async function isValidImageUrl(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (!response.ok) return false;

    const contentType = response.headers.get("content-type");
    return contentType && contentType.startsWith("image/");
  } catch (error) {
    console.error("Error validating image URL:", error);
    return false;
  }
}

/**
 * Find the best available thumbnail URL from entities
 * @param {import('./types.js').OdesliResponse} link
 * @returns {Promise<string|null>}
 */
async function findBestThumbnail(link) {
  if (link.thumbnail && (await isValidImageUrl(link.thumbnail))) {
    return link.thumbnail;
  }

  const entities = Object.entries(link.entitiesByUniqueId);

  for (const prefix of platformThumbnailPriority) {
    const entity = entities.find(([id]) => id.startsWith(prefix));
    if (entity && entity[1].thumbnailUrl) {
      if (await isValidImageUrl(entity[1].thumbnailUrl)) {
        return entity[1].thumbnailUrl;
      }
    }
  }

  for (const [, entity] of entities) {
    if (entity.thumbnailUrl && (await isValidImageUrl(entity.thumbnailUrl))) {
      return entity.thumbnailUrl;
    }
  }

  return null;
}

/**
 * Send a formatted link message to Discord
 * @param {import('discord.js').Message} message - The Discord message
 * @param {import('./types.js').OdesliResponse} link - The formatted link data
 * @param {*} artist - Optional artist data
 */
export async function sendLink(message, link, artist) {
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

  let artist_img = undefined;

  if (artist) {
    artist_img = artist.artists[0].image;
  }

  const thumbnailUrl = await findBestThumbnail(link);

  let embedColorHex = "DarkButNotBlack";
  if (thumbnailUrl) {
    try {
      const palette = await Vibrant.from(thumbnailUrl).getPalette();
      if (palette && palette.Vibrant) {
        embedColorHex = palette.Vibrant.hex;
      }
    } catch (error) {
      console.error("Failed to get color palette:", error);
    }
  }

  const embedmessage = new EmbedBuilder()
    .setDescription(
      `**${linkType[link.type]}:** ${
        link.title
      }\n **Artist:** ${link.artist.join(", ")}`
    )
    .setAuthor({
      name: `${link.title} - ${link.artist.join(", ")}`,
      url: link.pageUrl,
      iconURL: artist_img,
    })
    .setImage(thumbnailUrl)
    .setFooter({
      text: `Shared by ${message.author.username}`,
      iconURL: message.author.displayAvatarURL(),
    })
    .setColor(embedColorHex);

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
