// IDX-DOC-00: For index reference format, see INDEX_DESCRIBER.md
// IDX-SERVER-01: Multiplayer Server Module
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(__dirname));

// Store connected players
const players = new Map();

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    const newPlayer = {
        id: socket.id,
        position: { x: 0, y: 1, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        planet: 'earth',
        health: 100,
        isDead: false,
        kills: 0,
        deaths: 0,
    };
    players.set(socket.id, newPlayer);

    // Send the new player their own ID and the list of other players
    socket.emit('init', {
        id: socket.id,
        players: Array.from(players.values()),
    });
    
    // Notify other players about the new player
    socket.broadcast.emit('playerJoined', newPlayer);
    
    // Handle player updates
    socket.on('playerUpdate', (data) => {
        const player = players.get(socket.id);
        if (player) {
            player.position = data.position;
            player.rotation = data.rotation;
            player.planet = data.planet;
            
            // Broadcast to other players
            socket.broadcast.emit('playerUpdate', {
                id: socket.id,
                position: data.position,
                rotation: data.rotation,
                planet: data.planet,
                mathematicalData: data.mathematicalData
            });
        }
    });
    
    // Handle bullet firing
    socket.on('bulletFired', (data) => {
        socket.broadcast.emit('bulletFired', {
            id: socket.id,
            bulletId: data.id,
            position: data.position,
            direction: data.direction,
            damage: data.damage,
            weaponType: data.weaponType,
            bulletSize: data.bulletSize,
            bulletColor: data.bulletColor
        });
    });
    
    // Handle weapon switching
    socket.on('weaponSwitch', (data) => {
        const player = players.get(socket.id);
        if (player) {
            player.currentWeapon = data.weapon;
            
            socket.broadcast.emit('weaponSwitch', {
                id: socket.id,
                weapon: data.weapon
            });
        }
    });
    
    // Handle reloading
    socket.on('reload', (data) => {
        const player = players.get(socket.id);
        if (player) {
            player.isReloading = true;
            player.reloadStartTime = Date.now();
            
            socket.broadcast.emit('reload', {
                id: socket.id,
                weapon: data.weapon
            });
        }
    });
    
    // Handle explosion damage
    socket.on('explosionDamage', (data) => {
        const target = players.get(data.targetId);
        if (target && !target.isDead) {
            target.health = Math.max(0, target.health - data.damage);
            
            if (target.health <= 0) {
                target.isDead = true;
                target.deaths++;
                
                // Notify all players about the explosion kill
                io.emit('playerKilled', {
                    killerId: socket.id,
                    victimId: data.targetId,
                    killerName: `Player ${socket.id.slice(0, 6)}`,
                    victimName: `Player ${data.targetId.slice(0, 6)}`,
                    method: 'explosion'
                });
            }
            
            // Notify target about explosion damage
            socket.to(data.targetId).emit('playerDamaged', {
                damage: data.damage,
                attackerId: socket.id,
                newHealth: target.health,
                isDead: target.isDead,
                method: 'explosion'
            });
        }
    });
    
    // Handle player hit
    socket.on('playerHit', (data) => {
        const attacker = players.get(socket.id);
        const target = players.get(data.targetId);
        
        if (attacker && target && !target.isDead) {
            // Update target health
            target.health = Math.max(0, target.health - data.damage);
            
            // Update attacker stats
            attacker.shotsHit++;
            
            // Check if target died
            if (target.health <= 0) {
                target.isDead = true;
                target.deaths++;
                attacker.kills++;
                
                // Notify all players about the kill
                io.emit('playerKilled', {
                    killerId: socket.id,
                    victimId: data.targetId,
                    killerName: `Player ${socket.id.slice(0, 6)}`,
                    victimName: `Player ${data.targetId.slice(0, 6)}`
                });
            }
            
            // Notify target about damage
            socket.to(data.targetId).emit('playerDamaged', {
                damage: data.damage,
                attackerId: socket.id,
                newHealth: target.health,
                isDead: target.isDead
            });
            
            // Notify attacker about hit
            socket.emit('hitConfirmed', {
                targetId: data.targetId,
                damage: data.damage,
                targetHealth: target.health,
                killed: target.isDead
            });
        }
    });
    
    // Handle player death
    socket.on('playerDied', (data) => {
        const player = players.get(socket.id);
        if (player) {
            player.isDead = true;
            player.deaths++;
            
            // Notify other players
            socket.broadcast.emit('playerDied', {
                id: socket.id,
                attackerId: data.attackerId,
                victimName: player.playerName,
                method: data.method,
            });
        }
    });
    
    // Handle player respawn
    socket.on('playerRespawned', (data) => {
        const player = players.get(socket.id);
        if (player) {
            player.isDead = false;
            player.health = player.maxHealth;
            player.position = data.position;
            player.planet = data.planet;
            
            // Notify other players
            socket.broadcast.emit('playerRespawned', {
                id: socket.id,
                playerName: player.playerName,
                position: data.position,
                planet: data.planet,
                health: player.health
            });
        }
    });
    
    // Handle planet changes
    socket.on('planetChange', (data) => {
        const player = players.get(socket.id);
        if (player) {
            player.planet = data.planet;
            
            socket.broadcast.emit('planetChange', {
                id: socket.id,
                planet: data.planet
            });
        }
    });
    
    // Handle rocket travel
    socket.on('rocketTravel', (data) => {
        socket.broadcast.emit('rocketTravel', {
            id: socket.id,
            targetPlanet: data.targetPlanet
        });
    });
    
    // Handle chat messages
    socket.on('chatMessage', (data) => {
        const playerName = players.get(socket.id)?.playerName || 'Unknown Player';
        
        // Check for commands
        if (data.message.startsWith('/')) {
            handleChatCommand(socket, data.message, playerName);
            return;
        }
        
        // Broadcast message to all players
        io.emit('chatMessage', {
            playerName: playerName,
            message: data.message,
            timestamp: data.timestamp
        });
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        players.delete(socket.id);
        io.emit('playerLeft', socket.id);
    });
});

// Handle chat commands
function handleChatCommand(socket, message, playerName) {
    const command = message.toLowerCase().split(' ')[0];
    const args = message.split(' ').slice(1);
    
    switch (command) {
        case '/help':
            const helpMessage = `
Available commands:
/help - Show this help message
/players - List all online players
/planet <name> - Travel to a specific planet
/me <action> - Perform an action
/clear - Clear chat history
            `.trim();
            socket.emit('chatMessage', {
                playerName: 'System',
                message: helpMessage,
                timestamp: Date.now(),
                isSystem: true
            });
            break;
            
        case '/players':
            const playerList = Array.from(players.values()).map(p => p.playerName).join(', ');
            socket.emit('chatMessage', {
                playerName: 'System',
                message: `Online players: ${playerList}`,
                timestamp: Date.now(),
                isSystem: true
            });
            break;
            
        case '/planet':
            if (args.length > 0) {
                const planetName = args[0].toLowerCase();
                const validPlanets = ['earth', 'mars', 'moon', 'venus'];
                if (validPlanets.includes(planetName)) {
                    socket.emit('travelToPlanet', { planet: planetName });
                    io.emit('chatMessage', {
                        playerName: 'System',
                        message: `${playerName} is traveling to ${planetName}!`,
                        timestamp: Date.now(),
                        isSystem: true
                    });
                } else {
                    socket.emit('chatMessage', {
                        playerName: 'System',
                        message: `Invalid planet. Available: ${validPlanets.join(', ')}`,
                        timestamp: Date.now(),
                        isSystem: true
                    });
                }
            }
            break;
            
        case '/me':
            if (args.length > 0) {
                const action = args.join(' ');
                io.emit('chatMessage', {
                    playerName: 'System',
                    message: `* ${playerName} ${action}`,
                    timestamp: Date.now(),
                    isSystem: true
                });
            }
            break;
            
        case '/clear':
            socket.emit('clearChat');
            break;
            
        default:
            socket.emit('chatMessage', {
                playerName: 'System',
                message: `Unknown command: ${command}. Type /help for available commands.`,
                timestamp: Date.now(),
                isSystem: true
            });
    }
}

// API endpoint to receive tree output log
app.post('/api/tree-log', (req, res) => {
    const log = req.body.log;
    if (!log) {
        return res.status(400).json({ error: 'No log provided' });
    }
    fs.writeFile('tree-output-log.txt', Array.isArray(log) ? log.join('\n') : String(log), err => {
        if (err) {
            return res.status(500).json({ error: 'Failed to write log' });
        }
        res.json({ success: true });
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Game available at: http://localhost:${PORT}`);
}); 