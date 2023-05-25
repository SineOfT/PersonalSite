const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

document.addEventListener("keydown", (event) => {
   if (!event.repeat) {
      switch (event.key) {
         case "ArrowLeft":
            {
               moveLeft = true;
               stop = false;
            }
            break;

         case "ArrowRight":
            {
               moveRight = true;
               stop = false;
            }
            break;
      }
   }
});

document.addEventListener("keyup", (event) => {
   switch (event.key) {
      case "ArrowLeft":
      case "ArrowRight": {
         moveLeft = false;
         moveRight = false;
         stop = true;
      }
   }
});

canvas.addEventListener("mousedown", (event) => {
   let px = (event.clientX / window.innerWidth) * 2 - 1;
   if (px < 0) {
      moveLeft = true;
      stop = false;
   } else if (px > 0) {
      moveRight = true;
      stop = false;
   }
});

canvas.addEventListener("mouseup", () => {
   moveLeft = false;
   moveRight = false;
   stop = true;
});

const canvasWidth = (canvas.width = window.innerWidth);
const canvasHeight = (canvas.height = window.innerHeight);

let screenWidth = canvasWidth * 5;

let boatX = canvasWidth / 2;
let boatY = canvasHeight / 2;
let boatA = 0;

let boatdX = 0;
let boatdY = 0;
let boatdA = 0;

let boatWidth = canvasWidth / 5;
let boatHeight = canvasHeight / 7;

let boatCenterX = boatWidth / 2;
let boatCenterY = boatHeight / 3;

let moveLeft = false;
let moveRight = false;
let stop = false;

let boatOffsetInline = boatWidth / 4;
let boatOffsetTop = boatHeight / 3;
let boatOffsetBottom = boatHeight / 4;

let pixelLeftBottom;
let pixelRightBottom;
let pixelLeftTop;
let pixelRightTop;

let screendX = 0;
let screenX = 0;

let groundTime = 0;
let groundX = -screenWidth / 2 + canvasWidth / 2;
let groundY = 0;

const createPosition = (dx, dy) => [
   Math.atan2(dy, dx),
   Math.sqrt(dx * dx + dy * dy),
];

let [leftBottomAngle, leftBottomLength] = createPosition(
   -boatCenterX + boatOffsetInline,
   boatHeight - boatCenterY - boatOffsetBottom
);
let [rightBottomAngle, rightBottomLength] = createPosition(
   boatWidth - boatCenterX - boatOffsetInline,
   boatHeight - boatCenterY - boatOffsetBottom
);
let [leftTopAngle, leftTopLength] = createPosition(
   -boatCenterX + boatOffsetInline,
   boatHeight - boatCenterY - boatOffsetTop
);
let [rightTopAngle, rightTopLength] = createPosition(
   boatWidth - boatCenterX - boatOffsetInline,
   boatHeight - boatCenterY - boatOffsetTop
);

let waveOffsetMax = 0.005;

let waveLeft = {
   arr: [],
   offset: waveOffsetMax,
   pos: 0,
};

let waveRight = {
   arr: [],
   offset: -waveOffsetMax,
   pos: 0,
};

let waveSpeed = 3;

function createWaves(wave, maxWidth, maxOffset, front) {
   for (let i = 0; i < maxWidth; i++) {
      wave.pos += wave.offset;
      front ? wave.arr.unshift(wave.pos) : wave.arr.push(wave.pos);
      wave.offset = Math.min(
         Math.max(
            wave.offset - Math.random() * 0.0001 * Math.sign(wave.pos),
            -maxOffset
         ),
         maxOffset
      );
   }
}

createWaves(waveLeft, screenWidth, waveOffsetMax);
createWaves(waveRight, screenWidth, waveOffsetMax);

function gameEngine() {
   if (moveLeft) {
      screendX = Math.min(screendX + 0.1, 2);
   }

   if (moveRight) {
      screendX = Math.max(screendX - 0.1, -2);
   }

   if (stop) {
      screendX *= 0.95;
      if (Math.abs(screendX) < 0.1) {
         screendX = 0;
         stop = false;
      }
   }
   waveLeft.arr.splice(waveLeft.arr.length - waveSpeed, waveSpeed);
   createWaves(waveLeft, waveSpeed, waveOffsetMax, true);

   waveRight.arr.splice(0, waveSpeed);
   createWaves(waveRight, waveSpeed, waveOffsetMax);

   screenX += screendX;

   groundTime = (groundTime + 1) % 1000;
   groundY = Math.cos((groundTime * Math.PI) / 500) * 100;

   ctx.clearRect(0, 0, canvasWidth, canvasHeight);

   ctx.save();
   ctx.translate(screenX + groundX, groundY + 300);

   ctx.fillStyle = "#66E";
   ctx.fill(
      new Path2D(
         `M 0 0 ${waveLeft.arr
            .map((num, i) => `t ${1} ${num + waveRight.arr[i]}`)
            .join(" ")} V 1000 H 0 Z`
      )
   );

   ctx.restore();

   pixelLeftBottom = ctx.getImageData(
      boatX + leftBottomLength * Math.cos(leftBottomAngle + boatA),
      boatY + leftBottomLength * Math.sin(leftBottomAngle + boatA),
      1,
      1
   ).data;

   pixelRightBottom = ctx.getImageData(
      boatX + rightBottomLength * Math.cos(rightBottomAngle + boatA),
      boatY + rightBottomLength * Math.sin(rightBottomAngle + boatA),
      1,
      1
   ).data;

   pixelLeftTop = ctx.getImageData(
      boatX + leftTopLength * Math.cos(leftTopAngle + boatA),
      boatY + leftTopLength * Math.sin(leftTopAngle + boatA),
      1,
      1
   ).data;

   pixelRightTop = ctx.getImageData(
      boatX + rightTopLength * Math.cos(rightTopAngle + boatA),
      boatY + rightTopLength * Math.sin(rightTopAngle + boatA),
      1,
      1
   ).data;

   if (
      pixelLeftBottom[0] === 0 &&
      pixelLeftBottom[1] === 0 &&
      pixelLeftBottom[2] === 0 &&
      pixelLeftBottom[3] === 0
   ) {
      boatdY += 0.05;
      boatdA -= 0.001;
   }

   if (
      pixelRightBottom[0] === 0 &&
      pixelRightBottom[1] === 0 &&
      pixelRightBottom[2] === 0 &&
      pixelRightBottom[3] === 0
   ) {
      boatdY += 0.05;
      boatdA += 0.001;
   }

   if (
      pixelLeftTop[0] !== 0 ||
      pixelLeftTop[1] !== 0 ||
      pixelLeftTop[2] !== 0 ||
      pixelLeftTop[3] !== 0
   ) {
      boatdY = boatdY * 0.95 - 0.05;
      boatdA += 0.001;
   }

   if (
      pixelRightTop[0] !== 0 ||
      pixelRightTop[1] !== 0 ||
      pixelRightTop[2] !== 0 ||
      pixelRightTop[3] !== 0
   ) {
      boatdY = boatdY * 0.95 - 0.05;
      boatdA -= 0.001;
   }

   boatY += boatdY;
   boatA = boatA * 0.9 + boatdA;

   ctx.fillStyle = "#F00";
   ctx.save();
   ctx.translate(boatX, boatY);
   ctx.rotate(boatA);
   ctx.fillRect(-boatCenterX, -boatCenterY, boatWidth, boatHeight);
   ctx.restore();

   ctx.save();
   ctx.globalAlpha = 0.5;
   ctx.fillStyle = "#FF0";
   ctx.fillRect(
      boatX + leftBottomLength * Math.cos(leftBottomAngle + boatA) - 3,
      boatY + leftBottomLength * Math.sin(leftBottomAngle + boatA) - 3,
      6,
      6
   );

   ctx.fillRect(
      boatX + rightBottomLength * Math.cos(rightBottomAngle + boatA) - 3,
      boatY + rightBottomLength * Math.sin(rightBottomAngle + boatA) - 3,
      6,
      6
   );

   ctx.fillStyle = "#00F";
   ctx.fillRect(
      boatX + leftTopLength * Math.cos(leftTopAngle + boatA) - 3,
      boatY + leftTopLength * Math.sin(leftTopAngle + boatA) - 3,
      6,
      6
   );

   ctx.fillRect(
      boatX + rightTopLength * Math.cos(rightTopAngle + boatA) - 3,
      boatY + rightTopLength * Math.sin(rightTopAngle + boatA) - 3,
      6,
      6
   );
   ctx.restore();

   ctx.fillStyle = "#55E";
   ctx.save();

   ctx.translate(screenWidth + screenX + groundX, groundY + 310);
   ctx.scale(-1, 1);
   ctx.fill(
      new Path2D(
         `M 0 0 ${waveLeft.arr
            .map((num, i) => `t ${1} ${num + waveRight.arr[i]}`)
            .join(" ")} V 1000 H 0 Z`
      )
   );

   ctx.restore();

   window.requestAnimationFrame(gameEngine);
}
window.requestAnimationFrame(gameEngine);
