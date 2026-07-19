const fs = require('fs');
async function test() {
  const formData = new FormData();
  // Create a tiny 1x1 dummy PNG
  const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  const blob = new Blob([dummyPng], { type: 'image/png' });
  formData.append('image', blob, 'test.png');
  
  try {
    const res = await fetch('https://asclepius-backend-287074785289.asia-southeast1.run.app/predict', {
      method: 'POST',
      body: formData
    });
    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', text);
  } catch (e) {
    console.error(e);
  }
}
test();
