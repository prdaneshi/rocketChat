const { createCanvas } = require('canvas');
const crypto = require('crypto');

function generateCaptcha() {
  const canvas = createCanvas(200, 100);
  const ctx = canvas.getContext('2d');
  const captchaText = crypto.randomBytes(3).toString('hex');

  // Draw background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 200, 100);

  // Draw text
  ctx.font = '30px Arial';
  ctx.fillStyle = '#333';
  ctx.fillText(captchaText, 50, 60);

  // Add noise
  for (let i = 0; i < 1000; i++) {
    ctx.fillStyle = '#000';
    ctx.fillRect(Math.random() * 200, Math.random() * 100, 1, 1);
  }

  return {
    image: canvas.toDataURL(),
    text: captchaText
  };
}

module.exports = { generateCaptcha };