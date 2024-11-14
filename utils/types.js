/**
 * @typedef {Object} OdesliLinkData
 * @property {string} entityUniqueId - The unique ID for this entity
 * @property {string} url - The URL for this match
 * @property {string} [nativeAppUriMobile] - The native app URI for mobile devices
 * @property {string} [nativeAppUriDesktop] - The native app URI for desktop devices
 */

/**
 * @typedef {Object} OdesliEntity
 * @property {string} id - The unique identifier on the streaming platform/API provider
 * @property {'song'|'album'} type - The type of entity
 * @property {string} [title] - The title of the song/album
 * @property {string} [artistName] - The name of the artist
 * @property {string} [thumbnailUrl] - URL to the thumbnail image
 * @property {number} [thumbnailWidth] - Width of the thumbnail
 * @property {number} [thumbnailHeight] - Height of the thumbnail
 * @property {APIProvider} apiProvider - The API provider that powered this match
 * @property {Platform[]} platforms - Array of platforms powered by this entity
 */

/**
 * @typedef {Object} OdesliResponse
 * @property {string} entityUniqueId - The unique ID for the input entity from the request
 * @property {string} userCountry - The country code used for availability queries (defaults to 'US')
 * @property {string} pageUrl - URL to the Songlink page for this entity
 * @property {Object.<Platform, OdesliLinkData>} linksByPlatform - Collection of platform-specific link data
 * @property {Object.<string, OdesliEntity>} entitiesByUniqueId - Collection of entity data keyed by unique ID
 */

/**
 * @typedef {'spotify'|'itunes'|'appleMusic'|'youtube'|'youtubeMusic'|'google'|'googleStore'|'pandora'|'deezer'|'tidal'|'amazonStore'|'amazonMusic'|'soundcloud'|'napster'|'yandex'|'spinrilla'|'audius'|'audiomack'|'anghami'|'boomplay'} Platform
 */

/**
 * @typedef {'spotify'|'itunes'|'youtube'|'google'|'pandora'|'deezer'|'tidal'|'amazon'|'soundcloud'|'napster'|'yandex'|'spinrilla'|'audius'|'audiomack'|'anghami'|'boomplay'} APIProvider
 */

module.exports = {};
