import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import gameService from '../services/gameService';

export default function Play() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused
  const [playerStats, setPlayerStats] = useState({
    health: 100,
    energy: 100,
    score: 0,
    level: 1
  });
  const [multiplayerStatus, setMultiplayerStatus] = useState('disconnected');
  const [aiAgents, setAiAgents] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    // Connect to game service
    const connectToService = async () => {
      const connected = await gameService.connect();
      setIsConnected(connected);
      
      if (connected) {
        // Get initial data
        const gameStatus = await gameService.getGameStatus();
        const allPlayers = await gameService.getPlayers();
        setPlayers(allPlayers);
        
        // Listen for real-time updates
        gameService.addListener((data) => {
          setPlayers(data.players || []);
        });
      }
    };

    connectToService();

    return () => {
      // Cleanup listener
      gameService.removeListener(setPlayers);
    };
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && mountRef.current) {
      initGame();
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [gameState]);

  const initGame = () => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    scene.fog = new THREE.Fog(0x000011, 10, 100);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create planetary environment
    createPlanetaryEnvironment(scene);

    // Create player ship
    const playerShip = createPlayerShip();
    scene.add(playerShip);

    // Create AI agents
    const agents = createAIAgents(scene);
    setAiAgents(agents);

    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Update player ship
      updatePlayerShip(playerShip);
      
      // Update AI agents
      updateAIAgents(agents);
      
      // Update camera
      updateCamera(camera, playerShip);
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
  };

  const createPlanetaryEnvironment = (scene) => {
    // Create planet surface
    const planetGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
    const planetMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x2d5016,
      wireframe: false 
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.rotation.x = -Math.PI / 2;
    planet.receiveShadow = true;
    scene.add(planet);

    // Add some terrain features
    for (let i = 0; i < 20; i++) {
      const rockGeometry = new THREE.SphereGeometry(Math.random() * 2 + 0.5, 8, 6);
      const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(
        (Math.random() - 0.5) * 80,
        Math.random() * 2,
        (Math.random() - 0.5) * 80
      );
      rock.castShadow = true;
      scene.add(rock);
    }

    // Add atmospheric particles
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 200;
      positions[i + 1] = Math.random() * 50;
      positions[i + 2] = (Math.random() - 0.5) * 200;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x87ceeb,
      size: 0.5,
      transparent: true,
      opacity: 0.6
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
  };

  const createPlayerShip = () => {
    const shipGroup = new THREE.Group();

    // Main body
    const bodyGeometry = new THREE.ConeGeometry(1, 3, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x3498db });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    shipGroup.add(body);

    // Wings
    const wingGeometry = new THREE.BoxGeometry(4, 0.2, 1);
    const wingMaterial = new THREE.MeshLambertMaterial({ color: 0x2980b9 });
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-2, 0, 0);
    rightWing.position.set(2, 0, 0);
    leftWing.castShadow = true;
    rightWing.castShadow = true;
    shipGroup.add(leftWing);
    shipGroup.add(rightWing);

    // Engine glow
    const engineGeometry = new THREE.SphereGeometry(0.3, 8, 6);
    const engineMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff6b35,
      transparent: true,
      opacity: 0.8
    });
    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    engine.position.set(0, -1.5, 0);
    shipGroup.add(engine);

    shipGroup.userData = {
      velocity: new THREE.Vector3(),
      rotation: new THREE.Vector3(),
      health: 100,
      energy: 100
    };

    return shipGroup;
  };

  const createAIAgents = (scene) => {
    const agents = [];
    
    for (let i = 0; i < 5; i++) {
      const agentGroup = new THREE.Group();
      
      // Agent body
      const agentGeometry = new THREE.BoxGeometry(1, 1, 1);
      const agentMaterial = new THREE.MeshLambertMaterial({ color: 0xe74c3c });
      const agent = new THREE.Mesh(agentGeometry, agentMaterial);
      agent.castShadow = true;
      agentGroup.add(agent);
      
      // Position randomly
      agentGroup.position.set(
        (Math.random() - 0.5) * 50,
        Math.random() * 10 + 5,
        (Math.random() - 0.5) * 50
      );
      
      agentGroup.userData = {
        velocity: new THREE.Vector3(),
        target: new THREE.Vector3(),
        state: 'patrol',
        health: 50
      };
      
      scene.add(agentGroup);
      agents.push(agentGroup);
    }
    
    return agents;
  };

  const updatePlayerShip = (ship) => {
    // Handle input
    const speed = 0.1;
    const rotationSpeed = 0.02;
    
    // Keyboard controls (simplified for demo)
    if (window.keys) {
      if (window.keys['w'] || window.keys['ArrowUp']) {
        ship.userData.velocity.z -= speed;
      }
      if (window.keys['s'] || window.keys['ArrowDown']) {
        ship.userData.velocity.z += speed;
      }
      if (window.keys['a'] || window.keys['ArrowLeft']) {
        ship.userData.velocity.x -= speed;
      }
      if (window.keys['d'] || window.keys['ArrowRight']) {
        ship.userData.velocity.x += speed;
      }
    }
    
    // Apply velocity
    ship.position.add(ship.userData.velocity);
    
    // Apply damping
    ship.userData.velocity.multiplyScalar(0.95);
    
    // Keep ship within bounds
    ship.position.x = Math.max(-40, Math.min(40, ship.position.x));
    ship.position.z = Math.max(-40, Math.min(40, ship.position.z));
    ship.position.y = Math.max(2, Math.min(20, ship.position.y));
  };

  const updateAIAgents = (agents) => {
    agents.forEach(agent => {
      // Simple AI behavior
      switch (agent.userData.state) {
        case 'patrol':
          // Move in a patrol pattern
          agent.userData.velocity.x = Math.sin(Date.now() * 0.001) * 0.05;
          agent.userData.velocity.z = Math.cos(Date.now() * 0.001) * 0.05;
          break;
        case 'chase':
          // Chase player (simplified)
          break;
        case 'attack':
          // Attack behavior
          break;
      }
      
      // Apply velocity
      agent.position.add(agent.userData.velocity);
      
      // Keep agents within bounds
      agent.position.x = Math.max(-40, Math.min(40, agent.position.x));
      agent.position.z = Math.max(-40, Math.min(40, agent.position.z));
      agent.position.y = Math.max(2, Math.min(20, agent.position.y));
    });
  };

  const updateCamera = (camera, playerShip) => {
    // Follow player ship
    const targetPosition = playerShip.position.clone();
    targetPosition.y += 5;
    targetPosition.z += 10;
    
    camera.position.lerp(targetPosition, 0.05);
    camera.lookAt(playerShip.position);
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      alert('Please enter a player name');
      return;
    }
    
    try {
      const player = await gameService.joinGame(playerName);
      setCurrentPlayer(player);
      setPlayerStats({
        health: player.health,
        energy: player.energy,
        score: player.score,
        level: player.level
      });
      setGameState('menu');
    } catch (error) {
      console.error('Failed to join game:', error);
      alert('Failed to join game: ' + error.message);
    }
  };

  const startGame = async () => {
    if (!currentPlayer) {
      alert('Please join the game first');
      return;
    }
    
    try {
      const updatedPlayer = await gameService.startGame();
      setCurrentPlayer(updatedPlayer);
      setGameState('playing');
      setMultiplayerStatus('connected');
      
      // Initialize keyboard controls
      window.keys = {};
      window.addEventListener('keydown', (e) => {
        window.keys[e.key.toLowerCase()] = true;
      });
      window.addEventListener('keyup', (e) => {
        window.keys[e.key.toLowerCase()] = false;
      });
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to start game: ' + error.message);
    }
  };

  const pauseGame = async () => {
    if (!currentPlayer) return;
    
    try {
      const updatedPlayer = await gameService.pauseGame();
      setCurrentPlayer(updatedPlayer);
      setGameState('paused');
    } catch (error) {
      console.error('Failed to pause game:', error);
    }
  };

  const resumeGame = () => {
    setGameState('playing');
  };

  const connectMultiplayer = () => {
    setMultiplayerStatus('connecting');
    // Simulate connection delay
    setTimeout(() => {
      setMultiplayerStatus('connected');
    }, 1000);
  };

  return (
    <div className="play-page">
      {gameState === 'menu' && (
        <div className="game-menu">
          <h1>Multiplayer Planetary Shooter</h1>
          
          {!currentPlayer ? (
            <div className="join-game-form">
              <h2>Join the Game</h2>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Enter your player name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="input-field"
                />
                <button onClick={handleJoinGame} className="btn-primary btn-large">
                  Join Game
                </button>
              </div>
              <div className="connection-status">
                API Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </div>
            </div>
          ) : (
            <div className="menu-options">
              <div className="player-info">
                <h3>Welcome, {currentPlayer.name}!</h3>
                <p>Health: {currentPlayer.health} | Score: {currentPlayer.score} | Level: {currentPlayer.level}</p>
              </div>
              <button onClick={startGame} className="btn-primary btn-large">
                Start Single Player
              </button>
              <button onClick={connectMultiplayer} className="btn-primary btn-large">
                Connect Multiplayer
              </button>
              <button onClick={() => setCurrentPlayer(null)} className="btn-secondary">
                Change Player
              </button>
              <div className="menu-info">
                <p>Use WASD or Arrow Keys to control your ship</p>
                <p>AI Agents will assist you in combat</p>
                <p>Multiplayer Status: {multiplayerStatus}</p>
                <p>Players Online: {players.length}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {gameState === 'playing' && (
        <div className="game-container">
          <div className="game-ui">
            <div className="player-stats">
              <div className="player-info">
                <span>Player: {currentPlayer?.name}</span>
                <span>Planet: {currentPlayer?.planet}</span>
              </div>
              <div className="stat-bar">
                <span>Health:</span>
                <div className="bar">
                  <div 
                    className="bar-fill health" 
                    style={{ width: `${playerStats.health}%` }}
                  ></div>
                </div>
                <span>{playerStats.health}%</span>
              </div>
              <div className="stat-bar">
                <span>Energy:</span>
                <div className="bar">
                  <div 
                    className="bar-fill energy" 
                    style={{ width: `${playerStats.energy}%` }}
                  ></div>
                </div>
                <span>{playerStats.energy}%</span>
              </div>
              <div className="stat-display">
                <span>Score: {playerStats.score}</span>
                <span>Level: {playerStats.level}</span>
                <span>Kills: {currentPlayer?.kills || 0}</span>
                <span>Deaths: {currentPlayer?.deaths || 0}</span>
              </div>
            </div>
            
            <div className="game-controls">
              <button onClick={pauseGame} className="btn-warning">
                Pause
              </button>
              <div className="multiplayer-status">
                Multiplayer: {multiplayerStatus}
              </div>
              <div className="players-online">
                Players: {players.length}
              </div>
            </div>
          </div>
          
          <div ref={mountRef} className="game-canvas" />
        </div>
      )}

      {gameState === 'paused' && (
        <div className="pause-overlay">
          <div className="pause-menu">
            <h2>Game Paused</h2>
            <button onClick={resumeGame} className="btn-primary">
              Resume
            </button>
            <button onClick={() => setGameState('menu')} className="btn-danger">
              Quit to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 