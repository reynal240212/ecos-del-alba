// profile.js - User Account, Login, Persistence, XP & Leveling System for Ecos del Alba

const STORAGE_KEY = "ecos_del_alba_user_profile";
const LEADERBOARD_STORAGE_KEY = "ecos_del_alba_local_leaderboard";

class ProfileManager {
  constructor() {
    this.user = {
      name: "Guerrera del Alba",
      avatarIcon: "🏹",
      level: 1,
      xp: 0,
      xpToNext: 150,
      essence: 0,
      unlockedItems: ["none", "default"],
      equipped: {
        head: "none",
        back: "none",
        skin: "default",
      },
      stats: {
        totalEnemiesDefeated: 0,
        totalChestsOpened: 0,
        gamesPlayed: 0,
      },
    };

    this.onLevelUp = null;
    this.onProfileChange = null;
    this.load();
  }

  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.user = { ...this.user, ...parsed };
      }
    } catch (e) {
      console.warn("No se pudo cargar el perfil desde localStorage:", e);
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user));
      if (this.onProfileChange) {
        this.onProfileChange(this.user);
      }
    } catch (e) {
      console.warn("No se pudo guardar el perfil:", e);
    }
  }

  login(name, avatarIcon = "🏹") {
    if (!name || name.trim() === "") name = "Guerrera del Alba";
    this.user.name = name.trim();
    this.user.avatarIcon = avatarIcon;
    this.save();
    return this.user;
  }

  logout() {
    this.user.name = "Guerrera del Alba";
    this.user.avatarIcon = "🏹";
    this.save();
  }

  addXp(amount) {
    this.user.xp += amount;
    let leveledUp = false;

    while (this.user.xp >= this.user.xpToNext) {
      this.user.xp -= this.user.xpToNext;
      this.user.level += 1;
      this.user.xpToNext = Math.floor(150 * Math.pow(1.22, this.user.level - 1));
      this.user.essence += 100; // Bonus Essence on level up!
      leveledUp = true;
    }

    this.save();
    if (leveledUp && this.onLevelUp) {
      this.onLevelUp(this.user.level);
    }
    return { leveledUp, currentLevel: this.user.level, xp: this.user.xp, xpToNext: this.user.xpToNext };
  }

  addEssence(amount) {
    this.user.essence += amount;
    this.save();
  }

  spendEssence(amount) {
    if (this.user.essence >= amount) {
      this.user.essence -= amount;
      this.save();
      return true;
    }
    return false;
  }

  unlockItem(itemId) {
    if (!this.user.unlockedItems.includes(itemId)) {
      this.user.unlockedItems.push(itemId);
      this.save();
    }
  }

  isItemUnlocked(itemId) {
    return this.user.unlockedItems.includes(itemId) || itemId === "none" || itemId === "default";
  }

  equipItem(category, itemId) {
    this.user.equipped[category] = itemId;
    this.save();
  }

  // Record game completion or high scores in persistent local storage + backend
  async recordScore(score, timeSeconds, crystals, levelReached) {
    const entry = {
      player_name: this.user.name,
      avatar: this.user.avatarIcon,
      score,
      time_seconds: timeSeconds,
      crystals,
      level: levelReached,
      date: new Date().toLocaleDateString(),
    };

    // Save locally
    let list = this.getLocalLeaderboard();
    list.push(entry);
    list.sort((a, b) => b.score - a.score);
    list = list.slice(0, 15); // keep top 15
    try {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}

    // Send to API if available
    try {
      await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_name: this.user.name,
          score,
          crystals,
          time_seconds: timeSeconds,
        }),
      });
    } catch (e) {
      // offline/local mode fallback
    }

    return list;
  }

  getLocalLeaderboard() {
    try {
      const data = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {}
    // Default initial champions if first time
    return [
      { player_name: "Aura Ancestral", avatar: "👑", score: 4800, crystals: 9, time_seconds: 76, date: "25/09/2026" },
      { player_name: "Kael Valkiria", avatar: "⚡", score: 3950, crystals: 7, time_seconds: 92, date: "26/09/2026" },
      { player_name: "Lyra Cazadora", avatar: "🏹", score: 3200, crystals: 6, time_seconds: 110, date: "27/09/2026" },
    ];
  }
}

export const profileManager = new ProfileManager();
