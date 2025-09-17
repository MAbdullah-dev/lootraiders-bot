const liveMap = new Map();

export function startLive(guildId, channelId, startedById) {
  const info = {
    active: true,
    channelId,
    startedAt: new Date().toISOString(),
    startedBy: startedById,
  };
  liveMap.set(guildId, info);
  return info;
}

export function endLive(guildId) {
  const info = liveMap.get(guildId) || null;
  liveMap.delete(guildId);
  return info;
}

export function isLiveActive(guildId) {
  const info = liveMap.get(guildId);
  return !!(info && info.active);
}

export function getLiveInfo(guildId) {
  return liveMap.get(guildId) || null;
}
