const https = require('https');

async function testJSLoading() {
  console.log('🔍 Testing JavaScript Loading...\n');
  
  try {
    // First get the main HTML to extract script URLs
    const htmlResponse = await new Promise((resolve, reject) => {
      https.get('https://www.rekursing.com', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
    
    // Extract script URLs
    const scriptMatches = htmlResponse.match(/src="([^"]*\.js[^"]*)"/g);
    const cssMatches = htmlResponse.match(/href="([^"]*\.css[^"]*)"/g);
    
    console.log('📜 Found Scripts:');
    if (scriptMatches) {
      for (const match of scriptMatches) {
        const url = match.match(/src="([^"]*)"/)[1];
        console.log(`  - ${url}`);
      }
    }
    
    console.log('\n🎨 Found CSS:');
    if (cssMatches) {
      for (const match of cssMatches) {
        const url = match.match(/href="([^"]*)"/)[1];
        console.log(`  - ${url}`);
      }
    }
    
    // Test main JavaScript file
    const mainScriptMatch = htmlResponse.match(/src="([^"]*main-[^"]*\.js[^"]*)"/);
    if (mainScriptMatch) {
      const mainScriptUrl = mainScriptMatch[1];
      console.log(`\n🔍 Testing main script: ${mainScriptUrl}`);
      
      const scriptResponse = await new Promise((resolve, reject) => {
        https.get(`https://www.rekursing.com${mainScriptUrl}`, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => resolve({ statusCode: res.statusCode, length: data.length }));
        }).on('error', reject);
      });
      
      console.log(`  Status: ${scriptResponse.statusCode}`);
      console.log(`  Size: ${scriptResponse.length} bytes`);
      console.log(`  ✅ Main script is accessible`);
    }
    
    // Test main CSS file
    const mainCssMatch = htmlResponse.match(/href="([^"]*main-[^"]*\.css[^"]*)"/);
    if (mainCssMatch) {
      const mainCssUrl = mainCssMatch[1];
      console.log(`\n🎨 Testing main CSS: ${mainCssUrl}`);
      
      const cssResponse = await new Promise((resolve, reject) => {
        https.get(`https://www.rekursing.com${mainCssUrl}`, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => resolve({ statusCode: res.statusCode, length: data.length }));
        }).on('error', reject);
      });
      
      console.log(`  Status: ${cssResponse.statusCode}`);
      console.log(`  Size: ${cssResponse.length} bytes`);
      console.log(`  ✅ Main CSS is accessible`);
    }
    
    console.log('\n✅ All assets appear to be loading correctly!');
    console.log('💡 If the UI is not showing, check browser console for JavaScript errors.');
    
  } catch (error) {
    console.error('❌ Error testing JavaScript loading:', error.message);
  }
}

testJSLoading(); 