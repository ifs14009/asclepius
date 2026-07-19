const crypto = require('crypto');
const predictClassification = require('../services/inferenceService');
const { storeData, getHistories } = require('../services/storeData');
const InputError = require('../exceptions/InputError');

async function postPredictHandler(request, h) {
  try {
    const { image } = request.payload || {};
    
    // Check if image exists and is a stream from hapi
    if (!image || !image.hapi) {
      throw new InputError('Terjadi kesalahan dalam melakukan prediksi');
    }

    // Validate MIME type
    const contentType = image.hapi.headers['content-type'];
    if (!contentType || (!contentType.startsWith('image/') && !contentType.includes('image/jpeg') && !contentType.includes('image/png'))) {
      throw new InputError('Terjadi kesalahan dalam melakukan prediksi');
    }

    // Convert stream to Buffer
    const imageBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      image.on('data', (chunk) => chunks.push(chunk));
      image.on('end', () => resolve(Buffer.concat(chunks)));
      image.on('error', (err) => reject(err));
    });

    if (imageBuffer.length === 0) {
      throw new InputError('Terjadi kesalahan dalam melakukan prediksi');
    }

    const { model } = request.server.app;

    // Run prediction
    const { label, suggestion } = await predictClassification(model, imageBuffer);
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const data = {
      id: id,
      result: label,
      suggestion: suggestion,
      createdAt: createdAt
    };

    // Store in firestore
    await storeData(id, data);

    const response = h.response({
      status: 'success',
      message: 'Model is predicted successfully',
      data
    });
    response.code(201);
    return response;
  } catch (error) {
    if (error instanceof InputError || error.name === 'InputError') {
      const response = h.response({
        status: 'fail',
        message: error.message
      });
      response.code(error.statusCode || 400);
      return response;
    }
    // If it's a different error, pass it to server.js
    throw error;
  }
}

async function getHistoriesHandler(request, h) {
  const histories = await getHistories();
  const response = h.response({
    status: 'success',
    data: histories
  });
  response.code(200);
  return response;
}

module.exports = { postPredictHandler, getHistoriesHandler };
