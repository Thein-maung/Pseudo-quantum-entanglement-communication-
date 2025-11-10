import { loadTwin, infer } from './twinnet.js';

let TWIN_SEED;
let COUNTER = 0;

export async function setSeed(seed) {
  const hash = await crypto.subtle.digest('SHA-256', seed);
  TWIN_SEED = new Uint8Array(hash);
  COUNTER = 0;
}

export async function nextPad(len) {
  if (!TWIN_SEED) throw 'No seed set';
  await loadTwin();
  const input = TWIN_SEED.concat(new Uint8Array([COUNTER]));
  const pad = infer(input);
  COUNTER++;
  return new Uint8Array(pad).slice(0, len);
}
