function game() {
   const floor = Math.floor;
   const random = Math.random;

   const pi = Math.PI;
   const sqrt = Math.sqrt;
   const abs = Math.abs;
   const sin = Math.sin;
   const cos = Math.cos;
   const atan2 = Math.atan2;

   const setTimeout = window.setTimeout;

   const canvas = document.getElementById("gamescreen");
   const ctx = canvas.getContext("2d");

   const lockBtn = document.getElementById("lock-button");

   let screenWidth =
      (1000 * window.innerWidth) / parseInt(getComputedStyle(canvas).width);
   let screenHeight =
      (2000 * window.innerHeight) / parseInt(getComputedStyle(canvas).height);

   let screenLeft = 500 - screenWidth / 2;
   let screenRight = -500 + screenWidth / 2;
   let screenBottom = -2000 + screenHeight;

   window.addEventListener("resize", () => {
      screenWidth =
         (1000 * window.innerWidth) / parseInt(getComputedStyle(canvas).width);
      screenHeight =
         (2000 * window.innerHeight) /
         parseInt(getComputedStyle(canvas).height);

      screenLeft = 500 - screenWidth / 2;
      screenRight = -500 + screenWidth / 2;
      screenBottom = -1950 + screenHeight;

      screenX =
         -x > screenRight ? (-x < screenLeft ? -x : screenLeft) : screenRight;
      screenY = -y > screenBottom ? (-y < 50 ? -y : 50) : screenBottom;
   });

   let functions = new Set(["surface"]);

   function onArrowLeftDown() {
      if (!functions.has("right")) functions.add("left");
   }

   function onArrowRightDown() {
      if (!functions.has("left")) functions.add("right");
   }

   function onArrowUpDown() {
      if (
         !functions.has("down") &&
         !functions.has("surface") &&
         !functions.has("lock")
      )
         functions.add("up");
   }

   function onArrowDownDown() {
      if (
         !functions.has("up") &&
         !functions.has("surface") &&
         !functions.has("lock")
      )
         functions.add("down");
   }

   function onArrowLeftUp() {
      functions.delete("left");
   }

   function onArrowRightUp() {
      functions.delete("right");
   }

   function onArrowUpUp() {
      functions.delete("up");
   }

   function onArrowDownUp() {
      functions.delete("down");
   }

   function onSpace() {
      if (functions.has("surface")) {
         functions.clear();
         functions.add("cast");
         functions.add("animate");
         prevX = bobberX;
      } else if (functions.has("drop")) {
         functions.delete("drop");
         functions.add("pull");
      }
   }

   function lock() {
      if (functions.has("drop")) {
         functions.delete("up");
         functions.delete("down");
         functions.has("lock")
            ? functions.delete("lock")
            : functions.add("lock");
      }
   }

   document.addEventListener("keydown", (event) => {
      if (!event.repeat && !functions.has("animate")) {
         switch (event.key) {
            case "ArrowLeft":
               onArrowLeftDown();
               break;
            case "ArrowRight":
               onArrowRightDown();
               break;
            case "ArrowUp":
               onArrowUpDown();
               break;
            case "ArrowDown":
               onArrowDownDown();
               break;
         }
      }
   });

   document.addEventListener("keyup", (event) => {
      if (!functions.has("animate")) {
         switch (event.key) {
            case "ArrowLeft":
               onArrowLeftUp();
               break;
            case "ArrowRight":
               onArrowRightUp();
               break;
            case "ArrowUp":
               onArrowUpUp();
               break;
            case "ArrowDown":
               onArrowDownUp();
               break;
            case " ":
               onSpace();
               break;
            case "z":
               lock();
               break;
         }
      }
   });

   canvas.addEventListener("mousedown", (event) => {
      let px = (event.clientX / window.innerWidth) * 2 - 1;
      let py = (event.clientY / window.innerHeight) * 2 - 1;
      if (px > -0.5 && px < 0.5 && py > -0.5 && py < 0.5) {
      } else if (px < -abs(py)) {
         onArrowLeftDown();
      } else if (px > abs(py)) {
         onArrowRightDown();
      } else if (py < -abs(px)) {
         onArrowUpDown();
      } else if (py > abs(px)) {
         onArrowDownDown();
      }
   });

   canvas.addEventListener("mouseup", (event) => {
      let px = (event.clientX / window.innerWidth) * 2 - 1;
      let py = (event.clientY / window.innerHeight) * 2 - 1;
      if (px > -0.5 && px < 0.5 && py > -0.5 && py < 0.5) {
         onSpace();
      } else if (px < -abs(py)) {
         onArrowLeftUp();
      } else if (px > abs(py)) {
         onArrowRightUp();
      } else if (py < -abs(px)) {
         onArrowUpUp();
      } else if (py > abs(px)) {
         onArrowDownUp();
      }
   });

   lockBtn.addEventListener("click", () => lock());

   function createFish(fishes, fish, direction, isRandom) {
      if (fish) fishes.delete(fish);

      let rand = floor(random() * 100);
      if (rand < 30) {
         fishes.add([
            "small",
            isRandom ? floor(random() * 1000 - 500) : -500 * direction,
            floor(random() * 750),
            20,
            10,
            (floor(random() * 4 + 3) / 10) * direction,
            0,
            0,
            floor(random() * 3),
            floor(random() * 50 + 50) * direction,
            1,
            (floor(random() * 6 + 10) / 10) * direction,
         ]);
      } else if (rand < 60) {
         fishes.add([
            "medium",
            isRandom ? floor(random() * 1000 - 500) : -500 * direction,
            floor(random() * 750),
            40,
            25,
            (floor(random() * 5 + 5) / 10) * direction,
            0,
            0,
            floor(random() * 5),
            floor(random() * 50 + 50),
            1,
            (floor(random() * 6 + 15) / 10) * direction,
         ]);
      } else if (rand < 85) {
         fishes.add([
            "large",
            isRandom ? floor(random() * 1000 - 500) : -500 * direction,
            floor(random() * 1000),
            60,
            40,
            (floor(random() * 10 + 5) / 10) * direction,
            0,
            0,
            floor(random() * 10),
            floor(random() * 100 + 50),
            1,
            (floor(random() * 6 + 20) / 10) * direction,
         ]);
      } else if (rand < 100) {
         fishes.add([
            "giant",
            isRandom ? floor(random() * 1000 - 500) : -500 * direction,
            floor(random() * 1000 + 500),
            80,
            60,
            (floor(random() * 10 + 10) / 10) * direction,
            0,
            0,
            floor(random() * 15),
            floor(random() * 100 + 100),
            1,
            (floor(random() * 6 + 25) / 10) * direction,
         ]);
      }
   }

   function power(num, exp) {
      let returnNum = 1;
      for (let i = 0; i < exp; i++) {
         returnNum *= num;
      }
      return returnNum;
   }

   function bezier(time, scale, ...refPoints) {
      return (
         scale * power(1 - time, 4) * refPoints[0] +
         scale * 4 * power(1 - time, 3) * time * refPoints[1] +
         scale * 6 * power(1 - time, 2) * power(time, 2) * refPoints[2] +
         scale * 4 * (1 - time) * power(time, 3) * refPoints[3] +
         scale * power(time, 4) * refPoints[4]
      );
   }

   const sun = document.getElementById("sun");
   const sunCtx = sun.getContext("2d");

   const cloudA = document.getElementById("cloudA");
   const cloudACtx = cloudA.getContext("2d");

   const cloudB = document.getElementById("cloudB");
   const cloudBCtx = cloudB.getContext("2d");

   const ground = document.getElementById("ground");
   const groundCtx = ground.getContext("2d");

   const fishCanvas = document.getElementById("fish-canvas");
   const fishCtx = fishCanvas.getContext("2d");

   const fishRender = document.getElementById("fish");
   const fishRenderCtx = fishRender.getContext("2d");

   const boat = document.getElementById("boat");
   const boatCtx = boat.getContext("2d");

   const rod = document.getElementById("rod");
   const rodCtx = rod.getContext("2d");

   const bobber = document.getElementById("bobber");
   const bobberCtx = bobber.getContext("2d");

   const hook = document.getElementById("hook");
   const hookCtx = hook.getContext("2d");

   const land = document.getElementById("land");
   const landCtx = land.getContext("2d");

   const ocean = document.getElementById("ocean");
   const oceanCtx = ocean.getContext("2d");

   const mask = document.getElementById("mask");
   const maskCtx = mask.getContext("2d");

   canvas.width = 1000;
   canvas.height = 2000;

   sun.width = 1000;
   sun.height = 300;

   sunCtx.fillStyle = sunCtx.createLinearGradient(0, 200, 0, 0);
   sunCtx.fillStyle.addColorStop(0, "#FEB");
   sunCtx.fillStyle.addColorStop(0.1, "#FC8");
   sunCtx.fillStyle.addColorStop(1, "#88F");
   sunCtx.fillRect(0, 0, 1000, 200);

   sunCtx.fillStyle = sunCtx.createRadialGradient(500, -25, 0, 500, -25, 500);
   sunCtx.fillStyle.addColorStop(0, "#F70");
   sunCtx.fillStyle.addColorStop(0.15, "#F90");
   sunCtx.fillStyle.addColorStop(0.15, "#FB04");
   sunCtx.fillStyle.addColorStop(1, "#0000");
   sunCtx.translate(0, 200);
   sunCtx.fillRect(0, -200, 1000, 200);
   sunCtx.scale(1, -0.5);
   sunCtx.fillRect(0, -175, 1000, 175);

   cloudA.width = cloudB.width = 2000;
   cloudA.height = cloudB.height = 350;

   cloudACtx.fillStyle = cloudACtx.createRadialGradient(0, 0, 0, 0, 0, 10);
   cloudACtx.fillStyle.addColorStop(0, "#FFF");
   cloudACtx.fillStyle.addColorStop(0.5, "#FFFB");
   cloudACtx.fillStyle.addColorStop(1, "#FFF0");
   for (let i = 0, n = floor(random() * 20); i < n; i++) {
      let width = floor(random() * 10 + 5);
      cloudACtx.save();
      cloudACtx.translate(floor(random() * 1600 + 200), floor(random() * 200));
      cloudACtx.scale(width, width / floor(random() + 5));
      cloudACtx.fillRect(-10, -10, 20, 20);
      cloudACtx.restore();
   }
   cloudBCtx.fillStyle = cloudACtx.fillStyle;
   for (let i = 0, n = floor(random() * 20); i < n; i++) {
      let width = floor(random() * 10 + 5);
      cloudBCtx.save();
      cloudBCtx.translate(floor(random() * 1600 + 200), floor(random() * 200));
      cloudBCtx.scale(width, width / floor(random() + 5));
      cloudBCtx.fillRect(-10, -10, 20, 20);
      cloudBCtx.restore();
   }

   cloudACtx.scale(1, -0.5);
   cloudACtx.filter = "blur(5px)";
   cloudACtx.drawImage(cloudA, 0, -600);

   cloudBCtx.scale(1, -0.5);
   cloudBCtx.filter = "blur(5px)";
   cloudBCtx.drawImage(cloudB, 0, -600);

   ground.width = 1000;
   ground.height = 300;

   let plants = [
      [floor(random() * 2), floor(random() * 100), floor(random() * 2 + 3)],
   ];

   for (let i = 0; i < 20; i++) {
      plants.push([
         floor(random() * 2),
         floor(random() * 100) + plants[i][1] + 10 * plants[i][2],
         floor(random() * 5 + 5),
      ]);
      if (plants[i + 1][1] + 10 * plants[i + 1][2] > 1000) {
         plants.pop();
         break;
      }
   }

   for (let plant of plants) {
      if (plant[0] === 0) {
      } else {
         groundCtx.fillStyle = "#8F8";
         groundCtx.fillRect(plant[1], 0, 10 * plant[2], 250);
      }
   }

   groundCtx.fillStyle = "#FF0";
   groundCtx.fillRect(0, 250, 1000, 50);

   fishCanvas.width = 1000;
   fishCanvas.height = 2000;

   let fishSet = new Set();
   for (let i = 0; i < 30; i++) {
      createFish(fishSet, undefined, floor(random() * 2) * 2 - 1, true);
   }

   fishRender.width = 100;
   fishRender.height = 50;

   fishRenderCtx.fillStyle = "#888";
   fishRenderCtx.beginPath();
   fishRenderCtx.moveTo(10, 25);
   fishRenderCtx.lineTo(0, 22);
   fishRenderCtx.bezierCurveTo(25, 10, 50, 10, 80, 22);
   fishRenderCtx.lineTo(100, 15);
   fishRenderCtx.quadraticCurveTo(95, 25, 100, 35);
   fishRenderCtx.lineTo(80, 28);
   fishRenderCtx.quadraticCurveTo(50, 40, 40, 40);
   fishRenderCtx.quadraticCurveTo(35, 45, 30, 40);
   fishRenderCtx.quadraticCurveTo(25, 40, 0, 28);
   fishRenderCtx.fill();

   fishRenderCtx.fillStyle = "#777";
   fishRenderCtx.beginPath();
   fishRenderCtx.moveTo(0, 22);
   fishRenderCtx.quadraticCurveTo(25, 10, 35, 10);
   fishRenderCtx.quadraticCurveTo(45, 5, 50, 10);
   fishRenderCtx.quadraticCurveTo(55, 10, 80, 22);
   fishRenderCtx.lineTo(80, 25);
   fishRenderCtx.bezierCurveTo(50, 15, 25, 15, 0, 22);
   fishRenderCtx.fill();

   // fishRenderCtx.fillStyle = "#555";
   fishRenderCtx.beginPath();
   fishRenderCtx.moveTo(25, 25);
   fishRenderCtx.lineTo(30, 22.5);
   fishRenderCtx.bezierCurveTo(45, 15, 45, 35, 30, 27.5);
   fishRenderCtx.fill();

   boat.width = 150;
   boat.height = 80;

   boatCtx.fillStyle = "#FFF";
   boatCtx.beginPath();
   boatCtx.moveTo(50, 40);
   boatCtx.bezierCurveTo(60, 20, 60, 25, 80, 20);
   boatCtx.bezierCurveTo(102, 33, 95, 30, 100, 35);
   boatCtx.fill();

   boatCtx.strokeStyle = "#888";
   boatCtx.lineWidth = 0.5;
   boatCtx.fillStyle = boatCtx.createLinearGradient(60, 28, 68, 15);
   boatCtx.fillStyle.addColorStop(0, "#BBB");
   boatCtx.fillStyle.addColorStop(0.9, "#FFF");
   boatCtx.fillStyle.addColorStop(1, "#DDD");
   boatCtx.beginPath();
   boatCtx.moveTo(60, 28);
   boatCtx.bezierCurveTo(65, 23, 75, 25, 80, 22);
   boatCtx.lineTo(90, 28);
   boatCtx.closePath();
   boatCtx.fill();
   boatCtx.stroke();

   boatCtx.lineWidth = 1;
   boatCtx.beginPath();
   boatCtx.moveTo(80, 22);
   boatCtx.lineTo(72, 10);
   boatCtx.moveTo(50, 40);
   boatCtx.bezierCurveTo(60, 20, 45, 15, 55, 10);
   boatCtx.stroke();

   boatCtx.lineWidth = 3;
   boatCtx.strokeStyle = "#BBB";
   boatCtx.beginPath();
   boatCtx.moveTo(80, 10);
   boatCtx.bezierCurveTo(70, 15, 70, 10, 45, 10);
   boatCtx.stroke();

   boatCtx.fillStyle = "#FFF";
   boatCtx.beginPath();
   boatCtx.moveTo(80, 10);
   boatCtx.bezierCurveTo(70, 15, 70, 10, 45, 10);
   boatCtx.bezierCurveTo(45, 8, 85, 5, 80, 10);
   boatCtx.fill();

   boatCtx.fillStyle = "#888";
   boatCtx.fillRect(0, 40, 8, 15);
   boatCtx.fillRect(3, 55, 3, 5);

   boatCtx.fillStyle = "#000";
   boatCtx.fillRect(105, 15, 15, 20);

   boatCtx.fillStyle = "#888";
   boatCtx.beginPath();
   boatCtx.moveTo(0, 50);
   boatCtx.bezierCurveTo(10, 50, 10, 40, 15, 40);
   boatCtx.bezierCurveTo(50, 40, 50, 35, 125, 35);
   boatCtx.stroke();

   boatCtx.fillStyle = "#EEE";
   boatCtx.beginPath();
   boatCtx.moveTo(0, 50);
   boatCtx.bezierCurveTo(10, 50, 10, 40, 15, 40);
   boatCtx.bezierCurveTo(50, 40, 50, 35, 125, 35);
   boatCtx.lineTo(127, 38);
   boatCtx.bezierCurveTo(100, 38, 145, 55, 50, 55);
   boatCtx.bezierCurveTo(0, 55, 15, 55, 0, 50);
   boatCtx.fill();

   boatCtx.fillStyle = "#444";
   boatCtx.beginPath();
   boatCtx.moveTo(0, 50);
   boatCtx.bezierCurveTo(60, 45, 70, 38, 127, 38);
   boatCtx.bezierCurveTo(70, 40, 60, 50, 0, 50);
   boatCtx.fill();

   boatCtx.scale(1, -0.5);
   boatCtx.filter = "blur(5px)";
   boatCtx.drawImage(boat, 0, -160);

   rod.width = 40;
   rod.height = 40;

   rodCtx.translate(5, 37);
   rodCtx.rotate(-pi / 4);
   rodCtx.strokeStyle = "#000";
   rodCtx.lineWidth = 0.2;
   rodCtx.beginPath();
   rodCtx.moveTo(5, -5);
   rodCtx.lineTo(50, -2);
   rodCtx.stroke();

   rodCtx.fillStyle = "#864";
   rodCtx.beginPath();
   rodCtx.moveTo(-5, -2);
   rodCtx.lineTo(50, -1);
   rodCtx.lineTo(-5, 0);
   rodCtx.fill();

   rodCtx.beginPath();
   rodCtx.arc(5, -3, 2, 0, pi * 2, true);
   rodCtx.fill();

   rodCtx.fillRect(15, -5, 1, 3);
   rodCtx.fillRect(25, -4, 1, 3);
   rodCtx.fillRect(33, -3, 1, 2);
   rodCtx.fillRect(40, -3, 1, 2);
   rodCtx.fillRect(45, -2, 1, 1);

   bobber.width = 8;
   bobber.height = 8;

   bobberCtx.fillStyle = bobberCtx.createLinearGradient(0, 0, 0, 8);
   bobberCtx.fillStyle.addColorStop(0, "#D20");
   bobberCtx.fillStyle.addColorStop(0.5, "#D20");
   bobberCtx.fillStyle.addColorStop(0.5, "#FDB");
   bobberCtx.fillStyle.addColorStop(0.6, "#FB8");
   bobberCtx.fillStyle.addColorStop(0.6, "#D20");
   bobberCtx.fillStyle.addColorStop(1, "#D20");
   bobberCtx.fillRect(3, 0, 2, 8);

   bobberCtx.beginPath();
   bobberCtx.arc(4, 5, 2, 0, 2 * pi, true);
   bobberCtx.fill();

   hook.width = 4;
   hook.height = 4;

   hookCtx.fillStyle = "#F88";
   hookCtx.beginPath();
   hookCtx.arc(2, 2, 2, 0, 2 * pi, true);
   hookCtx.fill();

   land.width = 300;
   land.height = 1800;

   landCtx.strokeStyle = "#BB4";
   landCtx.lineWidth = 2;
   landCtx.beginPath();
   landCtx.moveTo(10, 22);
   landCtx.lineTo(20, 22);
   landCtx.moveTo(10, 28);
   landCtx.lineTo(20, 28);
   landCtx.stroke();

   landCtx.fillStyle = landCtx.createRadialGradient(15, 25, 0, 15, 25, 5);
   landCtx.fillStyle.addColorStop(0, "#D60");
   landCtx.fillStyle.addColorStop(0.2, "#B40");
   landCtx.fillStyle.addColorStop(0.2, "#D60");
   landCtx.fillStyle.addColorStop(0.4, "#D60");
   landCtx.fillStyle.addColorStop(0.4, "#B40");
   landCtx.fillStyle.addColorStop(0.6, "#B40");
   landCtx.fillStyle.addColorStop(0.6, "#D60");
   landCtx.fillStyle.addColorStop(0.8, "#D60");
   landCtx.fillStyle.addColorStop(0.8, "#B40");
   landCtx.fillStyle.addColorStop(0.9, "#B40");
   landCtx.fillStyle.addColorStop(0.9, "#830");
   landCtx.fillStyle.addColorStop(1, "#0000");
   landCtx.fillRect(10, 20, 10, 10);
   landCtx.drawImage(land, 10, 0);
   landCtx.drawImage(land, 20, 0);
   landCtx.drawImage(land, 40, 0);
   landCtx.drawImage(land, 80, 0);

   landCtx.translate(10, 30);
   landCtx.fillStyle = landCtx.createLinearGradient(0, 0, 0, 10);
   landCtx.fillStyle.addColorStop(0, "#830");
   landCtx.fillStyle.addColorStop(0.1, "#830");
   landCtx.fillStyle.addColorStop(0.1, "#940");
   landCtx.fillStyle.addColorStop(0.2, "#940");
   landCtx.fillStyle.addColorStop(0.2, "#830");
   landCtx.fillStyle.addColorStop(0.4, "#830");
   landCtx.fillStyle.addColorStop(0.4, "#940");
   landCtx.fillStyle.addColorStop(0.6, "#940");
   landCtx.fillStyle.addColorStop(0.6, "#830");
   landCtx.fillStyle.addColorStop(0.8, "#830");
   landCtx.fillStyle.addColorStop(0.8, "#940");
   landCtx.fillStyle.addColorStop(0.9, "#940");
   landCtx.fillStyle.addColorStop(0.9, "#830");
   landCtx.fillStyle.addColorStop(1, "#830");
   landCtx.fillRect(0, 0, 160, 10);

   landCtx.save();
   landCtx.translate(30, -30);
   landCtx.rotate(pi / 2);
   landCtx.fillRect(0, 0, 120, 10);
   landCtx.restore();
   landCtx.save();
   landCtx.translate(130, -30);
   landCtx.rotate(pi / 2);
   landCtx.fillRect(0, 0, 360, 10);
   landCtx.restore();

   landCtx.beginPath();
   landCtx.moveTo(2, 0);
   landCtx.lineTo(2, 10);
   landCtx.moveTo(5, 0);
   landCtx.lineTo(5, 10);
   landCtx.moveTo(8, 0);
   landCtx.lineTo(8, 10);
   landCtx.moveTo(147, 0);
   landCtx.lineTo(147, 10);
   landCtx.moveTo(150, 0);
   landCtx.lineTo(150, 10);
   landCtx.moveTo(153, 0);
   landCtx.lineTo(153, 10);
   landCtx.moveTo(20, 0);
   landCtx.lineTo(30, 10);
   landCtx.moveTo(30, 0);
   landCtx.lineTo(20, 10);
   landCtx.moveTo(120, 0);
   landCtx.lineTo(130, 10);
   landCtx.moveTo(130, 0);
   landCtx.lineTo(120, 10);
   landCtx.stroke();

   landCtx.translate(-10, -30);
   landCtx.fillStyle = "#AAA";
   landCtx.strokeStyle = "#666";
   landCtx.lineWidth = 1;

   landCtx.beginPath();
   landCtx.moveTo(0, 20);
   landCtx.lineTo(3, 20);
   landCtx.lineTo(8, 25);
   landCtx.lineTo(7, 30);
   landCtx.lineTo(10, 30);
   landCtx.lineTo(15, 40);
   landCtx.lineTo(20, 43);
   landCtx.lineTo(25, 50);
   landCtx.lineTo(23, 60);
   landCtx.lineTo(25, 65);
   landCtx.lineTo(20, 78);
   landCtx.lineTo(25, 80);
   landCtx.lineTo(32, 100);
   landCtx.lineTo(30, 105);
   landCtx.lineTo(55, 150);
   landCtx.lineTo(57, 170);
   landCtx.lineTo(56, 175);
   landCtx.lineTo(65, 195);
   landCtx.lineTo(60, 205);
   landCtx.lineTo(50, 215);
   landCtx.lineTo(40, 235);
   landCtx.lineTo(40, 250);
   landCtx.lineTo(45, 260);
   landCtx.lineTo(45, 280);
   landCtx.lineTo(50, 290);
   landCtx.lineTo(53, 300);
   landCtx.lineTo(60, 310);
   landCtx.lineTo(65, 325);
   landCtx.lineTo(80, 330);
   landCtx.lineTo(90, 350);
   landCtx.lineTo(120, 360);
   landCtx.lineTo(135, 350);
   landCtx.lineTo(145, 355);
   landCtx.lineTo(150, 370);
   landCtx.lineTo(160, 370);
   landCtx.lineTo(170, 380);
   landCtx.lineTo(170, 400);
   landCtx.lineTo(300, 500);
   landCtx.lineTo(300, 1800);
   landCtx.lineTo(0, 1800);
   landCtx.fill();
   landCtx.stroke();

   landCtx.lineWidth = 2;
   landCtx.beginPath();
   landCtx.moveTo(7, 30);
   landCtx.lineTo(3, 25);

   landCtx.moveTo(15, 40);
   landCtx.lineTo(10, 50);
   landCtx.lineTo(12, 55);

   landCtx.moveTo(20, 78);
   landCtx.lineTo(10, 75);

   landCtx.moveTo(32, 100);
   landCtx.lineTo(25, 120);
   landCtx.lineTo(15, 110);
   landCtx.moveTo(20, 115);
   landCtx.lineTo(10, 120);

   landCtx.moveTo(57, 170);
   landCtx.lineTo(55, 180);
   landCtx.lineTo(50, 165);
   landCtx.lineTo(45, 190);
   landCtx.lineTo(35, 188);
   landCtx.moveTo(48, 180);
   landCtx.lineTo(57, 190);
   landCtx.moveTo(50, 165);
   landCtx.lineTo(20, 170);
   landCtx.lineTo(30, 168);
   landCtx.lineTo(20, 150);
   landCtx.moveTo(40, 167);
   landCtx.lineTo(45, 155);

   landCtx.moveTo(30, 140);
   landCtx.lineTo(10, 140);
   landCtx.lineTo(5, 170);
   landCtx.moveTo(7, 150);
   landCtx.lineTo(0, 150);

   landCtx.moveTo(30, 180);
   landCtx.lineTo(25, 180);
   landCtx.lineTo(35, 200);
   landCtx.moveTo(32, 195);
   landCtx.lineTo(15, 210);

   landCtx.stroke();

   ocean.width = 1000;
   ocean.height = 1800;

   oceanCtx.fillStyle = oceanCtx.createLinearGradient(0, 0, 0, 1800);
   oceanCtx.fillStyle.addColorStop(0, "#DDF");
   oceanCtx.fillStyle.addColorStop(0.01, "#FC8");
   oceanCtx.fillStyle.addColorStop(0.05, "#44F");
   oceanCtx.fillStyle.addColorStop(1, "#00F");
   oceanCtx.globalAlpha = 0.5;
   oceanCtx.filter = "blur(2px)";
   oceanCtx.fillRect(0, 0, 1000, 1800);

   mask.width = 1000;
   mask.height = 1800;

   let x = 0;
   let y = -50;

   let boatX = 0;

   let bobberX = 0;
   let bobberY = -50;

   let hookX = 0;
   let hookY = -50;

   let screenX = 0;
   let screenY = 50;

   let cloudApos = -1000;
   let cloudBpos = 1000;
   let cloudAleft = false;
   let cloudBleft = true;

   let rodAngle = 0;
   let bobberAngle = pi;
   let swingAngle = 0;
   let holdAngle = 0;

   let hookLeft = -340;
   let hookRight = 340;

   let animateTime = 0;

   let moveDelay = 150;

   let fishTime = 0;
   let interest = false;
   let interestTime = 0;

   let prevX = 0;
   let prevY = 0;
   let prevAngle = 0;

   let catchFish = false;
   let catchAngle = 0;

   let pullTime = 0;

   let mapTime = -0.01;

   let strain = 0;
   let strainElasticity = 2;
   let maxStrain = 25;

   const maskGradientA = maskCtx.createLinearGradient(0, 0, 0, 1800);
   maskGradientA.addColorStop(0, "#0000");
   maskGradientA.addColorStop(0.7, "#000");
   maskGradientA.addColorStop(1, "#000");

   ctx.strokeStyle = "#000";
   ctx.lineWidth = 0.3;

   return {
      updateDraw: function () {
         if (functions.has("left")) {
            boatX = boatX > -339 ? boatX - 1 : -340;
            setTimeout(() => {
               bobberX = bobberX > hookLeft + 1 ? bobberX - 1 : hookLeft;
            }, 50);
            setTimeout(() => {
               x = x > hookLeft + 1 ? x - 1 : hookLeft;
               hookX = x;
               screenX =
                  -x > screenRight
                     ? -x < screenLeft
                        ? -x
                        : screenLeft
                     : screenRight;
            }, moveDelay);
         } else if (functions.has("right")) {
            boatX = boatX < 339 ? boatX + 1 : 340;
            setTimeout(() => {
               bobberX = bobberX < hookRight + 1 ? bobberX + 1 : hookRight;
            }, 50);
            setTimeout(() => {
               x = x < hookRight + 1 ? x + 1 : hookRight;
               hookX = x;
               screenX =
                  -x > screenRight
                     ? -x < screenLeft
                        ? -x
                        : screenLeft
                     : screenRight;
            }, moveDelay);
         }

         if (functions.has("up")) {
            setTimeout(() => {
               if (functions.has("drop")) y -= 0.5;
               y = y > 6 ? y - 1 : 5;
               hookY = y;
               screenY = -y > screenBottom ? (-y < 50 ? -y : 50) : screenBottom;
            }, 150);
            if (y <= 5) {
               functions.clear();
               functions.add("bringUp");
               functions.add("animate");
               prevX = x;
               if (catchFish) prevAngle = catchFish[7];
            }
         } else if (functions.has("down")) {
            setTimeout(() => {
               y = y < 1749 ? y + 1 : 1750;
               if (functions.has("drop")) y -= 0.5;
               hookY = y;
               screenY = -y > screenBottom ? (-y < 50 ? -y : 50) : screenBottom;
            }, 150);
         }

         if (functions.has("cast")) {
            animateTime += 0.01;

            if (animateTime <= 1) {
               rodAngle = bezier(animateTime, (-pi * 3) / 4, 0, 0.7, 1, 0.7, 0);
               swingAngle = -rodAngle;
               bobberAngle =
                  bezier(animateTime, -2.5 * pi, 0, 0, 1, 0.8, 0.5) + pi;
            } else if (animateTime <= 2) {
               bobberX =
                  bezier(animateTime - 1, 150, 0, 0.6, 0.8, 0.9, 1) + prevX;
               bobberY = bezier(animateTime - 1, 57, 0, -0.5, 0.5, 1.2, 1) - 50;
               x = bobberX;
               y = bobberY;
               hookX = x;
               hookY = y;
               screenX =
                  -x > screenRight
                     ? -x < screenLeft
                        ? -x
                        : screenLeft
                     : screenRight;
               screenY = -y > screenBottom ? (-y < 50 ? -y : 50) : screenBottom;

               bobberAngle =
                  bezier(animateTime - 1, pi / 4, 0, 0.5, 0.8, 2, 1) - pi / 4;
            } else if (animateTime > 2) {
               animateTime = 0;
               rodAngle = 0;
               swingAngle = 0;
               bobberAngle = 0;
               hookLeft = -190;
               hookRight = 490;
               moveDelay = 300;
               functions.delete("cast");
               functions.delete("animate");
               functions.delete("surface");
               functions.add("drop");
            }
         } else if (functions.has("drop")) {
            bobberY = bobberY > 7 ? bobberY - 0.5 : 7;
            if (!functions.has("lock")) {
               y = y < 1749.5 ? y + 0.5 : 1750;
               hookY = y;
               screenY = -y > screenBottom ? (-y < 50 ? -y : 50) : screenBottom;
            }
         } else if (functions.has("pull")) {
            pullTime++;
            if (interest) {
               catchFish = interest;
               interestTime = 0;
               interest = false;
            }
            if (!catchFish) {
               bobberY = bobberY > 7 ? bobberY - 0.5 : 7;
               y = y > 10 ? y - 5 : 5;
               hookY = y;
               screenY = -y > screenBottom ? (-y < 50 ? -y : 50) : screenBottom;
            }
            if (y <= 5) {
               pullTime = 0;
               functions.clear();
               functions.add("bringUp");
               functions.add("animate");
               prevX = x;
               if (catchFish) prevAngle = catchFish[7];
            }
            if (pullTime >= 10) {
               pullTime = 0;
               functions.delete("pull");
               if (catchFish) {
                  functions.delete("lock");
                  functions.add("reel");
                  catchAngle = floor(random() * 21 - 10) / 1000;
                  hookLeft = -500;
                  hookRight = 500;
               } else {
                  functions.add("drop");
               }
            }
         } else if (functions.has("reel")) {
            if (x > boatX - 150 && x < boatX + 150) bobberX = x;
            if (y < bobberY) bobberY = y;
            catchFish[7] += catchAngle;
            catchAngle =
               catchAngle < 0.05
                  ? catchAngle > -0.05
                     ? catchAngle + floor(random() * 11 - 5) / 1000
                     : catchAngle + floor(random() * 6) / 1000
                  : catchAngle - floor(random() * 6) / 1000;

            catchFish[1] += cos(catchFish[7]) * catchFish[11];
            catchFish[2] += sin(catchFish[7]) * catchFish[11];

            strain += sqrt(
               power(catchFish[1] - x, 2) + power(catchFish[2] - y, 2)
            );
            strain = strain > strainElasticity ? strain - strainElasticity : 0;
            if (strain > maxStrain) {
               functions.clear();
               functions.add("lineBreak");
               functions.add("animate");
               strain = 0;
               prevX = x;
               prevY = y;
            }
            x = (catchFish[1] + x) / 2;
            y = (catchFish[2] + y) / 2;
            catchFish[1] = x;
            catchFish[2] = y;
            hookX = x;
            hookY = y;
            screenX =
               -x > screenRight
                  ? -x < screenLeft
                     ? -x
                     : screenLeft
                  : screenRight;
            screenY = -y > screenBottom ? (-y < 50 ? -y : 50) : screenBottom;
            if (x < -500 || x > 500) {
               functions.clear();
               functions.add("lineBreak");
               functions.add("animate");
               prevX = x;
               prevY = y;
            } else if (y < 5) {
               functions.clear();
               functions.add("bringUp");
               functions.add("animate");
               prevX = x;
               prevAngle = catchFish[7];
               strain = 0;
            }
         } else if (functions.has("lineBreak")) {
            bobberY = bobberY > 7 ? bobberY - 0.5 : 7;
            if (catchFish) {
               catchFish[5] *= -3;
               catchFish = false;
            }
            hookX = NaN;
            hookY = NaN;
            animateTime += 0.005;
            x =
               bezier(animateTime, -prevX + bobberX, 0, 0.2, 0.5, 0.8, 1) +
               prevX;
            y = bezier(animateTime, -prevY + 5, 0, 0.2, 0.5, 0.8, 1) + prevY;
            if (y < bobberY) bobberY = y;
            screenX =
               -x > screenRight
                  ? -x < screenLeft
                     ? -x
                     : screenLeft
                  : screenRight;
            screenY = -y > screenBottom ? (-y < 50 ? -y : 50) : screenBottom;

            if (animateTime > 1) {
               animateTime = 0;
               functions.delete("lineBreak");
               functions.add("bringUp");
               functions.add("animate");
               prevX = x;
               prevAngle = catchFish[7];
            }
         } else if (functions.has("bringUp")) {
            animateTime += 0.01;

            if (animateTime <= 1) {
               x =
                  bezier(
                     animateTime,
                     -prevX + boatX - 35,
                     0,
                     0.5,
                     0.8,
                     0.9,
                     1
                  ) + prevX;
               y = bezier(animateTime, -25, 0, 0.5, 1, 2, 1) + 5;
               holdAngle = bezier(animateTime, -pi / 4, 0, 1, 1.5, 1, 1);
               bobberAngle = bezier(animateTime, -pi, 0, -0.2, -0.5, 0, 1);
               if (catchFish) {
                  catchFish[7] =
                     -prevAngle +
                     bezier(
                        animateTime,
                        catchFish[5] < 0 ? pi / 2 : -pi / 2,
                        0,
                        0.5,
                        1,
                        1.5,
                        1
                     ) +
                     prevAngle;
                  catchFish[1] = x;
                  catchFish[2] = y;
               }
               bobberX = x;
               bobberY = y;
               if (hookX) hookX = x;
               if (hookY) hookY = y;
               screenX =
                  -x > screenRight
                     ? -x < screenLeft
                        ? -x
                        : screenLeft
                     : screenRight;
               screenY = -y > screenBottom ? (-y < 50 ? -y : 50) : screenBottom;
            } else if (animateTime <= 1.5) {
               holdAngle =
                  bezier(2 * animateTime - 2, pi / 16, 0, 0.2, 0.5, 0.8, 1) -
                  pi / 4;
               bobberAngle =
                  bezier(2 * animateTime - 2, -pi / 4, 0, 0.5, 1, 0.5, 0) - pi;
               if (catchFish)
                  catchFish[7] =
                     bezier(2 * animateTime - 2, pi / 2, 0, -1, 0, 1, 0) +
                     (catchFish[5] < 0 ? pi / 2 : -pi / 2);
            } else if (animateTime <= 2.5) {
               x =
                  bezier(animateTime - 1.5, 35, 0, 0.2, 0.5, 0.8, 1) +
                  boatX -
                  35;
               y = bezier(animateTime - 1.5, -30, 0, 0.2, 0.5, 0.8, 1) - 20;
               holdAngle =
                  bezier(animateTime - 1.5, (pi * 3) / 16, 0, 1, 1, 1, 1) -
                  (pi * 3) / 16;
               swingAngle = bezier(
                  animateTime - 1.5,
                  -pi / 2,
                  0,
                  0.5,
                  1.5,
                  1,
                  0
               );
               bobberAngle =
                  bezier(animateTime - 1.5, -pi, 0, 0.2, 0, -1, 0) - pi;
               if (catchFish) {
                  catchFish[1] =
                     bezier(animateTime - 1.5, -80, 0, 0.5, 1, 1, 1) +
                     boatX -
                     35;
                  catchFish[2] =
                     bezier(animateTime - 1.5, 10, 0, -2, 1, 1, 1) - 20;
                  catchFish[7] =
                     bezier(animateTime - 1.5, -pi / 2, 0, 2, 1, 1, 1) +
                     (catchFish[5] < 0 ? pi / 2 : -pi / 2);
                  catchFish[10] = 2.5 - animateTime;
               }
               bobberX = x;
               bobberY = y;
               hookX = x;
               hookY = y;
               screenX =
                  -x > screenRight
                     ? -x < screenLeft
                        ? -x
                        : screenLeft
                     : screenRight;
               screenY = -y > screenBottom ? (-y < 50 ? -y : 50) : screenBottom;
            } else if (animateTime > 2.5) {
               animateTime = 0;
               holdAngle = 0;
               swingAngle = 0;
               bobberAngle = -pi;
               if (catchFish) {
                  createFish(fishSet, catchFish, floor(random() * 2) * 2 - 1);
                  catchFish = false;
               }
               functions.delete("bringUp");
               functions.delete("animate");
               functions.add("surface");
               hookLeft = -340;
               hookRight = 340;
               moveDelay = 150;
            }
         }

         cloudAleft
            ? (cloudApos =
                 cloudApos > -2000
                    ? cloudApos - 0.5
                    : ((cloudAleft = false), -2000))
            : (cloudApos =
                 cloudApos < 1000
                    ? cloudApos + 0.5
                    : ((cloudAleft = true), 1000));
         cloudBleft
            ? (cloudBpos =
                 cloudBpos > -2000
                    ? cloudBpos - 0.5
                    : ((cloudBleft = false), -2000))
            : (cloudBpos =
                 cloudBpos < 1000
                    ? cloudBpos + 0.5
                    : ((cloudBleft = true), 1000));

         fishCtx.clearRect(0, 0, 1000, 2000);

         fishTime++;
         for (let fish of fishSet) {
            if (fish !== catchFish) {
               if (
                  !functions.has("surface") &&
                  !functions.has("animate") &&
                  fish[5] < 0 &&
                  fish[1] > x - 1 &&
                  fish[1] < x + fish[3] * 2 &&
                  (fish[2] + fish[6] - y < 0
                     ? -fish[2] - fish[6] + y
                     : fish[2] + fish[6] - y) <
                     fish[1] - x + 1
               ) {
                  if (catchFish) {
                     fish[5] *= -3;
                  } else if (fish === interest) {
                     interestTime++;
                     fish[2] += 1;
                     fish[7] =
                        fish[7] > -pi / 2 + 0.1 ? fish[7] - 0.1 : -pi / 2;
                     bobberY += 1;
                     x = fish[1];
                     y = fish[2];
                     hookX = x;
                     hookY = y;
                     screenX =
                        -x > screenRight
                           ? -x < screenLeft
                              ? -x
                              : screenLeft
                           : screenRight;
                     screenY =
                        -y > screenBottom ? (-y < 50 ? -y : 50) : screenBottom;
                     if (
                        interestTime >= 50 ||
                        functions.has("left") ||
                        functions.has("right") ||
                        functions.has("up") ||
                        functions.has("down")
                     ) {
                        interestTime = 0;
                        interest = false;
                        fish[5] *= -3;
                        fish[1] += fish[5];
                     }
                  } else {
                     let angle = atan2(fish[2] + fish[6] - y, fish[1] - x);
                     fish[7] = angle;
                     fish[1] =
                        fish[1] > x - cos(angle) * fish[5]
                           ? fish[1] + cos(angle) * fish[5]
                           : x;
                     fish[2] += sin(angle) * fish[5];
                     if (fish[1] === x) {
                        interest = fish;
                     }
                  }
               } else if (
                  !functions.has("surface") &&
                  !functions.has("animate") &&
                  fish[5] > 0 &&
                  fish[1] > x - fish[3] * 2 &&
                  fish[1] < x + 1 &&
                  (fish[2] + fish[6] - y < 0
                     ? -fish[2] - fish[6] + y
                     : fish[2] + fish[6] - y) <
                     x - fish[1] + 1
               ) {
                  if (catchFish) {
                     fish[5] *= -3;
                  } else if (fish === interest) {
                     interestTime++;
                     fish[2] += 1;
                     fish[7] = fish[7] < pi / 2 - 0.1 ? fish[7] + 0.1 : pi / 2;
                     bobberY += 1;
                     x = fish[1];
                     y = fish[2];
                     hookX = x;
                     hookY = y;
                     screenX =
                        -x > screenRight
                           ? -x < screenLeft
                              ? -x
                              : screenLeft
                           : screenRight;
                     screenY =
                        -y > screenBottom ? (-y < 50 ? -y : 50) : screenBottom;
                     if (interestTime >= 50) {
                        interestTime = 0;
                        interest = false;
                        fish[5] *= -3;
                        fish[1] += fish[5];
                     }
                  } else {
                     let angle = atan2(-fish[2] - fish[6] + y, -fish[1] + x);
                     fish[7] = angle;
                     fish[1] =
                        fish[1] < x - cos(angle) * fish[5]
                           ? fish[1] + cos(angle) * fish[5]
                           : x;
                     fish[2] += sin(angle) * fish[5];
                     if (fish[1] === x) {
                        interest = fish;
                     }
                  }
               } else {
                  if (fish === interest) {
                     interestTime = 0;
                     interest = false;
                  }
                  !(fish[1] > 500 + fish[3] && fish[5] > 0)
                     ? !(fish[1] < -500 - fish[3] && fish[5] < 0)
                        ? (fish[1] += fish[5])
                        : createFish(fishSet, fish, 1)
                     : createFish(fishSet, fish, -1);
                  fish[6] =
                     sin(((fishTime % fish[9]) / fish[9]) * 2 * pi) * fish[8];
                  fish[7] =
                     ((cos(((fishTime % fish[9]) / fish[9]) * 2 * pi) *
                        pi *
                        fish[8]) /
                        fish[4] /
                        10) *
                     (fish[5] < 0 ? -1 : 1);
               }
            }

            fishCtx.save();
            fishCtx.translate(fish[1] + 500, fish[2] + fish[6] + 200);
            fishCtx.rotate(fish[7]);
            if (fish[5] > 0) fishCtx.scale(-1, 1);
            fishCtx.globalAlpha = fish[10];
            fishCtx.drawImage(
               fishRender,
               0,
               0,
               fishRender.width,
               fishRender.height,
               -2,
               -fish[4] / 2,
               fish[3],
               fish[4]
            );

            fishCtx.restore();
         }
         maskCtx.clearRect(0, 0, 1000, 1800);

         maskCtx.globalCompositeOperation = "source-out";
         maskCtx.fillStyle = maskGradientA;
         maskCtx.fillRect(0, 0, 1000, 1800);
         maskCtx.globalCompositeOperation = "destination-out";
         maskCtx.fillStyle = maskCtx.createRadialGradient(
            500 + x,
            y,
            0,
            500 + x,
            y,
            100
         );
         maskCtx.fillStyle.addColorStop(0, "#F00");
         maskCtx.fillStyle.addColorStop(1, "#0000");
         maskCtx.fillRect(0, 0, 1000, 1800);

         mapTime += 0.01;
         if (mapTime >= 1) mapTime = 0;

         ctx.clearRect(0, 0, 2000, 4000);
         ctx.save();
         ctx.translate(screenX, screenY + 150);
         ctx.drawImage(sun, 0, -200);
         ctx.drawImage(cloudA, cloudApos, -200);
         ctx.drawImage(cloudB, cloudBpos, -200);
         ctx.drawImage(ground, 0, 1500);
         ctx.save();
         ctx.translate(boatX + 465, -20);
         ctx.drawImage(boat, -115, -30);
         ctx.rotate(rodAngle + holdAngle);
         ctx.drawImage(rod, -5, -35);
         ctx.strokeStyle = "rgb(" + (255 * strain) / maxStrain + ", 0, 0)";
         ctx.beginPath();
         ctx.moveTo(35, -35);
         ctx.rotate(-holdAngle);
         ctx.translate(35, -35);
         ctx.rotate(swingAngle);
         ctx.lineTo(bobberX - boatX, bobberY + 51);
         ctx.moveTo(bobberX - boatX, bobberY + 51);
         ctx.lineTo(x - boatX, y + 55);
         ctx.stroke();
         ctx.drawImage(hook, hookX - boatX - 2, hookY + 53);
         ctx.save();
         ctx.translate(bobberX - boatX, bobberY + 51);
         ctx.rotate(bobberAngle);
         ctx.drawImage(bobber, -4, -8);
         ctx.restore();
         ctx.restore();
         ctx.drawImage(fishCanvas, 0, -200);
         ctx.drawImage(land, 0, -25);
         ctx.drawImage(ocean, 0, 0);
         ctx.drawImage(mask, 0, 0);
         ctx.restore();
      },
   };
}

const g = game();

function gameLoop() {
   g.updateDraw();
   return window.requestAnimationFrame(gameLoop);
}

window.requestAnimationFrame(gameLoop);
