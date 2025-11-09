/* qr.js  – glass-morphic PWA edition  */
import { setSeed } from './crypto.js';

const vid   = document.getElementById('cam');
const qrcvs = document.getElementById('qrcvs');

/* 1.  generate QR  – makes canvas visible first */
export async function generateQR(data) {
  qrcvs.style.display = 'block';                // force visible
  await QRCode.toCanvas(qrcvs, data, { width: 256, margin: 2 });
}

/* 2.  camera scan – gesture-safe, full error handling */
export async function startScan(onFound) {
  vid.style.display = 'block';                  // show video element
  vid.hidden = false;

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
  } catch (err) {
    vid.style.display = 'none';
    throw new Error('Camera blocked – check permissions / HTTPS');
  }

  vid.srcObject = stream;
  await vid.play();

  const canvas = document.createElement('canvas');
  const ctx    = canvas.getContext('2d');

  function loop() {
    if (vid.videoWidth === 0 || vid.videoHeight === 0) {
      return requestAnimationFrame(loop);
    }

    canvas.width  = vid.videoWidth;
    canvas.height = vid.videoHeight;
    ctx.drawImage(vid, 0, 0);

    const code = jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data,
                      canvas.width, canvas.height);

    if (code) {
      stream.getTracks().forEach(t => t.stop());
      vid.style.display = 'none';
      onFound(code.data);
      return;
    }
    requestAnimationFrame(loop);
  }
  loop();
}
