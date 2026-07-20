const Hapi = require('@hapi/hapi');
const ClientError = require('./src/exceptions/ClientError');
const InputError = require('./src/exceptions/InputError');

(async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  server.app.model = {};

  const handler = require('./src/server/handler');

  // Mock predictClassification
  const predictClassification = async (model, imageBuffer) => {
    return { label: 'Non-cancer', suggestion: 'Penyakit kanker tidak terdeteksi.' };
  };

  // Override predictClassification in handler.js using require.cache hack
  const path = require('path');
  const infServicePath = require.resolve('./src/services/inferenceService');
  require.cache[infServicePath] = {
    id: infServicePath,
    filename: infServicePath,
    loaded: true,
    exports: predictClassification
  };

  // Mock storeData
  const storeDataPath = require.resolve('./src/services/storeData');
  require.cache[storeDataPath] = {
    id: storeDataPath,
    filename: storeDataPath,
    loaded: true,
    exports: {
      storeData: async () => {},
      getHistories: async () => []
    }
  };

  // Re-require handler so it uses the mocked modules
  delete require.cache[require.resolve('./src/server/handler')];
  const mockedHandler = require('./src/server/handler');

  server.route({
    path: '/predict',
    method: 'POST',
    handler: mockedHandler.postPredictHandler,
    options: {
      payload: {
        multipart: true,
        maxBytes: 1000000,
        output: 'stream'
      }
    }
  });

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

  await server.initialize();

  console.log("--- Test: Empty Request Body ---");
  const res1 = await server.inject({
    method: 'POST',
    url: '/predict'
  });
  console.log('Status Code:', res1.statusCode);
  console.log('Payload:', res1.payload);

})();
