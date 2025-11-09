console.log('[PE] app.js loaded');

function toast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#00ff99;color:#000;padding:0.5rem 1rem;border-radius:8px;font-size:0.9rem;z-index:999`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

async function init() {
  console.log('[PE] DOM ready');

  const gen  = document.getElementById('genBtn');
  const scan = document.getElementById('scanBtn');
  const send = document.getElementById('sendBtn');
  const dec  = document.getElementById('decBtn');

  if (!gen)  { console.error('genBtn missing');  return; }
  if (!scan) { console.error('scanBtn missing'); return; }

  gen.onclick = async () => {
  toast('Creating QR…');
  const seed = crypto.getRandomValues(new Uint8Array(32));
  await setSeed(seed);
  document.getElementById('pairing').hidden = false; // make sure card visible
  await generateQR(btoa(String.fromCharCode(...seed)));
  toast('QR created – show it to the other device');
};


  scan.onclick = async () => {
    console.log('[PE] Scan clicked');
    toast('Opening camera…');
    try {
      await startScan(async raw => {
        const seed = new Uint8Array([...atob(raw)].map(c => c.charCodeAt(0)));
        await setSeed(seed);
        toast('Paired! You can now go offline.');
        document.getElementById('pairing').hidden = true;
        document.getElementById('chat').hidden   = false;
      });
    } catch (e) {
      console.error('[PE] scan error', e);
      toast('Camera error: ' + e.message);
    }
  };

  send.onclick = async () => {
    console.log('[PE] Send clicked');
    const txt = new TextEncoder().encode(document.getElementById('txt').value);
    const pad = await nextPad(txt.length);
    const cip = txt.map((b,i) => b ^ pad[i]);
    document.getElementById('log').textContent += '→ ' + btoa(String.fromCharCode(...cip)) + '\n';
    document.getElementById('txt').value = '';
  };

  dec.onclick = async () => {
    console.log('[PE] Decode clicked');
    const raw = prompt('Paste base64:');
    if (!raw) return;
    const cip = new Uint8Array([...atob(raw)].map(c => c.charCodeAt(0)));
    const pad = await nextPad(cip.length);
    const txt = cip.map((b,i) => b ^ pad[i]);
    document.getElementById('log').textContent += '← ' + new TextDecoder().decode(txt) + '\n';
  };
}

window.addEventListener('DOMContentLoaded', init);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
      

