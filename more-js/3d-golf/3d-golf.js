const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.translate(canvas.width / 2, canvas.height);
ctx.scale(1, -1);
ctx.strokeStyle = "#555";
ctx.lineWidth = 5;

let ball = {
   x: Math.floor(Math.random() * canvas.width - canvas.width / 2),
   y: 30,
   z: 0.5,
   radius: 30,
   color: {
      main: "#FFF",
      shadow: "#BBB",
   },
};

let hole = {
   x: 0,
   y: 0,
   z: 10,
   radius: 60,
};

let dx = 0;
let dy = 0;
let dz = 0;
let ax = -1;
let ay = -1;
let az = -0.001;

let holdTime = 0;
let charging;
let moving = false;
let scored = false;

document.addEventListener("pointerdown", (event) => {
   if (moving) return;
   holdTime = 0;
   charging = setInterval(() => {
      holdTime++;
   }, 10);
   dx = (event.clientX - canvas.width / 2) / 10;
   dz = (canvas.height / 2 - event.clientY) / 3000;
});

document.addEventListener("pointerup", () => {
   if (moving) return;
   dy = Math.min(holdTime, 100);
   dz += dy / 1000;
   clearInterval(charging);
   moving = true;
   window.requestAnimationFrame(draw);
});

function draw() {
   ball.x += dx;
   ball.y += dy;
   ball.z = Math.max(ball.z + dz, 0);
   dx = dx < 0 ? Math.min(dx - ax, 0) : Math.max(dx + ax, 0);
   dy += ay;
   dz = dz < 0 ? Math.min(dz - az, 0) : Math.max(dz + az, 0);

   if (ball.y < ball.radius) {
      if (
         Math.pow(ball.x - hole.x, 2) + 100000 * Math.pow(ball.z - hole.z, 2) <=
            Math.pow(ball.radius + hole.radius, 2) &&
         ball.y <= 50 &&
         dx * dx + 100000 * dz * dz <= 500
      ) {
         dx = 0;
         dy = 0;
         dz = 0;
         ball.radius -= 10;
         if (ball.radius <= 0) {
            scored = true;
         }
      } else {
         ball.y = ball.radius;
         dy *= -0.3;
         if (dy < 7) {
            dy = 0;
            if (dx === 0 && dz === 0) {
               moving = false;
            }
         }
      }
   }

   ctx.clearRect(-canvas.width / 2, 0, canvas.width, canvas.height);

   ctx.fillStyle = ctx.createLinearGradient(0, 0, 0, canvas.height);
   ctx.fillStyle.addColorStop(0, "#BCD");
   ctx.fillStyle.addColorStop(1, "#8AD");
   ctx.fillRect(-canvas.width / 2, 0, canvas.width, canvas.height);

   ctx.fillStyle = ctx.createLinearGradient(0, 0, 0, canvas.height / 3);
   ctx.fillStyle.addColorStop(0, "#2B2");
   ctx.fillStyle.addColorStop(0.5, "#4B4");
   ctx.fillStyle.addColorStop(1, "#6BA");
   ctx.fillRect(-canvas.width / 2, 0, canvas.width, canvas.height / 3);

   ctx.fillStyle = ctx.createRadialGradient(
      0,
      0,
      0,
      0,
      0,
      hole.radius / (hole.z + 1)
   );
   ctx.fillStyle.addColorStop(0, "#000");
   ctx.fillStyle.addColorStop(1, "#333");

   ctx.save();
   ctx.translate(hole.x, canvas.height / 3 - canvas.height / 3 / (hole.z + 1));
   ctx.scale(1, 0.3);
   ctx.beginPath();
   ctx.arc(0, 0, hole.radius / (hole.z + 1), 0, Math.PI * 2, true);
   ctx.fill();
   ctx.restore();

   ctx.fillStyle = ctx.createRadialGradient(
      0,
      0,
      0,
      0,
      0,
      ball.radius / (ball.z + 1)
   );
   ctx.fillStyle.addColorStop(0, "#080");
   ctx.fillStyle.addColorStop(1, "#0000");

   ctx.save();
   ctx.translate(
      ball.x / (ball.z + 1),
      canvas.height / 3 - canvas.height / 3 / (ball.z + 1)
   );
   ctx.scale(1, 0.3);
   ctx.beginPath();
   ctx.arc(0, 0, ball.radius / (ball.z + 1), 0, Math.PI * 2, true);
   ctx.fill();
   ctx.restore();

   ctx.fillStyle = ctx.createRadialGradient(
      0,
      0,
      0,
      0,
      0,
      ball.radius / (ball.z + 1)
   );
   ctx.fillStyle.addColorStop(0, ball.color.main);
   ctx.fillStyle.addColorStop(1, ball.color.shadow);

   ctx.save();
   ctx.translate(
      ball.x / (ball.z + 1),
      ball.y / (ball.z + 1) +
         canvas.height / 3 -
         canvas.height / 3 / (ball.z + 1)
   );
   ctx.beginPath();
   ctx.arc(0, 0, ball.radius / (ball.z + 1), 0, Math.PI * 2, true);
   ctx.fill();
   ctx.restore();

   ctx.save();
   ctx.beginPath();
   ctx.translate(0, canvas.height / 2);
   ctx.moveTo(-10, 0);
   ctx.lineTo(10, 0);
   ctx.moveTo(0, -10);
   ctx.lineTo(0, 10);
   ctx.stroke();
   ctx.restore();

   if (moving && !scored) window.requestAnimationFrame(draw);
}

draw();
