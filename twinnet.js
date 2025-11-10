let model;

export async function loadTwin() {
  if (model) return;
  await tf.ready();
  model = tf.sequential();
  model.add(tf.layers.dense({inputShape:[33], units:64, activation:'relu'}));
  model.add(tf.layers.dense({units:64, activation:'relu'}));
  model.add(tf.layers.dense({units:32, activation:'tanh'}));

  const weights = await fetch('weights.bin').then(r=>r.arrayBuffer());
  const decoded = tf.io.decodeWeights(new Uint8Array(weights), model.weights.map(w=>w.shape));
  await model.setWeights(Object.values(decoded));
}

export function infer(seed) {
  const input = tf.tensor2d([seed.map(v=>v/255)], [1, seed.length]);
  const out = model.predict(input);
  return out.dataSync();
}
