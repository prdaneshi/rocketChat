import { Meteor } from 'meteor/meteor';
import { createCanvas } from 'canvas';
import { Random } from 'meteor/random';
import { Mongo } from 'meteor/mongo';


export const Captchas = new Mongo.Collection('captchas');


function randomColor() {
  let r = Math.floor(Math.random()*256);
  let g = Math.floor(Math.random()*256);
  let b = Math.floor(Math.random()*256);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
} 

// function extractRcUid(cookieString : string ) {
//   const cookies = cookieString.split(';');
//   for (let cookie of cookies) {
//     const [name, value] = cookie.trim().split('=');
//     if (name === 'rc_uid') {
//       return value;
//     }
//   }
//   return null; // Return null if rc_uid is not found
// }

Meteor.methods({
  generateCaptcha() {
    //const width = 200;
    //const height = 100;
    //const canvas = createCanvas(width, height);
    //const captchaText = Random.id(6).toUpperCase();
    //const canvas = getImgValiCode() ;//canvas.getContext('2d');

    const userId = this.connection?.clientAddress;
    
    //const userId = this.connection?.httpHeaders.cookie.split(';')[0].trim().split('=')[1] || "nothing";

    // Remove any existing CAPTCHA for this user/session
    Captchas.remove({ userId });

    

    //-----------------------------------------------------
    let showNum = [];
    let canvasWinth = 150;
    let canvasHeight = 30;
    //let canvas = document.getElementById('valicode');
    const canvas = createCanvas(canvasWinth, canvasHeight);
    let context = canvas.getContext('2d');
    canvas.width = canvasWinth;
    canvas.height = canvasHeight;
    let sCode = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,0,1,2,3,4,5,6,7,8,9,!,@,#,$,%,^,&,*,(,)';
    let saCode = sCode.split(',');
    let saCodeLen = saCode.length;
    for (let i = 0; i <= 3; i++) {
      let sIndex = Math.floor(Math.random()*saCodeLen);
      let sDeg = (Math.random()*30*Math.PI) / 180;
      let cTxt = saCode[sIndex];
      showNum[i] = cTxt.toLowerCase();
      let x = 10 + i*20;
      let y = 20 + Math.random()*8;
      context.font = 'bold 23px Arial';
      context.translate(x, y);
      context.rotate(sDeg);
  
      context.fillStyle = randomColor();
      context.fillText(cTxt, 0, 0);
  
      context.rotate(-sDeg);
      context.translate(-x, -y);
    }
    for (let i = 0; i <= 5; i++) {
      context.strokeStyle = randomColor();
      context.beginPath();
      context.moveTo(
        Math.random() * canvasWinth,
        Math.random() * canvasHeight
      );
      context.lineTo(
        Math.random() * canvasWinth,
        Math.random() * canvasHeight
      );
      context.stroke();
    }
    for (let i = 0; i < 30; i++) {
      context.strokeStyle = randomColor();
      context.beginPath();
      let x = Math.random() * canvasWinth;
      let y = Math.random() * canvasHeight;
      context.moveTo(x,y);
      context.lineTo(x+1, y+1);
      context.stroke();
    }

    
    //return canvas;
    const captchaText = showNum.join('').toUpperCase();

     // Store the new CAPTCHA text in the database
     Captchas.insert({
      userId,
      captchaText,
      createdAt: new Date(),
    });

    //-----------------------------------------------------

    // Set background
    // ctx.fillStyle = 'black';
    // //ctx.fillRect(0, 0, width, height);
    // ctx.translate(30, 40);
    // // Set text
    // ctx.font = 'bold 30px Arial';
    // // ctx.fillStyle = '#333';
    // // ctx.textBaseline = 'middle';
    // // ctx.textAlign = 'center';

    // // Add noise
    // for (let i = 0; i < 1000; i++) {
    //   ctx.fillStyle = `rgba(${Random.fraction()*255},${Random.fraction()*255},${Random.fraction()*255},0.1)`;
    //   ctx.fillRect(Random.fraction() * width, Random.fraction() * height, 2, 2);
    // }

    // // Add text with slight rotation for each character
    // for (let i = 0; i < captchaText.length; i++) {
    //   ctx.save();
    //   ctx.translate(width/2 + (i-2)*20, height/2);
    //   ctx.rotate((Math.random() - 0.5) * 0.4);
    //   ctx.fillText(captchaText[i], 0, 0);
    //   ctx.restore();
    // }

    // ctx.fillText(captchaText, 0, 0);


    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png');

    return dataUrl ;
  },

  validateCaptcha(userInput) {
    //const storedCaptcha = global.captchas[this.connection.id];

    //const userId = this.connection?.httpHeaders.cookie.split(';')[0].trim().split('=')[1]  || "nothing";
    const userId = this.connection?.clientAddress;

    // Find the stored CAPTCHA for this user/session
    const storedCaptcha = Captchas.findOne({ userId });

    if (!storedCaptcha) {
      throw new Meteor.Error('Captcha not found.', userId);
    }

    // Compare the input with the stored CAPTCHA (case-insensitive)
    const isValid = userInput.toUpperCase() == storedCaptcha.captchaText;

    // Meteor._debug("TESTTTTT$");

    // if (!isValid) {
    //   throw new Meteor.Error('Wrong input', "input = " + userInput.toUpperCase() + " | database = " + storedCaptcha.captchaText + " | userID = " + userId);
    // }

    //delete global.captchas[this.connection.id]; // Clear the stored CAPTCHA

    return isValid; //userInput.toUpperCase() == storedCaptcha;
  }
  
});

