class Background {
   constructor(engine) {
      this.width = engine.shorter * 10;
      this.height = engine.shorter * 15;

      this.floor = { height: engine.shorter / 5 };

      this.pos = { x: 0, y: 0 };

      this.boat = { pos: { x: 0 } };

      this.plant = [Math.floor(Math.random() * 26)];

      for (this.i = 0; this.i < this.plant[0]; this.i++) {
         if (Math.floor(Math.random() * 2) === 0) {
            this.plant.push({
               type: "coral",
               color: "#F40",

               pos: {
                  x: (this.width - engine.shorter / 2) * (Math.random() - 0.5),
                  y: this.height - this.floor.height - engine.shorter / 2,
               },

               width: engine.shorter / 2,
               height: engine.shorter / 2,
            });
         } else {
            this.plant.push({
               type: "seaweed",
               color: "#8F8",

               pos: {
                  x: (this.width - engine.shorter / 10) * (Math.random() - 0.5),
                  y: this.height - this.floor.height - engine.shorter,
               },

               width: engine.shorter / 10,
               height: engine.shorter,
            });
         }

         if (
            this.plant.filter(
               (obj, index) =>
                  index !== 0 &&
                  index !== this.plant.length - 1 &&
                  obj.pos.x + obj.width >
                     this.plant[this.plant.length - 1].pos.x &&
                  obj.pos.x <
                     this.plant[this.plant.length - 1].pos.x +
                        this.plant[this.plant.length - 1].width
            ).length !== 0
         ) {
            this.plant.pop();
         }
      }

      this.plant.shift();
   }

   update(engine) {
      if (engine.character.pos.y === engine.canvas.height / 2) {
         if (engine.character.speed.y < 0) {
            if (this.pos.y > -engine.character.speed.y) {
               this.pos.y += engine.character.speed.y;
            } else if (this.pos.y !== 0) {
               this.pos.y = 0;
            }
         } else if (engine.character.speed.y > 0) {
            if (
               this.pos.y <
               this.height - engine.canvas.height - engine.character.speed.y
            ) {
               this.pos.y += engine.character.speed.y;
            } else if (this.pos.y !== this.height - engine.canvas.height) {
               this.pos.y = this.height - engine.canvas.height;
            }
         }
      }

      engine.ctx.fillStyle = engine.ctx.createRadialGradient(
         engine.character.pos.x + engine.canvas.width / 2,
         engine.character.pos.y,
         0,
         engine.character.pos.x + engine.canvas.width / 2,
         engine.character.pos.y,
         engine.shorter / 2
      );
      engine.ctx.fillStyle.addColorStop(0, "rgb(127, 127, 255)");
      engine.ctx.fillStyle.addColorStop(
         1,
         "rgb(0, 0, " +
            (0.5 - this.pos.y / (this.height - engine.canvas.height)) * 511 +
            ")"
      );

      engine.ctx.fillRect(
         -this.pos.x + engine.canvas.width / 2 - this.width / 2,
         -this.pos.y,
         this.width,
         this.height
      );

      engine.ctx.fillStyle = engine.ctx.createRadialGradient(
         engine.character.pos.x + engine.canvas.width / 2,
         engine.character.pos.y,
         0,
         engine.character.pos.x + engine.canvas.width / 2,
         engine.character.pos.y,
         engine.shorter / 2
      );
      engine.ctx.fillStyle.addColorStop(0, "#FF8");
      engine.ctx.fillStyle.addColorStop(1, "#000");

      engine.ctx.fillRect(
         -this.pos.x + engine.canvas.width / 2 - this.width / 2,
         -this.pos.y + this.height - this.floor.height,
         this.width,
         this.floor.height
      );

      this.plant.forEach((obj) => {
         engine.ctx.fillStyle = engine.ctx.createRadialGradient(
            engine.character.pos.x + engine.canvas.width / 2,
            engine.character.pos.y,
            0,
            engine.character.pos.x + engine.canvas.width / 2,
            engine.character.pos.y,
            engine.shorter / 2
         );
         engine.ctx.fillStyle.addColorStop(0, obj.color);
         engine.ctx.fillStyle.addColorStop(1, "#000");

         engine.ctx.fillRect(
            obj.pos.x - this.pos.x + engine.canvas.width / 2,
            obj.pos.y - this.pos.y,
            obj.width,
            obj.height
         );
      });
   }
}

class Character {
   constructor(engine) {
      this.radius = engine.shorter / 100;

      this.maxSpeed = engine.shorter / 250;

      this.line = 0;

      this.pos = { x: 0, y: 0 };
      this.speed = { x: 0, y: this.maxSpeed / 2 };
      this.minSpeed = { x: 0, y: this.maxSpeed / 2 };

      this.spdUp = { up: false, down: false };
      this.spdDown = false;

      this.pullUp = false;
      this.spdPull = 0;

      this.lock = false;

      this.boat = {
         pos: { x: 0 },
         speed: { x: 0 },
      };

      this.interest = [[]];
      this.target = -1;
      this.catch = -1;
      this.chance = false;

      this.i = 0;
   }

   update(engine) {
      if (this.boat.speed.x < 0) {
         if (this.speed.x - this.maxSpeed / 60 > this.boat.speed.x) {
            this.speed.x -= this.maxSpeed / 60;
         } else {
            this.speed.x = this.boat.speed.x;
         }
      }

      if (this.boat.speed.x > 0) {
         if (this.speed.x - this.maxSpeed / 60 < this.boat.speed.x) {
            this.speed.x += this.maxSpeed / 60;
         } else {
            this.speed.x = this.boat.speed.x;
         }
      }

      if (this.spdUp.up) {
         if (this.speed.y > (-this.maxSpeed * 7) / 8) {
            this.speed.y -= this.maxSpeed / 8;
         } else {
            this.speed.y = -this.maxSpeed;
            this.spdUp.up = false;
         }
      }

      if (this.spdUp.down) {
         if (this.speed.y < (this.maxSpeed * 7) / 8) {
            this.speed.y += this.maxSpeed / 8;
         } else {
            this.speed.y = this.maxSpeed;
            this.spdUp.down = false;
         }
      }

      if (
         this.boat.speed.x === 0 &&
         this.pos.x + engine.background.pos.x !==
            engine.background.boat.pos.x + this.boat.pos.x
      ) {
         this.speed.x =
            (engine.background.boat.pos.x +
               this.boat.pos.x -
               engine.background.pos.x -
               this.pos.x) /
            120;
      }

      if (this.spdDown) {
         if (this.speed.y < -this.maxSpeed / 8 + this.minSpeed.y) {
            this.speed.y += this.maxSpeed / 8;
         } else if (this.speed.y > this.maxSpeed / 8 + this.minSpeed.y) {
            this.speed.y -= this.maxSpeed / 8;
         } else {
            this.speed.y = this.minSpeed.y;
            this.spdDown = false;
         }
      }

      if (this.lock && this.minSpeed.y !== 0) {
         this.minSpeed.y = 0;
         this.speed.y = 0;
      }

      if (!this.lock && this.minSpeed.y !== this.maxSpeed / 2) {
         this.minSpeed.y = this.maxSpeed / 2;
         this.speed.y = this.maxSpeed / 2;
      }

      if (this.speed.x !== 0) {
         if (
            Math.abs(engine.background.pos.x + this.pos.x + this.speed.x) >=
            engine.background.width / 2 - engine.canvas.width / 2
         ) {
            if (
               Math.abs(engine.background.pos.x) !==
               engine.background.width / 2 - engine.canvas.width / 2
            ) {
               engine.background.pos.x =
                  (engine.background.width / 2 - engine.canvas.width / 2) *
                  Math.sign(engine.background.pos.x);
            }

            if (Math.abs(this.pos.x + this.speed.x) > engine.canvas.width / 2) {
               if (Math.abs(this.pos.x) !== engine.canvas.width / 2) {
                  this.pos.x =
                     (engine.canvas.width / 2) * Math.sign(this.pos.x);
               }
            } else {
               this.pos.x += this.speed.x;
            }
         } else {
            engine.background.pos.x += this.speed.x;
         }
      }

      if (this.boat.speed.x !== 0) {
         if (
            Math.abs(
               engine.background.boat.pos.x +
                  this.boat.pos.x +
                  this.boat.speed.x
            ) >=
            engine.background.width / 2 - engine.canvas.width / 2
         ) {
            if (
               Math.abs(engine.background.boat.pos.x) !==
               engine.background.width / 2 - engine.canvas.width / 2
            ) {
               engine.background.boat.pos.x =
                  (engine.background.width / 2 - engine.canvas.width / 2) *
                  Math.sign(engine.background.boat.pos.x);
            }

            if (
               Math.abs(this.boat.pos.x + this.boat.speed.x) >
               engine.canvas.width / 2
            ) {
               if (Math.abs(this.boat.pos.x) !== engine.canvas.width / 2) {
                  this.boat.pos.x =
                     (engine.canvas.width / 2) * Math.sign(this.boat.pos.x);
               }
            } else {
               this.boat.pos.x += this.boat.speed.x;
            }
         } else {
            engine.background.boat.pos.x += this.boat.speed.x;
         }
      }

      if (this.speed.x !== 0 || this.speed.y !== 0) {
         if (
            Math.sqrt(
               Math.pow(this.line + this.speed.y, 2) -
                  Math.pow(
                     engine.background.boat.pos.x +
                        this.boat.pos.x -
                        engine.background.pos.x -
                        this.pos.x,
                     2
                  )
            ) <=
            engine.canvas.height / 2
         ) {
            if (engine.background.pos.y !== 0) {
               engine.background.pos.y = 0;
            }

            if (this.pos.y + this.speed.y < 0) {
               if (this.pos.y !== 0) {
                  this.pos.y = 0;
                  this.line = 0;
               }
            } else {
               this.pos.y = Math.sqrt(
                  Math.pow(this.line + this.speed.y, 2) -
                     Math.pow(
                        engine.background.boat.pos.x +
                           this.boat.pos.x -
                           engine.background.pos.x -
                           this.pos.x,
                        2
                     )
               );
               this.line += this.speed.y;
            }
         } else if (
            Math.sqrt(
               Math.pow(this.line + this.speed.y, 2) -
                  Math.pow(
                     engine.background.boat.pos.x +
                        this.boat.pos.x -
                        engine.background.pos.x -
                        this.pos.x,
                     2
                  )
            ) >
               engine.canvas.height / 2 &&
            Math.sqrt(
               Math.pow(this.line + this.speed.y, 2) -
                  Math.pow(
                     engine.background.boat.pos.x +
                        this.boat.pos.x -
                        engine.background.pos.x -
                        this.pos.x,
                     2
                  )
            ) <
               engine.background.height - engine.canvas.height / 2
         ) {
            engine.background.pos.y =
               Math.sqrt(
                  Math.pow(this.line + this.speed.y, 2) -
                     Math.pow(
                        engine.background.boat.pos.x +
                           this.boat.pos.x -
                           engine.background.pos.x -
                           this.pos.x,
                        2
                     )
               ) -
               engine.canvas.height / 2;
            this.line += this.speed.y;
         } else if (
            Math.sqrt(
               Math.pow(this.line + this.speed.y, 2) -
                  Math.pow(
                     engine.background.boat.pos.x +
                        this.boat.pos.x -
                        engine.background.pos.x -
                        this.pos.x,
                     2
                  )
            ) >=
            engine.background.height - engine.canvas.height / 2
         ) {
            if (
               engine.background.pos.y !==
               engine.background.height - engine.canvas.height
            ) {
               engine.background.pos.y =
                  engine.background.height - engine.canvas.height;
            }

            if (
               this.pos.y + this.speed.y >
               engine.canvas.height - engine.background.floor.height
            ) {
               if (
                  this.pos.y !==
                  engine.canvas.height - engine.background.floor.height
               ) {
                  this.pos.y =
                     engine.canvas.height - engine.background.floor.height;
               }
            } else {
               this.pos.y =
                  Math.sqrt(
                     Math.pow(this.line + this.speed.y, 2) -
                        Math.pow(
                           engine.background.boat.pos.x +
                              this.boat.pos.x -
                              engine.background.pos.x -
                              this.pos.x,
                           2
                        )
                  ) -
                  engine.background.height +
                  engine.canvas.height;
               this.line += this.speed.y;
            }
         }
      }

      if (this.pullUp) {
         if (this.chance) {
            this.catch = this.target;
         }

         this.speed.y = this.spdPull;

         if (this.spdPull > (-this.maxSpeed * 24) / 5) {
            this.spdPull -= this.maxSpeed / 5;
         } else {
            this.spdPull = 0;
            this.pullUp = false;
            this.speed.y = this.maxSpeed / 2;
         }
      }

      this.interest.push([]);

      engine.fish.fish
         .filter(
            (obj) =>
               obj.type !== "ground" &&
               ((obj.rotation > 0 &&
                  obj.pos.x +
                     (obj.width / 2) * Math.sign(obj.rotation) +
                     obj.speed * Math.sin(obj.rotation) <
                     engine.background.pos.x + this.pos.x + this.speed.x) ||
                  (obj.rotation < 0 &&
                     obj.pos.x +
                        (obj.width / 2) * Math.sign(obj.rotation) +
                        obj.speed * Math.sin(obj.rotation) >
                        engine.background.pos.x + this.pos.x + this.speed.x)) &&
               ((obj.pos.x +
                  (obj.width / 2) * Math.sign(obj.rotation) +
                  obj.speed * Math.sin(obj.rotation) >
                  engine.background.pos.x +
                     this.pos.x +
                     this.speed.x -
                     engine.shorter / 3 &&
                  obj.pos.x +
                     (obj.width / 2) * Math.sign(obj.rotation) +
                     obj.speed * Math.sin(obj.rotation) <
                     engine.background.pos.x +
                        this.pos.x +
                        this.speed.x +
                        engine.shorter / 3 &&
                  (Math.abs(
                     obj.pos.y +
                        (obj.height / 2) * Math.sign(obj.rotation) +
                        obj.speed * Math.cos(obj.rotation) -
                        engine.background.pos.y -
                        this.pos.y -
                        this.speed.y
                  ) *
                     3) /
                     2 <
                     Math.abs(
                        obj.pos.x +
                           (obj.width / 2) * Math.sign(obj.rotation) +
                           obj.speed * Math.sin(obj.rotation) -
                           engine.background.pos.x -
                           this.pos.x -
                           this.speed.x
                     )) ||
                  (Math.abs(
                     obj.pos.x +
                        (obj.width / 2) * Math.sign(obj.rotation) +
                        obj.speed * Math.sin(obj.rotation) -
                        engine.background.pos.x -
                        this.pos.x -
                        this.speed.x
                  ) <
                     engine.shorter / 20 &&
                     Math.abs(
                        obj.pos.y +
                           (obj.height / 2) * Math.sign(obj.rotation) +
                           obj.speed * Math.cos(obj.rotation) -
                           engine.background.pos.y -
                           this.pos.y -
                           this.speed.y
                     ) <
                        engine.shorter / 30))
         )
         .forEach((obj) => {
            this.interest[1].push(obj);

            if (!obj.wait) {
               if (Math.floor(Math.random() * 1000) === 0) {
                  if (obj.speed < this.maxSpeed * 2) obj.speed *= 2;

                  if (
                     ((obj.rotation + Math.PI) % Math.PI > Math.PI / 2 &&
                        ((obj.pos.x +
                           obj.width / 2 +
                           obj.speed * Math.sin(obj.rotation) <
                           engine.background.pos.x +
                              this.pos.x +
                              this.speed.x &&
                           obj.pos.y +
                              obj.height / 2 +
                              obj.speed * Math.cos(obj.rotation) <
                              engine.background.pos.y +
                                 this.pos.y +
                                 this.speed.y) ||
                           (obj.pos.x -
                              obj.width / 2 +
                              obj.speed * Math.sin(obj.rotation) >
                              engine.background.pos.x +
                                 this.pos.x +
                                 this.speed.x &&
                              obj.pos.y -
                                 obj.height / 2 +
                                 obj.speed * Math.cos(obj.rotation) >
                                 engine.background.pos.y +
                                    this.pos.y +
                                    this.speed.y))) ||
                     ((obj.rotation + Math.PI) % Math.PI < Math.PI / 2 &&
                        ((obj.pos.x +
                           obj.width / 2 +
                           obj.speed * Math.sin(obj.rotation) <
                           engine.background.pos.x +
                              this.pos.x +
                              this.speed.x &&
                           obj.pos.y -
                              obj.height / 2 +
                              obj.speed * Math.cos(obj.rotation) >
                              engine.background.pos.y +
                                 this.pos.y +
                                 this.speed.y) ||
                           (obj.pos.x -
                              obj.width / 2 +
                              obj.speed * Math.sin(obj.rotation) >
                              engine.background.pos.x +
                                 this.pos.x +
                                 this.speed.x &&
                              obj.pos.y +
                                 obj.height / 2 +
                                 obj.speed * Math.cos(obj.rotation) <
                                 engine.background.pos.y +
                                    this.pos.y +
                                    this.speed.y)))
                  ) {
                     obj.rotation *= -1;
                  }

                  if (
                     (Math.abs(obj.rotation) < Math.PI / 2 &&
                        obj.pos.y + obj.height / 2 <
                           engine.background.pos.y +
                              this.pos.y +
                              this.speed.y) ||
                     (Math.abs(obj.rotation) > Math.PI / 2 &&
                        obj.pos.y - obj.height / 2 >
                           engine.background.pos.y + this.pos.y + this.speed.y)
                  ) {
                     obj.rotation < 0
                        ? (obj.rotation += Math.PI)
                        : (obj.rotation -= Math.PI);
                  }
               } else {
                  obj.color = "#0F0";
                  obj.rotation = Math.atan(
                     (engine.background.pos.x + this.pos.x - obj.pos.x) /
                        (engine.background.pos.y + this.pos.y - obj.pos.y)
                  );
                  if (engine.background.pos.y + this.pos.y - obj.pos.y < 0)
                     obj.rotation < 0
                        ? (obj.rotation += Math.PI)
                        : (obj.rotation -= Math.PI);

                  if (
                     (obj.rotation > 0 &&
                        obj.pos.x +
                           obj.width / 2 +
                           obj.speed * Math.sin(obj.rotation) >=
                           engine.background.pos.x +
                              this.pos.x +
                              this.speed.x -
                              this.radius) ||
                     (obj.rotation < 0 &&
                        obj.pos.x -
                           obj.width / 2 +
                           obj.speed * Math.sin(obj.rotation) <=
                           engine.background.pos.x +
                              this.pos.x +
                              this.speed.x +
                              this.radius)
                  ) {
                     if (Math.floor(Math.random() * 3) === 0) {
                        obj.speed = 0;
                        obj.color = "#000";
                        obj.interest = false;
                        obj.wait = true;
                        obj.pos.x =
                           engine.background.pos.x +
                           this.pos.x -
                           (this.radius + obj.width / 2) *
                              Math.sin(obj.rotation);
                        obj.pos.y =
                           engine.background.pos.y +
                           this.pos.y -
                           (this.radius + obj.width / 2) *
                              Math.cos(obj.rotation);

                        this.chance = true;
                        this.target = engine.fish.fish.indexOf(obj);
                     } else {
                        obj.speed *= -1;
                        obj.interest = true;
                        obj.backSpd = Math.random() * 450 + 50;
                     }
                  }

                  if (obj.interest) {
                     obj.speed += this.maxSpeed / obj.backSpd;
                  }
               }
            } else {
               obj.nibble++;

               if (obj.nibble >= obj.eatSpd) {
                  obj.speed = this.maxSpeed;
                  obj.rotation < 0
                     ? (obj.rotation += Math.PI)
                     : (obj.rotation -= Math.PI);
                  obj.wait = false;

                  this.chance = false;
                  this.target = -1;
               }
            }
         });

      this.interest[0]
         .filter((obj) => !this.interest[1].includes(obj))
         .forEach((obj) => {
            obj.color = "#F0F";
            if (obj.speed < 0) obj.speed *= -1;
            if (obj.speed === 0) obj.speed = this.maxSpeed / 2;
            if (obj.speed < this.maxSpeed * 2) obj.speed *= 2;
            obj.rotation < 0
               ? (obj.rotation += Math.PI)
               : (obj.rotation -= Math.PI);
         });

      this.interest.shift();

      engine.ctx.strokeStyle = "#000";
      engine.ctx.lineWidth = "2px";

      engine.ctx.beginPath();
      engine.ctx.moveTo(
         engine.background.boat.pos.x +
            this.boat.pos.x -
            engine.background.pos.x +
            engine.canvas.width / 2,
         -engine.background.pos.y
      );
      engine.ctx.lineTo(this.pos.x + engine.canvas.width / 2, this.pos.y);
      engine.ctx.stroke();

      engine.ctx.fillStyle = "#F00";
      engine.ctx.beginPath();
      engine.ctx.arc(
         this.pos.x + engine.canvas.width / 2,
         this.pos.y,
         this.radius,
         0,
         Math.PI * 2
      );
      engine.ctx.fill();
   }
}

class Fish {
   constructor(engine) {
      this.fish = [
         Math.floor(Math.random() * 500),
         Math.floor(Math.random() * 250),
         Math.floor(Math.random() * 150),
         Math.floor(Math.random() * 60),
         Math.floor(Math.random() * 10),
         Math.floor(Math.random() * 30),
      ];

      for (this.i = 0; this.i < this.fish[0]; this.i++) {
         this.fish.push({
            type: "very-small",

            width: engine.shorter / 30,
            height: engine.shorter / 75,

            pos: {
               x: engine.background.width * (Math.random() - 0.5),
               y:
                  engine.background.height / 5 +
                  (engine.background.height / 5) *
                     Math.pow(Math.random() * 2 - 1, 3) *
                     (Math.floor(Math.random() * 2) * 2 - 1) +
                  engine.shorter / 2,
            },

            speed:
               (Math.random() * engine.character.maxSpeed) / 5 +
               engine.character.maxSpeed / 5,

            rotation:
               Math.floor(Math.random() * 2) * Math.PI -
               Math.PI / 2 +
               ((Math.random() * 2 - 1) * Math.PI) / 8,

            min: engine.shorter / 2,
            max: (engine.background.height * 2) / 5 + engine.shorter / 2,

            interest: false,
            wait: false,

            backSpd: 0,
            eatSpd: 50,
            nibble: 0,
         });
      }

      for (this.i = 0; this.i < this.fish[1]; this.i++) {
         this.fish.push({
            type: "small",

            width: engine.shorter / 20,
            height: engine.shorter / 50,

            pos: {
               x: engine.background.width * (Math.random() - 0.5),
               y:
                  (engine.background.height * 2) / 5 +
                  (engine.background.height / 5) *
                     Math.pow(Math.random() * 2 - 1, 3) *
                     (Math.floor(Math.random() * 2) * 2 - 1),
            },

            speed:
               (Math.random() * engine.character.maxSpeed) / 3 +
               engine.character.maxSpeed / 3,

            rotation:
               Math.floor(Math.random() * 2) * Math.PI -
               Math.PI / 2 +
               ((Math.random() * 2 - 1) * Math.PI) / 8,

            min: engine.background.height / 5,
            max: (engine.background.height * 3) / 5,

            interest: false,
            wait: false,

            backSpd: 0,
            eatSpd: 50,
            nibble: 0,
         });
      }

      for (this.i = 0; this.i < this.fish[2]; this.i++) {
         this.fish.push({
            type: "medium",

            width: engine.shorter / 10,
            height: engine.shorter / 25,

            pos: {
               x: engine.background.width * (Math.random() - 0.5),
               y:
                  (engine.background.height * 3) / 5 +
                  (engine.background.height / 5) *
                     Math.pow(Math.random() * 2 - 1, 3) *
                     (Math.floor(Math.random() * 2) * 2 - 1),
            },

            speed:
               (Math.random() * engine.character.maxSpeed) / 2 +
               engine.character.maxSpeed / 2,

            rotation:
               Math.floor(Math.random() * 2) * Math.PI -
               Math.PI / 2 +
               ((Math.random() * 2 - 1) * Math.PI) / 8,

            min: (engine.background.height * 2) / 5,
            max: (engine.background.height * 4) / 5,

            interest: false,
            wait: false,

            backSpd: 0,
            eatSpd: 50,
            nibble: 0,
         });
      }

      for (this.i = 0; this.i < this.fish[3]; this.i++) {
         this.fish.push({
            type: "large",

            width: engine.shorter / 3,
            height: engine.shorter / 7,

            pos: {
               x: engine.background.width * (Math.random() - 0.5),
               y:
                  (engine.background.height * 4) / 5 +
                  (engine.background.height / 5) *
                     Math.pow(Math.random() * 2 - 1, 3) *
                     (Math.floor(Math.random() * 2) * 2 - 1) -
                  engine.shorter / 2,
            },

            speed:
               Math.random() * engine.character.maxSpeed +
               engine.character.maxSpeed,

            rotation:
               Math.floor(Math.random() * 2) * Math.PI -
               Math.PI / 2 +
               ((Math.random() * 2 - 1) * Math.PI) / 8,

            min: (engine.background.height * 3) / 5 - engine.shorter / 2,
            max:
               engine.background.height -
               engine.background.floor.height -
               engine.shorter / 2,

            interest: false,
            wait: false,

            backSpd: 0,
            eatSpd: 50,
            nibble: 0,
         });
      }

      for (this.i = 0; this.i < this.fish[4]; this.i++) {
         this.fish.push({
            type: "very-large",

            width: engine.shorter,
            height: engine.shorter / 3,

            pos: {
               x: engine.background.width * (Math.random() - 0.5),
               y:
                  (engine.background.height * 4) / 5 +
                  (engine.background.height / 5) *
                     Math.pow(Math.random() * 2 - 1, 3) *
                     (Math.floor(Math.random() * 2) * 2 - 1) -
                  engine.shorter / 2,
            },

            speed:
               Math.random() * engine.character.maxSpeed * 2 +
               engine.character.maxSpeed * 2,

            rotation:
               Math.floor(Math.random() * 2) * Math.PI -
               Math.PI / 2 +
               ((Math.random() * 2 - 1) * Math.PI) / 8,

            min: (engine.background.height * 3) / 5 - engine.shorter / 2,
            max:
               engine.background.height -
               engine.background.floor.height -
               engine.shorter / 2,

            interest: false,
            wait: false,

            backSpd: 0,
            eatSpd: 50,
            nibble: 0,
         });
      }

      for (this.i = 0; this.i < this.fish[5]; this.i++) {
         this.fish.push({
            type: "ground",

            width: engine.shorter / 20,
            height: engine.shorter / 50,

            pos: {
               x: engine.background.width * (Math.random() - 0.5),
               y: engine.background.height - engine.background.floor.height,
            },

            speed: (Math.random() * engine.character.maxSpeed) / 10,

            rotation: Math.floor(Math.random() * 2) * Math.PI - Math.PI / 2,

            min: -Infinity,
            max: Infinity,

            interest: false,
            wait: false,

            backSpd: 0,
            eatSpd: 50,
            nibble: 0,
         });
      }

      this.fish.splice(0, 6);
   }

   update(engine) {
      this.fish.forEach((obj) => {
         obj.pos.x += Math.sin(obj.rotation) * obj.speed;
         obj.pos.y += Math.cos(obj.rotation) * obj.speed;

         if (
            Math.sign(obj.rotation) < 0 &&
            obj.pos.x < -engine.background.width / 2 - obj.width * 1.5
         ) {
            this.fish.splice(this.fish.indexOf(obj), 1);

            if (Math.floor(Math.random() * 2) === 0) {
               this.fish.push({
                  type: "very-small",

                  width: engine.shorter / 30,
                  height: engine.shorter / 75,

                  pos: {
                     x:
                        -engine.background.width / 2 -
                        (engine.shorter * 3) / 40,
                     y:
                        engine.background.height / 5 +
                        (engine.background.height / 5) *
                           Math.pow(Math.random() * 2 - 1, 3) *
                           (Math.floor(Math.random() * 2) * 2 - 1) +
                        engine.shorter / 2,
                  },

                  speed:
                     (Math.random() * engine.character.maxSpeed) / 5 +
                     engine.character.maxSpeed / 5,

                  rotation:
                     Math.PI / 2 + ((Math.random() * 2 - 1) * Math.PI) / 8,

                  min: engine.shorter / 2,
                  max: (engine.background.height * 2) / 5 + engine.shorter / 2,

                  interest: false,
                  wait: false,

                  backSpd: 0,
                  eatSpd: 50,
                  nibble: 0,
               });
            } else if (Math.floor(Math.random() * 2) === 0) {
               this.fish.push({
                  type: "small",

                  width: engine.shorter / 20,
                  height: engine.shorter / 50,

                  pos: {
                     x:
                        -engine.background.width / 2 -
                        (engine.shorter * 3) / 20,
                     y:
                        (engine.background.height * 2) / 5 +
                        (engine.background.height / 5) *
                           Math.pow(Math.random() * 2 - 1, 3) *
                           (Math.floor(Math.random() * 2) * 2 - 1),
                  },

                  speed:
                     (Math.random() * engine.character.maxSpeed) / 3 +
                     engine.character.maxSpeed / 3,

                  rotation:
                     Math.PI / 2 + ((Math.random() * 2 - 1) * Math.PI) / 8,

                  min: engine.background.height / 5,
                  max: (engine.background.height * 3) / 5,

                  interest: false,
                  wait: false,

                  backSpd: 0,
                  eatSpd: 50,
                  nibble: 0,
               });
            } else if (Math.floor(Math.random() * 5) <= 2) {
               this.fish.push({
                  type: "medium",

                  width: engine.shorter / 10,
                  height: engine.shorter / 25,

                  pos: {
                     x:
                        -engine.background.width / 2 -
                        (engine.shorter * 3) / 10,
                     y:
                        (engine.background.height * 3) / 5 +
                        (engine.background.height / 5) *
                           Math.pow(Math.random() * 2 - 1, 3) *
                           (Math.floor(Math.random() * 2) * 2 - 1),
                  },

                  speed:
                     (Math.random() * engine.character.maxSpeed) / 2 +
                     engine.character.maxSpeed / 2,

                  rotation:
                     Math.PI / 2 + ((Math.random() * 2 - 1) * Math.PI) / 8,

                  min: (engine.background.height * 2) / 5,
                  max: (engine.background.height * 4) / 5,

                  interest: false,
                  wait: false,

                  backSpd: 0,
                  eatSpd: 50,
                  nibble: 0,
               });
            } else if (Math.floor(Math.random() * 5) <= 2) {
               this.fish.push({
                  type: "large",

                  width: engine.shorter / 3,
                  height: engine.shorter / 7,

                  pos: {
                     x: -engine.background.width / 2 - (engine.shorter * 3) / 4,
                     y:
                        (engine.background.height * 4) / 5 +
                        (engine.background.height / 5) *
                           Math.pow(Math.random() * 2 - 1, 3) *
                           (Math.floor(Math.random() * 2) * 2 - 1) -
                        engine.shorter / 2,
                  },

                  speed:
                     Math.random() * engine.character.maxSpeed +
                     engine.character.maxSpeed,

                  rotation:
                     Math.PI / 2 + ((Math.random() * 2 - 1) * Math.PI) / 8,

                  min: (engine.background.height * 3) / 5 - engine.shorter / 2,
                  max:
                     engine.background.height -
                     engine.background.floor.height -
                     engine.shorter / 2,

                  interest: false,
                  wait: false,

                  backSpd: 0,
                  eatSpd: 50,
                  nibble: 0,
               });
            } else if (Math.floor(Math.random() * 4) === 0) {
               this.fish.push({
                  type: "very-large",

                  width: engine.shorter,
                  height: engine.shorter / 3,

                  pos: {
                     x: -engine.background.width / 2 - (engine.shorter * 3) / 4,
                     y:
                        (engine.background.height * 4) / 5 +
                        (engine.background.height / 5) *
                           Math.pow(Math.random() * 2 - 1, 3) *
                           (Math.floor(Math.random() * 2) * 2 - 1) -
                        engine.shorter / 2,
                  },

                  speed:
                     Math.random() * engine.character.maxSpeed * 2 +
                     engine.character.maxSpeed * 2,

                  rotation:
                     Math.PI / 2 + ((Math.random() * 2 - 1) * Math.PI) / 8,

                  min: (engine.background.height * 3) / 5 - engine.shorter / 2,
                  max:
                     engine.background.height -
                     engine.background.floor.height -
                     engine.shorter / 2,

                  interest: false,
                  wait: false,

                  backSpd: 0,
                  eatSpd: 50,
                  nibble: 0,
               });
            } else {
               this.fish.push({
                  type: "ground",

                  width: engine.shorter / 20,
                  height: engine.shorter / 50,

                  pos: {
                     x:
                        -engine.background.width / 2 -
                        (engine.shorter * 3) / 40,
                     y:
                        engine.background.height -
                        engine.background.floor.height,
                  },

                  speed: (Math.random() * engine.character.maxSpeed) / 10,

                  rotation: Math.PI / 2,

                  min: -Infinity,
                  max: Infinity,

                  interest: false,
                  wait: false,

                  backSpd: 0,
                  eatSpd: 50,
                  nibble: 0,
               });
            }
         } else if (
            Math.sign(obj.rotation) > 0 &&
            obj.pos.x > engine.background.width / 2 + obj.width * 1.5
         ) {
            this.fish.splice(this.fish.indexOf(obj), 1);

            if (Math.floor(Math.random() * 2) === 0) {
               this.fish.push({
                  type: "very-small",

                  width: engine.shorter / 30,
                  height: engine.shorter / 75,

                  pos: {
                     x: engine.background.width / 2 + (engine.shorter * 3) / 40,
                     y:
                        engine.background.height / 5 +
                        (engine.background.height / 5) *
                           Math.pow(Math.random() * 2 - 1, 3) *
                           (Math.floor(Math.random() * 2) * 2 - 1) +
                        engine.shorter / 2,
                  },

                  speed:
                     (Math.random() * engine.character.maxSpeed) / 5 +
                     engine.character.maxSpeed / 5,

                  rotation:
                     -Math.PI / 2 + ((Math.random() * 2 - 1) * Math.PI) / 8,

                  min: engine.shorter / 2,
                  max: (engine.background.height * 2) / 5 + engine.shorter / 2,

                  interest: false,
                  wait: false,

                  backSpd: 0,
                  eatSpd: 50,
                  nibble: 0,
               });
            } else if (Math.floor(Math.random() * 2) === 0) {
               this.fish.push({
                  type: "small",

                  width: engine.shorter / 20,
                  height: engine.shorter / 50,

                  pos: {
                     x: engine.background.width / 2 + (engine.shorter * 3) / 20,
                     y:
                        (engine.background.height * 2) / 5 +
                        (engine.background.height / 5) *
                           Math.pow(Math.random() * 2 - 1, 3) *
                           (Math.floor(Math.random() * 2) * 2 - 1),
                  },

                  speed:
                     (Math.random() * engine.character.maxSpeed) / 3 +
                     engine.character.maxSpeed / 3,

                  rotation:
                     -Math.PI / 2 + ((Math.random() * 2 - 1) * Math.PI) / 8,

                  min: engine.background.height / 5,
                  max: (engine.background.height * 3) / 5,

                  interest: false,
                  wait: false,

                  backSpd: 0,
                  eatSpd: 50,
                  nibble: 0,
               });
            } else if (Math.floor(Math.random() * 5) <= 2) {
               this.fish.push({
                  type: "medium",

                  width: engine.shorter / 10,
                  height: engine.shorter / 25,

                  pos: {
                     x: engine.background.width / 2 + (engine.shorter * 3) / 10,
                     y:
                        (engine.background.height * 3) / 5 +
                        (engine.background.height / 5) *
                           Math.pow(Math.random() * 2 - 1, 3) *
                           (Math.floor(Math.random() * 2) * 2 - 1),
                  },

                  speed:
                     (Math.random() * engine.character.maxSpeed) / 2 +
                     engine.character.maxSpeed / 2,

                  rotation:
                     -Math.PI / 2 + ((Math.random() * 2 - 1) * Math.PI) / 8,

                  min: (engine.background.height * 2) / 5,
                  max: (engine.background.height * 4) / 5,

                  interest: false,
                  wait: false,

                  backSpd: 0,
                  eatSpd: 50,
                  nibble: 0,
               });
            } else if (Math.floor(Math.random() * 5) <= 2) {
               this.fish.push({
                  type: "large",

                  width: engine.shorter / 3,
                  height: engine.shorter / 7,

                  pos: {
                     x: engine.background.width / 2 + (engine.shorter * 3) / 4,
                     y:
                        (engine.background.height * 4) / 5 +
                        (engine.background.height / 5) *
                           Math.pow(Math.random() * 2 - 1, 3) *
                           (Math.floor(Math.random() * 2) * 2 - 1) -
                        engine.shorter / 2,
                  },

                  speed:
                     Math.random() * engine.character.maxSpeed +
                     engine.character.maxSpeed,

                  rotation:
                     -Math.PI / 2 + ((Math.random() * 2 - 1) * Math.PI) / 8,

                  min: (engine.background.height * 3) / 5 - engine.shorter / 2,
                  max:
                     engine.background.height -
                     engine.background.floor.height -
                     engine.shorter / 2,

                  interest: false,
                  wait: false,

                  backSpd: 0,
                  eatSpd: 50,
                  nibble: 0,
               });
            } else if (Math.floor(Math.random() * 4) === 0) {
               this.fish.push({
                  type: "very-large",

                  width: engine.shorter,
                  height: engine.shorter / 3,

                  pos: {
                     x: engine.background.width / 2 + (engine.shorter * 3) / 4,
                     y:
                        (engine.background.height * 4) / 5 +
                        (engine.background.height / 5) *
                           Math.pow(Math.random() * 2 - 1, 3) *
                           (Math.floor(Math.random() * 2) * 2 - 1) -
                        engine.shorter / 2,
                  },

                  speed:
                     Math.random() * engine.character.maxSpeed * 2 +
                     engine.character.maxSpeed * 2,

                  rotation:
                     -Math.PI / 2 + ((Math.random() * 2 - 1) * Math.PI) / 8,

                  min: (engine.background.height * 3) / 5 - engine.shorter / 2,
                  max:
                     engine.background.height -
                     engine.background.floor.height -
                     engine.shorter / 2,

                  interest: false,
                  wait: false,

                  backSpd: 0,
                  eatSpd: 50,
                  nibble: 0,
               });
            } else {
               this.fish.push({
                  type: "ground",

                  width: engine.shorter / 20,
                  height: engine.shorter / 50,

                  pos: {
                     x: engine.background.width / 2 + (engine.shorter * 3) / 40,
                     y:
                        engine.background.height -
                        engine.background.floor.height,
                  },

                  speed: (Math.random() * engine.character.maxSpeed) / 10,

                  rotation: -Math.PI / 2,

                  min: -Infinity,
                  max: Infinity,

                  interest: false,
                  wait: false,

                  backSpd: 0,
                  eatSpd: 50,
                  nibble: 0,
               });
            }
         }

         if (obj.pos.y < obj.min) {
            obj.rotation < 0
               ? (obj.rotation += Math.PI / 500)
               : (obj.rotation -= Math.PI / 500);
         } else if (obj.pos.y > obj.max) {
            obj.rotation < 0
               ? (obj.rotation -= Math.PI / 500)
               : (obj.rotation += Math.PI / 500);
         }

         obj.color
            ? (engine.ctx.fillStyle = obj.color)
            : (engine.ctx.fillStyle = "#F00");

         engine.ctx.save();

         engine.ctx.translate(
            obj.pos.x - engine.background.pos.x + engine.canvas.width / 2,
            obj.pos.y - engine.background.pos.y
         );

         engine.ctx.rotate(-obj.rotation);

         engine.ctx.fillRect(
            -obj.height / 2,
            -obj.width / 2,
            obj.height,
            obj.width
         );

         engine.ctx.restore();
      });
   }
}

class Map {
   constructor(engine) {
      this.scale = engine.canvas.height / 2 / engine.background.height;

      this.i = Infinity;
   }

   update(engine) {
      this.i++;

      if (this.i >= 100) {
         this.i = 0;
      }

      engine.mapctx.clearRect(
         0,
         (engine.mapcvs.height / 50) * (this.i - 1),
         engine.mapcvs.width,
         engine.mapcvs.height / 50
      );

      engine.mapctx.fillStyle = "#0F08";
      engine.mapctx.fillRect(
         0,
         (engine.mapcvs.height / 50) * (this.i - 1),
         engine.mapcvs.width,
         engine.mapcvs.height / 50
      );

      if (
         engine.mapcvs.height > (engine.mapcvs.height / 50) * (this.i - 1) &&
         engine.mapcvs.height - engine.background.floor.height * this.scale <
            (engine.mapcvs.height / 50) * this.i
      ) {
         engine.mapctx.fillRect(
            0,
            engine.mapcvs.height - engine.background.floor.height * this.scale,
            engine.mapcvs.width,
            engine.background.floor.height * this.scale
         );
      }

      engine.background.plant
         .filter(
            (obj) =>
               engine.mapcvs.height -
                  engine.background.floor.height * this.scale >
                  (engine.mapcvs.height / 50) * (this.i - 1) &&
               engine.mapcvs.height -
                  engine.background.floor.height * this.scale -
                  obj.height * this.scale <
                  (engine.mapcvs.height / 50) * this.i
         )
         .forEach((obj) => {
            engine.mapctx.fillRect(
               obj.pos.x * this.scale + engine.mapcvs.width / 2,
               obj.pos.y * this.scale,
               obj.width * this.scale,
               obj.height * this.scale
            );
         });

      if (
         engine.background.pos.y * this.scale +
            engine.character.pos.y * this.scale +
            (engine.character.radius / 2) * this.scale * 10 >
            (engine.mapcvs.height / 50) * (this.i - 1) &&
         engine.background.pos.y * this.scale +
            engine.character.pos.y * this.scale -
            (engine.character.radius / 2) * this.scale * 10 <
            (engine.mapcvs.height / 50) * this.i
      ) {
         engine.mapctx.fillStyle = "#F00";
         engine.mapctx.beginPath();
         engine.mapctx.arc(
            engine.background.pos.x * this.scale +
               engine.character.pos.x * this.scale +
               engine.mapcvs.width / 2,
            engine.background.pos.y * this.scale +
               engine.character.pos.y * this.scale,
            engine.character.radius * this.scale * 10,
            0,
            Math.PI * 2
         );
         engine.mapctx.fill();
      }

      engine.mapctx.fillStyle = "#F008";

      engine.fish.fish
         .filter(
            (obj) =>
               obj.pos.y * this.scale + (obj.height / 2) * this.scale >
                  (engine.mapcvs.height / 50) * (this.i - 1) &&
               obj.pos.y * this.scale - (obj.height / 2) * this.scale <
                  (engine.mapcvs.height / 50) * this.i
         )
         .forEach((obj) => {
            engine.mapctx.fillRect(
               obj.pos.x * this.scale -
                  (obj.width / 2) * this.scale +
                  engine.mapcvs.width / 2,
               obj.pos.y * this.scale - (obj.height / 2) * this.scale,
               obj.width * this.scale,
               obj.height * this.scale
            );
         });
      engine.mapctx.fillStyle = engine.mapctx.createLinearGradient(
         0,
         (engine.mapcvs.height / 50) * this.i,
         0,
         (engine.mapcvs.height / 50) * (this.i + 1)
      );
      engine.mapctx.fillStyle.addColorStop(0, "#FFF0");
      engine.mapctx.fillStyle.addColorStop(0.5, "#FFF");
      engine.mapctx.fillStyle.addColorStop(1, "#FFF0");

      engine.mapctx.fillRect(
         0,
         (engine.mapcvs.height / 50) * this.i,
         engine.mapcvs.width,
         engine.mapcvs.height / 50
      );
   }
}

class Game {
   constructor() {
      const self = this;

      this.canvas = document.getElementById("canvas");
      this.mapbg = document.getElementById("mapbg");
      this.mapcvs = document.getElementById("map");

      this.ctx = this.canvas.getContext("2d");
      this.mbgctx = this.mapbg.getContext("2d");
      this.mapctx = this.mapcvs.getContext("2d");

      this.isMapZoomed = false;

      this.canvas.width = window.innerWidth + 1;
      this.canvas.height = window.innerHeight;

      this.canvas.width < this.canvas.height
         ? (this.shorter = this.canvas.width)
         : (this.shorter = this.canvas.height);

      const abs = Math.abs;

      function onArrowLeftDown() {
         self.character.boat.speed.x = -self.character.maxSpeed;
      }

      function onArrowRightDown() {
         self.character.boat.speed.x = self.character.maxSpeed;
      }

      function onArrowUpDown() {
         self.character.spdUp.up = true;

         if (self.character.spdUp.down) self.character.spdUp.down = false;
         if (self.character.spdDown) self.character.spdDown = false;
      }

      function onArrowDownDown() {
         self.character.spdUp.down = true;

         if (self.character.spdUp.up) self.character.spdUp.up = false;
         if (self.character.spdDown) self.character.spdDown = false;
      }

      function onEnterDown() {
         if (self.mapcvs.height !== self.canvas.height) {
            self.map.scale = self.canvas.height / self.background.height;
            self.map.i = Infinity;

            self.mapcvs.width = self.mapbg.width =
               self.background.width * self.map.scale;
            self.mapcvs.height = self.mapbg.height =
               self.background.height * self.map.scale;
            self.mapbg.style.left = self.mapcvs.style.left =
               self.canvas.width / 2 - self.mapcvs.width / 2 + "px";

            self.mbgctx.fillStyle = "#000";
            self.mbgctx.fillRect(0, 0, self.mapcvs.width, self.mapcvs.height);
         }
         self.isMapZoomed = true;
      }

      function onArrowLeftRightUp() {
         self.character.boat.speed.x = self.character.minSpeed.x;
      }

      function onArrowUpDownUp() {
         self.character.spdDown = true;

         if (self.character.spdUp.up) self.character.spdUp.up = false;
         if (self.character.spdUp.down) self.character.spdUp.down = false;
      }

      function pullUp() {
         self.character.pullUp = true;
      }

      function lock() {
         self.character.lock
            ? (self.character.lock = false)
            : (self.character.lock = true);
      }

      function onEnterUp() {
         self.map.scale = self.canvas.height / 2 / self.background.height;
         self.map.i = Infinity;

         self.mapcvs.width = self.mapbg.width =
            self.background.width * self.map.scale;
         self.mapcvs.height = self.mapbg.height =
            self.background.height * self.map.scale;
         self.mapbg.style.left = self.mapcvs.style.left =
            self.canvas.width - self.mapcvs.width + "px";
         self.isMapZoomed = false;
      }

      document.addEventListener("keydown", (event) => {
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

            case "Enter":
               onEnterDown();
               break;
         }
      });

      document.addEventListener("keyup", (event) => {
         switch (event.key) {
            case "ArrowLeft":
            case "ArrowRight":
               onArrowLeftRightUp();
               break;

            case "ArrowUp":
            case "ArrowDown":
               onArrowLeftRightUp();
               break;

            case " ":
               pullUp();
               break;

            case "z":
               lock();
               break;

            case "Enter":
               onEnterUp();
               break;
         }
      });

      canvas.addEventListener("pointerdown", (event) => {
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

      canvas.addEventListener("pointerup", (event) => {
         let px = (event.clientX / window.innerWidth) * 2 - 1;
         let py = (event.clientY / window.innerHeight) * 2 - 1;
         if (px > -0.5 && px < 0.5 && py > -0.5 && py < 0.5) {
            pullUp();
         } else if (px < -abs(py) || px > abs(py)) {
            onArrowLeftRightUp();
         } else if (py < -abs(px) || py > abs(px)) {
            onArrowUpDownUp();
         }
      });

      this.mapcvs.addEventListener("click", () =>
         this.isMapZoomed ? onEnterUp() : onEnterDown()
      );

      let lockButton = document.getElementById("lock-button");
      lockButton.addEventListener("click", () => lock());

      this.background = new Background(this);
      this.character = new Character(this);
      this.fish = new Fish(this);

      this.mapcvs.width = this.mapbg.width =
         ((this.canvas.height / 2) * this.background.width) /
         this.background.height;
      this.mapcvs.height = this.mapbg.height = this.canvas.height / 2;

      this.mapcvs.style.left = this.mapbg.style.left =
         this.canvas.width - this.mapcvs.width + "px";

      this.map = new Map(this);
   }

   update() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.background.update(this);
      this.character.update(this);
      this.fish.update(this);
      this.map.update(this);
   }
}

let game = new Game();

function gameLoop() {
   game.update();

   window.requestAnimationFrame(gameLoop);
}

window.requestAnimationFrame(gameLoop);
