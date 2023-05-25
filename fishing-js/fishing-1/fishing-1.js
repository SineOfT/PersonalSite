const abs = Math.abs;

const canvas = document.getElementById("gameScreen");
const covcvs = document.getElementById("cover");
const mapcvs = document.getElementById("map");

const lockBtn = document.getElementById("lock-button");

const ctx = canvas.getContext("2d");
const covctx = covcvs.getContext("2d");
const mapctx = mapcvs.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

covcvs.width = canvas.width;
covcvs.height = canvas.height;

let randNum = Math.floor(Math.random() * 5);

function onArrowLeftDown(object) {
   object.MoveLeft();
}

function onArrowRightDown(object) {
   object.MoveRight();
}

function onArrowUpDown(object) {
   object.MoveUp();
}

function onSpaceDown(object) {
   if (game.surface) {
      if (object.cast === 0) object.cast = 1;
   } else if (game.underwater) {
      object.pullUp = true;
   }
}

function lock(object) {
   if (!object.lock) {
      object.lock = true;
      object.speed.y = 0;
   } else {
      object.lock = false;
      object.speed.y = object.gravity;
   }
}

function onArrowLeftUp(object) {
   if (object.speed.x < 0) object.StopX();
}
function onArrowRightUp(object) {
   if (object.speed.x > 0) object.StopX();
}

function onArrowUpUp(object) {
   if (object.speed.y < 0) {
      if (!object.lock) {
         object.StopGrav();
      } else {
         object.StopY();
      }
   }
}

function onSpaceUp(object) {
   if (game.surface) {
      if (object.cast === 1) object.cast = 2;
   } else if (game.underwater) {
      object.pullUp = false;
      object.letDown = true;
   }
}

class InputHandler {
   constructor(object) {
      document.addEventListener("keydown", (event) => {
         switch (event.key) {
            case "ArrowLeft":
               onArrowLeftDown(object);
               break;

            case "ArrowRight":
               onArrowRightDown(object);
               break;

            case "ArrowUp":
               onArrowUpDown(object);
               break;

            case " ":
               onSpaceDown(object);
               break;

            case "z":
               lock(object);
               break;

            case "Enter":
               object.ZoomIn();
               break;
         }
      });

      document.addEventListener("keyup", (event) => {
         switch (event.key) {
            case "ArrowLeft":
               onArrowLeftUp(object);
               break;

            case "ArrowRight":
               onArrowRightUp(object);
               break;

            case "ArrowUp":
               onArrowUpUp(object);
               break;

            case " ":
               onSpaceUp(object);
               break;

            case "Enter":
               object.ZoomOut();
               break;
         }
      });

      gameScreen.addEventListener("mousedown", (event) => {
         let px = (event.clientX / window.innerWidth) * 2 - 1;
         let py = (event.clientY / window.innerHeight) * 2 - 1;
         if (px > -0.5 && px < 0.5 && py > -0.5 && py < 0.5) {
            onSpaceDown(object);
         } else if (px < -abs(py)) {
            onArrowLeftDown(object);
         } else if (px > abs(py)) {
            onArrowRightDown(object);
         } else if (py < -abs(px)) {
            onArrowUpDown(object);
         }
      });

      gameScreen.addEventListener("mouseup", (event) => {
         let px = (event.clientX / window.innerWidth) * 2 - 1;
         let py = (event.clientY / window.innerHeight) * 2 - 1;
         if (px > -0.5 && px < 0.5 && py > -0.5 && py < 0.5) {
            onSpaceUp(object);
         } else if (px < -abs(py)) {
            onArrowLeftUp(object);
         } else if (px > abs(py)) {
            onArrowRightUp(object);
         } else if (py < -abs(px)) {
            onArrowUpUp(object);
         }
      });

      mapcvs.addEventListener("click", () => {
         map.scale === 1 ? object.ZoomIn() : object.ZoomOut();
      });

      lockBtn.addEventListener("click", () => lock(object));
   }
}

class Character {
   constructor() {
      this.gameWidth = canvas.width;
      this.gameHeight = canvas.height;

      if (canvas.width < canvas.height) {
         this.shorter = this.gameWidth;
         this.longer = this.gameHeight;
      } else {
         this.shorter = this.gameHeight;
         this.longer = this.gameWidth;
      }

      this.rod = {
         width: this.shorter * 0.25,
         height: this.shorter * 0.25,
      };

      this.boat = {
         width: this.shorter * 0.35,
         height: this.shorter * 0.1,
         position: { x: 0, y: 0 },
      };

      this.bait = {
         radius: this.shorter * 0.02,
         position: { x: 0, y: 0 },
      };

      this.suf = {
         height: this.gameHeight,
      };

      this.water = {
         width: this.longer * 2,
         height: this.longer * 2,
      };

      this.floor = {
         height: this.gameHeight / 8,
      };

      this.gravity = this.shorter / 300;

      this.moveLeft = false;
      this.moveRight = false;
      this.moveUp = false;
      this.move = false;

      this.pullBack = false;
      this.cast = false;

      this.position = {
         x: 0,
         y: -(this.gameHeight / 3 + this.gravity * 48),
      };

      this.facing = this.boat.width / 2;
      this.baitPos = { x: 0, y: 0 };

      this.movement = { x: 0, y: 0 };
      this.acceleration = this.shorter / 2500;

      this.speed = { x: 0, y: this.gravity };
      this.maxSpeed = this.shorter / 250;

      this.delay = {
         arr: { x: [], y: [] },
         speed: { x: 0, y: 0 },
         num: { x: 0, y: 0 },
         maxNum: { x: 30, y: 10 },
      };

      for (let i = 0; i < this.delay.maxNum.x; i++) {
         this.delay.arr.x.push(0);
      }
      for (let i = 0; i < this.delay.maxNum.y; i++) {
         this.delay.arr.y.push(0);
      }

      this.line = {
         width: this.shorter / 500,
         depth: this.gravity,
         rotate: 0,
      };

      this.rotate = 0;
      this.angle = 0;
      this.maxAngle = 0.05;

      this.pullBack = false;
      this.cast = 0;

      this.pullUp = false;
      this.letDown = false;
      this.success = false;
      this.fail = false;
      this.catch = false;

      this.reel = -this.gravity * 3;
      this.accuracy = this.shorter / 20;
      this.close = this.shorter / 5;
      this.sight = this.shorter / 2;

      this.closest = 0;

      this.fish = {
         target: undefined,
         angle: 0,
         maxAngle: 0.15,
         prefAngle: 0,
      };

      this.trash = { target: undefined };
      this.scare = { target: [] };

      this.interest = false;

      this.i = 0;
      this.j = 0;
      this.k = 0;
      this.l = 0;
   }

   MoveLeft() {
      this.speed.x = -this.maxSpeed;
   }
   MoveRight() {
      this.speed.x = this.maxSpeed;
   }
   MoveUp() {
      this.speed.y = -this.maxSpeed;
   }

   StopX() {
      this.speed.x = 0;
   }
   StopY() {
      this.speed.y = 0;
   }
   StopGrav() {
      this.speed.y = this.gravity;
   }

   PullBack() {
      this.angle = this.maxAngle;
   }
   Release() {
      this.angle = -this.maxAngle;
   }

   MovementBoat() {
      if (
         this.boat.position.x <=
            -(this.water.width / 2 - this.rod.width + this.bait.radius) &&
         this.speed.x < 0
      ) {
         this.boat.position.x = -(
            this.water.width / 2 -
            this.rod.width +
            this.bait.radius
         );
      } else if (
         this.boat.position.x >=
            this.water.width / 2 - this.rod.width + this.bait.radius &&
         this.speed.x > 0
      ) {
         this.boat.position.x =
            this.water.width / 2 - this.rod.width + this.bait.radius;
      } else {
         this.boat.position.x += this.speed.x;
      }
   }

   MovementGrav() {
      this.baitPos.x += this.delay.arr.x[0];
      this.baitPos.y += this.delay.arr.y[0];

      this.delay.num.x = Math.round(
         this.delay.maxNum.x * (this.baitPos.y / this.water.height)
      );

      for (let i = this.delay.num.x; i > 0; i--) {
         this.delay.arr.x[i] = this.delay.arr.x[i - 1];
      }

      this.delay.num.y = Math.round(
         this.delay.maxNum.y * (this.baitPos.y / this.water.height)
      );

      for (let i = this.delay.num.y; i > 0; i--) {
         this.delay.arr.y[i] = this.delay.arr.y[i - 1];
      }

      this.delay.arr.x[0] =
         (this.boat.position.x - this.baitPos.x + this.facing) /
         ((this.baitPos.y + 15) / 15);
      this.delay.speed.x = this.delay.arr.x[this.delay.num.x];

      this.delay.arr.y[0] = (this.boat.position.y - this.baitPos.y) / 15;
      this.delay.speed.y = this.delay.arr.y[this.delay.num.y];

      if (
         this.position.x <= -(this.water.width / 2 - this.bait.radius) &&
         this.delay.speed.x < 0
      ) {
         this.position.x = -(this.water.width / 2 - this.bait.radius);
      } else if (
         this.position.x >= this.water.width / 2 - this.bait.radius &&
         this.delay.speed.x > 0
      ) {
         this.position.x = this.water.width / 2 - this.bait.radius;
      } else {
         this.position.x += this.delay.speed.x;
      }

      if (
         this.boat.position.x <=
            -(this.water.width / 2 - this.boat.width / 2) &&
         this.speed.x < 0
      ) {
         this.boat.position.x = -(this.water.width / 2 - this.boat.width / 2);
      } else if (
         this.boat.position.x >= this.water.width / 2 - this.boat.width / 2 &&
         this.speed.x > 0
      ) {
         this.boat.position.x = this.water.width / 2 - this.boat.width / 2;
      } else {
         this.boat.position.x += this.speed.x;
      }

      if (this.position.y <= -this.bait.radius) {
         game.transition = true;
      } else if (
         this.position.y >= this.water.height - this.bait.radius &&
         this.delay.speed.y > 0
      ) {
         this.position.y = this.water.height - this.bait.radius;
         this.line.rotate = Math.atan(
            (this.boat.position.x - this.position.x + this.facing) /
               this.position.y
         );
         this.line.depth = this.position.y / Math.cos(this.line.rotate);
      } else {
         this.line.depth += this.delay.speed.y;
         this.line.rotate = Math.asin(
            (this.boat.position.x - this.position.x + this.facing) /
               this.line.depth
         );
         this.position.y = Math.cos(this.line.rotate) * this.line.depth;
      }

      if (this.boat.position.y <= -this.bait.radius && this.speed.y < 0) {
         this.boat.position.y = -this.bait.radius;
      } else if (
         this.boat.position.y >= this.water.height - this.bait.radius &&
         this.speed.y > 0
      ) {
         this.boat.position.y = this.water.height - this.bait.radius;
      } else {
         this.boat.position.y += this.speed.y;
      }
   }

   MovementFish() {
      if (
         this.position.x <= -(this.water.width / 2 + this.bait.radius) ||
         this.position.x >= this.water.width / 2 + this.bait.radius ||
         this.position.y >= this.water.height + this.bait.radius
      ) {
         this.fail = true;
      } else if (this.position.y <= -this.bait.radius) {
         game.transition = true;
      } else {
         this.position.x += this.speed.x;
         this.position.y += this.speed.y;
      }

      if (
         this.boat.position.x <=
            -(this.water.width / 2 - this.boat.width / 2) &&
         this.speed.x < 0
      ) {
         this.boat.position.x = -(this.water.width / 2 - this.boat.width / 2);
      } else if (
         this.boat.position.x >= this.water.width / 2 - this.boat.width / 2 &&
         this.speed.x > 0
      ) {
         this.boat.position.x = this.water.width / 2 - this.boat.width / 2;
      } else {
         this.boat.position.x += this.speed.x;
      }

      if (this.fish.target.movement < 0) {
         this.fish.target.rotate = this.fish.angle;
      } else {
         this.fish.target.rotate = -this.fish.angle;
      }

      this.position.x +=
         Math.sin(
            this.fish.target.rotate +
               (Math.PI / 2) * Math.sign(this.fish.target.movement)
         ) * this.fish.target.speed;
      this.position.y +=
         -Math.cos(
            this.fish.target.rotate +
               (Math.PI / 2) * Math.sign(this.fish.target.movement)
         ) * this.fish.target.speed;

      this.line.rotate = Math.atan(
         (this.boat.position.x - this.position.x + this.facing) /
            this.position.y
      );
      this.line.depth = this.position.y / Math.cos(this.line.rotate);

      this.fish.target.posX =
         this.position.x +
         this.water.width / 2 -
         (this.fish.target.width / 2) * Math.sign(this.fish.target.movement);
      this.fish.target.posY = this.position.y;
   }

   Cast() {
      if (this.cast === 1) {
         this.PullBack();

         if (this.rotate >= Math.PI / 2 && this.angle > 0) {
            this.rotate = Math.PI / 2;
            this.pullBack = true;
         } else {
            this.rotate += this.angle;
         }
      }

      if (this.cast === 2) {
         this.Release();

         if (this.rotate <= 0 && this.angle < 0) {
            this.rotate = 0;

            if (this.pullBack) {
               this.cast = 3;

               if (
                  this.boat.position.x <
                  -(this.water.width - this.gameWidth) / 2
               )
                  this.facing = this.boat.width / 2;
               if (this.boat.position.x > this.water.width - this.gameWidth / 2)
                  this.facing = -this.boat.width / 2;
            } else {
               this.cast = 0;
            }
         } else {
            this.rotate += this.angle;
         }
      }

      if (this.cast === 3 && this.pullBack) {
         if (this.bait.position.y > -(this.rod.height + this.boat.height / 2)) {
            this.bait.position.y += this.movement.y;
            this.movement.y -= this.acceleration;

            this.line.depth += this.gravity * 3;
            this.line.rotate = Math.acos(
               -this.bait.position.y / this.line.depth
            );

            this.bait.position.x = Math.sin(this.line.rotate) * this.line.depth;
         } else {
            this.cast = 4;
         }
      }

      if (this.cast === 4) {
         if (
            this.bait.position.y >
            -(this.rod.height + this.boat.height / 2 + this.gameHeight / 3)
         ) {
            this.movement.y = -this.gravity;
            this.bait.position.y += this.movement.y;

            this.line.depth += (this.gravity * 3) / 4;
            this.line.rotate = Math.acos(
               -this.bait.position.y / this.line.depth
            );

            this.bait.position.x = Math.sin(this.line.rotate) * this.line.depth;
         } else {
            this.cast = 5;
         }

         this.position.y += this.gravity;
      }

      if (this.cast === 5) {
         game.transition = true;

         this.movement.y = -this.gravity;
         this.bait.position.y += this.movement.y;

         this.line.depth += this.gravity * 0.95;
         this.line.rotate = Math.acos(-this.bait.position.y / this.line.depth);

         this.bait.position.x = Math.sin(this.line.rotate) * this.line.depth;

         this.position.y += this.gravity;
      }
   }

   Interest() {
      this.fish.target.rotate = Math.atan(
         (this.position.y - this.fish.target.posY) /
            (this.position.x -
               this.fish.target.posX -
               (this.fish.target.width / 2) *
                  Math.sign(this.fish.target.movement) +
               this.water.width / 2)
      );
      this.fish.target.move +=
         ((this.position.y - this.fish.target.posY) /
            Math.sin(this.fish.target.rotate) -
            this.fish.target.move) /
         25;
   }

   PullUp() {
      if (!this.i && !this.success) {
         if (
            this.position.x + this.water.width / 2 >
               this.fish.target.posX +
                  Math.cos(this.fish.target.rotate) * this.fish.target.move +
                  (this.fish.target.width / 2) *
                     Math.sign(this.fish.target.movement) -
                  this.accuracy &&
            this.position.x + this.water.width / 2 <
               this.fish.target.posX +
                  Math.cos(this.fish.target.rotate) * this.fish.target.move +
                  (this.fish.target.width / 2) *
                     Math.sign(this.fish.target.movement) +
                  this.accuracy &&
            this.position.y >
               this.fish.target.posY +
                  Math.sin(this.fish.target.rotate) * this.fish.target.move -
                  this.accuracy &&
            this.position.y <
               this.fish.target.posY +
                  Math.sin(this.fish.target.rotate) * this.fish.target.move +
                  this.accuracy
         ) {
            this.fish.move = 0;
            this.fish.angle = 0;
            this.fish.maxAngle = 0.15;
            this.fish.prefAngle = (Math.random() * 2 - 1) * Math.PI;
            this.catch = true;
            this.success = true;
         }
      }

      this.speed.y = 0;

      if (this.i !== 15) {
         this.line.depth += this.reel;
         this.position.x += Math.sin(this.line.rotate) * this.reel;
         this.position.y += Math.cos(this.line.rotate) * this.reel;

         this.i++;
      }
   }

   LetDown() {
      if (this.j === this.i * 3) {
         this.letDown = false;

         if (!this.lock) this.speed.y = this.gravity;

         this.i = 0;
         this.j = 0;
      } else {
         this.speed.y = 0;
         this.line.depth += this.gravity;

         this.j++;
      }
   }

   Fish() {
      for (let fish of target.pos) {
         if (
            this.position.x + this.water.width / 2 >
               fish.posX +
                  (fish.width / 2) * Math.sign(fish.movement) -
                  (this.close * 2) / 3 +
                  (this.close / 3) * Math.sign(fish.movement) &&
            this.position.x + this.water.width / 2 <
               fish.posX +
                  (fish.width / 2) * Math.sign(fish.movement) +
                  (this.close * 2) / 3 +
                  (this.close / 3) * Math.sign(fish.movement) &&
            this.position.y > fish.posY - this.close &&
            this.position.y < fish.posY + this.close
         ) {
            if (fish !== this.fish.target) fish.movement = -fish.movement * 3;
         } else if (
            this.position.x + this.water.width / 2 >
               fish.posX +
                  Math.cos(fish.rotate) * fish.move +
                  (fish.width / 2) * Math.sign(fish.movement) -
                  this.sight / 2 +
                  (this.sight / 2) * Math.sign(fish.movement) &&
            this.position.x + this.water.width / 2 <
               fish.posX +
                  Math.cos(fish.rotate) * fish.move +
                  (fish.width / 2) * Math.sign(fish.movement) +
                  this.sight / 2 +
                  (this.sight / 2) * Math.sign(fish.movement) &&
            this.position.y >
               fish.posY + Math.sin(fish.rotate) * fish.move - this.sight &&
            this.position.y <
               fish.posY + Math.sin(fish.rotate) * fish.move + this.sight
         ) {
            if (!this.interest) {
               this.interest = true;
               this.fish.target = fish;
            } else if (
               Math.sqrt(
                  Math.pow(
                     this.position.x -
                        fish.posX -
                        (fish.width / 2) * Math.sign(fish.movement),
                     2
                  ) + Math.pow(this.position.y - fish.posY, 2)
               ) <
               Math.sqrt(
                  Math.pow(
                     this.position.x -
                        this.fish.target.posX +
                        Math.cos(this.fish.target.rotate) *
                           this.fish.target.move -
                        (this.fish.target.width / 2) *
                           Math.sign(this.fish.target.movement),
                     2
                  ) +
                     Math.pow(
                        this.position.y -
                           this.fish.target.posY +
                           Math.sin(this.fish.target.rotate) *
                              this.fish.target.move,
                        2
                     )
               )
            ) {
               this.fish.target = fish;
            }
         }
      }

      if (this.fish.target && !this.success) {
         if (
            this.position.x + this.water.width / 2 <
               this.fish.target.posX +
                  Math.cos(this.fish.target.rotate) * this.fish.target.move +
                  (this.fish.target.width / 2) *
                     Math.sign(this.fish.target.movement) -
                  this.sight / 2 +
                  (this.sight / 2) * Math.sign(this.fish.target.movement) ||
            this.position.x + this.water.width / 2 >
               this.fish.target.posX +
                  Math.cos(this.fish.target.rotate) * this.fish.target.move +
                  (this.fish.target.width / 2) *
                     Math.sign(this.fish.target.movement) +
                  this.sight / 2 +
                  (this.sight / 2) * Math.sign(this.fish.target.movement) ||
            this.position.y <
               this.fish.target.posY +
                  Math.sin(this.fish.target.rotate) * this.fish.target.move -
                  this.sight ||
            this.position.y >
               this.fish.target.posY +
                  Math.sin(this.fish.target.rotate) * this.fish.target.move +
                  this.sight
         ) {
            this.interest = false;
            this.fish.target = undefined;
         }
      }

      if (!this.fail) {
         for (let trash of target.trash.pos) {
            if (
               this.position.x + this.water.width / 2 >
                  trash.posX - trash.width / 2 &&
               this.position.x + this.water.width / 2 <
                  trash.posX + trash.width / 2 &&
               this.position.y > trash.posY - trash.height / 2 &&
               this.position.y < trash.posY + trash.height / 2
            ) {
               this.trash.target = trash;
               this.fail = true;
            }
         }
      }
   }

   Catch() {
      if (!this.swing) {
         if (this.fish.angle >= Math.PI / 2) {
            this.swing = true;

            this.fish.angle = Math.PI / 2;
            this.fish.maxAngle = 0.15;
         } else {
            this.fish.angle += this.fish.maxAngle;
            this.fish.maxAngle -= this.fish.maxAngle / 30;
         }
      } else {
         if (this.k === 25) {
            this.swing = false;
            this.catch = false;

            this.k = 0;
         } else {
            this.fish.angle += this.fish.prefAngle / 25;

            this.k++;
         }
      }
   }

   Success() {
      this.fish.target.posX =
         this.position.x -
         (this.fish.target.width / 2) * Math.sign(this.fish.target.movement);
      this.fish.target.posY = this.position.y;

      this.l++;

      if (this.l === 3) {
         this.fish.angle +=
            Math.random() * this.fish.maxAngle * 2 - this.fish.maxAngle;
         this.l = 0;
      }
   }

   Fail() {
      this.line.depth += this.reel;

      this.position.x -= Math.sin(this.line.rotate) * this.reel;
      this.position.y = Math.cos(this.line.rotate) * this.line.depth;

      if (this.trash.target) {
         this.trash.target.posX = this.position.x + this.water.width / 2;
         this.trash.target.posY = this.position.y;
      }
   }

   ZoomIn() {
      map.scale = this.gameHeight / map.height;
      mapcvs.width = map.width * map.scale;
      mapcvs.height = map.height * map.scale;

      mapcvs.style.left = this.gameWidth / 2 - mapcvs.width / 2 + "px";
   }

   ZoomOut() {
      map.scale = 1;

      mapcvs.width = map.width;
      mapcvs.height = map.height;

      mapcvs.style.left = this.gameWidth - map.width + "px";
   }

   uptSuf() {
      if (
         this.cast === 0 ||
         this.cast === 1 ||
         (this.cast === 2 && !this.pullBack)
      ) {
         this.move = true;

         if (this.speed.x < 0) this.facing = -this.boat.width / 2;
         if (this.speed.x > 0) this.facing = this.boat.width / 2;

         this.MovementBoat(this.rod.width + this.bait.radius);
      } else {
         this.move = false;
      }

      this.position.x = this.boat.position.x + this.facing;

      if (this.cast) {
         this.Cast();
      }
   }

   uptWater() {
      if (!this.fail) {
         if (!this.success) {
            this.MovementGrav();
         } else {
            this.MovementFish();
         }
      }

      if (this.pullUp) this.PullUp();
      if (this.letDown) this.LetDown();

      this.Fish();

      if (this.interest) this.Interest();

      if (this.catch) this.Catch();
      if (this.success) this.Success();
      if (this.fail) this.Fail();
   }

   surface(ctx) {
      let positionX = this.boat.position.x - background.position.x;

      ctx.save();

      if (this.facing < 0) {
         positionX = -positionX;
         ctx.translate(this.gameWidth, 0);
         ctx.scale(-1, 1);
      }

      ctx.fillStyle = "rgb(255, 0, 0)";

      ctx.save();

      ctx.translate(
         positionX + this.gameWidth / 2,
         (this.gameHeight * 2) / 3 - this.boat.height / 2
      );
      ctx.scale(1, -1);
      ctx.rotate(this.rotate);

      ctx.save();

      ctx.fillStyle = "rgb(0, 0, 0)";

      ctx.translate(this.rod.width, this.rod.height);
      ctx.rotate(this.line.rotate + Math.PI);
      ctx.fillRect(0, 0, this.line.width, this.line.depth);

      ctx.restore();

      ctx.fillStyle = "rgb(255, 0, 0)";

      ctx.fillRect(0, 0, this.rod.width, this.rod.height);

      ctx.fillStyle = "rgb(255, 0, 0)";
      ctx.beginPath();
      ctx.arc(
         this.bait.position.x + this.rod.width,
         this.bait.position.y + this.rod.height,
         this.bait.radius,
         0,
         Math.PI * 2,
         true
      );
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      ctx.fillRect(
         positionX + this.gameWidth / 2 - this.boat.width / 2,
         (this.gameHeight * 2) / 3 - this.boat.height / 2,
         this.boat.width,
         this.boat.height
      );
      ctx.restore();
   }

   underwater(ctx) {
      let positionX = this.position.x - background.position.x;
      let positionY = this.position.y - background.position.y;

      ctx.fillStyle = "rgb(0, 0, 0)";

      ctx.save();

      ctx.translate(
         this.gameWidth / 2 +
            this.boat.position.x -
            background.position.x +
            this.facing,
         -background.position.y
      );
      ctx.rotate(this.line.rotate);
      ctx.fillRect(0, 0, this.line.width, this.line.depth);

      ctx.restore();

      ctx.fillStyle = "rgb(255, 0, 0)";

      ctx.beginPath();
      ctx.arc(
         this.gameWidth / 2 + positionX,
         positionY,
         this.bait.radius,
         0,
         Math.PI * 2,
         true
      );
      ctx.closePath();
      ctx.fill();
   }
}

class Background {
   constructor() {
      this.gameWidth = canvas.width;
      this.gameHeight = canvas.height;
      this.shorter = character.shorter;

      this.position = { x: 0, y: 0 };

      this.suf = {
         height: character.suf.height,
      };

      this.water = {
         width: character.water.width,
         height: character.water.height,
      };

      this.floor = {
         height: character.floor.height,
      };

      this.sun = this.shorter / 4;
      this.moon = this.shorter / 8;

      this.raindrop = {
         num: 15,
         width: this.shorter / 200,
         height: this.shorter / 25,
      };

      this.cloud = {
         num: 5,
         pos: [],
         width: this.shorter / 2,
         height: this.shorter / 4,
      };

      for (let i = 0; i < this.cloud.num; i++) {
         let random = Math.floor(Math.random() * 2) * 2 - 1;

         let cloud = {};
         cloud.posX = Math.round(
            Math.random() * (this.water.width - this.cloud.width)
         );
         cloud.posY = Math.round(
            Math.random() * ((this.gameHeight * 2) / 3 - this.cloud.height)
         );
         cloud.movement =
            (this.gameWidth / (Math.round(Math.random() * 500) + 500)) * random;

         this.cloud.pos.push(cloud);
      }

      this.star = {
         num: 100,
         pos: [],
         size: this.shorter / 200,
      };

      for (let i = 0; i < this.star.num; i++) {
         let star = {};
         star.posX = Math.round(
            Math.random() *
               ((this.water.width - this.gameWidth) / 2 +
                  this.gameWidth -
                  this.star.size) -
               (this.water.width - this.gameWidth) / 4
         );
         star.posY = Math.round(
            Math.random() * ((this.gameHeight * 2) / 3 - this.star.size)
         );

         this.star.pos.push(star);
      }

      this.plant = {
         num: 8,
         pos: [],
         coral: {
            width: this.water.width / 10,
            height: this.water.height / 10,
         },
         seaweed: {
            width: this.water.width / 50,
            height: this.water.height / 5,
         },
      };

      for (let i = 0; i < this.plant.num; i++) {
         let plant = {};
         let type = Math.floor(Math.random() * 2);

         if (type === 0) {
            plant.type = "coral";
            plant.color = "rgb(255, 127, 127)";
            plant.pos =
               (this.plant.pos.length * this.water.width) / this.plant.num +
               Math.round(
                  Math.random() *
                     (this.water.width / this.plant.num -
                        this.plant.coral.width)
               );
            plant.width = this.plant.coral.width;
            plant.height = this.plant.coral.height;
         } else if (type === 1) {
            plant.type = "seaweed";
            plant.color = "rgb(63, 255, 0)";
            plant.pos =
               (this.plant.pos.length * this.water.width) / this.plant.num +
               Math.round(
                  Math.random() *
                     (this.water.width / this.plant.num -
                        this.plant.seaweed.width)
               );
            plant.width = this.plant.seaweed.width;
            plant.height = this.plant.seaweed.height;
         }

         this.plant.pos.push(plant);
      }

      this.i = 0;
   }

   uptSuf() {
      if (character.move) {
         if (
            character.boat.position.x <
            -(this.water.width - this.gameWidth) / 2
         ) {
            this.position.x = -(this.water.width - this.gameWidth) / 2;
         } else if (
            character.boat.position.x >
            (this.water.width - this.gameWidth) / 2
         ) {
            this.position.x = (this.water.width - this.gameWidth) / 2;
         } else {
            this.position.x = character.boat.position.x;
         }
      }
   }

   uptWater() {
      if (
         character.position.x > -(this.water.width - this.gameWidth) / 2 &&
         character.position.x < (this.water.width - this.gameWidth) / 2
      ) {
         this.position.x = character.position.x;
      }

      if (
         character.position.y > this.gameHeight / 2 &&
         character.position.y <
            this.water.height + this.floor.height - this.gameHeight / 2
      ) {
         this.position.y = character.position.y - this.gameHeight / 2;
      }
   }

   dawn(ctx) {
      this.skygrad = ctx.createLinearGradient(
         0,
         0,
         0,
         (this.gameHeight * 2) / 3
      );
      this.skygrad.addColorStop(0, "rgb(0, 127, 255)");
      this.skygrad.addColorStop(0.7, "rgb(255, 127, 0)");
   }

   day() {
      this.skygrad = "rgb(95, 127, 255)";
   }

   dusk(ctx) {
      this.skygrad = ctx.createLinearGradient(
         0,
         0,
         0,
         (this.gameHeight * 2) / 3
      );
      this.skygrad.addColorStop(0, "rgb(0, 63, 127)");
      this.skygrad.addColorStop(1, "rgb(191, 0, 255)");
   }

   night() {
      this.skygrad = "rgb(0, 0, 63)";
   }

   rain() {
      this.skygrad = "rgb(95, 95, 255)";
   }

   surface(ctx) {
      ctx.fillStyle = this.skygrad;
      ctx.fillRect(
         -(this.water.width - this.gameWidth) / 2 - this.position.x,
         0,
         this.water.width,
         (this.suf.height * 2) / 3
      );

      ctx.fillStyle = "rgb(63, 63, 255)";
      ctx.fillRect(
         -(this.water.width - this.gameWidth) / 2 - this.position.x,
         (this.gameHeight * 2) / 3,
         this.water.width,
         this.suf.height / 3
      );

      if (randNum === 2) {
         ctx.fillStyle = "rgb(255, 255, 255)";

         for (let star of this.star.pos) {
            ctx.fillRect(
               star.posX - this.position.x / 2,
               star.posY - this.gameHeight / 3,
               this.star.size,
               this.star.size
            );
         }
      }

      if (randNum === 0 || randNum === 1 || randNum === 2) {
         ctx.fillStyle = "rgb(255, 255, 63)";

         ctx.beginPath();
         ctx.arc(
            this.gameWidth / 2 - this.position.x / 5,
            (this.gameHeight * 2) / 3,
            this.sun,
            0,
            Math.PI,
            true
         );
         ctx.closePath();
         ctx.fill();

         ctx.fillStyle = "rgb(255, 255, 255)";

         for (let cloud of this.cloud.pos) {
            cloud.posX += cloud.movement;

            if (
               (cloud.posX <= -this.cloud.width && cloud.movement < 0) ||
               (cloud.posX >= this.water.width && cloud.movement > 0)
            ) {
               cloud.posY = Math.round(
                  Math.random() *
                     ((this.gameHeight * 2) / 3 - this.cloud.height)
               );

               if (cloud.movement < 0) {
                  cloud.movement = Math.round(Math.random() * 20) / 10 + 1;
               } else if (cloud.movement > 0) {
                  cloud.movement = Math.round(Math.random() * -20) / 10 - 1;
               }
            }

            ctx.fillRect(
               cloud.posX -
                  (this.water.width - this.gameWidth) / 2 -
                  this.position.x,
               cloud.posY,
               this.cloud.width,
               this.cloud.height
            );
         }
      }

      if (randNum === 3) {
         ctx.fillStyle = "rgb(255, 255, 255)";

         for (let star of this.star.pos) {
            ctx.fillRect(
               star.posX - this.position.x / 2,
               star.posY,
               this.star.size,
               this.star.size
            );
         }

         ctx.fillStyle = "rgb(255, 255, 127)";

         ctx.beginPath();
         ctx.arc(
            (this.gameWidth * 3) / 4 - this.position.x / 5,
            this.gameHeight / 4,
            this.moon,
            0,
            Math.PI * 2,
            true
         );
         ctx.closePath();
         ctx.fill();
      }

      if (randNum === 4) {
         ctx.fillStyle = "rgb(0, 0, 255)";

         for (let i = 0; i < this.raindrop.num; i++) {
            ctx.fillRect(
               Math.round(
                  Math.random() * (this.gameWidth - this.raindrop.width)
               ),
               Math.round(
                  Math.random() *
                     ((this.gameHeight * 2) / 3 - this.raindrop.height)
               ),
               this.raindrop.width,
               this.raindrop.height
            );
         }
      }
   }

   underwater(ctx) {
      ctx.fillStyle = "rgb(63, 63, 255)";
      ctx.fillRect(
         -(this.water.width - this.gameWidth) / 2 - this.position.x,
         -this.position.y,
         this.water.width,
         this.water.height
      );

      ctx.fillStyle = "rgb(255, 191, 127)";
      ctx.fillRect(
         -(this.water.width - this.gameWidth) / 2 - this.position.x,
         this.water.height - this.position.y,
         this.water.width,
         this.floor.height
      );

      for (let plant of this.plant.pos) {
         ctx.fillStyle = plant.color;
         ctx.fillRect(
            plant.pos -
               (this.water.width - this.gameWidth) / 2 -
               this.position.x,
            this.water.height - plant.height - this.position.y,
            plant.width,
            plant.height
         );
      }
   }
}

class Target {
   constructor() {
      this.gameWidth = canvas.width;
      this.gameHeight = canvas.height;

      this.position = { x: 0, y: 0 };

      this.water = {
         width: character.water.width,
         height: character.water.height,
      };

      this.floor = {
         height: character.floor.height,
      };

      this.pos = [];

      this.small = {
         width: this.water.width / 30,
         height: this.water.width / 100,

         type: ["mackeral"],

         num: 30,
         pos: [],
      };

      this.medium = {
         width: this.water.width / 30,
         height: this.water.width / 60,

         type: [""],

         num: 20,
         pos: [],
      };

      this.large = {
         width: this.water.width / 15,
         height: this.water.width / 30,

         type: [""],

         num: 10,
         pos: [],
      };

      this.ground = {
         width: this.water.width / 30,
         height: this.water.width / 100,

         type: [""],

         num: 10,
         pos: [],
      };

      this.clownfish = {
         width: this.water.width / 60,
         height: this.water.width / 100,

         num: 5,
         pos: [],
      };

      this.trash = {
         width: this.water.width / 60,
         height: this.water.width / 60,

         type: [""],

         num: 20,
         pos: [],
      };

      for (let i = 0; i < this.small.num; i++) {
         let random = Math.floor(Math.random() * 2) * 2 - 1;
         let fish = {};

         fish.width = this.small.width;
         fish.height = this.small.height;
         fish.type = this.small.type[Math.floor(Math.random())];
         fish.posX = Math.round(Math.random() * this.water.width);
         fish.posY = Math.round(
            Math.random() * (this.water.height / 2 - fish.height) +
               fish.height / 2
         );
         fish.movement =
            Math.round(Math.random() * (this.water.width / 1000) + 1) * random;
         fish.rotate = 0;
         fish.move = 0;
         fish.speed = this.water.width / 2000;

         this.small.pos.push(fish);
         this.pos.push(fish);
      }

      for (let i = 0; i < this.medium.num; i++) {
         let random = Math.floor(Math.random() * 2) * 2 - 1;
         let fish = {};

         fish.width = this.medium.width;
         fish.height = this.medium.height;
         fish.type = this.medium.type[Math.floor(Math.random())];
         fish.posX = Math.round(Math.random() * this.water.width);
         fish.posY = Math.round(
            Math.random() * (this.water.height / 2 - fish.height) +
               this.water.width / 4 +
               fish.height / 2
         );
         fish.movement =
            Math.round(Math.random() * (this.water.width / 750) + 1) * random;
         fish.rotate = 0;
         fish.move = 0;
         fish.speed = this.water.width / 1000;

         this.medium.pos.push(fish);
         this.pos.push(fish);
      }

      for (let i = 0; i < this.large.num; i++) {
         let random = Math.floor(Math.random() * 2) * 2 - 1;
         let fish = {};

         fish.width = this.large.width;
         fish.height = this.large.height;
         fish.type = this.large.type[Math.floor(Math.random())];
         fish.posX = Math.round(Math.random() * this.water.width);
         fish.posY = Math.round(
            Math.random() * (this.water.height / 2 - fish.height) +
               this.water.width / 2 +
               fish.height / 2
         );
         fish.movement =
            Math.round(Math.random() * (this.water.width / 500) + 1) * random;
         fish.rotate = 0;
         fish.move = 0;
         fish.speed = this.water.width / 500;

         this.large.pos.push(fish);
         this.pos.push(fish);
      }

      for (let i = 0; i < this.ground.num; i++) {
         let random = Math.floor(Math.random() * 2) * 2 - 1;
         let fish = {};

         fish.width = this.ground.width;
         fish.height = this.ground.height;
         fish.type = this.ground.type[Math.floor(Math.random())];
         fish.posX = Math.round(Math.random() * this.water.width);
         fish.posY = Math.round(this.water.height - fish.height / 2);
         fish.movement =
            Math.round(Math.random() * (this.water.width / 2000) + 1) * random;
         fish.rotate = 0;
         fish.move = 0;
         fish.speed = this.water.width / 4000;

         this.ground.pos.push(fish);
         this.pos.push(fish);
      }

      for (let plant of background.plant.pos) {
         let pos = [];

         for (let i = 0; i < this.clownfish.num; i++) {
            let random = Math.floor(Math.random() * 2) * 2 - 1;
            let fish = {};

            fish.width = this.clownfish.width;
            fish.height = this.clownfish.height;
            fish.posX = Math.round(Math.random() * plant.width + plant.pos);
            fish.posY = Math.round(
               Math.random() * (plant.height - fish.height) +
                  (this.water.width - plant.height) +
                  fish.height / 2
            );
            fish.movement =
               Math.round(Math.random() * (this.water.width / 1000) + 1) *
               random;
            fish.rotate = 0;
            fish.move = 0;
            fish.speed = Math.abs(fish.movement);

            pos.push(fish);
            this.pos.push(fish);
         }

         this.clownfish.pos.push(pos);
      }

      for (let i = 0; i < this.trash.num; i++) {
         let random = Math.floor(Math.random() * 2) * 2 - 1;
         let fish = {};

         fish.width = this.trash.width;
         fish.height = this.trash.height;
         fish.type = this.trash.type[Math.floor(Math.random())];
         fish.posX = Math.round(
            Math.random() * (this.water.width + fish.width) - fish.width / 2
         );
         fish.posY = Math.round(
            Math.random() * ((this.water.height * 7) / 8 - fish.height) +
               this.water.height / 8 +
               fish.height / 2
         );
         fish.movement =
            Math.round(Math.random() * (this.water.width / 750) + 1) * random;

         this.trash.pos.push(fish);
      }
   }

   update() {
      this.position.x = background.position.x;

      if (
         character.position.y > this.gameHeight / 2 &&
         character.position.y <
            this.water.height + this.floor.height - this.gameHeight / 2
      ) {
         this.position.y = character.position.y - this.gameHeight / 2;
      }

      for (let fish of this.small.pos) {
         if (fish !== character.fish.target) {
            fish.posX += fish.movement;

            if (
               (fish.posX <= -fish.width / 2 && fish.movement < 0) ||
               (fish.posX >= this.water.width + fish.width / 2 &&
                  fish.movement > 0)
            ) {
               fish.posY = Math.round(
                  Math.random() * (this.water.height / 2 - fish.height) +
                     fish.height / 2
               );

               fish.movement =
                  -Math.round(Math.random() * (this.water.width / 1000) + 1) *
                  Math.sign(fish.movement);
            }
         }
      }

      for (let fish of this.medium.pos) {
         if (fish !== character.fish.target) {
            fish.posX += fish.movement;

            if (
               (fish.posX <= -fish.width / 2 && fish.movement < 0) ||
               (fish.posX >= this.water.width + fish.width / 2 &&
                  fish.movement > 0)
            ) {
               fish.posY = Math.round(
                  Math.random() * (this.water.height / 2 - fish.height) +
                     this.water.height / 4 +
                     fish.height / 2
               );

               fish.movement =
                  -Math.round(Math.random() * (this.water.width / 750) + 1) *
                  Math.sign(fish.movement);
            }
         }
      }

      for (let fish of this.large.pos) {
         if (fish !== character.fish.target) {
            fish.posX += fish.movement;

            if (
               (fish.posX <= -fish.width / 2 && fish.movement < 0) ||
               (fish.posX >= this.water.width + fish.width / 2 &&
                  fish.movement > 0)
            ) {
               fish.posY = Math.round(
                  Math.random() * (this.water.height / 2 - fish.height) +
                     this.water.height / 2 +
                     fish.height / 2
               );

               fish.movement =
                  -Math.round(Math.random() * (this.water.width / 500) + 1) *
                  Math.sign(fish.movement);
            }
         }
      }

      for (let fish of this.ground.pos) {
         if (fish !== character.fish.target) {
            fish.posX += fish.movement;

            if (
               (fish.posX <= -fish.width / 2 && fish.movement < 0) ||
               (fish.posX >= this.water.width + fish.width / 2 &&
                  fish.movement > 0)
            ) {
               fish.movement =
                  -Math.round(Math.random() * (this.water.width / 2000) + 1) *
                  Math.sign(fish.movement);
            }
         }
      }

      for (let i in this.clownfish.pos) {
         for (let fish of this.clownfish.pos[i]) {
            if (fish !== character.fish.target) {
               fish.posX += fish.movement;

               if (fish.posX <= background.plant.pos[i].pos) {
                  fish.movement += fish.speed / 25;
               } else if (
                  fish.posX >=
                  background.plant.pos[i].pos + background.plant.pos[i].width
               ) {
                  fish.movement += -fish.speed / 25;
               }
            }
         }
      }

      for (let trash of this.trash.pos) {
         if (trash !== character.trash.target) {
            trash.posX += trash.movement;

            if (
               (trash.posX <= -trash.width / 2 && trash.movement < 0) ||
               (trash.posX >= this.water.width + trash.width / 2 &&
                  trash.movement > 0)
            ) {
               trash.posY = Math.round(
                  Math.random() * ((this.water.height * 7) / 8 - trash.height) +
                     this.water.height / 8 +
                     trash.height / 2
               );

               trash.movement =
                  -Math.round(Math.random() * (this.water.width / 750) + 1) *
                  Math.sign(trash.movement);
            }
         }
      }
   }

   draw(ctx) {
      ctx.fillStyle = "rgb(255, 0, 0)";

      for (let fish of this.pos) {
         ctx.save();

         ctx.translate(
            fish.posX -
               this.position.x -
               (this.water.width - this.gameWidth) / 2 +
               (fish.width / 2) * Math.sign(fish.movement),
            fish.posY - this.position.y
         );
         ctx.rotate(fish.rotate);

         ctx.fillRect(
            -fish.width / 2 -
               (fish.width / 2) * Math.sign(fish.movement) +
               fish.move,
            -fish.height / 2,
            fish.width,
            fish.height
         );

         ctx.restore();
      }

      ctx.fillStyle = "rgb(0, 255, 0)";

      for (let trash of this.trash.pos) {
         ctx.fillRect(
            trash.posX -
               this.position.x -
               (this.water.width - this.gameWidth) / 2 -
               trash.width / 2,
            trash.posY - this.position.y - trash.height / 2,
            trash.width,
            trash.height
         );
      }
   }
}

class Map {
   constructor() {
      this.gameWidth = canvas.width;
      this.gameHeight = canvas.height;

      this.position = { x: 0 };

      this.scale = 1;

      this.boat = {
         width: character.boat.width / 10,
         height: character.boat.height / 10,
      };

      this.rod = {
         width: character.rod.width / 10,
         height: character.rod.height / 10,
      };

      this.bait = {
         radius: character.bait.radius / 10,
      };

      this.suf = {
         height: background.suf.height / 10,
      };

      this.space = {
         height: character.gravity * 4.8,
      };

      this.water = {
         width: background.water.width / 10,
         height: background.water.height / 10,
      };

      this.floor = {
         height: background.floor.height / 10,
      };

      this.width = this.water.width;
      this.height =
         this.suf.height +
         this.space.height +
         this.water.height +
         this.floor.height;

      mapcvs.width = this.width;
      mapcvs.height = this.height;

      this.shine = this.bait.radius / 8;

      mapcvs.style.left = this.gameWidth - this.width + "px";

      this.gravity = this.gameHeight / 3000;
      this.speed = { x: 0, y: this.gravity };
      this.maxSpeed = this.gameWidth / 5000;

      this.facing = this.boat.width / 2;

      this.flashing = 0;

      this.i = true;
   }

   draw(mapctx) {
      if (character.speed.x < 0)
         this.facing = (-this.boat.width / 2) * this.scale;
      if (character.speed.x > 0)
         this.facing = (this.boat.width / 2) * this.scale;

      if (!this.i) {
         this.flashing -= 0.03;
         if (this.flashing <= 0.01) this.i = true;
      } else if (this.i) {
         this.flashing += 0.03;
         if (this.flashing >= 1) this.i = false;
      }

      mapctx.fillStyle = "rgba(127, 127, 127, 0.25)";
      mapctx.fillRect(0, 0, this.width * this.scale, this.height * this.scale);

      mapctx.fillRect(
         0,
         ((this.suf.height * 2) / 3) * this.scale,
         this.width * this.scale,
         (this.height - (this.suf.height * 2) / 3) * this.scale
      );

      mapctx.fillRect(
         0,
         (this.height - this.floor.height) * this.scale,
         this.width * this.scale,
         this.floor.height * this.scale
      );

      for (let plant of background.plant.pos) {
         mapctx.fillRect(
            (plant.pos / 10) * this.scale,
            (this.height - this.floor.height - plant.height / 10) * this.scale,
            (plant.width / 10) * this.scale,
            (plant.height / 10) * this.scale
         );
      }

      mapctx.fillStyle = "rgba(0, 255, 0, 0.5)";

      for (let fish of target.pos) {
         mapctx.save();

         if (fish === character.fish.target) mapctx.fillStyle = "rgba(0, 0, 0)";

         mapctx.translate(
            (fish.posX / 10 + (fish.width / 20) * Math.sign(fish.movement)) *
               this.scale,
            (fish.posY / 10 + this.suf.height + this.space.height) * this.scale
         );
         mapctx.rotate(fish.rotate);

         mapctx.fillRect(
            (-fish.width / 20 -
               (fish.width / 20) * Math.sign(fish.movement) +
               fish.move / 10) *
               this.scale,
            (-fish.height / 20) * this.scale,
            (fish.width / 10) * this.scale,
            (fish.height / 10) * this.scale
         );

         mapctx.restore();
      }

      mapctx.fillStyle = "rgba(255, 0, 0, 0.5)";

      for (let trash of target.trash.pos) {
         mapctx.fillRect(
            (trash.posX / 10 - trash.width / 20) * this.scale,
            (trash.posY / 10 -
               trash.height / 20 +
               this.suf.height +
               this.space.height) *
               this.scale,
            (trash.width / 10) * this.scale,
            (trash.height / 10) * this.scale
         );
      }

      mapctx.fillStyle = "rgba(255, 0, 0, 0.75)";

      if (
         character.boat.position.x / 10 <
         -(this.width / 2 - this.bait.radius - this.boat.width / 2)
      ) {
         this.position.x =
            -(this.width / 2 - this.bait.radius - this.boat.width / 2) *
            this.scale;
      } else if (
         character.boat.position.x / 10 >
         this.width / 2 - this.bait.radius - this.boat.width / 2
      ) {
         this.position.x =
            (this.width / 2 - this.bait.radius - this.boat.width / 2) *
            this.scale;
      } else {
         this.position.x = character.boat.position.x / 10;
      }

      mapctx.fillRect(
         (this.width / 2 - this.boat.width / 2 + this.position.x) * this.scale,
         ((this.suf.height * 2) / 3 - this.boat.height / 2) * this.scale,
         this.boat.width * this.scale,
         this.boat.height * this.scale
      );

      mapctx.save();

      mapctx.fillStyle = "rgb(255, 255, 255)";
      mapctx.globalAlpha = this.flashing;

      mapctx.beginPath();
      mapctx.arc(
         (character.position.x / 10 + this.width / 2) * this.scale,
         (character.position.y / 10 + this.suf.height + this.space.height) *
            this.scale,
         (this.bait.radius + this.shine) * this.scale,
         0,
         Math.PI * 2,
         true
      );
      mapctx.closePath();
      mapctx.fill();

      mapctx.restore();

      mapctx.beginPath();
      mapctx.arc(
         (character.position.x / 10 + this.width / 2) * this.scale,
         (character.position.y / 10 + this.suf.height + this.space.height) *
            this.scale,
         this.bait.radius * this.scale,
         0,
         Math.PI * 2,
         true
      );
      mapctx.closePath();
      mapctx.fill();
   }
}

class Cover {
   constructor() {
      this.gameWidth = canvas.width;
      this.gameHeight = canvas.height;

      this.fade = 0;

      this.transition = false;
   }

   draw(covctx) {
      if (!this.transition) {
         this.fade += 1 / 50;
      } else {
         this.fade -= 1 / 50;
      }

      if (this.fade >= 1) {
         this.transition = true;

         if (game.surface) {
            game.surface = false;
            game.underwater = true;

            character.pullBack = false;
            character.cast = false;
            character.position.x = character.boat.position.x + character.facing;
            character.position.y = 0;
            character.line.depth = character.gravity;
            character.baitPos.x = character.position.x;
            character.baitPos.y = character.position.y;
         } else if (game.underwater) {
            game.surface = true;
            game.underwater = false;
         }
      }

      if (this.fade <= 0) {
         this.fade = 0;
         this.transition = false;
         game.transition = false;
      }

      covctx.fillStyle = "rgb(0, 0, 0)";
      covctx.globalAlpha = this.fade;

      covctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
   }
}

class Game {
   constructor() {
      this.surface = true;
      this.underwater = false;
      this.menu = false;
      this.transition = false;
   }

   update() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (this.surface) {
         character.uptSuf();
         background.uptSuf();

         background.surface(ctx);
         character.surface(ctx);
      } else if (this.underwater) {
         character.uptWater();
         background.uptWater();

         background.underwater(ctx);
         character.underwater(ctx);
         target.draw(ctx);
      } else if (this.menu) {
      }

      if (this.transition) {
         covctx.clearRect(0, 0, canvas.width, canvas.height);
         gameCover.draw(covctx);
      }

      mapctx.clearRect(0, 0, mapcvs.width, mapcvs.height);

      target.update();
      map.draw(mapctx);
   }
}

let character = new Character();
new InputHandler(character);

let background = new Background();

let target = new Target();

let map = new Map();
let gameCover = new Cover();
let game = new Game();

switch (randNum) {
   case 0:
      background.dawn(ctx);
      break;
   case 1:
      background.day();
      break;
   case 2:
      background.dusk(ctx);
      break;
   case 3:
      background.night();
      break;
   case 4:
      background.rain();
      break;
}

function gameLoop(timestamp) {
   game.update();

   requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
