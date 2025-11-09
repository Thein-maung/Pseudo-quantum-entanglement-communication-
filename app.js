import { setSeed, nextPad } from './crypto.js';
import { generateQR, startScan } from './qr.js';

const chatDiv = document.getElementById('chat');
const pairingDiv = document.getElementById('pairing');

document.getElementById('genBtn').onclick = async () => {
  const seed = crypto.getRandomValues(new Uint8Array(32));
  await setSeed(seed);
  await generateQR(btoa(String.fromCharCode(...seed)));
  pairingDiv.hidden = true; chatDiv.hidden = false;
};

document.getElementById('scanBtn').onclick = async () => {
  await startScan(async raw => {
    const seed = new Uint8Array([...atob(raw)].map(c => c.charCodeAt(0)));
    await setSeed(seed);
    pairingDiv.hidden = true; chatDiv.hidden = false;
  });
};

document.getElementById('sendBtn').onclick = async () => {
  const txt = new TextEncoder().encode(document.getElementById('txt').value);
  const pad = await nextPad(txt.length);
  const cip = txt.map((b, i) => b ^ pad[i]);
  document.getElementById('log').textContent = btoa(String.fromCharCode(...cip));
};

document.getElementById('decBtn').onclick = async () => {
  const cip = new Uint8Array([...atob(prompt('Paste base64'))].map(c => c.charCodeAt(0)));
  const pad = await nextPad(cip.length);
  const txt = cip.map((b, i) => b ^ pad[i]);
  document.getElementById('log').textContent = new TextDecoder().decode(txt);
};

// register service worker
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

