/**
 * Performance Monitor
 * Provides comprehensive performance monitoring and optimization
 * Tracks FPS, memory usage, and system performance metrics
 */
export class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: {
                current: 0,
                average: 0,
                min: Infinity,
                max: 0,
                samples: []
            },
            memory: {
                used: 0,
                total: 0,
                percentage: 0,
                history: []
            },
            frameTime: {
                current: 0,
                average: 0,
                samples: []
            },
            renderTime: {
                current: 0,
                average: 0,
                samples: []
            },
            updateTime: {
                current: 0,
                average: 0,
                samples: []
            }
        };
        
        this.thresholds = {
            fps: {
                warning: 45,
                critical: 30
            },
            memory: {
                warning: 0.7, // 70%
                critical: 0.9  // 90%
            },
            frameTime: {
                warning: 22, // 45 FPS equivalent
                critical: 33  // 30 FPS equivalent
            }
        };
        
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.lastSecond = Math.floor(performance.now() / 1000);
        
        this.eventListeners = [];
        this.optimizationStrategies = new Map();
        
        this.setupOptimizationStrategies();
    }
    
    /**
     * Setup optimization strategies
     */
    setupOptimizationStrategies() {
        this.optimizationStrategies.set('reduceParticles', this.reduceParticles.bind(this));
        this.optimizationStrategies.set('reduceDrawDistance', this.reduceDrawDistance.bind(this));
        this.optimizationStrategies.set('disableShadows', this.disableShadows.bind(this));
        this.optimizationStrategies.set('reduceTextureQuality', this.reduceTextureQuality.bind(this));
        this.optimizationStrategies.set('enableLOD', this.enableLOD.bind(this));
        this.optimizationStrategies.set('clearMemory', this.clearMemory.bind(this));
    }
    
    /**
     * Start performance monitoring
     */
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.lastSecond = Math.floor(performance.now() / 1000);
        
        // Start monitoring interval
        this.monitoringInterval = setInterval(() => {
            this.updateMetrics();
            this.checkThresholds();
            this.optimizeIfNeeded();
        }, 1000); // Update every second
        
        console.log('Performance monitoring started');
    }
    
    /**
     * Stop performance monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        console.log('Performance monitoring stopped');
    }
    
    /**
     * Update performance metrics
     */
    updateMetrics() {
        const currentTime = performance.now();
        const currentSecond = Math.floor(currentTime / 1000);
        
        // Update FPS
        if (currentSecond > this.lastSecond) {
            this.metrics.fps.current = this.frameCount;
            this.metrics.fps.samples.push(this.frameCount);
            
            // Keep only last 60 samples (1 minute of data)
            if (this.metrics.fps.samples.length > 60) {
                this.metrics.fps.samples.shift();
            }
            
            // Calculate average, min, max
            const samples = this.metrics.fps.samples;
            this.metrics.fps.average = samples.reduce((a, b) => a + b, 0) / samples.length;
            this.metrics.fps.min = Math.min(...samples);
            this.metrics.fps.max = Math.max(...samples);
            
            this.frameCount = 0;
            this.lastSecond = currentSecond;
        }
        
        // Update memory usage
        if (performance.memory) {
            this.metrics.memory.used = performance.memory.usedJSHeapSize;
            this.metrics.memory.total = performance.memory.jsHeapSizeLimit;
            this.metrics.memory.percentage = this.metrics.memory.used / this.metrics.memory.total;
            
            this.metrics.memory.history.push({
                timestamp: currentTime,
                used: this.metrics.memory.used,
                percentage: this.metrics.memory.percentage
            });
            
            // Keep only last 60 memory samples
            if (this.metrics.memory.history.length > 60) {
                this.metrics.memory.history.shift();
            }
        }
        
        // Update frame time
        const frameTime = currentTime - this.lastFrameTime;
        this.metrics.frameTime.current = frameTime;
        this.metrics.frameTime.samples.push(frameTime);
        
        if (this.metrics.frameTime.samples.length > 60) {
            this.metrics.frameTime.samples.shift();
        }
        
        this.metrics.frameTime.average = this.metrics.frameTime.samples.reduce((a, b) => a + b, 0) / this.metrics.frameTime.samples.length;
        
        this.lastFrameTime = currentTime;
        this.frameCount++;
    }
    
    /**
     * Record frame render time
     * @param {number} renderTime - Time taken to render frame
     */
    recordRenderTime(renderTime) {
        this.metrics.renderTime.current = renderTime;
        this.metrics.renderTime.samples.push(renderTime);
        
        if (this.metrics.renderTime.samples.length > 60) {
            this.metrics.renderTime.samples.shift();
        }
        
        this.metrics.renderTime.average = this.metrics.renderTime.samples.reduce((a, b) => a + b, 0) / this.metrics.renderTime.samples.length;
    }
    
    /**
     * Record update time
     * @param {number} updateTime - Time taken to update game state
     */
    recordUpdateTime(updateTime) {
        this.metrics.updateTime.current = updateTime;
        this.metrics.updateTime.samples.push(updateTime);
        
        if (this.metrics.updateTime.samples.length > 60) {
            this.metrics.updateTime.samples.shift();
        }
        
        this.metrics.updateTime.average = this.metrics.updateTime.samples.reduce((a, b) => a + b, 0) / this.metrics.updateTime.samples.length;
    }
    
    /**
     * Check performance thresholds
     */
    checkThresholds() {
        const warnings = [];
        const criticals = [];
        
        // Check FPS
        if (this.metrics.fps.current < this.thresholds.fps.critical) {
            criticals.push(`Critical: FPS dropped to ${this.metrics.fps.current}`);
        } else if (this.metrics.fps.current < this.thresholds.fps.warning) {
            warnings.push(`Warning: FPS dropped to ${this.metrics.fps.current}`);
        }
        
        // Check memory usage
        if (this.metrics.memory.percentage > this.thresholds.memory.critical) {
            criticals.push(`Critical: Memory usage at ${(this.metrics.memory.percentage * 100).toFixed(1)}%`);
        } else if (this.metrics.memory.percentage > this.thresholds.memory.warning) {
            warnings.push(`Warning: Memory usage at ${(this.metrics.memory.percentage * 100).toFixed(1)}%`);
        }
        
        // Check frame time
        if (this.metrics.frameTime.current > this.thresholds.frameTime.critical) {
            criticals.push(`Critical: Frame time ${this.metrics.frameTime.current.toFixed(2)}ms`);
        } else if (this.metrics.frameTime.current > this.thresholds.frameTime.warning) {
            warnings.push(`Warning: Frame time ${this.metrics.frameTime.current.toFixed(2)}ms`);
        }
        
        // Emit events for warnings and criticals
        if (warnings.length > 0) {
            this.emitEvent('performanceWarning', { warnings });
        }
        
        if (criticals.length > 0) {
            this.emitEvent('performanceCritical', { criticals });
        }
        
        // Log warnings and criticals
        warnings.forEach(warning => console.warn(`Performance: ${warning}`));
        criticals.forEach(critical => console.error(`Performance: ${critical}`));
    }
    
    /**
     * Optimize performance if needed
     */
    optimizeIfNeeded() {
        const optimizations = [];
        
        // Check if optimization is needed
        if (this.metrics.fps.current < this.thresholds.fps.warning) {
            optimizations.push('reduceParticles');
            optimizations.push('enableLOD');
        }
        
        if (this.metrics.memory.percentage > this.thresholds.memory.warning) {
            optimizations.push('clearMemory');
            optimizations.push('reduceTextureQuality');
        }
        
        if (this.metrics.frameTime.current > this.thresholds.frameTime.warning) {
            optimizations.push('reduceDrawDistance');
            optimizations.push('disableShadows');
        }
        
        // Apply optimizations
        optimizations.forEach(optimization => {
            if (this.optimizationStrategies.has(optimization)) {
                this.optimizationStrategies.get(optimization)();
            }
        });
        
        if (optimizations.length > 0) {
            this.emitEvent('performanceOptimization', { optimizations });
            console.log(`Applied optimizations: ${optimizations.join(', ')}`);
        }
    }
    
    /**
     * Reduce particle count
     */
    reduceParticles() {
        // Implementation would reduce particle system complexity
        console.log('Reducing particle count for performance');
    }
    
    /**
     * Reduce draw distance
     */
    reduceDrawDistance() {
        // Implementation would reduce rendering distance
        console.log('Reducing draw distance for performance');
    }
    
    /**
     * Disable shadows
     */
    disableShadows() {
        // Implementation would disable shadow rendering
        console.log('Disabling shadows for performance');
    }
    
    /**
     * Reduce texture quality
     */
    reduceTextureQuality() {
        // Implementation would reduce texture resolution
        console.log('Reducing texture quality for performance');
    }
    
    /**
     * Enable Level of Detail (LOD)
     */
    enableLOD() {
        // Implementation would enable LOD systems
        console.log('Enabling LOD for performance');
    }
    
    /**
     * Clear memory
     */
    clearMemory() {
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        // Clear object pools
        this.emitEvent('clearObjectPools');
        
        console.log('Clearing memory for performance');
    }
    
    /**
     * Get current performance metrics
     * @returns {Object} Current metrics
     */
    getMetrics() {
        return {
            fps: { ...this.metrics.fps },
            memory: { ...this.metrics.memory },
            frameTime: { ...this.metrics.frameTime },
            renderTime: { ...this.metrics.renderTime },
            updateTime: { ...this.metrics.updateTime }
        };
    }
    
    /**
     * Get performance summary
     * @returns {Object} Performance summary
     */
    getPerformanceSummary() {
        const fps = this.metrics.fps;
        const memory = this.metrics.memory;
        const frameTime = this.metrics.frameTime;
        
        return {
            status: this.getPerformanceStatus(),
            fps: {
                current: fps.current,
                average: Math.round(fps.average),
                min: fps.min,
                max: fps.max
            },
            memory: {
                used: this.formatBytes(memory.used),
                total: this.formatBytes(memory.total),
                percentage: (memory.percentage * 100).toFixed(1)
            },
            frameTime: {
                current: frameTime.current.toFixed(2),
                average: frameTime.average.toFixed(2)
            },
            recommendations: this.getOptimizationRecommendations()
        };
    }
    
    /**
     * Get performance status
     * @returns {string} Performance status
     */
    getPerformanceStatus() {
        const fps = this.metrics.fps.current;
        const memory = this.metrics.memory.percentage;
        const frameTime = this.metrics.frameTime.current;
        
        if (fps < this.thresholds.fps.critical || 
            memory > this.thresholds.memory.critical || 
            frameTime > this.thresholds.frameTime.critical) {
            return 'critical';
        } else if (fps < this.thresholds.fps.warning || 
                   memory > this.thresholds.memory.warning || 
                   frameTime > this.thresholds.frameTime.warning) {
            return 'warning';
        } else {
            return 'good';
        }
    }
    
    /**
     * Get optimization recommendations
     * @returns {Array} List of recommendations
     */
    getOptimizationRecommendations() {
        const recommendations = [];
        
        if (this.metrics.fps.current < this.thresholds.fps.warning) {
            recommendations.push('Consider reducing graphics quality');
            recommendations.push('Enable performance mode');
        }
        
        if (this.metrics.memory.percentage > this.thresholds.memory.warning) {
            recommendations.push('Close other applications to free memory');
            recommendations.push('Restart the game to clear memory');
        }
        
        if (this.metrics.frameTime.current > this.thresholds.frameTime.warning) {
            recommendations.push('Reduce draw distance');
            recommendations.push('Disable advanced graphics features');
        }
        
        return recommendations;
    }
    
    /**
     * Format bytes to human readable format
     * @param {number} bytes - Bytes to format
     * @returns {string} Formatted bytes
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     */
    addEventListener(event, callback) {
        this.eventListeners.push({ event, callback });
    }
    
    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     */
    removeEventListener(event, callback) {
        this.eventListeners = this.eventListeners.filter(
            listener => !(listener.event === event && listener.callback === callback)
        );
    }
    
    /**
     * Emit event
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    emitEvent(event, data) {
        this.eventListeners.forEach(listener => {
            if (listener.event === event) {
                listener.callback(data);
            }
        });
        
        // Also dispatch custom event
        const customEvent = new CustomEvent(event, { detail: data });
        document.dispatchEvent(customEvent);
    }
    
    /**
     * Set performance thresholds
     * @param {Object} thresholds - New thresholds
     */
    setThresholds(thresholds) {
        this.thresholds = { ...this.thresholds, ...thresholds };
    }
    
    /**
     * Get performance report
     * @returns {Object} Detailed performance report
     */
    getPerformanceReport() {
        return {
            timestamp: new Date().toISOString(),
            metrics: this.getMetrics(),
            summary: this.getPerformanceSummary(),
            thresholds: this.thresholds,
            monitoring: {
                isActive: this.isMonitoring,
                uptime: this.getUptime()
            }
        };
    }
    
    /**
     * Get monitoring uptime
     * @returns {number} Uptime in seconds
     */
    getUptime() {
        if (!this.isMonitoring) return 0;
        return Math.floor((performance.now() - this.lastFrameTime) / 1000);
    }
    
    /**
     * Export performance data
     * @returns {Object} Exportable performance data
     */
    exportData() {
        return {
            metrics: this.metrics,
            thresholds: this.thresholds,
            report: this.getPerformanceReport()
        };
    }
    
    /**
     * Reset performance metrics
     */
    resetMetrics() {
        this.metrics = {
            fps: {
                current: 0,
                average: 0,
                min: Infinity,
                max: 0,
                samples: []
            },
            memory: {
                used: 0,
                total: 0,
                percentage: 0,
                history: []
            },
            frameTime: {
                current: 0,
                average: 0,
                samples: []
            },
            renderTime: {
                current: 0,
                average: 0,
                samples: []
            },
            updateTime: {
                current: 0,
                average: 0,
                samples: []
            }
        };
        
        console.log('Performance metrics reset');
    }
    
    /**
     * Cleanup resources
     */
    dispose() {
        this.stopMonitoring();
        
        // Remove all event listeners
        this.eventListeners = [];
        
        // Clear optimization strategies
        this.optimizationStrategies.clear();
        
        // Reset metrics
        this.resetMetrics();
        
        console.log('Performance monitor disposed');
    }
} 