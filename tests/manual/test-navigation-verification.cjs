const http = require('http');
const https = require('https');

// Test configuration
const TEST_URLS = [
  'http://localhost:4173',
  'http://localhost:4174', 
  'http://localhost:4175',
  'http://localhost:4176',
  'http://localhost:3000'
];

async function testUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          contentType: res.headers['content-type'],
          contentLength: data.length,
          hasReactRoot: data.includes('id="root"'),
          hasLoadingScreen: data.includes('loading-screen'),
          hasNavBar: data.includes('nav') || data.includes('navigation'),
          hasMainJS: data.includes('main-') && data.includes('.js'),
          hasMainCSS: data.includes('main-') && data.includes('.css'),
          hasReactScript: data.includes('src="/src/main.jsx"') || data.includes('src="./assets/main-'),
          content: data.substring(0, 500) // First 500 chars for debugging
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        error: err.message,
        status: 'ERROR'
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        url,
        error: 'Timeout',
        status: 'TIMEOUT'
      });
    });
  });
}

async function testAssetLoading(baseUrl, assetPath) {
  return new Promise((resolve) => {
    const url = `${baseUrl}${assetPath}`;
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      resolve({
        url,
        status: res.statusCode,
        contentType: res.headers['content-type'],
        contentLength: res.headers['content-length']
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        error: err.message,
        status: 'ERROR'
      });
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({
        url,
        error: 'Timeout',
        status: 'TIMEOUT'
      });
    });
  });
}

async function runTests() {
  console.log('🔍 Testing Navigation and UI Elements...\n');
  
  // Test all possible URLs
  for (const url of TEST_URLS) {
    console.log(`📡 Testing: ${url}`);
    const result = await testUrl(url);
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}\n`);
      continue;
    }
    
    console.log(`✅ Status: ${result.status}`);
    console.log(`📄 Content-Type: ${result.contentType}`);
    console.log(`📏 Content Length: ${result.contentLength} bytes`);
    console.log(`🎯 Has React Root: ${result.hasReactRoot ? '✅' : '❌'}`);
    console.log(`🔄 Has Loading Screen: ${result.hasLoadingScreen ? '✅' : '❌'}`);
    console.log(`🧭 Has Navigation: ${result.hasNavBar ? '✅' : '❌'}`);
    console.log(`📜 Has Main JS: ${result.hasMainJS ? '✅' : '❌'}`);
    console.log(`🎨 Has Main CSS: ${result.hasMainCSS ? '✅' : '❌'}`);
    console.log(`⚛️ Has React Script: ${result.hasReactScript ? '✅' : '❌'}`);
    
    if (result.status === 200) {
      console.log('\n📄 Content Preview:');
      console.log(result.content);
      console.log('...\n');
      
      // Test asset loading if we found a working server
      if (result.hasMainJS) {
        console.log('🔍 Testing asset loading...');
        
        // Extract asset paths from content
        const jsMatch = result.content.match(/src="([^"]*main-[^"]*\.js)"/);
        const cssMatch = result.content.match(/href="([^"]*main-[^"]*\.css)"/);
        
        if (jsMatch) {
          const jsResult = await testAssetLoading(url, jsMatch[1]);
          console.log(`📜 JS Asset (${jsMatch[1]}): ${jsResult.status} - ${jsResult.contentType}`);
        }
        
        if (cssMatch) {
          const cssResult = await testAssetLoading(url, cssMatch[1]);
          console.log(`🎨 CSS Asset (${cssMatch[1]}): ${cssResult.status} - ${cssResult.contentType}`);
        }
      }
    }
    
    console.log('─'.repeat(80) + '\n');
  }
  
  console.log('🏁 Navigation verification complete!');
}

// Run the tests
runTests().catch(console.error); 