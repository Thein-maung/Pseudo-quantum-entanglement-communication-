/*  qr.js  – complete, bullet-proof  */
import { setSeed } from './crypto.js';

const vid   = document.getElementById('cam');
const qrcvs = document.getElementById('qrcvs');

/* ---------- 1.  GENERATE QR ---------- */
export async function generateQR(data) {
  // ensure canvas is in the layout
  qrcvs.style.display = 'block';
  // QRCode needs a moment to layout
  await new Promise(r => requestAnimationFrame(r));
  await QRCode.toCanvas(qrcvs, data, { width: 256, margin: 2, errorCorrectionLevel: 'M' });
}

/* ---------- 2.  SCAN QR  ---------- */
export async function startScan(onFound) {
  // 1.  make video box visible **before** getUserMedia
  vid.style.display = 'block';
  vid.hidden = false;

  // 2.  request camera **synchronously** (keeps user-gesture)
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
  } catch (err) {
    vid.style.display = 'none';
    // readable error for UI
    if (err.name === 'NotAllowedError')     throw new Error('Camera permission denied');
    if (err.name === 'NotFoundError')       throw new Error('No camera found');
    if (location.protocol !== 'https:')     throw new Error('HTTPS required for camera');
    throw new Error('Camera open failed: ' + err.message);
  }

  // 3.  start video feed
  vid.srcObject = stream;
  await vid.play();

  // 4.  scanning loop
  const canvas = document.createElement('canvas');
  const ctx    = canvas.getContext('2d');

  function loop() {
    // video ready?
    if (!vid.videoWidth || !vid.videoHeight) {
      return requestAnimationFrame(loop);
    }

    canvas.width  = vid.videoWidth;
    canvas.height = vid.videoHeight;
    ctx.drawImage(vid, 0, 0);

    const code = jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data,
                      canvas.width, canvas.height);

    if (code) {
      // stop everything
      stream.getTracks().forEach(t => t.stop());
      vid.style.display = 'none';
      onFound(code.data);
      return;
    }
    requestAnimationFrame(loop);
  }
  loop();
}
