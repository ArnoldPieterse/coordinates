import http from 'http';
import { URL } from 'url';

const HEALTH_CHECK_PORT = process.env.GATEWAY_PORT || 3002;
const HEALTH_CHECK_HOST = 'localhost';
const HEALTH_CHECK_PATH = '/health';
const TIMEOUT = 5000; // 5 seconds

function performHealthCheck() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HEALTH_CHECK_HOST,
      port: HEALTH_CHECK_PORT,
      path: HEALTH_CHECK_PATH,
      method: 'GET',
      timeout: TIMEOUT
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200 && response.status === 'healthy') {
            console.log('AI Gateway health check passed');
            resolve(true);
          } else {
            console.error('AI Gateway health check failed: Invalid response', response);
            reject(new Error('AI Gateway health check failed: Invalid response'));
          }
        } catch (error) {
          console.error('AI Gateway health check failed: Invalid JSON response', error);
          reject(new Error('AI Gateway health check failed: Invalid JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      console.error('AI Gateway health check failed: Request error', error.message);
      reject(new Error(`AI Gateway health check failed: ${error.message}`));
    });

    req.on('timeout', () => {
      console.error('AI Gateway health check failed: Request timeout');
      req.destroy();
      reject(new Error('AI Gateway health check failed: Request timeout'));
    });

    req.end();
  });
}

// Run health check
performHealthCheck()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('AI Gateway health check failed:', error.message);
    process.exit(1);
  }); 