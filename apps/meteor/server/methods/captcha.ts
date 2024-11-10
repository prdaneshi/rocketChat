import { Meteor } from 'meteor/meteor';
import { createCanvas } from 'canvas';
import { Random } from 'meteor/random';

Meteor.methods({
  generateCaptcha() {
    const width = 0;
    const height = 0;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const captchaText = "1234" ;//Random.id(6).toUpperCase();

    // Set background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Set text
    ctx.font = 'bold 30px Sans';  // Using 'Sans' as a fallback font
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    // Draw text
    ctx.fillText(captchaText, width / 2, height / 2);

    console.debug(captchaText);

    // Add some noise
    // ctx.lineWidth = 2;  // Set a visible line width for noise
    // for (let i = 0; i < 50; i++) {
    //   ctx.beginPath();
    //   ctx.moveTo(Math.random() * width, Math.random() * height);
    //   ctx.lineTo(Math.random() * width, Math.random() * height);
    //   ctx.strokeStyle = `rgba(0, 0, 0, 0.2)`;
    //   ctx.stroke();
    // }

    // Store the captcha text securely
    if (!global.captchas) {
      global.captchas = {};
    }
    global.captchas[this.connection.id] = captchaText;

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png');

    return dataUrl;
  },

  validateCaptcha(userInput) {
    const storedCaptcha = global.captchas[this.connection.id];
    //delete global.captchas[this.connection.id]; // Clear the stored CAPTCHA

    return userInput.toUpperCase() === storedCaptcha;
  }
});
