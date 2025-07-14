# 🌌 Multiplayer Planetary Shooter

> For index reference format, see [INDEX_DESCRIBER.md](./INDEX_DESCRIBER.md)  <!-- IDX-DOC-00 -->

# IDX-DOC-01: Features

A cutting-edge multiplayer first-person shooter game built with Three.js, featuring procedurally generated worlds, mathematical physics integration, and AI-driven gameplay systems.

## 🚀 Features

### Core Gameplay
- **Multiplayer FPS**: Real-time multiplayer combat across multiple planets
- **Planetary Physics**: Each planet has unique gravity, atmosphere, and environmental effects
- **Advanced Weapon System**: 7 different weapon types with unique mechanics
- **Mathematical Integration**: Fine structure constant and complex mathematical systems influence gameplay

### Procedural Generation
- **Universal Object Generator**: Voxel-based procedural object generation with Marching Cubes algorithm
- **Dynamic Worlds**: Procedurally generated planets with unique characteristics
- **Flow Diagram Visualization**: 3D visualization of system architecture and data flows

### AI Systems
- **Mathematical AI**: Neural network-driven AI that adapts to player behavior
- **Pattern Recognition**: Real-time analysis of player actions and mathematical patterns
- **Adaptive Difficulty**: Dynamic difficulty adjustment based on player performance

### Technical Features
- **Real-time Networking**: Socket.io-based multiplayer with low latency
- **Advanced Rendering**: Three.js with PBR materials, dynamic lighting, and procedural skies
- **Performance Optimization**: Efficient rendering pipeline with LOD systems
- **Modular Architecture**: Clean, maintainable codebase with comprehensive documentation
- **System Interconnectivity Matrix**: Revolutionary visualization of program interconnectivity and butterfly effects
- **Spatial Function Clustering Matrix**: Spatial optimization and refactoring suggestions

## 🛠️ Technology Stack

- **Frontend**: Three.js, Vite, ES6 Modules
- **Backend**: Node.js, Socket.io, Express
- **Physics**: Custom mathematical physics engine
- **AI**: Neural networks with mathematical pattern recognition
- **Networking**: Real-time WebSocket communication

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/multiplayer-planetary-shooter.git
cd multiplayer-planetary-shooter

# Install dependencies
npm install

# Start the development server
npm start
```

The game will be available at:
- **Game**: http://localhost:3001
- **Development Server**: http://localhost:3000

## 🎮 Controls

### Movement
- **WASD**: Move
- **Space**: Jump
- **Shift**: Dash (with cooldown)
- **V**: Toggle camera mode (First/Third person)

### Combat
- **Left Click**: Shoot
- **Mouse Wheel**: Switch weapons
- **1-7**: Quick weapon selection
- **R**: Reload

### Object Generation
- **G**: Generate Kameeldoring tree
- **H**: Generate random tree
- **J**: Clear all generated objects
- **K**: Inspect objects

### Tools
- **F1**: Debug Console
- **F2**: Performance Monitor
- **F3**: Network Analyzer
- **F4**: Gameplay Enhancer
- **F8**: System Interconnectivity Matrix
- **F10**: Spatial Function Clustering Matrix
- **F9**: Trigger Butterfly Effect

## 🌍 Planets

### Earth
- **Gravity**: Standard (-30)
- **Atmosphere**: Blue sky, green terrain
- **Special**: Balanced gameplay

### Mars
- **Gravity**: Low (-12)
- **Atmosphere**: Red sky, rocky terrain
- **Special**: Enhanced jumping, reduced accuracy

### Moon
- **Gravity**: Very low (-5)
- **Atmosphere**: Dark sky, gray terrain
- **Special**: Extreme jumping, precise shooting

### Jupiter
- **Gravity**: High (-50)
- **Atmosphere**: Orange sky, golden terrain
- **Special**: Heavy movement, powerful weapons

### Venus
- **Gravity**: Medium (-25)
- **Atmosphere**: Pink sky, sandy terrain
- **Special**: Balanced with unique visual effects

## 🔧 Development

### Project Structure
```
Coordinates/
├── src/                    # Source code
│   ├── main.js            # Main game loop
│   ├── mathematical-engine.js
│   ├── mathematical-ai.js
│   ├── mathematical-visualizer.js
│   ├── flow-diagram-visualizer.js
│   ├── system-interconnectivity-matrix.js
│   └── style.css
├── game_describers/       # Documentation and diagrams
├── tools/                 # Development tools
├── universal-object-generator.js
├── server.js             # Multiplayer server
└── package.json
```

### Key Systems

#### Mathematical Engine
- Fine structure constant integration
- Complex number calculations
- Fractal and quantum effects
- Real-time mathematical analysis

#### Universal Object Generator
- Voxel-based generation
- Marching Cubes algorithm
- Procedural texturing
- Behavior attachment

#### AI System
- 8-input neural network
- Pattern recognition
- Adaptive responses
- Mathematical analysis

#### System Interconnectivity Matrix

#### Spatial Function Clustering Matrix
- Real-time function interconnectivity visualization
- Butterfly effect propagation tracking
- Multi-perspective system views
- Mathematical constant integration

### Building for Production
```bash
# Build the project
npm run build

# Start production server
npm run start:prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add comprehensive documentation
- Include tests for new features
- Update flow diagrams for architectural changes

## 📊 Performance

### Optimization Features
- **LOD Systems**: Level of detail for distant objects
- **Frustum Culling**: Only render visible objects
- **Object Pooling**: Efficient memory management
- **Network Optimization**: Compressed data transmission

### System Requirements
- **Minimum**: 4GB RAM, Intel i3/AMD equivalent
- **Recommended**: 8GB RAM, Intel i5/AMD equivalent
- **Graphics**: WebGL 2.0 compatible GPU

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill processes on port 3001
npx kill-port 3001
npm start
```

#### Performance Issues
- Reduce graphics quality in settings
- Close other browser tabs
- Check for background processes

#### Connection Issues
- Verify server is running
- Check firewall settings
- Ensure stable internet connection

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js Community**: For the amazing 3D graphics library
- **Socket.io**: For real-time networking capabilities
- **Mathematical Community**: For inspiration in mathematical game design

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/multiplayer-planetary-shooter/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/multiplayer-planetary-shooter/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/multiplayer-planetary-shooter/wiki)

## IDX-TREEHYBRID: Hybrid L-System + Space Colonization Tree Generator
A new procedural tree generator combines L-Systems for main structure and Space Colonization for fine branching and leaf distribution. See implementation plan in [src/procedural-tree-voxel.js](src/procedural-tree-voxel.js) (IDX-TREEHYBRID-PLAN).

### Approach Overview
- **L-Systems**: Generate the main tree skeleton and primary branching structure
- **Space Colonization**: Add fine branches and distribute leaves naturally
- **Benefits**: Combines structural control with organic distribution
- **Industry Standard**: Similar to SpeedTree and other professional tools

### Implementation Status
- [x] Implementation plan documented (IDX-TREEHYBRID-PLAN)
- [ ] L-System skeleton generation
- [ ] Space colonization fine branching
- [ ] Mesh generation and optimization
- [ ] Parameter controls and presets
- [ ] Documentation and examples

### Technical Details
The hybrid approach addresses limitations of single-method approaches:
- L-Systems alone can be too rigid and predictable
- Space colonization alone lacks structural control
- Combined approach provides both control and natural variation

---

**Made with ❤️ and Mathematics** 

# LLM Provider Setup & Usage

This project supports multiple LLM providers for AI agent thinking and dashboard features. To enable real LLMs, follow these steps:

## Local LLMs

### LM Studio
- Download and install LM Studio: https://lmstudio.ai/
- Start the local server: `lms server start`
- The backend will auto-detect LM Studio at `http://localhost:1234/v1`

### Ollama
- Download and install Ollama: https://ollama.com/
- Start the Ollama server: `ollama serve`
- The backend will auto-detect Ollama at `http://localhost:11434`

## Cloud/Free APIs

### OpenAI (Free Tier)
- Get an API key from https://platform.openai.com/
- Set the environment variable `OPENAI_API_KEY` before starting the server.

### Anthropic (Free Tier)
- Get an API key from https://console.anthropic.com/
- Set the environment variable `ANTHROPIC_API_KEY` before starting the server.

### HuggingFace (Free Tier)
- Get an API key from https://huggingface.co/settings/tokens
- Set the environment variable `HUGGINGFACE_API_KEY` before starting the server.

## Usage
- The backend will auto-detect and connect to any available LLM provider.
- The dashboard will show LLM status and allow switching between providers.
- To test LLM endpoints, run: `node test-llm-comprehensive.js`

--- 