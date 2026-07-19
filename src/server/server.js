// Polyfill: util.isNullOrUndefined was removed in Node.js 24+
// @tensorflow/tfjs-node@3.x still calls it at runtime (e.g. during decodeImage).
// Must run BEFORE any other require, especially before TensorFlow loads.
const _util = require('util');
if (typeof _util.isNullOrUndefined !== 'function') {
  _util.isNullOrUndefined = (v) => v === null || v === undefined;
}

require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const loadModel = require('../services/loadModel');
const ClientError = require('../exceptions/ClientError');

(async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  const model = await loadModel();
  server.app.model = model;

  server.route(routes);

  server.ext('onPreResponse', function (request, h) {
    const response = request.response;

    if (response instanceof Error) {
      if (response instanceof ClientError || response.name === 'ClientError' || response.name === 'InputError') {
        const newResponse = h.response({
          status: 'fail',
          message: response.message
        });
        newResponse.code(response.statusCode || 400);
        return newResponse;
      }

      if (response.isBoom) {
        const statusCode = response.output.statusCode;

        if (statusCode === 413) {
          const newResponse = h.response({
            status: 'fail',
            message: 'Payload content length greater than maximum allowed: 1000000'
          });
          newResponse.code(413);
          return newResponse;
        }

        if (statusCode === 400 || statusCode === 415) {
          const newResponse = h.response({
            status: 'fail',
            message: 'Terjadi kesalahan dalam melakukan prediksi'
          });
          newResponse.code(400);
          return newResponse;
        }
      }

      const newResponse = h.response({
        status: 'fail',
        message: response.message
      });
      newResponse.code(response.isBoom ? response.output.statusCode : 500);
      return newResponse;
    }

    return h.continue;
  });

  server.ext('onPostResponse', (request, h) => {
    const response = request.response;
    const statusCode = response.isBoom ? response.output.statusCode : response.statusCode;
    const payload = response.isBoom ? response.output.payload : response.source;
    
    console.log(`[${request.method.toUpperCase()} ${request.path}] returned status code: ${statusCode}`);
    console.log(`Response Payload:`, payload);
    
    return h.continue;
  });

  await server.start();
  console.log(`Server started at: ${server.info.uri}`);
})();
