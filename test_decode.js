const tf = require('@tensorflow/tfjs-node');

try {
  const buffer = Buffer.from('hello world this is a text file');
  const tensor = tf.node.decodeImage(buffer, 3);
  console.log('SUCCESS, tensor shape:', tensor.shape);
} catch (error) {
  console.log('ERROR THROWN:', error.message);
}
