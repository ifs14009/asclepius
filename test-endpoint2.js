const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function test() {
  const form = new FormData();
  // Provide a real tiny image
  const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  form.append('image', dummyPng, { filename: 'test.png', contentType: 'image/png' });

  try {
    const res = await fetch('https://asclepius-backend-287074785289.asia-southeast1.run.app/predict', {
      method: 'POST',
      body: form
    });
    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', text);
  } catch (e) {
    console.error(e);
  }
}
test();
