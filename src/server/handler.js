const crypto = require('crypto');
const predictClassification = require('../services/inferenceService');
const { storeData, getHistories } = require('../services/storeData');
const InputError = require('../exceptions/InputError');

async function postPredictHandler(request, h) {
  try {
    const { image } = request.payload || {};

    // Check if image exists and is a readable stream uploaded via multipart (has .hapi metadata)
    if (!image || typeof image.pipe !== 'function' || !image.hapi) {
      throw new InputError('Terjadi kesalahan dalam melakukan prediksi');
    }

    // Validate MIME type — must be an image type
    const contentType = image.hapi.headers['content-type'] || '';
    if (!contentType.startsWith('image/')) {
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

    // Store in Firestore
    await storeData(id, data);

    const response = h.response({
      status: 'success',
      message: 'Model is predicted successfully',
      data
    });
    response.code(201);
    return response;
  } catch (error) {
    console.error('ERROR PREDIKSI:', error);
    
    // Always return 400 for prediction errors
    const response = h.response({
      status: 'fail',
      message: error.message || 'Terjadi kesalahan dalam melakukan prediksi'
    });
    response.code(400);
    return response;
  }
}

async function getHistoriesHandler(request, h) {
  try {
    const histories = await getHistories();
    const response = h.response({
      status: 'success',
      data: histories
    });
    response.code(200);
    return response;
  } catch (error) {
    console.error('ERROR HISTORIES:', error);
    const response = h.response({
      status: 'fail',
      message: 'Gagal mengambil riwayat prediksi'
    });
    response.code(500);
    return response;
  }
}

module.exports = { postPredictHandler, getHistoriesHandler };
