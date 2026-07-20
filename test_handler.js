const Hapi = require('@hapi/hapi');
const routes = require('./src/server/routes');
const ClientError = require('./src/exceptions/ClientError');
const InputError = require('./src/exceptions/InputError');

(async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  server.app.model = {
    predict: () => ({
      data: async () => [0.8] // Mock cancer
    })
  };

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

  // Mock storeData so it doesn't try to use firestore
  const handler = require('./src/server/handler');
  const storeData = require('./src/services/storeData');
  storeData.storeData = async () => {};

  // Mock predictClassification to skip tf
  const predictClassification = require('./src/services/inferenceService');
  const originalPredict = require('./src/services/inferenceService');
  require.cache[require.resolve('./src/services/inferenceService')].exports = async () => {
    // throw new InputError('Terjadi kesalahan dalam melakukan prediksi');
    return { label: 'Cancer', suggestion: 'Segera periksa ke dokter!' };
  };

  await server.initialize();

  // Test 1: No payload
  console.log("--- Test 1: No Payload ---");
  const res1 = await server.inject({
    method: 'POST',
    url: '/predict'
  });
  console.log(res1.statusCode);
  console.log(res1.payload);

  // Test 2: Payload not multipart
  console.log("\n--- Test 2: Not multipart ---");
  const res2 = await server.inject({
    method: 'POST',
    url: '/predict',
    payload: { image: 'test' }
  });
  console.log(res2.statusCode);
  console.log(res2.payload);

  // Test 3: Multipart but field is not image
  console.log("\n--- Test 3: Multipart, wrong field ---");
  const FormData = require('form-data');
  const form = new FormData();
  form.append('file', 'hello world');
  
  const res3 = await server.inject({
    method: 'POST',
    url: '/predict',
    headers: form.getHeaders(),
    payload: form.getBuffer()
  });
  console.log(res3.statusCode);
  console.log(res3.payload);

})();
