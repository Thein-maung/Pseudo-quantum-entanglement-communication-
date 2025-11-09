const SEED_DB = 'pe_seed';
let COUNTER = 0;
let TWIN_SEED;

export async function cryptoReady() {
  // base64-encoded 21 kB weights – truncated here for brevity
  return 'UEsDBBQAAAAIA…base64…';   // <-- replace with real weights blob
}

export async function setSeed(s) {
  TWIN_SEED = new Uint8Array(await crypto.subtle.digest('SHA-256', s));
  COUNTER = 0;
  await save();
}

export async function nextPad(len) {
  if (!TWIN_SEED) throw 'no seed';
  const buf = new ArrayBuffer(16);
  const view = new DataView(buf);
  view.setUint32(0, COUNTER, true);
  const seed = new Uint8Array(buf);
  await loadTwin();
  const raw = infer(TWIN_SEED.concat(seed));
  COUNTER++;
  await save();
  return raw.slice(0, len);
}

function save() {
  return idbSet(SEED_DB, { seed: TWIN_SEED, counter: COUNTER });
}
