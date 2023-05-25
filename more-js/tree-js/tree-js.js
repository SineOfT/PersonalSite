const max = Math.max;
let size = 800;
let lock = true;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = size;
canvas.height = size;

ctx.imageSmoothingEnabled = false;

ctx.translate(0, canvas.height);
ctx.scale(1, -1);

const renderScreen = document.getElementById("renderScreen");
const renderCanvases = document.getElementsByClassName("renderCanvas");
let renderFixed = true;

let trees = [];
for (let renderCanvas of renderCanvases) {
   trees.push([
      renderCanvas,
      [
         [
            Math.floor(Math.random() * 100 + 50),
            0,
            Math.floor(Math.random() * 50 + 25),
         ],
      ],
      new Set(
         ["leaf", "sakura"].filter(() => Math.floor(Math.random() * 2) === 0)
      ),
   ]);
}

function createBranches(tree, treeWidth, state) {
   let area1 = Math.floor(Math.random() * (treeWidth * treeWidth - 1) + 1);
   let area2 = treeWidth * treeWidth - area1;
   let width1 = Math.floor(Math.sqrt(area1) * 10) / 10;
   let width2 = Math.floor(Math.sqrt(area2) * 10) / 10;
   let length1 = Math.floor(Math.random() * (treeWidth * 1.5 + 25));
   let length2 = Math.floor(Math.random() * (treeWidth * 1.5 + 25));
   let splitAngle = Math.floor(Math.random() * Math.PI * 3 + 2) / 10;
   let angle1 = Math.ceil(((splitAngle * width2) / treeWidth) * 10) / 10;
   let angle2 = Math.floor(((-splitAngle * width1) / treeWidth) * 10) / 10;

   tree.push([length1, angle1, width1]);

   if (width1 > 1.5) {
      createBranches(tree, width1, state);
   } else {
      if (state.has("leaf")) {
         tree.push([
            "leaf",
            "rgb(" +
               Math.floor(Math.random() * 64) +
               ", " +
               Math.floor(Math.random() * 128 + 128) +
               ", " +
               Math.floor(Math.random() * 64) +
               ")",
         ]);
      }
      if (state.has("sakura") && Math.floor(Math.random() * 10) === 0) {
         tree.push([
            "sakura",
            "rgb(256, " +
               Math.floor(Math.random() * 64 + 128) +
               ", " +
               Math.floor(Math.random() * 64 + 128) +
               ")",
         ]);
      }
   }

   tree.push("end");

   tree.push([length2, angle2, width2]);

   if (width2 > 1.5) {
      createBranches(tree, width2, state);
   } else {
      if (state.has("leaf")) {
         tree.push([
            "leaf",
            "rgb(" +
               Math.floor(Math.random() * 64) +
               ", " +
               Math.floor(Math.random() * 128 + 128) +
               ", " +
               Math.floor(Math.random() * 64) +
               ")",
         ]);
      } else if (state.has("sakura") && Math.floor(Math.random() * 10) === 0) {
         tree.push([
            "leaf",
            "rgb(256, " +
               Math.floor(Math.random() * 64 + 128) +
               ", " +
               Math.floor(Math.random() * 64 + 128) +
               ")",
         ]);
      }
   }

   tree.push("end");
}

function renderTree(treeCanvas, tree) {
   const treeCtx = treeCanvas.getContext("2d");

   treeCanvas.width = 1500;
   treeCanvas.height = 1500;

   treeCtx.translate(750, 250);
   treeCtx.lineCap = "round";

   for (let branch of tree) {
      if (branch === "end") {
         treeCtx.restore();
      } else if (typeof branch[0] === "number") {
         treeCtx.save();
         treeCtx.strokeStyle = treeCtx.createLinearGradient(
            -branch[2] / 2,
            0,
            branch[2] / 2,
            0
         );
         treeCtx.strokeStyle.addColorStop(0, "#720");
         treeCtx.strokeStyle.addColorStop(0.5, "#D50");
         treeCtx.strokeStyle.addColorStop(1, "#720");
         treeCtx.lineWidth = branch[2];
         treeCtx.beginPath();
         treeCtx.moveTo(0, 0);
         treeCtx.rotate(branch[1]);
         treeCtx.translate(0, branch[0]);
         treeCtx.lineTo(0, 0);
         treeCtx.stroke();
      }
   }

   treeCtx.fillStyle = treeCtx.createLinearGradient(
      -tree[0][2] / 2,
      0,
      tree[0][2] / 2,
      0
   );
   treeCtx.fillStyle.addColorStop(0, "#720");
   treeCtx.fillStyle.addColorStop(0.5, "#D50");
   treeCtx.fillStyle.addColorStop(1, "#720");
   treeCtx.beginPath();
   treeCtx.moveTo(-tree[0][2] / 2, 0);
   treeCtx.quadraticCurveTo(
      -tree[0][2] / 2,
      -tree[0][2] / 2,
      (-tree[0][2] * 3) / 4,
      -tree[0][2]
   );
   treeCtx.quadraticCurveTo(
      0,
      (-tree[0][2] * 5) / 4,
      (tree[0][2] * 3) / 4,
      -tree[0][2]
   );
   treeCtx.quadraticCurveTo(tree[0][2] / 2, -tree[0][2] / 2, tree[0][2] / 2, 0);
   treeCtx.fill();

   for (let branch of tree) {
      if (branch === "end") {
         treeCtx.restore();
      } else if (branch[0] === "leaf") {
         treeCtx.fillStyle = branch[1];
         treeCtx.beginPath();
         treeCtx.moveTo(0, 0);
         treeCtx.quadraticCurveTo(10, 10, 0, 20);
         treeCtx.quadraticCurveTo(-10, 10, 0, 0);
         treeCtx.fill();
      } else if (branch[0] === "sakura") {
         treeCtx.save();
         treeCtx.fillStyle = branch[1];
         treeCtx.rotate(-2);
         treeCtx.beginPath();
         treeCtx.moveTo(0, 0);
         treeCtx.quadraticCurveTo(10, 10, 5, 20);
         treeCtx.lineTo(0, 15);
         treeCtx.lineTo(-5, 20);
         treeCtx.quadraticCurveTo(-5, 10, 5, 0);
         treeCtx.fill();
         treeCtx.rotate(1);
         treeCtx.beginPath();
         treeCtx.moveTo(0, 0);
         treeCtx.quadraticCurveTo(10, 10, 5, 20);
         treeCtx.lineTo(0, 15);
         treeCtx.lineTo(-5, 20);
         treeCtx.quadraticCurveTo(-5, 10, 5, 0);
         treeCtx.fill();
         treeCtx.rotate(1);
         treeCtx.beginPath();
         treeCtx.moveTo(0, 0);
         treeCtx.quadraticCurveTo(10, 10, 5, 20);
         treeCtx.lineTo(0, 15);
         treeCtx.lineTo(-5, 20);
         treeCtx.quadraticCurveTo(-5, 10, 5, 0);
         treeCtx.fill();
         treeCtx.rotate(1);
         treeCtx.beginPath();
         treeCtx.moveTo(0, 0);
         treeCtx.quadraticCurveTo(10, 10, 5, 20);
         treeCtx.lineTo(0, 15);
         treeCtx.lineTo(-5, 20);
         treeCtx.quadraticCurveTo(-5, 10, 5, 0);
         treeCtx.fill();
         treeCtx.rotate(1);
         treeCtx.beginPath();
         treeCtx.moveTo(0, 0);
         treeCtx.quadraticCurveTo(10, 10, 5, 20);
         treeCtx.lineTo(0, 15);
         treeCtx.lineTo(-5, 20);
         treeCtx.quadraticCurveTo(-5, 10, 5, 0);
         treeCtx.fill();
         treeCtx.restore();
      } else {
         treeCtx.save();
         treeCtx.rotate(branch[1]);
         treeCtx.translate(0, branch[0]);
      }
   }

   treeCtx.restore();

   treeCtx.globalCompositeOperation = "source-atop";

   treeCtx.save();

   treeCtx.fillStyle = treeCtx.createLinearGradient(
      -tree[0][2] * 5,
      tree[0][2] * 5 + 250,
      tree[0][2] * 5,
      0
   );

   treeCtx.fillStyle.addColorStop(0, "#FF8B");
   treeCtx.fillStyle.addColorStop(0.25, "#FF85");
   treeCtx.fillStyle.addColorStop(0.5, "#0000");
   treeCtx.fillStyle.addColorStop(0.75, "#000");
   treeCtx.fillRect(-750, -250, 1500, 1250);

   treeCtx.restore();
}

function drawScreen(ctx) {
   ctx.fillStyle = ctx.createRadialGradient(0, 0, 0, 0.5, 0, 0.5);
   ctx.fillStyle.addColorStop(0, "#0008");
   ctx.fillStyle.addColorStop(1, "#0000");

   for (let i = 0; i < trees.length; i++) {
      let [treeCanvas, tree, state] = trees[i];
      let treeDist = size / trees.length;
      let treeWidth = treeDist * 2;
      let renderScale = treeWidth / 1500;
      ctx.save();
      ctx.translate(treeDist / 2 + treeDist * i, treeWidth / 6);
      ctx.save();
      ctx.translate(0, (-tree[0][2] * renderScale) / 2);
      ctx.scale(tree[0][0] * renderScale * 10, tree[0][2] * renderScale * 3);
      ctx.rotate(-0.5);
      ctx.fillRect(0, -0.5, 1, 1);
      ctx.restore();
      ctx.drawImage(
         treeCanvas,
         0,
         0,
         1500,
         1500,
         -treeWidth / 2,
         -treeWidth / 6,
         treeWidth,
         treeWidth
      );
      ctx.restore();
   }
}

function setSize(val) {
   canvas.width = val;
   canvas.height = val;

   ctx.imageSmoothingEnabled = false;

   ctx.translate(0, canvas.height);
   ctx.scale(1, -1);

   lock = true;

   drawScreen(ctx);
}

for (let [treeCanvas, tree, state] of trees) {
   createBranches(tree, tree[0][2], state);
   tree.push("end");
   renderTree(treeCanvas, tree);
}

drawScreen(ctx);

document.addEventListener("keydown", (event) => {
   switch (event.key) {
      case "Shift":
         if (!lock) {
            lock = true;
         } else {
            lock = false;
         }
         break;

      case "ArrowLeft":
         size = max(size - 50, 50);
         setSize(size);
         break;

      case "ArrowRight":
         size += 50;
         setSize(size);
         break;
   }
});

document.addEventListener("keyup", (event) => {
   switch (event.key) {
      case "Shift":
         if (!renderFixed) {
            renderFixed = true;
            renderScreen.style.position = "fixed";
         } else {
            renderFixed = false;
            renderScreen.style.position = "absolute";
         }
         break;
   }
});
