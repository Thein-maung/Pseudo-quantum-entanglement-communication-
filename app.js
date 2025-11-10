import { setSeed, nextPad } from './crypto.js';
import { generateQR, startScan } from './qr.js';

const pairing = document.getElementById('pairing');
const chat = document.getElementById('chat');
const log = document.getElementById('log');
const txt = document.getElementById('txt');

// QR pairing
document.getElementById('genBtn').onclick = async () => {
  const seed = crypto.getRandomValues(new Uint8Array(32));
  await setSeed(seed);
  await generateQR(btoa(String.fromCharCode(...seed)));
  pairing.hidden = true; chat.hidden = false;
};

document.getElementById('scanBtn').onclick = async () => {
  await startScan(async raw => {
    const seed = new Uint8Array([...atob(raw)].map(c=>c.charCodeAt(0)));
    await setSeed(seed);
    pairing.hidden = true; chat.hidden = false;
  });
};

// Encrypt & show
document.getElementById('sendBtn').onclick = async () => {
  const msg = new TextEncoder().encode(txt.value);
  const pad = await nextPad(msg.length);
  const enc = msg.map((b,i)=>b^pad[i]);
  log.textContent = btoa(String.fromCharCode(...enc));
};

// Decrypt & speak
document.getElementById('decBtn').onclick = async () => {
  const cip = prompt('Paste base64 cipher:');
  if(!cip) return;
  const bytes = new Uint8Array([...atob(cip)].map(c=>c.charCodeAt(0)));
  const pad = await nextPad(bytes.length);
  const dec = bytes.map((b,i)=>b^pad[i]);
  const text = new TextDecoder().decode(dec);
  log.textContent = text;
  speechSynthesis.speak(new SpeechSynthesisUtterance(text));
};

// Voice input
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = false;
document.getElementById('voiceBtn').onclick = ()=> recognition.start();
recognition.onresult = e => txt.value = e.results[0][0].transcript;

// Voice output
document.getElementById('speakBtn').onclick = ()=> speechSynthesis.speak(new SpeechSynthesisUtterance(txt.value));

// Service Worker
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
