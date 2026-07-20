const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/predict',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=--------------------------497424424364234032227181'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

// Write a bad payload
req.write('--------------------------497424424364234032227181\r\n');
req.write('Content-Disposition: form-data; name="not_image"\r\n\r\n');
req.write('Hello World\r\n');
req.write('--------------------------497424424364234032227181--\r\n');
req.end();
