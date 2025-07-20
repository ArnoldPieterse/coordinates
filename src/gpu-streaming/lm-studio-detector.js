/**
 * LM Studio Detector
 * Discovers and connects to LM Studio instances on the network
 */

import { EventEmitter } from 'events';

export class LMStudioDetector extends EventEmitter {
  constructor() {
    super();
    this.discoveredInstances = new Map();
    this.knownInstances = [
      { host: '10.3.129.26', port: 1234, name: 'User LM Studio' },
      { host: 'localhost', port: 1234, name: 'Local LM Studio' },
      { host: '127.0.0.1', port: 1234, name: 'Localhost LM Studio' }
    ];
    this.scanning = false;
  }

  async scanNetwork() {
    if (this.scanning) return;
    
    this.scanning = true;
    console.log('🔍 Scanning for LM Studio instances...');
    
    try {
      // Scan known instances first
      await this.scanKnownInstances();
      
      // Scan common network ranges
      await this.scanNetworkRanges();
      
      console.log(`✅ Network scan complete. Found ${this.discoveredInstances.size} LM Studio instances`);
      this.emit('scan:complete', Array.from(this.discoveredInstances.values()));
      
    } catch (error) {
      console.error('❌ Network scan failed:', error);
      this.emit('scan:error', error);
    } finally {
      this.scanning = false;
    }
  }

  async scanKnownInstances() {
    console.log('🎯 Scanning known LM Studio instances...');
    
    for (const instance of this.knownInstances) {
      try {
        const isAvailable = await this.testLMStudioConnection(instance.host, instance.port);
        
        if (isAvailable) {
          const instanceInfo = await this.getLMStudioInfo(instance.host, instance.port);
          const instanceKey = `${instance.host}:${instance.port}`;
          
          this.discoveredInstances.set(instanceKey, {
            ...instance,
            ...instanceInfo,
            status: 'available',
            discoveredAt: new Date()
          });
          
          console.log(`✅ Found LM Studio: ${instance.name} at ${instance.host}:${instance.port}`);
          this.emit('instance:discovered', this.discoveredInstances.get(instanceKey));
        }
      } catch (error) {
        console.log(`❌ ${instance.name} at ${instance.host}:${instance.port} not available`);
      }
    }
  }

  async scanNetworkRanges() {
    console.log('🌐 Scanning network ranges for LM Studio instances...');
    
    // Common network ranges to scan
    const networkRanges = [
      '10.3.129.0/24',  // User's network
      '192.168.1.0/24', // Common home network
      '192.168.0.0/24'  // Common home network
    ];
    
    for (const range of networkRanges) {
      await this.scanNetworkRange(range);
    }
  }

  async scanNetworkRange(networkRange) {
    const [baseIP, mask] = networkRange.split('/');
    const baseIPParts = baseIP.split('.').map(Number);
    const maskBits = parseInt(mask);
    
    // Calculate network address
    const networkAddress = this.calculateNetworkAddress(baseIPParts, maskBits);
    const hostCount = Math.pow(2, 32 - maskBits);
    
    console.log(`🔍 Scanning ${networkRange} (${hostCount} hosts)...`);
    
    // Scan first 50 hosts in the range
    const maxHosts = Math.min(50, hostCount);
    
    for (let i = 1; i < maxHosts; i++) {
      const hostIP = this.calculateHostIP(networkAddress, i);
      
      try {
        const isAvailable = await this.testLMStudioConnection(hostIP, 1234);
        
        if (isAvailable) {
          const instanceInfo = await this.getLMStudioInfo(hostIP, 1234);
          const instanceKey = `${hostIP}:1234`;
          
          if (!this.discoveredInstances.has(instanceKey)) {
            this.discoveredInstances.set(instanceKey, {
              host: hostIP,
              port: 1234,
              name: `Discovered LM Studio (${hostIP})`,
              ...instanceInfo,
              status: 'available',
              discoveredAt: new Date()
            });
            
            console.log(`✅ Found new LM Studio at ${hostIP}:1234`);
            this.emit('instance:discovered', this.discoveredInstances.get(instanceKey));
          }
        }
      } catch (error) {
        // Silently continue scanning
      }
    }
  }

  async testLMStudioConnection(host, port) {
    try {
      const url = `http://${host}:${port}/v1/models`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getLMStudioInfo(host, port) {
    try {
      const url = `http://${host}:${port}/v1/models`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          models: data.data || [],
          modelCount: (data.data || []).length,
          serverInfo: {
            host,
            port,
            protocol: 'http'
          }
        };
      }
    } catch (error) {
      console.error(`Failed to get LM Studio info from ${host}:${port}:`, error);
    }
    
    return {
      models: [],
      modelCount: 0,
      serverInfo: { host, port, protocol: 'http' }
    };
  }

  calculateNetworkAddress(ipParts, maskBits) {
    const mask = (0xFFFFFFFF << (32 - maskBits)) >>> 0;
    return ipParts.map((part, i) => part & (mask >> (24 - i * 8)) & 0xFF);
  }

  calculateHostIP(networkAddress, hostIndex) {
    const hostParts = [...networkAddress];
    let remaining = hostIndex;
    
    for (let i = 3; i >= 0 && remaining > 0; i--) {
      hostParts[i] += remaining % 256;
      remaining = Math.floor(remaining / 256);
    }
    
    return hostParts.join('.');
  }

  getDiscoveredInstances() {
    return Array.from(this.discoveredInstances.values());
  }

  getAvailableInstances() {
    return Array.from(this.discoveredInstances.values())
      .filter(instance => instance.status === 'available');
  }

  async testInstanceConnection(host, port) {
    return await this.testLMStudioConnection(host, port);
  }

  async getInstanceModels(host, port) {
    const instanceInfo = await this.getLMStudioInfo(host, port);
    return instanceInfo.models;
  }

  // Continuous monitoring
  startMonitoring(intervalMs = 30000) {
    console.log(`🔄 Starting LM Studio monitoring (${intervalMs}ms interval)`);
    
    this.monitoringInterval = setInterval(async () => {
      await this.scanNetwork();
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🛑 Stopped LM Studio monitoring');
    }
  }
} 