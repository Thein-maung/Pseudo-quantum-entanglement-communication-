import * as tf from './tf.min.js';

let model;

// Tiny embedded 2-layer network
const modelData = {
  layers: [
    { type:'dense', units:64, activation:'relu', inputShape:[33] },
    { type:'dense', units:32, activation:'tanh' }
  ],
  // Random small weights for demonstration
  weights: {
    'dense/kernel': tf.randomNormal([33,64]).arraySync(),
    'dense/bias': tf.randomNormal([64]).arraySync(),
    'dense_1/kernel': tf.randomNormal([64,32]).arraySync(),
    'dense_1/bias': tf.randomNormal([32]).arraySync()
  }
};

export async function loadTwin() {
  if(model) return;
  await tf.ready();

  model = tf.sequential({
    layers: [
      tf.layers.dense({ units:64, activation:'relu', inputShape:[33] }),
      tf.layers.dense({ units:32, activation:'tanh' })
    ]
  });

  const w = [
    tf.tensor2d(modelData.weights['dense/kernel']),
    tf.tensor1d(modelData.weights['dense/bias']),
    tf.tensor2d(modelData.weights['dense_1/kernel']),
    tf.tensor1d(modelData.weights['dense_1/bias'])
  ];
  await model.setWeights(w);
}

export function infer(seed) {
  const input = tf.tensor2d([seed.map(v=>v/255)], [1, seed.length]);
  const out = model.predict(input);
  return Array.from(out.dataSync());
}
