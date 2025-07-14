/**
 * Game Service - Player and Game Management via API
 * Handles player actions, game state, and combat via REST API
 * IDX-GAME-SERVICE-001
 */

class GameService {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api';
    this.currentPlayer = null;
    this.listeners = new Set();
    this.isConnected = false;
  }

  async connect() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (response.ok) {
        this.isConnected = true;
        console.log('Game Service connected to API successfully');
        return true;
      } else {
        throw new Error('API health check failed');
      }
    } catch (error) {
      console.error('Failed to connect to Game Service API:', error);
      return false;
    }
  }

  async joinGame(playerName) {
    try {
      const response = await fetch(`${this.baseUrl}/players/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerName })
      });

      if (!response.ok) {
        throw new Error(`Failed to join game: ${response.statusText}`);
      }

      const result = await response.json();
      this.currentPlayer = result.player;
      console.log(`Player joined: ${this.currentPlayer.name}`);
      return this.currentPlayer;
    } catch (error) {
      console.error('Failed to join game:', error);
      throw error;
    }
  }

  async updatePosition(position, rotation, planet) {
    if (!this.currentPlayer) {
      throw new Error('No player joined');
    }

    try {
      const response = await fetch(`${this.baseUrl}/players/${this.currentPlayer.id}/position`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ position, rotation, planet })
      });

      if (!response.ok) {
        throw new Error(`Failed to update position: ${response.statusText}`);
      }

      const result = await response.json();
      this.currentPlayer = result.player;
      return this.currentPlayer;
    } catch (error) {
      console.error('Failed to update position:', error);
      throw error;
    }
  }

  async shoot(targetId, damage, weaponType) {
    if (!this.currentPlayer) {
      throw new Error('No player joined');
    }

    try {
      const response = await fetch(`${this.baseUrl}/players/${this.currentPlayer.id}/shoot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetId, damage, weaponType })
      });

      if (!response.ok) {
        throw new Error(`Failed to shoot: ${response.statusText}`);
      }

      const result = await response.json();
      this.currentPlayer = result.attacker;
      console.log(`Shot fired: ${result.message}`);
      return result;
    } catch (error) {
      console.error('Failed to shoot:', error);
      throw error;
    }
  }

  async startGame() {
    if (!this.currentPlayer) {
      throw new Error('No player joined');
    }

    try {
      const response = await fetch(`${this.baseUrl}/game/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId: this.currentPlayer.id })
      });

      if (!response.ok) {
        throw new Error(`Failed to start game: ${response.statusText}`);
      }

      const result = await response.json();
      this.currentPlayer = result.player;
      console.log(`Game started: ${result.message}`);
      return this.currentPlayer;
    } catch (error) {
      console.error('Failed to start game:', error);
      throw error;
    }
  }

  async pauseGame() {
    if (!this.currentPlayer) {
      throw new Error('No player joined');
    }

    try {
      const response = await fetch(`${this.baseUrl}/game/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId: this.currentPlayer.id })
      });

      if (!response.ok) {
        throw new Error(`Failed to pause game: ${response.statusText}`);
      }

      const result = await response.json();
      this.currentPlayer = result.player;
      console.log(`Game paused: ${result.message}`);
      return this.currentPlayer;
    } catch (error) {
      console.error('Failed to pause game:', error);
      throw error;
    }
  }

  async getPlayers() {
    try {
      const response = await fetch(`${this.baseUrl}/players`);
      if (!response.ok) {
        throw new Error(`Failed to get players: ${response.statusText}`);
      }
      const result = await response.json();
      return result.players || [];
    } catch (error) {
      console.error('Failed to get players:', error);
      return [];
    }
  }

  async getGameStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/game/status`);
      if (!response.ok) {
        throw new Error(`Failed to get game status: ${response.statusText}`);
      }
      const result = await response.json();
      return result.stats || {};
    } catch (error) {
      console.error('Failed to get game status:', error);
      return {};
    }
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  isConnected() {
    return this.isConnected;
  }

  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in listener callback:', error);
      }
    });
  }
}

// Export singleton instance
const gameService = new GameService();
export default gameService; 