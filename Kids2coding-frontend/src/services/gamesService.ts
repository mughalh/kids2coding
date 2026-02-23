import { ref, get } from 'firebase/database';
import { database } from '../firebase/config';

// Get all games (for listing in the games screen)
export async function getAllGames() {
  try {
    const gamesRef = ref(database, 'games');
    const snapshot = await get(gamesRef);
    if (snapshot.exists()) {
      const gamesObj = snapshot.val();
      return Object.keys(gamesObj).map(key => ({
        id: key,
        ...gamesObj[key]
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}

// Get a specific game by ID (includes metadata but not levels)
export async function getGameById(gameId: string) {
  try {
    const gameRef = ref(database, `games/${gameId}`);
    const snapshot = await get(gameRef);
    return snapshot.exists() ? { id: gameId, ...snapshot.val() } : null;
  } catch (error) {
    console.error(`Error fetching game ${gameId}:`, error);
    return null;
  }
}

// Get all levels for a specific game (sorted by levelNumber)
export async function getGameLevels(gameId: string) {
  try {
    const levelsRef = ref(database, `games/${gameId}/levels`);
    const snapshot = await get(levelsRef);
    if (snapshot.exists()) {
      const levelsObj = snapshot.val();
      // Convert object to array and sort by levelNumber
      return Object.keys(levelsObj)
        .map(key => ({
          id: key,
          ...levelsObj[key]
        }))
        .sort((a, b) => a.levelNumber - b.levelNumber);
    }
    return [];
  } catch (error) {
    console.error(`Error fetching levels for ${gameId}:`, error);
    return [];
  }
}

// Get a single level by its key (if you need to load on demand)
export async function getLevel(gameId: string, levelId: string) {
  try {
    const levelRef = ref(database, `games/${gameId}/levels/${levelId}`);
    const snapshot = await get(levelRef);
    return snapshot.exists() ? { id: levelId, ...snapshot.val() } : null;
  } catch (error) {
    console.error(`Error fetching level ${levelId}:`, error);
    return null;
  }
}