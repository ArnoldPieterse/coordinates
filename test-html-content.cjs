const https = require('https');

async function testHTMLContent() {
  console.log('🔍 Testing HTML Content...\n');
  
  try {
    const response = await new Promise((resolve, reject) => {
      https.get('https://www.rekursing.com', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
      }).on('error', reject);
    });
    
    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Content Length: ${response.body.length} bytes`);
    
    // Check for key elements
    const checks = [
      { name: 'React Root', pattern: 'id="app"', found: response.body.includes('id="app"') },
      { name: 'Loading Screen', pattern: 'loading-screen', found: response.body.includes('loading-screen') },
      { name: 'Main Script', pattern: 'main-', found: response.body.includes('main-') },
      { name: 'CSS File', pattern: '.css', found: response.body.includes('.css') },
      { name: 'Rekursing Title', pattern: 'Rekursing', found: response.body.includes('Rekursing') },
      { name: 'React Script', pattern: 'type="module"', found: response.body.includes('type="module"') }
    ];
    
    console.log('\n📋 Content Checks:');
    checks.forEach(check => {
      const status = check.found ? '✅' : '❌';
      console.log(`${status} ${check.name}: ${check.found ? 'Found' : 'Not found'}`);
    });
    
    // Show first 500 characters
    console.log('\n📄 First 500 characters of HTML:');
    console.log(response.body.substring(0, 500));
    
    // Show last 500 characters
    console.log('\n📄 Last 500 characters of HTML:');
    console.log(response.body.substring(response.body.length - 500));
    
  } catch (error) {
    console.error('❌ Error testing HTML content:', error.message);
  }
}

testHTMLContent(); 