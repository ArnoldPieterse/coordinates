#!/usr/bin/env node

/**
 * Web Search CLI Tool
 * Command-line interface for web search functionality
 * Usage: node web-search-cli.js <query> <search-engine> <number-of-results>
 */

class WebSearchCLI {
    constructor() {
        this.searchEngines = {
            google: {
                name: 'Google',
                baseUrl: 'https://www.google.com/search',
                icon: '🔍'
            },
            bing: {
                name: 'Bing',
                baseUrl: 'https://www.bing.com/search',
                icon: '🔎'
            },
            duckduckgo: {
                name: 'DuckDuckGo',
                baseUrl: 'https://duckduckgo.com/',
                icon: '🦆'
            },
            youtube: {
                name: 'YouTube',
                baseUrl: 'https://www.youtube.com/results',
                icon: '📺'
            },
            github: {
                name: 'GitHub',
                baseUrl: 'https://github.com/search',
                icon: '💻'
            }
        };
    }

    async execute(args) {
        if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
            this.showHelp();
            return;
        }

        const query = args[0];
        const engine = args[1] || 'google';
        const maxResults = parseInt(args[2]) || 10;

        console.log(`🔍 Searching for: "${query}"`);
        console.log(`🔎 Engine: ${engine}`);
        console.log(`📊 Max Results: ${maxResults}`);
        console.log('─'.repeat(50));

        try {
            const results = await this.searchWeb(query, engine, maxResults);
            this.displayResults(results, query, engine);
        } catch (error) {
            console.error('❌ Search failed:', error.message);
            process.exit(1);
        }
    }

    async searchWeb(query, engine, maxResults) {
        // For demo purposes, we'll simulate search results
        // In a real implementation, you would use actual search APIs
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

        const engineInfo = this.searchEngines[engine];
        const results = [];

        // Generate mock results based on the search engine
        for (let i = 1; i <= Math.min(maxResults, 10); i++) {
            results.push({
                title: `${engineInfo.name} Result ${i} for "${query}"`,
                url: `https://example${i}.com/search-result`,
                snippet: `This is a sample search result ${i} for the query "${query}" using ${engineInfo.name}. This would contain relevant information found by the search engine.`,
                engine: engine,
                rank: i
            });
        }

        return results;
    }

    displayResults(results, query, engine) {
        if (results.length === 0) {
            console.log(`🔍 No results found for "${query}" using ${engine}`);
            return;
        }

        console.log(`✅ Found ${results.length} results for "${query}" using ${engine}\n`);

        results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.title}`);
            console.log(`   📍 ${result.url}`);
            console.log(`   📝 ${result.snippet}`);
            console.log(`   🏷️  Rank: #${result.rank} | Engine: ${result.engine}`);
            console.log('');
        });

        console.log('─'.repeat(50));
        console.log(`💡 Tip: Use --help for usage information`);
    }

    showHelp() {
        console.log(`
🔍 Web Search CLI Tool

Usage:
  node web-search-cli.js <query> [search-engine] [number-of-results]

Parameters:
  query              Search query (required)
  search-engine      Search engine to use (optional, default: google)
  number-of-results  Maximum number of results (optional, default: 10)

Available Search Engines:
  google      🔍 Google Search
  bing        🔎 Bing Search
  duckduckgo  🦆 DuckDuckGo
  youtube     📺 YouTube
  github      💻 GitHub

Examples:
  node web-search-cli.js "Three.js tutorial"
  node web-search-cli.js "space shooter game" google 5
  node web-search-cli.js "JavaScript tips" bing 15
  node web-search-cli.js "game development" youtube 8

Options:
  --help, -h  Show this help message
        `);
    }
}

// Main execution
if (process.argv.length > 2) {
    const cli = new WebSearchCLI();
    const args = process.argv.slice(2);
    
    cli.execute(args)
        .then(() => {
            console.log('✅ Search completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ CLI Error:', error.message);
            process.exit(1);
        });
} else {
    const cli = new WebSearchCLI();
    cli.showHelp();
} 