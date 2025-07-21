/**
 * Data Loader for Transformer Trading System
 * Handles loading and processing of financial data from various sources
 */

export class DataLoader {
    constructor() {
        this.dataCache = new Map();
        this.processedData = [];
    }

    // Load EURUSD sample data from CSV
    async loadEURUSDSampleData() {
        try {
            console.log('📊 Loading EURUSD sample data...');
            
            const response = await fetch('/src/data/eurusd_sample.csv');
            if (!response.ok) {
                throw new Error(`Failed to load CSV: ${response.status}`);
            }
            
            const csvText = await response.text();
            const data = this.parseCSV(csvText);
            
            console.log(`✅ Loaded ${data.length} EURUSD data points`);
            return data;
            
        } catch (error) {
            console.error('❌ Failed to load EURUSD data:', error);
            // Fallback to generated data
            return this.generateFallbackData();
        }
    }

    // Parse CSV data
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const row = {};
            
            headers.forEach((header, index) => {
                let value = values[index];
                
                // Parse numeric values
                if (['Open', 'High', 'Low', 'Close', 'Volume'].includes(header)) {
                    value = parseFloat(value);
                }
                
                // Parse timestamp
                if (header === 'Gmt time') {
                    value = this.parseTimestamp(value);
                }
                
                row[header.toLowerCase().replace(/\s+/g, '_')] = value;
            });
            
            data.push(row);
        }
        
        return data;
    }

    // Parse timestamp from various formats
    parseTimestamp(timestampStr) {
        try {
            // Handle format: "01.07.2020 00:00:00.000"
            if (timestampStr.includes('.')) {
                const [datePart, timePart] = timestampStr.split(' ');
                const [day, month, year] = datePart.split('.');
                const [hour, minute, second] = timePart.split(':');
                
                return new Date(year, month - 1, day, hour, minute, second).getTime();
            }
            
            // Handle ISO format
            return new Date(timestampStr).getTime();
            
        } catch (error) {
            console.warn('Could not parse timestamp:', timestampStr);
            return Date.now();
        }
    }

    // Generate fallback data if CSV loading fails
    generateFallbackData() {
        console.log('🔄 Generating fallback EURUSD data...');
        
        const data = [];
        const basePrice = 1.1000; // EUR/USD base price
        let currentPrice = basePrice;
        
        // Generate 3 years of hourly data
        const startTime = Date.now() - (3 * 365 * 24 * 60 * 60 * 1000);
        
        for (let i = 0; i < 26280; i++) { // 3 years * 365 days * 24 hours
            const timestamp = startTime + (i * 60 * 60 * 1000);
            
            // Simulate realistic EUR/USD movements
            const volatility = 0.0005; // 0.05% hourly volatility
            const trend = 0.000001; // Slight trend
            const random = (Math.random() - 0.5) * 2;
            
            currentPrice *= (1 + trend + random * volatility);
            
            const spread = 0.0001; // 1 pip spread
            const bidPrice = currentPrice - spread / 2;
            const askPrice = currentPrice + spread / 2;
            
            data.push({
                gmt_time: timestamp,
                open: bidPrice * (1 + (Math.random() - 0.5) * 0.0002),
                high: bidPrice * (1 + Math.random() * 0.0005),
                low: bidPrice * (1 - Math.random() * 0.0005),
                close: bidPrice,
                volume: Math.floor(Math.random() * 1000) + 100
            });
        }
        
        console.log(`✅ Generated ${data.length} fallback data points`);
        return data;
    }

    // Process data for transformer trading
    processDataForTrading(rawData) {
        console.log('🔄 Processing data for transformer trading...');
        
        const processedData = rawData.map(row => ({
            timestamp: row.gmt_time || row.timestamp,
            open: row.open,
            high: row.high,
            low: row.low,
            close: row.close,
            volume: row.volume || 1000
        })).filter(row => 
            row.timestamp && 
            !isNaN(row.open) && 
            !isNaN(row.high) && 
            !isNaN(row.low) && 
            !isNaN(row.close)
        );
        
        // Sort by timestamp
        processedData.sort((a, b) => a.timestamp - b.timestamp);
        
        console.log(`✅ Processed ${processedData.length} data points`);
        this.processedData = processedData;
        
        return processedData;
    }

    // Get data statistics
    getDataStats() {
        if (!this.processedData.length) {
            return null;
        }
        
        const prices = this.processedData.map(d => d.close);
        const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i]);
        
        return {
            totalPoints: this.processedData.length,
            dateRange: {
                start: new Date(this.processedData[0].timestamp),
                end: new Date(this.processedData[this.processedData.length - 1].timestamp)
            },
            priceStats: {
                min: Math.min(...prices),
                max: Math.max(...prices),
                mean: prices.reduce((sum, p) => sum + p, 0) / prices.length,
                std: Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / returns.length)
            },
            volatility: Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / returns.length) * Math.sqrt(24 * 365), // Annualized
            dataQuality: this.processedData.length > 1000 ? 'High' : 'Low'
        };
    }

    // Cache data for performance
    cacheData(key, data) {
        this.dataCache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    // Get cached data
    getCachedData(key, maxAge = 3600000) { // 1 hour default
        const cached = this.dataCache.get(key);
        if (cached && (Date.now() - cached.timestamp) < maxAge) {
            return cached.data;
        }
        return null;
    }

    // Clear cache
    clearCache() {
        this.dataCache.clear();
        console.log('🗑️ Data cache cleared');
    }
}

export default DataLoader; 