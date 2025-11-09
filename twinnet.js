import { cryptoReady, nextPad } from './crypto.js';

let model;
export async function loadTwin() {
  if (model) return;
  await tf.ready();
  model = tf.sequential({
    layers: [
      tf.layers.conv1d({ inputShape: [null, 8], kernelSize: 4, dilationRate: 2, filters: 64, activation: 'sin' }),
      tf.layers.conv1d({ kernelSize: 4, dilationRate: 4, filters: 64, activation: 'sin' }),
      tf.layers.conv1d({ kernelSize: 4, dilationRate: 8, filters: 8 })
    ]
  });
  // 21 kB weights stored as base64 inside crypto.js
  const weights = tf.io.decodeWeights(await cryptoReady());
  await model.setWeights(Object.values(weights));
}

export function infer(seed) {
  const input = tf.tensor(seed, [1, 2, 8]);
  const out = model.predict(input);
  return out.dataSync();
}
