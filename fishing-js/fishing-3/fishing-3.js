window.addEventListener(
   "load",
   () => {
      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#FFF";

      const pi = Math.PI;

      const sign = Math.sign;
      const pow = Math.pow;
      const sqrt = Math.sqrt;

      const sin = Math.sin;
      const cos = Math.cos;
      const tan = Math.tan;
      const atan2 = Math.atan2;

      const floor = Math.floor;
      const random = Math.random;
      const randomNum = (min, diff) => floor(random() * diff + min);

      const abs = Math.abs;

      const mod = (val, modVal) => ((val % modVal) + modVal) % modVal;

      const limitMin = (val, max) => (val < max ? max : val);
      const limitMax = (val, max) => (val > max ? max : val);

      let windowWidth = canvas.width;
      let windowHeight = canvas.height;

      const screenWidth = 5000;
      const screenHeight = 5000;

      let screenMaxLeft = -screenWidth + windowWidth;
      let screenMaxRight = 0;

      let oceanX = 0;
      let oceanY = 0;

      let oceanDepth = 3000;

      let oceanMoveTime = 0;

      let oceanGradient = ctx.createLinearGradient(0, -200, 0, 200);
      oceanGradient.addColorStop(0.3, "#EEFB");
      oceanGradient.addColorStop(1, "#BBF6");

      let oceanPath;

      let skyGradient = ctx.createLinearGradient(0, 0, 0, 500);
      skyGradient.addColorStop(0, "#88F");
      skyGradient.addColorStop(0.8, "#EC8");
      skyGradient.addColorStop(1, "#FFF");

      let sunGradient = ctx.createRadialGradient(
         screenWidth / 2,
         400,
         0,
         screenWidth / 2,
         600,
         800
      );
      sunGradient.addColorStop(0, "#F80");
      sunGradient.addColorStop(0.25, "#FB0");
      sunGradient.addColorStop(0.26, "#FD8B");
      sunGradient.addColorStop(1, "#FFF0");

      const boat = [
         ["#000", new Path2D("M 450 -75 v -100 h 75 v 100 Z")],
         [
            "#AAD",
            new Path2D(
               "M 50 -15 h 40 l 10 -10 v -30 c 150 0, 250 -50, 450 -50, q -25 150, -475 150 q 0 -50, -25 -50 Z"
            ),
         ],
         [
            "#FFF",
            new Path2D(
               "M 50 -5 c 200 0, 300 -50, 475 -50 q -2 6, -10 10 c -165 0, -265 50, -460 50 Z"
            ),
         ],
         [
            "#555",
            new Path2D(
               "M 25 -65 h 20 l 15 -15 h 20 l 5 15 v 30 l -10 15 h -30 v 35 l 10 15 l -5 15 l -30 10 l -5 -15 l 25 -5 l -5 -10 v -50 l -10 -10 Z"
            ),
         ],
         ["#F00", new Path2D("M 0 0 h 10 v 10 h -10 Z")],
      ];

      let boatWidth = 525;

      let boatInitX = screenWidth / 2;
      let boatInitY = 0;

      let boatX = boatInitX;
      let boatY = boatInitY;

      let boatMaxLeft = 0;
      let boatMaxRight = screenWidth - windowWidth;

      let boatInitAngle = 0;
      let boatAngle = boatInitAngle;

      let boatWaveAmp = 0;

      let boatMoveTime = 0;

      const rod = [
         "lineBack",
         [
            "#B50",
            new Path2D(
               "M 0 -30 l 3 30 v 10 h 10 v -15 c -25 -8, 35 -8, 10 0 v 15 c 10 0, 10 10, 0 10 h -20 v 30 c 0 5, -15 5, -15 0 v -50 l 2 -30 a 5 5 0 1 1 10 0"
            ),
         ],
         [
            "#EEE",
            new Path2D(
               "M 10 10 h 16 m -16 -3 h 16 m -16 -3 h 16 m -16 -3 h 16 m -16 -3 h 16 m -16 -3 h 16"
            ),
         ],
         "lineFront",
         "seg",
         ["#EEE", new Path2D("M 18 0 l -2 -30")],
         [
            "#B50",
            new Path2D(
               "M 0 0 a 5 5 0 1 1 -10 0 l 1 -30 a 4.5 4.5 0 1 1 9 0 v 24 a 20 3 0 1 1 0 6"
            ),
         ],
         "seg",
         ["#EEE", new Path2D("M 16 0 l -2 -30")],
         [
            "#B50",
            new Path2D(
               "M 0 0 a 4.5 4.5 0 1 1 -9 0 l 1 -30 a 4 4 0 1 1 8 0 v 24 a 18 3 0 1 1 0 6"
            ),
         ],
         "seg",
         ["#EEE", new Path2D("M 14 0 l -2 -30")],
         [
            "#B50",
            new Path2D(
               "M 0 0 a 4 4 0 1 1 -8 0 l 1 -30 a 3.5 3.5 0 1 1 7 0 v 24 a 16 3 0 1 1 0 6"
            ),
         ],
         "seg",
         ["#EEE", new Path2D("M 12 0 l -2 -30")],
         [
            "#B50",
            new Path2D(
               "M 0 0 a 3.5 3.5 0 1 1 -7 0 l 1 -30 a 3 3 0 1 1 6 0 v 26 a 14 2 0 1 1 0 4"
            ),
         ],
         "seg",
         ["#EEE", new Path2D("M 10 0 l -2 -30")],
         [
            "#B50",
            new Path2D(
               "M 0 0 a 3 3 0 1 1 -6 0 l 1 -30 a 2.5 2.5 0 1 1 5 0 v 26 a 12 2 0 1 1 0 4"
            ),
         ],
         "seg",
         ["#EEE", new Path2D("M 8 0 l -2 -30")],
         [
            "#B50",
            new Path2D(
               "M 0 0 a 2.5 2.5 0 1 1 -5 0 l 1 -30 a 2 2 0 1 1 4 0 v 26 a 10 2 0 1 1 0 4"
            ),
         ],
         "seg",
         ["#EEE", new Path2D("M 6 0 l -2 -30")],
         [
            "#B50",
            new Path2D(
               "M 0 0 a 2 2 0 1 1 -4 0 l 1 -30 a 1.5 1.5 0 1 1 3 0 v 28 a 8 1 0 1 1 0 2"
            ),
         ],
         "seg",
         ["#EEE", new Path2D("M 4 0 l -2 -30")],
         [
            "#B50",
            new Path2D(
               "M 0 0 a 1.5 1.5 0 1 1 -3 0 l 1 -30 a 1 1 0 1 1 2 0 v 28 a 6 1 0 1 1 0 2"
            ),
         ],
         "seg",
         ["#EEE", new Path2D("M 2 0 l -2 -30")],
         [
            "#B50",
            new Path2D(
               "M 0 0 a 1 1 0 1 1 -2 0 v -30 a 1 1 0 1 1 2 0 a 4 1 0 1 1 0 2 v 26 a 4 1 0 1 1 0 2"
            ),
         ],
         "seg",
         "startBobber",
         "handle",
         ["#B50", new Path2D("M 0 2 a 2 2 0 1 1 0 -4 h 15 a 2 2 0 1 1 0 4 Z")],
         "grip",
         ["#B50", new Path2D("M -2 0 a 4 8 0 1 1 0 0.1 Z")],
         "connectBobber",
      ];

      let rodX = 500;
      let rodY = -125;

      let rodInitAngle = pi * 0.28;
      let rodAngle = rodInitAngle;
      let bendAngle = 0;

      let windTime = 0;
      let unwindTime = 0;

      let bobberInitOffsetX = rodX + sin(rodAngle) * 300;
      let bobberInitOffsetY = rodY - cos(rodAngle) * 300 + 15;

      let bobberOffsetX = bobberInitOffsetX;
      let bobberOffsetY = bobberInitOffsetY;

      let bobberX = boatX + bobberInitOffsetX;
      let bobberY = -boatY + bobberInitOffsetY;

      let bobberWaveAmp = 0;

      let baitInitOffsetX = rodX + sin(rodAngle) * 300;
      let baitInitOffsetY = rodY - cos(rodAngle) * 300 + 30;

      let baitOffsetX = baitInitOffsetX;
      let baitOffsetY = baitInitOffsetY;

      let baitX = boatX + baitInitOffsetX;
      let baitY = boatY + baitInitOffsetY;

      let baitMaxBottom = oceanDepth;

      const fishPath = new Path2D(
         "M 0 0 c 0 25 -75 25 -75 5 l -25 20 v -50 l 25 20 c 0 -20 75 -20 75 5 Z"
      );

      const getScreenXPos = () => -bobberX + windowWidth / 2;
      const getScreenYPos = () => -baitY;

      let screenX = getScreenXPos();
      let screenY = 0;

      let hookMoveTime = 0;

      let castMoveTime = 0;
      let pullMoveTime = 0;

      let fishes = new Set();

      let interestFishes = new Set();

      let biteFish = false;
      let hookFish = false;

      function createFish(fishSet, posX, direction) {
         fishSet.add({
            x: posX,
            y: randomNum(0, oceanDepth),
            dir: direction,
            width: 100,
            height: 50,
            speed: (randomNum(1, 20) / 10 + 1) * direction,
         });
      }

      function replaceFish(
         fishSet,
         posX,
         posY,
         direction = randomNum(0, 2) * 2 - 1
      ) {
         fishSet.add({
            x: posX,
            y: posY,
            dir: direction,
            width: 100,
            height: 50,
            speed: (randomNum(1, 20) / 10 + 1) * direction,
         });
      }

      for (let i = 0; i < 100; i++) {
         createFish(
            fishes,
            randomNum(0, screenWidth + 1),
            randomNum(0, 2) * 2 - 1
         );
      }

      let moveElements = new Set();
      moveElements.add("surface");

      function createWaves(ctx, amp, range, pos) {
         ctx.bezierCurveTo(
            pos + range,
            -amp * amp * 0.005,
            pos,
            amp * amp * 0.005,
            pos + range,
            0
         );

         if (amp < 50) return;

         createWaves(ctx, (amp * 2) / 3, (range * 2) / 3, pos + range);
      }

      function drawFish(fish, ctx) {
         ctx.save();
         ctx.fillStyle = "#C55";
         ctx.translate(fish.x, fish.y);
         ctx.rotate(fish.rotate);
         ctx.scale(fish.dir, 1);
         ctx.globalAlpha = fish.opacity;
         ctx.fill(fishPath);
         ctx.restore();
      }

      const btnLeft = document.getElementById("btnLeft");
      const btnRight = document.getElementById("btnRight");
      const btnReel = document.getElementById("btnReel");
      const btnLock = document.getElementById("btnLock");
      const btnCast = document.getElementById("btnCast");

      const btnLeftIcon = document.getElementById("btnLeftIcon");
      const btnRightIcon = document.getElementById("btnRightIcon");
      const btnReelIcon = document.getElementById("btnReelIcon");
      const btnLockIcon = document.getElementById("btnLockIcon");
      const btnCastIcon = document.getElementById("btnCastIcon");

      function moveLeftStart() {
         if (!moveElements.has("moveRight") && moveElements.has("surface")) {
            moveElements.add("moveLeft");
            moveElements.delete("moveRight");
            btnLeft.style.backgroundColor = "#555D";
         }
      }

      function moveLeftEnd() {
         if (
            moveElements.has("moveLeft") &&
            !moveElements.has("stopRightWave")
         ) {
            moveElements.add("stopLeftWave");
         }

         moveElements.delete("moveLeft");
         btnLeft.style.backgroundColor = "#5555";
      }

      function moveRightStart() {
         if (!moveElements.has("moveLeft") && moveElements.has("surface")) {
            moveElements.add("moveRight");
            moveElements.delete("moveLeft");
            btnRight.style.backgroundColor = "#555D";
         }
      }

      function moveRightEnd() {
         if (
            moveElements.has("moveRight") &&
            !moveElements.has("stopLeftWave")
         ) {
            moveElements.add("stopRightWave");
         }

         moveElements.delete("moveRight");
         btnRight.style.backgroundColor = "#5555";
      }

      function reelStart() {
         if (
            !event.repeat &&
            moveElements.has("ocean") &&
            !moveElements.has("hook")
         ) {
            moveElements.add("reel");
            btnReel.style.backgroundColor = "#555D";

            if (moveElements.has("drop")) {
               moveElements.delete("drop");
               btnLock.style.backgroundColor = "#555D";
               btnLockIcon.setAttribute("href", "#lock");
            }
         }
      }

      function reelEnd() {
         moveElements.delete("reel");
         btnReel.style.backgroundColor = "#5555";
      }

      function lockChange() {
         if (moveElements.has("ocean") && !moveElements.has("reel")) {
            if (moveElements.has("drop")) {
               moveElements.delete("drop");
               btnLock.style.backgroundColor = "#555D";
               btnLockIcon.setAttribute("href", "#lock");
            } else {
               moveElements.add("drop");
               btnLock.style.backgroundColor = "#5555";
               btnLockIcon.setAttribute("href", "#unlock");
            }
         }
      }

      function castStart() {
         if (
            moveElements.has("surface") &&
            !moveElements.has("moveLeft") &&
            !moveElements.has("moveRight") &&
            !moveElements.has("stopLeftWave") &&
            !moveElements.has("stopRightWave")
         ) {
            moveElements.clear();
            moveElements.add("cast");

            btnCast.style.backgroundColor = "#555D";

            btnLock.style.backgroundColor = "#5555";
            btnLockIcon.setAttribute("href", "#unlock");

            btnLeftIcon.style.fill = "#0002";
            btnRightIcon.style.fill = "#0002";
            btnCastIcon.style.fill = "#0002";
            btnCastIcon.style.stroke = "#0002";
         }
      }

      function hookStart() {
         if (moveElements.has("ocean")) {
            moveElements.add("hook");

            btnCast.style.backgroundColor = "#555D";

            if (moveElements.has("drop")) {
               moveElements.delete("drop");
               btnLock.style.backgroundColor = "#555D";
               btnLockIcon.setAttribute("href", "#lock");
            }

            if (moveElements.has("reel")) {
               reelEnd();
            }
         }
      }

      document.addEventListener("keydown", (event) => {
         switch (event.key) {
            case "ArrowLeft":
               moveLeftStart();
               break;

            case "ArrowRight":
               moveRightStart();
               break;

            case "ArrowUp":
               reelStart();
               break;
         }
      });

      document.addEventListener("keyup", (event) => {
         switch (event.key) {
            case "ArrowLeft":
               moveLeftEnd();
               break;

            case "ArrowRight":
               moveRightEnd();
               break;

            case "ArrowUp":
               reelEnd();
               break;

            case "z":
               lockChange();
               break;

            case " ":
               castStart();
               hookStart();
               break;
         }
      });

      btnLeft.addEventListener("pointerdown", () => {
         moveLeftStart();
      });

      btnLeft.addEventListener("pointerup", () => {
         moveLeftEnd();
      });

      btnRight.addEventListener("pointerdown", () => {
         moveRightStart();
      });

      btnRight.addEventListener("pointerup", () => {
         moveRightEnd();
      });

      btnReel.addEventListener("pointerdown", () => {
         reelStart();
      });

      btnReel.addEventListener("pointerup", () => {
         reelEnd();
      });

      btnLock.addEventListener("click", () => {
         lockChange();
      });

      btnCast.addEventListener("click", () => {
         castStart();
         hookStart();
      });

      function gameEngine() {
         if (
            moveElements.has("moveLeft") ||
            moveElements.has("moveRight") ||
            moveElements.has("stopLeftWave") ||
            moveElements.has("stopRightWave")
         ) {
            if (
               (moveElements.has("moveLeft") &&
                  !moveElements.has("stopRightWave")) ||
               moveElements.has("stopLeftWave")
            ) {
               boatX = limitMin(boatX - 2, boatMaxLeft);
               bobberOffsetX =
                  (cos((boatMoveTime * pi) / 50) - 1) * 5 + bobberInitOffsetX;
               baitOffsetX =
                  -(cos((boatMoveTime * pi) / 50) - 1) * 20 + baitInitOffsetX;
            } else if (
               (moveElements.has("moveRight") &&
                  !moveElements.has("stopLeftWave")) ||
               moveElements.has("stopRightWave")
            ) {
               boatX = limitMax(boatX + 2, boatMaxRight);
               bobberOffsetX =
                  (cos((boatMoveTime * pi) / 50) - 1) * 30 + bobberInitOffsetX;
               baitOffsetX =
                  (cos((boatMoveTime * pi) / 50) - 1) * 60 + baitInitOffsetX;
            }

            boatY = sin((boatMoveTime * pi) / 50) * 15 + boatInitY;
            bobberOffsetY =
               (cos((boatMoveTime * pi) / 50) - 1) * 40 + bobberInitOffsetY;
            baitOffsetY =
               (cos((boatMoveTime * pi) / 50) - 1) * 45 + baitInitOffsetY;

            boatAngle =
               (cos((boatMoveTime * pi) / 50) - 1) * 0.05 + boatInitAngle;

            boatWaveAmp = -(cos((boatMoveTime * pi) / 50) - 1) * 100;

            bobberX = boatX + bobberOffsetX;
            bobberY = boatY + bobberOffsetY;
            baitX = boatX + baitOffsetX;
            baitY = boatY + baitOffsetY;
            screenX = getScreenXPos();

            if (
               !moveElements.has("stopLeftWave") &&
               !moveElements.has("stopRightWave") &&
               (moveElements.has("moveLeft") ||
                  moveElements.has("moveRight")) &&
               boatX > boatMaxLeft &&
               boatX < boatMaxRight
            ) {
               boatMoveTime++;
            } else {
               if (boatMoveTime > 100) {
                  boatMoveTime %= 100;
               }

               if (boatMoveTime <= 50) {
                  boatMoveTime--;
               } else if (boatMoveTime > 50) {
                  boatMoveTime++;
               }

               if (boatMoveTime <= 0 || boatMoveTime > 100) {
                  boatMoveTime = 0;
                  boatInitX = boatX;
                  boatY = boatInitY;
                  bobberOffsetX = bobberInitOffsetX;
                  bobberOffsetY = bobberInitOffsetY;
                  baitOffsetX = baitInitOffsetX;
                  baitOffsetY = baitInitOffsetY;

                  if (
                     moveElements.has("moveLeft") &&
                     moveElements.has("stopRightWave")
                  ) {
                     boatInitX = boatX;
                  } else if (
                     moveElements.has("moveRight") &&
                     moveElements.has("stopLeftWave")
                  ) {
                     boatInitX = boatX;
                  }

                  moveElements.delete("stopLeftWave");
                  moveElements.delete("stopRightWave");
               }
            }
         }

         if (moveElements.has("drop")) {
            baitOffsetY = limitMax(baitOffsetY + 2, baitMaxBottom);
            if (baitOffsetY < baitMaxBottom) {
               unwindTime = (unwindTime + pi / 25) % (pi * 2);
            }

            baitY = baitOffsetY;
            screenY = getScreenYPos();
         }

         if (moveElements.has("reel")) {
            baitOffsetY -= 2;
            windTime = (windTime + pi / 25) % (pi * 2);
            baitY = baitOffsetY;
            screenY = getScreenYPos();

            if (baitOffsetY <= 0) {
               baitOffsetY = 0;

               reelEnd();

               btnReelIcon.style.fill = "#0002";
               btnLockIcon.style.fill = "#0002";
               btnCastIcon.style.fill = "#0002";
               btnCastIcon.style.stroke = "#0002";

               moveElements.clear();
               moveElements.add("pullUp");
            }
         }

         if (moveElements.has("cast")) {
            if (castMoveTime <= 10) {
            } else if (castMoveTime <= 60) {
               bobberOffsetX =
                  (-400 / 2500) * (castMoveTime - 10) * (castMoveTime - 10) +
                  bobberInitOffsetX;
            } else if (castMoveTime <= 150) {
               bobberOffsetX =
                  0.12 * (castMoveTime - 60) * (castMoveTime - 150) -
                  400 +
                  bobberInitOffsetX;
            } else if (castMoveTime <= 180) {
               bobberOffsetX =
                  (400 / 30) * (castMoveTime - 150) - 400 + bobberInitOffsetX;
            } else if (castMoveTime <= 300) {
               bobberOffsetX =
                  (-(castMoveTime - 300) * (castMoveTime - 300) * 500) / 14400 +
                  500 +
                  bobberInitOffsetX;
            }

            if (castMoveTime <= 15) {
            } else if (castMoveTime <= 70) {
               bobberOffsetY =
                  0.1 * (castMoveTime - 15) * (castMoveTime - 70) +
                  bobberInitOffsetY;
            } else if (castMoveTime <= 130) {
               bobberOffsetY =
                  -0.1 * (castMoveTime - 70) * (castMoveTime - 130) +
                  bobberInitOffsetY;
            } else if (castMoveTime <= 180) {
               bobberOffsetY =
                  0.15 * (castMoveTime - 130) * (castMoveTime - 180) +
                  bobberInitOffsetY;
            } else if (castMoveTime <= 300) {
               bobberOffsetY =
                  (-(castMoveTime - 180) *
                     (castMoveTime - 180) *
                     bobberInitOffsetY) /
                     14400 +
                  bobberInitOffsetY;
            } else if (castMoveTime <= 350) {
               bobberOffsetY =
                  (-sin(((castMoveTime - 300) * pi) / 25 - pi) /
                     (castMoveTime - 300 + pi)) *
                  300;
            }

            if (castMoveTime <= 20) {
            } else if (castMoveTime <= 60) {
               baitOffsetX =
                  (-400 / 1600) * (castMoveTime - 20) * (castMoveTime - 20) +
                  baitInitOffsetX;
            } else if (castMoveTime <= 150) {
               baitOffsetX =
                  0.15 * (castMoveTime - 60) * (castMoveTime - 150) -
                  400 +
                  baitInitOffsetX;
            } else if (castMoveTime <= 180) {
               baitOffsetX =
                  (500 / 30) * (castMoveTime - 150) - 400 + baitInitOffsetX;
            } else if (castMoveTime <= 300) {
               baitOffsetX =
                  (-(castMoveTime - 300) * (castMoveTime - 300) * 400) / 14400 +
                  500 +
                  sin(((castMoveTime - 180) * pi) / 20) * 15 +
                  baitInitOffsetX;
            }

            if (castMoveTime <= 25) {
            } else if (castMoveTime <= 60) {
               baitOffsetY =
                  0.1 * (castMoveTime - 25) * (castMoveTime - 60) +
                  baitInitOffsetY;
            } else if (castMoveTime <= 140) {
               baitOffsetY =
                  -0.05 * (castMoveTime - 60) * (castMoveTime - 140) +
                  baitInitOffsetY;
            } else if (castMoveTime <= 180) {
               baitOffsetY =
                  0.3 * (castMoveTime - 140) * (castMoveTime - 180) +
                  baitInitOffsetY;
            } else if (castMoveTime <= 300) {
               baitOffsetY =
                  (-(castMoveTime - 180) *
                     (castMoveTime - 180) *
                     baitInitOffsetY) /
                     14400 -
                  (cos(((castMoveTime - 180) * pi) / 20) - 1) * 15 +
                  baitInitOffsetY;
            } else if (castMoveTime <= 350) {
               baitOffsetY = 2 * (castMoveTime - 300);
               screenY = getScreenYPos();
            }

            if (castMoveTime <= 300) {
            } else if (castMoveTime <= 350) {
               bobberWaveAmp =
                  -(cos(((castMoveTime - 300) * pi) / 25) - 1) * 50;
            }

            if (castMoveTime <= 100) {
               rodAngle =
                  ((cos((castMoveTime * pi) / 100) - 1) * pi) / 3 +
                  rodInitAngle;
            } else if (castMoveTime <= 180) {
               rodAngle =
                  ((castMoveTime - 100) * (castMoveTime - 100) * pi) / 9600 -
                  (pi * 2) / 3 +
                  rodInitAngle;
            } else if (castMoveTime <= 300) {
               bendAngle =
                  (-sin(((castMoveTime - 180) * pi) / 20 + pi) /
                     (castMoveTime - 180 + pi)) *
                  0.5;
            }

            if (castMoveTime <= 180) {
            } else if (castMoveTime <= 350) {
               unwindTime = (unwindTime + pi / 25) % (pi * 2);
            }

            bobberX = boatX + bobberOffsetX;
            bobberY = boatY + bobberOffsetY;
            baitX = boatX + baitOffsetX;
            baitY = boatY + baitOffsetY;

            screenX = getScreenXPos();

            castMoveTime++;

            if (castMoveTime > 350) {
               castMoveTime = 0;

               bobberX = boatX + bobberInitOffsetX + 500;
               bobberY = 0;

               baitX = boatX + baitInitOffsetX + 500;

               rodAngle = rodInitAngle;
               bendAngle = 0;

               bobberWaveAmp = 0;

               btnCast.style.backgroundColor = "#5555";

               btnCastIcon.setAttribute("href", "#pullRod");

               btnReelIcon.style.fill = "#000B";
               btnLockIcon.style.fill = "#000B";
               btnCastIcon.style.fill = "#000B";
               btnCastIcon.style.stroke = "#000B";

               moveElements.add("ocean");
               moveElements.add("drop");
               moveElements.delete("cast");
            }
         }

         if (moveElements.has("pullUp")) {
            for (let fish of interestFishes) {
               replaceFish(fishes, fish.x, fish.y);
               interestFishes.delete(fish);
            }

            if (hookFish) {
               if (hookFish.opacity === undefined) hookFish.opacity = 1;
               hookFish.opacity = limitMin(hookFish.opacity - 0.05, 0);
               if (hookFish.opacity === 0) hookFish = false;
            }

            if (pullMoveTime <= 20) {
            } else if (pullMoveTime <= 120) {
               bobberOffsetX =
                  -(pullMoveTime - 120) * 7 - 200 + bobberInitOffsetX;
            } else if (pullMoveTime <= 300) {
            } else if (pullMoveTime <= 350) {
               bobberOffsetX =
                  -(cos(((pullMoveTime - 300) * pi) / 100) - 1) * 200 +
                  bobberInitOffsetX -
                  200;
            } else if (pullMoveTime <= 500) {
               bobberOffsetX =
                  (sin(((pullMoveTime - 250) * pi) / 50) /
                     (((pullMoveTime - 250) * pi) / 50)) *
                     200 +
                  bobberInitOffsetX;
            }

            if (pullMoveTime <= 20) {
            } else if (pullMoveTime <= 120) {
               bobberOffsetY =
                  (((pullMoveTime - 20) * (pullMoveTime - 145)) / 2500) * 150;
            } else if (pullMoveTime <= 300) {
            } else if (pullMoveTime <= 450) {
               bobberOffsetY =
                  (-(cos(((pullMoveTime - 300) * pi) / 150) - 1) / 2) *
                     (bobberInitOffsetY + 150) -
                  150;
            }

            if (pullMoveTime <= 30) {
            } else if (pullMoveTime <= 150) {
               baitOffsetX =
                  (-(pullMoveTime - 150) / 120) * 700 - 200 + baitInitOffsetX;
            } else if (pullMoveTime <= 325) {
               baitOffsetX =
                  (-sin(((pullMoveTime - 150 - 50) * pi) / 50) /
                     (((pullMoveTime - 150 - 50) * pi) / 50)) *
                     25 +
                  baitInitOffsetX -
                  200;
            } else if (pullMoveTime <= 350) {
               baitOffsetX =
                  -(cos(((pullMoveTime - 325) * pi) / 50) - 1) * 200 +
                  baitInitOffsetX -
                  200;
            } else if (pullMoveTime <= 500) {
               baitOffsetX =
                  (sin(((pullMoveTime - 250) * pi) / 50) /
                     (((pullMoveTime - 250) * pi) / 50)) *
                     500 +
                  baitInitOffsetX;
            }

            if (pullMoveTime <= 30) {
            } else if (pullMoveTime <= 130) {
               baitOffsetY =
                  (((pullMoveTime - 30) * (pullMoveTime - 150)) / 2000) * 120 +
                  sin(((pullMoveTime - 25) * pi) / 15) * 25;
            } else if (pullMoveTime <= 300) {
            } else if (pullMoveTime <= 450) {
               baitOffsetY =
                  (-(cos(((pullMoveTime - 300) * pi) / 150) - 1) / 2) *
                     (baitInitOffsetY + 120) -
                  120;
            }

            if (pullMoveTime <= 100) {
               rodAngle =
                  ((cos((pullMoveTime * pi) / 100) - 1) * pi) / 3 +
                  rodInitAngle;
            } else if (pullMoveTime <= 200) {
               rodAngle =
                  ((cos(((pullMoveTime - 0) * pi) / 100) - 2) * pi * 2) / 9 +
                  rodInitAngle;
            } else if (pullMoveTime <= 250) {
            } else if (pullMoveTime <= 350) {
               rodAngle =
                  ((cos(((pullMoveTime - 150) * pi) / 100) - 1) * pi) / 9 +
                  rodInitAngle;
            }

            if (pullMoveTime <= 25) {
            } else if (pullMoveTime <= 125) {
               bendAngle = -(cos(((pullMoveTime - 25) * pi) / 50) - 1) * 0.075;
            }

            if (pullMoveTime <= 50) {
            } else if (pullMoveTime <= 100) {
               windTime = (windTime + pi / 25) % (pi * 2);
            } else if (pullMoveTime <= 300) {
            } else if (pullMoveTime <= 450) {
               windTime = (windTime + pi / 25) % (pi * 2);
            }

            bobberX = boatX + bobberOffsetX;
            bobberY = boatY + bobberOffsetY;

            baitX = boatX + baitOffsetX;
            baitY = boatY + baitOffsetY;

            screenX = getScreenXPos();

            pullMoveTime++;

            if (pullMoveTime > 500) {
               pullMoveTime = 0;

               bobberOffsetX = bobberInitOffsetX;
               bobberOffsetY = bobberInitOffsetY;

               bobberX = boatX + bobberOffsetX;
               bobberY = boatY + bobberOffsetY;

               baitOffsetX = baitInitOffsetX;
               baitOffsetY = baitInitOffsetY;

               baitX = boatX + baitOffsetX;
               baitY = boatY + baitOffsetY;

               rodAngle = rodInitAngle;
               bendAngle = 0;

               btnCastIcon.setAttribute("href", "#castRod");

               btnLeftIcon.style.fill = "#000B";
               btnRightIcon.style.fill = "#000B";
               btnCastIcon.style.fill = "#000B";
               btnCastIcon.style.stroke = "#000B";

               moveElements.add("surface");
               moveElements.delete("pullUp");
            }
         }

         oceanY = sin((oceanMoveTime * pi) / 1000) * 50;
         oceanMoveTime = (oceanMoveTime + 1) % 2000;

         if (moveElements.has("hook")) {
            if (biteFish) {
               hookFish = biteFish;
               biteFish = false;
               hookFish.rotate = (-pi / 2) * hookFish.dir;
            }
            if (hookMoveTime <= 20) {
               baitOffsetY = limitMin(baitOffsetY - 5, 0);
            }

            if (hookMoveTime <= 20) {
               rodAngle =
                  ((cos((hookMoveTime * pi) / 20) - 1) * pi) / 8 + rodInitAngle;
            } else if (hookMoveTime <= 50) {
               rodAngle =
                  ((cos(((hookMoveTime + 10) * pi) / 30) - 1) * pi) / 8 +
                  rodInitAngle;
            }

            if (hookMoveTime <= 30) {
               bendAngle = -(cos((hookMoveTime * pi) / 15) - 1) * 0.05;
            }

            if (hookMoveTime <= 30) {
            } else if (hookMoveTime <= 50) {
               windTime = (windTime + pi / 25) % (pi * 2);
            }

            baitY = boatY + baitOffsetY;
            screenY = getScreenYPos();

            hookMoveTime++;

            if (hookMoveTime > 50) {
               hookMoveTime = 0;

               rodAngle = rodInitAngle;
               bendAngle = 0;

               btnCast.style.backgroundColor = "#5555";

               if (baitOffsetY <= 1) {
                  btnReelIcon.style.fill = "#0002";
                  btnLockIcon.style.fill = "#0002";
                  btnCastIcon.style.fill = "#0002";
                  btnCastIcon.style.stroke = "#0002";

                  moveElements.clear();
                  moveElements.add("pullUp");
               }

               moveElements.delete("hook");
            }
         }

         for (let fish of fishes) {
            fish.x += fish.speed;

            if (fish.x <= -fish.width || fish.x >= screenWidth + fish.width) {
               fishes.delete(fish);
               createFish(fishes, fish.x, -sign(fish.speed));
            }
         }

         if (moveElements.has("ocean")) {
            for (let fish of fishes) {
               if (
                  (fish.x - baitX) * fish.dir < 0 &&
                  fish.x > baitX - 100 &&
                  fish.x < baitX + 100 &&
                  fish.y > baitY - 50 &&
                  fish.y < baitY + 50
               ) {
                  interestFishes.add({
                     x: fish.x,
                     y: fish.y,
                     rotate: 0,
                     dir: fish.dir,
                     width: fish.width,
                     height: fish.height,
                     speed: fish.speed,
                     sqrMax: Infinity,
                  });

                  fishes.delete(fish);
               }
            }

            for (let fish of interestFishes) {
               if (
                  moveElements.has("drop") ||
                  moveElements.has("reel") ||
                  moveElements.has("hook") ||
                  hookFish
               ) {
                  replaceFish(fishes, fish.x, fish.y, sign(fish.x - baitX));
                  interestFishes.delete(fish);
               }

               if (fish.x !== baitX && fish.y !== baitY) {
                  fish.rotate =
                     atan2(fish.y - baitY, fish.x - baitX) +
                     pi / 2 +
                     (fish.dir * pi) / 2;
               }

               if (fish.dir < 0) {
                  fish.x = limitMin(
                     fish.x + cos(fish.rotate) * fish.speed,
                     baitX
                  );
               } else {
                  fish.x = limitMax(
                     fish.x + cos(fish.rotate) * fish.speed,
                     baitX
                  );
               }

               if (fish.rotate * fish.dir > 0) {
                  fish.y = limitMin(
                     fish.y + sin(fish.rotate) * fish.speed,
                     baitY
                  );
               } else {
                  fish.y = limitMax(
                     fish.y + sin(fish.rotate) * fish.speed,
                     baitY
                  );
               }

               fish.sqrDist =
                  (fish.x - baitX) * (fish.x - baitX) +
                  (fish.y - baitY) * (fish.y - baitY);

               if (fish.sqrDist < 1 && fish.speed * fish.dir > 0) {
                  if (!biteFish) {
                     let rand = randomNum(0, 2);

                     if (rand === 0) {
                        fish.speed = (-randomNum(1, 20) / 10 + 1) * fish.dir;
                        fish.sqrMax = randomNum(0, 51);
                     } else if (rand === 1) {
                        biteFish = fish;
                        biteFish.rotate = (pi / 2) * biteFish.dir;
                        interestFishes.delete(fish);
                     }
                  } else {
                     replaceFish(fishes, baitX, baitY);
                     interestFishes.delete(fish);
                  }
               } else if (
                  fish.sqrDist > fish.sqrMax * fish.sqrMax &&
                  fish.speed * fish.dir < 0
               ) {
                  fish.speed = (randomNum(1, 20) / 10 + 1) * fish.dir;
                  fish.sqrMax = Infinity;
               }
            }

            if (biteFish) {
               if (randomNum(0, 25) === 0) {
                  biteFish = false;
                  replaceFish(fishes, baitX, baitY);
               }

               bobberY = limitMax(bobberY + 0.5, 20);
               if (bobberY < 20) {
                  baitY += 1;
               }
               biteFish.y = baitY;
            } else {
               bobberY = limitMin(bobberY - 0.5, 0);
               if (bobberY > 0) {
                  baitY -= 1;
               }
            }

            if (hookFish) {
               hookFish.x = baitX;
               hookFish.y = baitY;
            }
         }

         if (
            (moveElements.has("moveLeft") &&
               !moveElements.has("stopRightWave")) ||
            moveElements.has("stopLeftWave")
         ) {
            oceanPath = new Path2D();
            oceanPath.moveTo(screenWidth, 0);
            oceanPath.lineTo(screenWidth, oceanDepth);
            oceanPath.lineTo(0, oceanDepth);
            oceanPath.lineTo(0, 0);
            oceanPath.lineTo(boatX + (boatWidth * 5) / 8, 0);
            oceanPath.quadraticCurveTo(
               boatX + (boatWidth * 3) / 4,
               0,
               boatX + (boatWidth * 3) / 4,
               -boatWaveAmp / 5
            );
            createWaves(
               oceanPath,
               (boatWaveAmp * 3) / 2,
               boatWaveAmp / 2,
               boatX + (boatWidth * 3) / 4
            );
            oceanPath.lineTo(screenWidth, 0);
         } else if (
            (moveElements.has("moveRight") &&
               !moveElements.has("stopLeftWave")) ||
            moveElements.has("stopRightWave")
         ) {
            oceanPath = new Path2D();
            oceanPath.moveTo(0, 0);
            oceanPath.lineTo(0, oceanDepth);
            oceanPath.lineTo(screenWidth, oceanDepth);
            oceanPath.lineTo(screenWidth, 0);
            oceanPath.lineTo(boatX + boatWidth + 200, 0);
            oceanPath.bezierCurveTo(
               boatX + boatWidth + 100,
               0,
               boatX + boatWidth,
               boatWaveAmp / 6,
               boatX + boatWidth,
               -boatWaveAmp / 12
            );
            oceanPath.bezierCurveTo(
               boatX + boatWidth,
               -boatWaveAmp / 3,
               boatX + boatWidth + boatWaveAmp,
               (-boatWaveAmp * 3) / 8,
               boatX + boatWidth + boatWaveAmp / 2,
               (-boatWaveAmp * 7) / 16
            );
            oceanPath.bezierCurveTo(
               boatX + boatWidth,
               -boatWaveAmp / 2,
               boatX + boatWidth - 200,
               0,
               boatX + boatWidth - 300,
               0
            );
            oceanPath.lineTo(boatX + 100 + boatWaveAmp / 5, 0);
            oceanPath.quadraticCurveTo(
               boatX + 100,
               0,
               boatX + 100,
               -boatWaveAmp / 5
            );
            createWaves(
               oceanPath,
               (boatWaveAmp * 3) / 2,
               -boatWaveAmp / 2,
               boatX + 100
            );
            oceanPath.lineTo(0, 0);
         } else if (moveElements.has("cast")) {
            oceanPath = new Path2D();
            oceanPath.moveTo(screenWidth, 0);
            oceanPath.lineTo(screenWidth, oceanDepth);
            oceanPath.lineTo(0, oceanDepth);
            oceanPath.lineTo(0, 0);
            oceanPath.lineTo(bobberX - 30, 0);
            createWaves(
               oceanPath,
               bobberWaveAmp,
               bobberWaveAmp / 5,
               bobberX - 30
            );
            oceanPath.lineTo(bobberX, 0);
            createWaves(oceanPath, bobberWaveAmp, bobberWaveAmp / 3, bobberX);
            oceanPath.lineTo(screenWidth, 0);
         } else {
            oceanPath = new Path2D();
            oceanPath.moveTo(0, 0);
            oceanPath.lineTo(0, oceanDepth);
            oceanPath.lineTo(screenWidth, oceanDepth);
            oceanPath.lineTo(screenWidth, 0);
            oceanPath.lineTo(0, 0);
         }

         ctx.clearRect(0, 0, windowWidth, windowHeight);

         ctx.save();

         ctx.translate(screenX, screenY);

         ctx.save();
         ctx.fillStyle = skyGradient;
         ctx.fillRect(0, 0, screenWidth, 500);
         ctx.restore();

         ctx.save();
         ctx.translate(-screenX * 0.8 - 1400, 0);
         ctx.fillStyle = sunGradient;
         ctx.fillRect(0, 0, screenWidth, 800);
         ctx.restore();

         ctx.save();

         ctx.translate(oceanX, oceanY + 500);

         ctx.save();
         ctx.fillStyle = "#DDF";
         ctx.fill(oceanPath);
         ctx.restore();

         ctx.save();
         ctx.fillStyle = "red";
         for (let fish of fishes) {
            drawFish(fish, ctx);
         }
         for (let fish of interestFishes) {
            drawFish(fish, ctx);
         }
         if (biteFish) drawFish(biteFish, ctx);
         if (hookFish) drawFish(hookFish, ctx);
         ctx.restore();

         ctx.save();
         ctx.save();
         ctx.translate(boatX, boatY);
         ctx.rotate(boatAngle);
         for (let element of boat) {
            ctx.fillStyle = element[0];
            ctx.fill(element[1]);
         }

         ctx.translate(rodX, rodY);
         ctx.rotate(rodAngle);
         ctx.save();
         for (let element of rod) {
            if (element === "seg") {
               ctx.translate(0, -30);
               ctx.rotate(bendAngle);
            } else if (element === "lineBack") {
               if (mod(unwindTime - windTime, pi) < pi / 2) {
                  ctx.beginPath();
                  ctx.moveTo(
                     18 + Math.cos((unwindTime - windTime) * 2) * 9,
                     -5
                  );
                  ctx.lineTo(18, -30);
                  ctx.stroke();
               }
            } else if (element === "lineFront") {
               if (mod(unwindTime - windTime, pi) >= pi / 2) {
                  ctx.beginPath();
                  ctx.moveTo(
                     18 + Math.cos((unwindTime - windTime) * 2) * 9,
                     -5
                  );
                  ctx.lineTo(18, -30);
                  ctx.stroke();
               }
            } else if (element === "handle") {
               ctx.restore();
               ctx.translate(25, 15);
               ctx.rotate(windTime);
            } else if (element === "grip") {
               ctx.translate(15, 0);
               ctx.rotate(-windTime);
            } else if (element === "startBobber") {
               ctx.beginPath();
               ctx.moveTo(0, 0);
            } else if (element === "connectBobber") {
               ctx.restore();
               ctx.lineTo(bobberX, bobberY);
               ctx.lineTo(baitX, baitY);
               ctx.stroke();
            } else if (element[0] === "#EEE") {
               ctx.strokeStyle = element[0];
               ctx.stroke(element[1]);
            } else {
               ctx.fillStyle = element[0];
               ctx.fill(element[1]);
            }
         }

         ctx.restore();

         ctx.save();
         ctx.translate(bobberX, bobberY);
         ctx.fillStyle = "#F00";
         ctx.fillRect(-5, -5, 10, 10);
         ctx.restore();

         ctx.save();
         ctx.translate(baitX, baitY);
         ctx.fillStyle = "#F80";
         ctx.fillRect(-5, -5, 10, 10);
         ctx.restore();

         ctx.save();
         ctx.clip(oceanPath);
         ctx.scale(1, -0.5);
         ctx.globalAlpha = 0.7;
         ctx.filter = "blur(15px)";
         ctx.drawImage(canvas, -screenX, -screenY - oceanY - 500);
         ctx.restore();

         ctx.restore();

         ctx.restore();

         window.requestAnimationFrame(gameEngine);
      }

      window.requestAnimationFrame(gameEngine);
   },
   { once: true }
);
