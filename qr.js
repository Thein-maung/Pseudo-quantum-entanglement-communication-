import { setSeed } from './crypto.js';

const vid = document.getElementById('cam');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

export async function generateQR(data) {
  await QRCode.toCanvas(document.getElementById('qrcvs'), data, { width: 256 });
}

export async function startScan(onFound) {
  vid.hidden = false;
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  vid.srcObject = stream;
  await vid.play();
  scanLoop(onFound);
}

function scanLoop(onFound) {
  if (vid.videoWidth === 0) return requestAnimationFrame(() => scanLoop(onFound));
  canvas.width = vid.videoWidth;
  canvas.height = vid.videoHeight;
  ctx.drawImage(vid, 0, 0);
  const code = jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
  if (code) { vid.srcObject.getTracks().forEach(t => t.stop()); vid.hidden = true; onFound(code.data); }
  else requestAnimationFrame(() => scanLoop(onFound));
}
