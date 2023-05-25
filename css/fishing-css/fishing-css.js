const bgScreen = document.querySelector(".screen");
const sky = document.querySelector(".sky");
const ocean = document.querySelector(".ocean");
const sun = document.querySelector(".sun");
const clouds = document.querySelector(".clouds");
const fisherman = document.querySelector(".fisherman");
const rod = document.querySelector(".fisherman .rod");
const bobber = document.querySelector(".fisherman .rod .bobber");
const hook = document.querySelector(".fisherman .rod .bobber .hook");
const line = document.querySelector(".castline");
const hLine = document.querySelector(".hookline");

let vw = window.innerWidth / 100;
let vh = window.innerHeight / 100;
let vmin;
vw > vh ? (vmin = vh) : (vmin = vw);

let release;
let castLine;
let hookLine;
let bgAnimation;
let moveLeft;
let moveRight;

let hookLeft =
   parseInt(getComputedStyle(fisherman).left) / vw +
   parseInt(getComputedStyle(bobber).left) / vw +
   (5 * vmin) / vw;
let hookTop =
   parseInt(getComputedStyle(fisherman).top) / vh +
   parseInt(getComputedStyle(bobber).top) / vh +
   parseInt(getComputedStyle(hook).top) / vh -
   (31 * vmin) / vh;

window.onresize = () => {
   vw = window.innerWidth / 100;
   vh = window.innerHeight / 100;
   vw > vh ? (vmin = vh) : (vmin = vw);

   hookLeft =
      parseInt(getComputedStyle(fisherman).left) / vw +
      parseInt(getComputedStyle(bobber).left) / vw +
      (5 * vmin) / vw;
   hookTop =
      parseInt(getComputedStyle(fisherman).top) / vh +
      parseInt(getComputedStyle(bobber).top) / vh +
      parseInt(getComputedStyle(hook).top) / vh -
      20 -
      (11 * vmin) / vh;
};

function center(move) {
   if (!move) {
      hookLeft =
         parseInt(getComputedStyle(fisherman).left) / vw +
         parseInt(getComputedStyle(bobber).left) / vw +
         (5 * vmin) / vw;
      hookTop =
         parseInt(getComputedStyle(fisherman).top) / vh +
         parseInt(getComputedStyle(bobber).top) / vh +
         parseInt(getComputedStyle(hook).top) / vh -
         (31 * vmin) / vh;
   }

   if (hookLeft > -53 && hookLeft < 147) {
      bgScreen.style.left =
         Math.min(Math.max(-hookLeft + 50 - (3 * vmin) / vw, -100), 100) + "vw";
      sky.style.left =
         Math.min(Math.max(hookLeft - 50 + (3 * vmin) / vw, -100), 100) + "vw";
      ocean.style.left =
         Math.min(Math.max(hookLeft - 50 + (3 * vmin) / vw, -100), 100) + "vw";
      sun.style.left =
         Math.min(Math.max(hookLeft * 0.8 - 60 + (3 * vmin) / vw, -100), 100) +
         "vw";
      clouds.style.left =
         Math.min(Math.max(hookLeft * 0.6 - 70 + (3 * vmin) / vw, -100), 100) +
         "vw";
   }

   if (hookTop < 317) {
      bgScreen.style.top = -hookTop + 50 - (3 * vmin) / vh + "vh";
   }
}

function left() {
   moveLeft = setInterval(() => {
      hookLeft = Math.max(hookLeft - 0.5, -100 + (5 * vmin) / vw);

      fisherman.style.left =
         hookLeft -
         parseInt(getComputedStyle(bobber).left) / vw -
         (5 * vmin) / vw +
         "vw";

      if (hookLeft == -100 + (5 * vmin) / vw) {
         clearInterval(moveLeft);
      }

      center(true);
   }, 100 / 3);
}

function right() {
   moveRight = setInterval(() => {
      hookLeft = Math.min(
         hookLeft + 0.5,
         parseInt(getComputedStyle(bobber).left) / vw + 200 - (100 * vmin) / vw
      );

      fisherman.style.left =
         hookLeft -
         parseInt(getComputedStyle(bobber).left) / vw -
         (5 * vmin) / vw +
         "vw";

      if (
         hookLeft ==
         parseInt(getComputedStyle(bobber).left) / vw + 200 - (100 * vmin) / vw
      ) {
         clearInterval(moveRight);
      }

      center(true);
   }, 100 / 3);
}

function cast() {
   rod.style.transform = "rotate(0)";
   bobber.style.left = "80vmin";
   bobber.style.top = "43vmin";

   setTimeout(() => {
      castLine = setInterval(() => {
         line.setAttribute("x1", 0);
         line.setAttribute("y1", 0);
         line.setAttribute(
            "x2",
            parseInt(getComputedStyle(bobber).left) - 26 * vmin
         );
         line.setAttribute(
            "y2",
            parseInt(getComputedStyle(bobber).top) + 2 * vmin
         );
      }, 100 / 6);

      setTimeout(() => {
         clearInterval(castLine);
      }, 1500);
   }, 2500);

   setTimeout(() => {
      bgScreen.style.transition = "left 3s, top 3s";
      sky.style.transition = "left 3s";
      ocean.style.transition = "left 3s";
      sun.style.transition = "left 3s";
      clouds.style.transition = "left 3s";
      center();

      setTimeout(() => {
         bgScreen.style.transition = "none";
         sky.style.transition = "none";
         ocean.style.transition = "none";
         sun.style.transition = "none";
         clouds.style.transition = "none";
      }, 3000);
   }, 4000);

   setTimeout(() => {
      hookLine = setInterval(() => {
         hookTop = Math.min(hookTop + 0.5, 366);
         hook.style.top =
            hookTop -
            parseInt(getComputedStyle(bobber).top) / vh -
            70 +
            (24 * vmin) / vh +
            "vh";

         hLine.setAttribute("x1", 150 * vw - 3 * vmin);
         hLine.setAttribute("y1", 3 * vmin);
         hLine.setAttribute("x2", 150 * vw - 3 * vmin);
         hLine.setAttribute("y2", parseInt(getComputedStyle(hook).top));

         center(true);
      }, 100 / 3);
   }, 7000);
}

document.querySelector(".left").onpointerdown = () => {
   left();
};
document.querySelector(".left").onpointerup = () => {
   clearInterval(moveLeft);
};

document.querySelector(".right").onpointerdown = () => {
   right();
};
document.querySelector(".right").onpointerup = () => {
   clearInterval(moveRight);
};

document.querySelector(".button").addEventListener("click", () => {
   cast();
});

window.addEventListener("keydown", (event) => {
   if (event.repeat) return;
   switch (event.key) {
      case "ArrowLeft":
         left();
         break;
      case "ArrowRight":
         right();
         break;
   }
});

window.addEventListener("keyup", (event) => {
   switch (event.key) {
      case "ArrowLeft":
         clearInterval(moveLeft);
         break;
      case "ArrowRight":
         clearInterval(moveRight);
         break;
      case " ":
         cast();
         break;
   }
});
