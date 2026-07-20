const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testAPI() {
  const url = 'https://asclepius-backend-287074785289.asia-southeast1.run.app/predict';
  console.log(`Testing URL: ${url}\n`);

  // Test 1: Empty Body
  console.log('--- Test 1: Empty JSON Body ---');
  let res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  console.log(`Status: ${res.status}`);
  console.log(`Body: ${await res.text()}\n`);

  // Test 2: Text file spoofed as image
  console.log('--- Test 2: Text file as image (Dicoding Bad Request simulation) ---');
  fs.writeFileSync('dummy.txt', 'This is not an image');
  const form = new FormData();
  form.append('image', fs.createReadStream('dummy.txt'), {
    filename: 'dummy.txt',
    contentType: 'image/jpeg'
  });

  res = await fetch(url, {
    method: 'POST',
    body: form
  });
  console.log(`Status: ${res.status}`);
  console.log(`Body: ${await res.text()}\n`);

  // Test 3: No image field
  console.log('--- Test 3: Valid image but wrong field name ---');
  const form2 = new FormData();
  form2.append('file', fs.createReadStream('favicon.png'));
  res = await fetch(url, {
    method: 'POST',
    body: form2
  });
  console.log(`Status: ${res.status}`);
  console.log(`Body: ${await res.text()}\n`);
}

testAPI().catch(console.error);
