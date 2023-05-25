document
   .getElementById("input")
   .addEventListener("submit", (event) => event.preventDefault());

const playerNameMap = new Map([
   ["rgb(255, 0, 0)", "Red"],
   ["rgb(255, 127, 0)", "Orange"],
   ["rgb(255, 191, 0)", "Yellow"],
   ["rgb(0, 255, 0)", "Lime"],
   ["rgb(0, 127, 0)", "Green"],
   ["rgb(0, 255, 191)", "Cyan"],
   ["rgb(159, 179, 255)", "Sky"],
   ["rgb(0, 0, 255)", "Blue"],
   ["rgb(127, 0, 255)", "Purple"],
   ["rgb(255, 0, 255)", "Magenta"],
   ["rgb(255, 159, 191)", "Pink"],
   ["rgb(149, 41, 15)", "Brown"],
   ["rgb(245, 245, 245)", "White"],
   ["rgb(127, 127, 127)", "Gray"],
   ["rgb(0, 0, 0)", "Black"],
]);

let players;
let playStones;
let playRounds;
let playerStyleSet = new Set();

window.addEventListener("load", () => {
   document
      .getElementById("num-submit-button")
      .addEventListener("click", submitPlayerNum);
});

function submitPlayerNum() {
   if (document.querySelector("#input:invalid")) return;
   document.getElementById("num-submit-button").disabled = true;

   let input = document.getElementById("input");
   players = parseInt(document.getElementById("player-num-input").value);
   playStones = parseInt(document.getElementById("stone-num-input").value);
   playRounds = parseInt(document.getElementById("round-num-input").value);

   let index = 0;
   for (let i = 1; i <= players; i++) {
      let inputField = document.createElement("fieldset");
      let styleLegend = document.createElement("legend");
      styleLegend.innerHTML = "Player " + i + "'s Stone Color";
      inputField.appendChild(styleLegend);

      playerNameMap.forEach((name, style) => {
         let nameValue = "player-style-" + i;
         let idValue = "player-style-" + index;
         let styleLabel = document.createElement("label");
         styleLabel.for = idValue;
         styleLabel.classList.add("player-style-label");
         styleLabel.style.color = style;
         styleLabel.innerHTML = name;
         inputField.appendChild(styleLabel);

         let styleInput = document.createElement("input");
         styleInput.type = "radio";
         styleInput.name = nameValue;
         styleInput.id = idValue;
         styleInput.style.color = style;
         styleInput.required = true;
         styleInput.addEventListener("click", () => onSelectStyle(styleInput));
         inputField.appendChild(styleInput);
         index++;
      });
      input.appendChild(inputField);
   }
   let submitButton = document.createElement("button");
   submitButton.type = "submit";
   submitButton.innerHTML = "Submit";
   submitButton.addEventListener("click", onStartGame);
   input.appendChild(submitButton);
}

function onSelectStyle(styleInput) {
   let selectedStyles = Array.from(
      document.querySelectorAll("#input input[type=radio]:checked")
   );
   let style = styleInput.style.color;
   selectedStyles.forEach((obj) => {
      if (obj !== styleInput && obj.style.color === style) {
         styleInput.checked = false;
      }
   });
}

function onStartGame() {
   if (document.querySelector("#input:invalid")) return;
   let form = document.getElementById("input");
   form.style.pointerEvents = "none";
   form.style.opacity = 0;
   let selectedStyles = document.querySelectorAll(
      "#input input[type=radio]:checked"
   );
   let selectedStylesShuffled = Array.from(selectedStyles).sort(
      () => Math.random() - 0.5
   );
   selectedStylesShuffled.forEach((object) => {
      let style = object.style.color;
      playerStyleSet.add(style);
   });

   game(players, playStones, playRounds, playerStyleSet);
}

function game(players, playStones, playRounds, playerStyleSet) {
   const scoreboard = document.getElementById("scoreboard");
   const scoreTable = document.getElementById("scoreboardTable");
   const moveScoreBtn = document.getElementById("moveScoreboard");
   const buttonSymbol = document.getElementById("buttonSymbol");

   const root = document.querySelector(":root");

   const gameScreen = document.getElementById("screen");

   const statBGCanvas = document.getElementById("staticBackground");
   const statBGCtx = statBGCanvas.getContext("2d");

   const dynmBGCanvas = document.getElementById("dynamicBackground");
   const dynmBGCtx = dynmBGCanvas.getContext("2d");

   const sweepCanvas = document.getElementById("sweepScreen");
   const sweepCtx = sweepCanvas.getContext("2d");
   sweepCanvas.style.opacity = "0.2";

   const transitionCanvas = document.getElementById("transitionScreen");
   const transitionCtx = transitionCanvas.getContext("2d");

   const staticCanvas = document.getElementById("staticScreen");
   const staticCtx = staticCanvas.getContext("2d");

   const dynamicCanvas = document.getElementById("dynamicScreen");
   const dynamicCtx = dynamicCanvas.getContext("2d");

   const coverCanvas = document.getElementById("coverScreen");
   const coverCtx = coverCanvas.getContext("2d");

   const markerCanvas = document.getElementById("posMarkerScreen");
   const markerCtx = markerCanvas.getContext("2d");

   const curlScreen = document.getElementById("curlChangeTracker");

   const pi = Math.PI;
   const sqrt = Math.sqrt;
   const min = Math.min;
   const max = Math.max;
   const sin = Math.sin;
   const cos = Math.cos;
   const atan2 = Math.atan2;
   const sign = Math.sign;
   const abs = Math.abs;
   const findDist = (dX, dY) => sqrt(dX * dX + dY * dY);
   const approachMin = (x, max, ease) => max * (ease / (x + ease));
   const approachMax = (x, max, ease) => max * (1 - ease / (x + ease));

   const headTowards = (pos, goal, percent, acc) => {
      let newPos = pos - (pos - goal) * percent;
      if (pos > goal - acc && pos < goal + acc) {
         newPos = goal;
      } else {
         newPos += newPos - goal < 0 ? acc : -acc;
      }
      return newPos;
   };

   const hammers = createHammers(players);

   const stoneRadius = 25;
   const stoneGradient = staticCtx.createRadialGradient(
      0,
      0,
      0,
      0,
      0,
      stoneRadius
   );
   stoneGradient.addColorStop(0.6, "#888");
   stoneGradient.addColorStop(0.8, "#DDD");
   stoneGradient.addColorStop(1, "#BBB");

   const ringRadius = 180;
   const ringBackX = stoneRadius * 4;
   const ringPositionX = ringBackX + ringRadius;
   const ringPositionY = max(ringRadius * 1.2, players * stoneRadius);
   const ringGradient = statBGCtx.createRadialGradient(
      0,
      0,
      0,
      0,
      0,
      ringRadius
   );
   ringGradient.addColorStop(stoneRadius / ringRadius, "#FFF");
   ringGradient.addColorStop(stoneRadius / ringRadius, "#F00");
   ringGradient.addColorStop(0.33, "#F00");
   ringGradient.addColorStop(0.34, "#FFF");
   ringGradient.addColorStop(0.66, "#FFF");
   ringGradient.addColorStop(0.67, "#00F");

   const markerY = 15;
   const markerMaxHeight = 30;
   const markerCanvasHeight = markerY + markerMaxHeight;

   const hogLine = ringPositionX + ringRadius * 3;
   const sheetLength = hogLine * 6;

   const lineDist = sheetLength - hogLine * 2;

   let windowWidth = window.innerWidth;
   let windowHeight = window.innerHeight;

   const screenWidth = hogLine * 2;
   const screenHeight = ringPositionY * 2;

   const buttonHeight = max(windowHeight / 10, 50);
   const tableHeight = min(100 * (players + 1), windowHeight - buttonHeight);

   const scale = min(
      (windowWidth * 0.9) / screenWidth,
      (windowHeight * 0.9) / screenHeight
   );

   root.style.setProperty("--scale", scale);
   root.style.setProperty("--table-height", tableHeight + "px");
   root.style.setProperty(
      "--cell-height",
      tableHeight / (players + 1) / 2 + "px"
   );
   root.style.setProperty("--button-height", buttonHeight + "px");

   gameScreen.style.width = screenWidth + "px";
   gameScreen.style.height = screenHeight + "px";

   statBGCanvas.width =
      dynmBGCanvas.width =
      sweepCanvas.width =
      transitionCanvas.width =
      staticCanvas.width =
      dynamicCanvas.width =
      coverCanvas.width =
      markerCanvas.width =
         screenWidth;
   statBGCanvas.height =
      dynmBGCanvas.height =
      sweepCanvas.height =
      transitionCanvas.height =
      staticCanvas.height =
      dynamicCanvas.height =
      coverCanvas.height =
         screenHeight;

   markerCanvas.height = markerCanvasHeight;
   markerCanvas.style.height = markerCanvasHeight + "px";

   const scoreCellMap = new Map();
   const totalCellMap = new Map();
   const scoreTotalMap = new Map();

   let playerOrderArr = [...playerStyleSet];

   const playerRemainingStoneX = stoneRadius;
   const playerOutStoneX = screenWidth - stoneRadius;

   const playerStoneYMap = new Map();
   createPlayerStoneY();

   let remainingStoneOrderArr = [];
   let transitionStoneSet = new Set();
   let dynamicStoneSet = new Set();
   let staticStoneSet = new Set();
   let outStoneMap = new Map();
   createOutStones();

   let startX;
   let startY;
   let releaseX;
   let releaseY;
   let releaseCurl = 1;
   let releaseStyle;

   const sweepGradient = sweepCtx.createLinearGradient(0, 0, sheetLength, 0);
   for (let i = 0.05; i <= 1; i += 0.1) {
      sweepGradient.addColorStop(i, "#E7E7E7");
      sweepGradient.addColorStop(i + 0.05, "#BBB");
   }
   let sweepArr = [[]];
   let sweepX;
   let sweepY;
   let prevX;
   let prevY;

   const updateFunctionMap = new Map();

   let screenX = 0;

   let curlPointerDown = false;

   let currentLeft = false;
   let currentRound = 0;

   let alpha = 1;

   function moveScoreboardUp() {
      scoreboard.style.top = -tableHeight + "px";
      moveScoreBtn.removeAttribute("down");
      buttonSymbol.src = "icons/down.svg";
   }

   function moveScoreboardDown() {
      scoreboard.style.top = "0px";
      moveScoreBtn.setAttribute("down", "");
      buttonSymbol.src = "icons/up.svg";
   }

   function drawStone(x, y, rotate, style, ctx) {
      ctx.save();

      ctx.translate(x, y);
      ctx.fillStyle = stoneGradient;
      ctx.beginPath();
      ctx.arc(0, 0, stoneRadius, 0, pi * 2);
      ctx.fill();

      ctx.fillStyle = style;
      ctx.beginPath();
      ctx.arc(0, 0, (stoneRadius * 2) / 3, 0, pi * 2);
      ctx.fill();

      ctx.fillStyle = "#AAA";
      ctx.beginPath();
      ctx.arc(0, 0, stoneRadius / 3, 0, pi * 2);
      ctx.fill();

      ctx.rotate(rotate);
      ctx.fillStyle = "#BBB";
      ctx.beginPath();
      ctx.ellipse(
         -stoneRadius / 3,
         0,
         stoneRadius / 2,
         stoneRadius / 5,
         0,
         0,
         pi * 2
      );
      ctx.fill();

      ctx.restore();
   }

   function drawRings(x, y, ctx) {
      ctx.save();

      ctx.translate(x, y);
      ctx.fillStyle = ringGradient;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, pi * 2);
      ctx.fill();

      ctx.restore();
   }

   function drawLine(x1, y1, x2, y2, style, width, ctx) {
      if (isNaN(x2)) x2 = x1;
      if (isNaN(y2)) y2 = y1;
      ctx.save();

      ctx.strokeStyle = style;
      ctx.lineWidth = width;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.restore();
   }

   function drawArrow(startX, startY, endX, endY, ctx) {
      let dX = endX - startX;
      let dY = endY - startY;
      let length = findDist(dX, dY);
      let angle = atan2(dY, dX);
      ctx.save();

      ctx.fillStyle = "#000";
      ctx.lineWidth = 2 + length / 100;
      ctx.translate(startX, startY);
      ctx.beginPath();
      ctx.arc(0, 0, 5 + length / 250, 0, pi * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.translate(
         endX - startX + (stoneRadius + length / 5) * cos(angle),
         endY - startY + (stoneRadius + length / 5) * sin(angle)
      );
      ctx.lineTo(0, 0);
      ctx.moveTo(
         (length / 10) * cos(angle - (pi * 3) / 4),
         (length / 10) * sin(angle - (pi * 3) / 4)
      );
      ctx.lineTo(0, 0);
      ctx.lineTo(
         (length / 10) * cos(angle + (pi * 3) / 4),
         (length / 10) * sin(angle + (pi * 3) / 4)
      );
      ctx.stroke();

      ctx.restore();
   }

   function drawCurl(x, y, curl, ctx) {
      let radius = stoneRadius + 5;

      ctx.save();

      ctx.translate(x, y);
      ctx.scale(1, sign(curl));
      ctx.strokeStyle = "#000";
      ctx.fillStyle = "#000";
      ctx.lineWidth = abs(curl) * 3;
      ctx.beginPath();
      ctx.moveTo(0, -radius);
      ctx.arc(0, 0, radius, -pi / 2, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(radius, -5);
      ctx.moveTo(radius - 5, -5);
      ctx.lineTo(radius, 5);
      ctx.lineTo(radius + 5, -5);
      ctx.lineTo(radius, -5);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
   }

   function drawSweepLine(sweepArr) {
      sweepCtx.save();

      sweepCtx.translate(-screenX, 0);
      sweepCtx.strokeStyle = sweepGradient;
      sweepCtx.lineWidth = 20;
      sweepCtx.lineCap = "round";
      sweepCtx.lineJoin = "round";

      sweepArr.forEach((arr) => {
         sweepCtx.beginPath();

         arr.forEach(({ x, y, speed }, i) => {
            i === 0 ? sweepCtx.moveTo(x, y) : sweepCtx.lineTo(x, y);
         });

         sweepCtx.stroke();
      });

      sweepCtx.restore();
   }

   function drawMarker(x, y, speed, ctx) {
      ctx.save();

      ctx.fillStyle = "#000";
      ctx.translate(x, y);
      ctx.scale(speed, speed);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-2, 2);
      ctx.lineTo(2, 2);
      ctx.fill();

      ctx.restore();
   }

   function drawNumber(x, y, number, ctx) {
      ctx.save();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `1000 ${stoneRadius * 2}px serif`;
      ctx.lineWidth = 2;
      ctx.fillStyle = "#FFF";
      ctx.strokeStyle = "#000";
      ctx.translate(x, y);
      if (currentLeft) ctx.scale(-1, 1);
      ctx.fillText(number, 0, 0);
      ctx.strokeText(number, 0, 0);

      ctx.restore();
   }

   function drawStaticBackground() {
      statBGCtx.clearRect(0, 0, screenWidth, screenHeight);

      statBGCtx.save();

      drawRings(screenWidth - ringPositionX, ringPositionY, statBGCtx);

      drawLine(hogLine, 0, NaN, screenHeight, "#F00", 5, statBGCtx);

      drawLine(
         screenWidth - ringPositionX,
         0,
         NaN,
         screenHeight,
         "#F005",
         3,
         statBGCtx
      );

      drawLine(
         screenWidth - ringBackX,
         0,
         NaN,
         screenHeight,
         "#F005",
         3,
         statBGCtx
      );

      drawLine(0, ringPositionY, screenWidth, NaN, "#F005", 3, statBGCtx);

      statBGCtx.restore();
   }

   function drawDynamicBackground() {
      dynmBGCtx.clearRect(0, 0, screenWidth, screenHeight);

      if (screenX < hogLine) {
         drawRings(ringPositionX - screenX, ringPositionY, dynmBGCtx);

         drawLine(
            hogLine - screenX,
            0,
            NaN,
            screenHeight,
            "#F00",
            5,
            dynmBGCtx
         );

         drawLine(
            ringPositionX - screenX,
            0,
            NaN,
            screenHeight,
            "#F005",
            3,
            dynmBGCtx
         );

         drawLine(
            ringBackX - screenX,
            0,
            NaN,
            screenHeight,
            "#F005",
            3,
            dynmBGCtx
         );
      }
   }

   function drawStaticStones() {
      staticCtx.clearRect(0, 0, screenWidth, screenHeight);

      playerStyleSet.forEach((player) => {
         let remainingStoneNum = remainingStoneOrderArr.filter(
            (style) => style === player
         ).length;
         if (remainingStoneNum !== 0) {
            let x = playerRemainingStoneX;
            let y = playerStoneYMap.get(player);
            drawStone(x, y, 0, player, staticCtx);
            if (remainingStoneNum !== 1)
               drawNumber(x, y, remainingStoneNum, staticCtx);
         }

         let outStoneNum = outStoneMap.get(player);
         if (outStoneNum !== 0) {
            let x = playerOutStoneX;
            let y = playerStoneYMap.get(player);
            drawStone(x, y, 0, player, staticCtx);
            if (outStoneNum !== 1) drawNumber(x, y, outStoneNum, staticCtx);
         }
      });

      staticStoneSet.forEach((stone) => {
         drawStone(
            stone.x - lineDist,
            stone.y,
            stone.rotate,
            stone.style,
            staticCtx
         );
      });
   }

   function drawTransitionStones() {
      transitionCtx.clearRect(0, 0, screenWidth, screenHeight);

      transitionStoneSet.forEach(({ x, y, rotate, style }) => {
         drawStone(x, y, rotate, style, transitionCtx);
      });
   }

   function drawPrepStone() {
      dynamicCtx.clearRect(0, 0, screenWidth, screenHeight);

      drawStone(releaseX, releaseY, 0, releaseStyle, dynamicCtx);
      drawCurl(releaseX, releaseY, releaseCurl, dynamicCtx);
   }

   function drawReleaseStone() {
      dynamicCtx.clearRect(0, 0, screenWidth, screenHeight);
      markerCtx.clearRect(0, 0, screenWidth, screenHeight);

      drawArrow(startX, startY, releaseX, releaseY, dynamicCtx);
      drawStone(releaseX, releaseY, 0, releaseStyle, dynamicCtx);
      drawCurl(releaseX, releaseY, releaseCurl, dynamicCtx);
      drawMarker(
         (releaseX / sheetLength) * screenWidth,
         markerY,
         findDist(releaseX - startX, releaseY - startY) / 60,
         markerCtx
      );
   }

   function drawDynamicStones() {
      dynamicCtx.clearRect(0, 0, screenWidth, screenHeight);
      markerCtx.clearRect(0, 0, screenWidth, screenHeight);

      dynamicStoneSet.forEach((stone) => {
         drawStone(
            stone.x - screenX,
            stone.y,
            stone.rotate,
            stone.style,
            dynamicCtx
         );
         drawMarker(
            (stone.x / sheetLength) * screenWidth,
            markerY,
            stone.speed,
            markerCtx
         );
      });
   }

   function drawSweep() {
      sweepCtx.clearRect(0, 0, screenWidth, screenHeight);

      drawSweepLine(sweepArr);
   }

   function drawCoverScreen() {
      coverCtx.clearRect(0, 0, screenWidth, screenHeight);
      coverCtx.globalAlpha = alpha;
      coverCtx.fillRect(0, 0, screenWidth, screenHeight);
   }

   function drawDirection() {
      if (currentLeft) {
         statBGCtx.translate(screenWidth, 0);
         statBGCtx.scale(-1, 1);

         dynmBGCtx.translate(screenWidth, 0);
         dynmBGCtx.scale(-1, 1);

         sweepCtx.translate(screenWidth, 0);
         sweepCtx.scale(-1, 1);

         transitionCtx.translate(screenWidth, 0);
         transitionCtx.scale(-1, 1);

         staticCtx.translate(screenWidth, 0);
         staticCtx.scale(-1, 1);

         dynamicCtx.translate(screenWidth, 0);
         dynamicCtx.scale(-1, 1);

         markerCtx.translate(screenWidth, 0);
         markerCtx.scale(-1, 1);
         return;
      }

      statBGCanvas.width =
         dynmBGCanvas.width =
         sweepCanvas.width =
         transitionCanvas.width =
         staticCanvas.width =
         dynamicCanvas.width =
         markerCanvas.width =
            screenWidth;
   }

   function createScoreboard() {
      playerStyleSet.forEach((style) => {
         let playerRow = scoreTable.insertRow(0);
         playerRow.id = style;
         let playerCell = playerRow.insertCell(0);
         playerCell.innerHTML = playerNameMap.get(style);
         playerCell.style.textAlign = "left";
         playerCell.style.color = style;
         playerCell.style.fontWeight = "bold";
         playerCell.style.borderRightWidth = "3px";
         playerCell.style.textShadow = "0 0 2px #000";

         let cellArr = [];
         for (let i = 1; i <= playRounds; i++) {
            let cell = playerRow.insertCell(i);
            cellArr.push(cell);
         }
         scoreCellMap.set(style, cellArr);

         let playerTotal = playerRow.insertCell(playRounds + 1);
         playerTotal.innerHTML = 0;
         playerTotal.style.textAlign = "left";
         playerTotal.style.fontWeight = "bold";
         playerTotal.style.borderLeftWidth = "3px";
         totalCellMap.set(style, playerTotal);
         scoreTotalMap.set(style, 0);
      });

      let headerRow = scoreTable.insertRow(0);
      let emptyCell = headerRow.insertCell(0);
      emptyCell.style.textAlign = "left";
      emptyCell.style.borderRightWidth = "3px";
      emptyCell.style.borderBottomWidth = "3px";

      for (let i = 1; i <= playRounds; i++) {
         let headerCell = headerRow.insertCell(i);
         headerCell.innerHTML = i;
         headerCell.style.fontWeight = "bold";
         headerCell.style.borderBottomWidth = "3px";
      }

      let headerTotal = headerRow.insertCell(playRounds + 1);
      headerTotal.innerHTML = "Total";
      headerTotal.style.textAlign = "left";
      headerTotal.style.fontWeight = "bold";
      headerTotal.style.borderLeftWidth = "3px";
      headerTotal.style.borderBottomWidth = "3px";

      updateHammer();
   }

   function createRemainingStones() {
      for (let i = 0; i < playStones; i++) {
         remainingStoneOrderArr.push(...playerOrderArr);
      }
   }

   function createOutStones() {
      playerStyleSet.forEach((player) => {
         outStoneMap.set(player, 0);
      });
   }

   function createPlayerStoneY() {
      playerOrderArr.forEach((player, position) => {
         position % 2 == 0
            ? playerStoneYMap.set(player, (position + 1) * stoneRadius)
            : playerStoneYMap.set(
                 player,
                 screenHeight - position * stoneRadius
              );
      });
   }

   function addDirection(x) {
      return currentLeft ? screenWidth - x : x;
   }

   function findArrayLength(array) {
      return array.reduce(
         (acc, obj) => acc + (obj.length === 0 ? 1 : obj.length),
         0
      );
   }

   function calculateOrder(scorer) {
      if (!scorer) return;
      let remainingPlayers = [...playerOrderArr];
      remainingPlayers.splice(remainingPlayers.indexOf(scorer), 1);
      playerOrderArr = [...remainingPlayers, scorer];
   }

   function updateScore(style, score) {
      scoreCellMap.forEach((cellArr, cellStyle) => {
         let currCell = cellArr[currentRound - 1];
         currCell.innerHTML = cellStyle === style ? score : 0;
      });
   }

   function updateHammer() {
      scoreCellMap.forEach((cellArr, cellStyle) => {
         let nextCell = cellArr[currentRound];
         nextCell.appendChild(hammers[playerOrderArr.indexOf(cellStyle)]);
      });
   }

   function updateTotal(style, score) {
      if (!style) return;
      let total = scoreTotalMap.get(style) + score;
      scoreTotalMap.set(style, total);
      totalCellMap.get(style).innerHTML = total;
   }

   function calculateScore() {
      let closestStones = [];
      staticStoneSet.forEach((stone) => {
         let distanceFromCenter = findDist(
            stone.x - sheetLength + ringPositionX,
            stone.y - ringPositionY
         );
         if (distanceFromCenter < ringRadius + stoneRadius) {
            closestStones.push({
               dist: distanceFromCenter,
               style: stone.style,
            });
         }
      });

      let closestStyle = "";
      let closestScore = NaN;

      if (closestStones.length > 0) {
         closestStones = closestStones.sort((a, b) => a.dist - b.dist);

         closestStyle = closestStones[0].style;
         closestScore = 0;
         for (let { style } of closestStones) {
            if (style !== closestStyle) {
               break;
            }
            closestScore++;
         }
      }

      calculateOrder(closestStyle);
      updateScore(closestStyle, closestScore);
      updateHammer();
      updateTotal(closestStyle, closestScore);
   }

   function getHammerSize(players, index) {
      return ((players - index) / players) * 100 + "%";
   }

   function createHammers(players) {
      let hammers = [];
      for (let i = 0; i < players; i++) {
         let img = document.createElement("img");
         img.src = "icons/hammer.svg";
         img.style.width = getHammerSize(players, i);
         hammers.push(img);
      }
      return hammers;
   }

   function updateTransitionStones() {
      transitionStoneSet.forEach((stone) => {
         let { x, y, finalX, finalY, rotate, style, finish } = stone;
         stone.x = headTowards(x, finalX, 0.05, 0.5);
         stone.y = headTowards(y, finalY, 0.05, 0.5);
         stone.rotate = headTowards(rotate, 0, 0.05, 0.01);
         if (x === finalX && y === finalY && rotate === 0) {
            finish(stone);
            transitionStoneSet.delete(stone);
         }
      });

      drawTransitionStones();

      if (transitionStoneSet.size === 0) {
         updateFunctionMap.delete("updateTransition");
      }
   }

   function updateRemainingStone() {
      let style = remainingStoneOrderArr.pop();
      drawStaticStones();

      transitionStoneSet.add({
         x: playerRemainingStoneX,
         y: playerStoneYMap.get(style),
         finalX: ringBackX,
         finalY: ringPositionY,
         rotate: 0,
         style,
         finish: (stone) => {
            releaseX = stone.x;
            releaseY = stone.y;
            releaseStyle = stone.style;
            drawPrepStone();
         },
      });

      updateFunctionMap.set("updateTransition", updateTransitionStones);
   }

   function updateCurl(curl) {
      releaseCurl = curl < 0 ? max(curl - 1, -2) : min(curl + 1, 2);

      if (updateFunctionMap.size === 0) {
         drawPrepStone();
      }
   }

   function dimCurl() {
      releaseCurl = max(releaseCurl - 0.5, -2);
      if (releaseCurl > -1 && releaseCurl < 1) {
         releaseCurl = -1;
      }

      if (updateFunctionMap.size === 0) {
         drawPrepStone();
      }
   }

   function accCurl() {
      releaseCurl = min(releaseCurl + 0.5, 2);
      if (releaseCurl > -1 && releaseCurl < 1) {
         releaseCurl = 1;
      }

      if (updateFunctionMap.size === 0) {
         drawPrepStone();
      }
   }

   function createReleaseStone(x, y) {
      startX = x;
      startY = y;
   }

   function updateReleaseStoneValues(x, y) {
      releaseX = min(x, hogLine - stoneRadius);
      releaseY = y;
   }

   function updateReleaseStone() {
      drawReleaseStone();
   }

   function createDynamicStone(x, y, speed, angle, rotate, curl, style, isHit) {
      dynamicStoneSet.add({
         x,
         y,
         speed,
         angle,
         friction: 0,
         angleAcc: 0,
         rotate,
         curl,
         style,
         isHit,
      });

      updateFunctionMap.set("updateDynamic", updateDynamicStones);
      updateFunctionMap.set("updateScreen", updateScreenX);
   }

   function updateSweepValues(x, y) {
      sweepX = x;
      sweepY = y;
   }

   function updateSweep() {
      let arr = sweepArr[0];
      let lastArr = sweepArr[sweepArr.length - 1];
      if (sweepX !== prevX || sweepY !== prevY) {
         let sSpeed =
            arr.length < 2
               ? 0
               : findDist(sweepX + screenX - arr[0].x, sweepY - arr[0].y);

         prevX = sweepX;
         prevY = sweepY;

         arr.unshift({ x: sweepX + screenX, y: sweepY, speed: sSpeed });
      } else {
         sweepArr.unshift([]);
      }

      while (findArrayLength(sweepArr) > 30) {
         if (lastArr.length === 0) {
            sweepArr.pop();
         } else {
            lastArr.pop();
         }
      }

      drawSweep();
   }

   function findSweep(stone) {
      let { x, y, friction, angleAcc, curl } = stone;
      sweepArr.forEach((arr) => {
         arr.forEach(({ x: sX, y: sY, speed: sSpeed }) => {
            if (findDist(sX - x, sY - y) < stoneRadius) {
               let dY = sY - y;
               stone.friction = max(
                  friction - approachMax(sSpeed, 0.00005, 1),
                  0
               );
               stone.angleAcc =
                  max(
                     abs(angleAcc) +
                        approachMax(
                           abs(dY),
                           approachMin(
                              abs(curl),
                              approachMin(sSpeed, 0.0005, 0.5),
                              0.05
                           ),
                           1
                        ) *
                           sign(dY) *
                           sign(curl),
                     0
                  ) * sign(curl);
               return;
            }
         });
      });
   }

   function findHit(stone) {
      let { x, y, speed, angle, curl } = stone;

      staticStoneSet.forEach((sStone) => {
         let { x: sX, y: sY, rotate: sRotate, style: sStyle } = sStone;
         let dX = sX - x;
         let dY = sY - y;

         if (findDist(dX, dY) < stoneRadius * 2) {
            let currSpeedX = speed * cos(angle);
            let currSpeedY = speed * sin(angle);
            let sAngle = atan2(dY, dX);
            let dAngle = sAngle - angle;

            let sCurl = sign(dAngle);

            let transfer = speed * cos(dAngle);
            let keep = speed * sin(dAngle);

            let sSpeedX = (transfer * cos(sAngle)) / 2;
            let sSpeedY = (transfer * sin(sAngle)) / 2;
            let sSpeed = findDist(sSpeedX, sSpeedY);

            let newSpeedX = currSpeedX / 2 - sSpeedX;
            let newSpeedY = currSpeedY / 2 - sSpeedY;

            stone.speed = findDist(newSpeedX, newSpeedY);
            stone.angle = atan2(newSpeedY, newSpeedX);
            stone.curl = sCurl;

            staticStoneSet.delete(sStone);
            drawStaticStones();
            createDynamicStone(
               sX,
               sY,
               sSpeed,
               sAngle,
               sRotate,
               sCurl,
               sStyle,
               true
            );
         }
      });
   }

   function updateDynamicStoneValues(stone) {
      let { x, y, speed, angle, friction, angleAcc, rotate, curl } = stone;

      stone.friction += 0.00005;
      stone.angleAcc +=
         approachMin(abs(curl), approachMin(speed, 0.0001, 0.5), 0.05) *
         sign(curl);

      stone.speed = max(speed - friction, 0);
      stone.angle += angleAcc;

      findSweep(stone);
      if (x > sheetLength - hogLine - stoneRadius) findHit(stone);

      stone.x += speed * cos(angle);
      stone.y += speed * sin(angle);

      stone.rotate = ((rotate + curl / 50 + pi) % (pi * 2)) - pi;
   }

   function updateDynamicStones() {
      dynamicStoneSet.forEach((stone) => {
         updateDynamicStoneValues(stone);

         let { x, y, speed, rotate, style } = stone;

         if (
            (speed === 0 && x < sheetLength - hogLine + stoneRadius) ||
            x < stoneRadius ||
            x > sheetLength - ringBackX + stoneRadius ||
            y < stoneRadius ||
            y > screenHeight - stoneRadius
         ) {
            dynamicStoneSet.delete(stone);
            transitionStoneSet.add({
               x: x - screenX,
               y,
               finalX: playerOutStoneX,
               finalY: playerStoneYMap.get(style),
               rotate: rotate,
               style,
               finish: (stone) => {
                  outStoneMap.set(style, outStoneMap.get(style) + 1);
                  drawStaticStones();
               },
            });

            updateFunctionMap.set("updateTransition", updateTransitionStones);
         } else if (speed === 0) {
            dynamicStoneSet.delete(stone);
            staticStoneSet.add({ x, y, rotate, style });
            drawStaticStones();
         }
      });

      drawDynamicStones();

      if (dynamicStoneSet.size === 0) {
         updateFunctionMap.delete("updateDynamic");

         if (remainingStoneOrderArr.length === 0) {
            currentLeft = !currentLeft;
            currentRound += 1;
            calculateScore();
            moveScoreboardDown();
            updateFunctionMap.set("updateRound", dimScreen);
         } else {
            resetRound();
            updateFunctionMap.set("resetScreen", resetScreenX);
         }
      }
   }

   function updateScreenX() {
      if (dynamicStoneSet.size !== 1) {
         updateFunctionMap.delete("updateScreen");
         return;
      }

      let { x, speed } = [...dynamicStoneSet][0];
      screenX = min(
         max(screenX + min(x - screenWidth / 3 - screenX, speed + 3), 0),
         lineDist
      );

      if (screenX === lineDist) {
         updateFunctionMap.delete("updateScreen");
      }

      drawDynamicBackground();
   }

   function resetScreenX() {
      screenX = headTowards(screenX, 0, 0.05, 0.5);

      if (screenX === 0) {
         updateFunctionMap.delete("resetScreen");
         updateRemainingStone();
      }

      drawDynamicBackground();
   }

   function resetRound() {
      startX = NaN;
      startY = NaN;
      releaseX = NaN;
      releaseY = NaN;
      releaseCurl = 1;
      releaseStyle = "";

      sweepArr = [[]];
      sweepX = NaN;
      sweepY = NaN;
      prevX = NaN;
      prevY = NaN;
   }

   function updateRound() {
      screenX = 0;
      resetRound();
      remainingStoneOrderArr = [];
      staticStoneSet.clear();
      outStoneMap.clear();
      createRemainingStones();
      createPlayerStoneY();
      createOutStones();

      drawDirection();
      drawStaticBackground();
      drawDynamicBackground();
      drawStaticStones();
   }

   function dimScreen() {
      alpha += 0.01;
      drawCoverScreen();
      if (alpha >= 1) {
         alpha = 1;
         updateRound();
         updateFunctionMap.set("updateRound", accScreen);
      }
   }

   function accScreen() {
      alpha -= 0.01;
      drawCoverScreen();
      if (alpha <= 0) {
         alpha = 0;
         moveScoreboardUp();
         updateRemainingStone();
         updateFunctionMap.delete("updateRound");
      }
   }

   function gameFunction() {
      updateFunctionMap.forEach((func) => func());
      updateSweep();

      window.requestAnimationFrame(gameFunction);
   }

   function checkMouseY(y, screenY) {
      if (y < screenY - screenHeight * 0.9) return false;
      return true;
   }

   moveScoreBtn.addEventListener("click", () => {
      moveScoreBtn.hasAttribute("down")
         ? moveScoreboardUp()
         : moveScoreboardDown();
   });

   window.addEventListener("keyup", (event) => {
      if (event.key === "ArrowUp") {
         dimCurl();
         return;
      }

      if (event.key === "ArrowDown") {
         accCurl();
         return;
      }
   });

   curlScreen.addEventListener("pointerdown", (event) => {
      if (
         updateFunctionMap.size !== 0 &&
         !updateFunctionMap.has("updateRelease")
      )
         return;
      updateCurl((event.offsetY / windowHeight) * 2 - 1);
      curlPointerDown = true;
   });

   curlScreen.addEventListener("pointermove", (event) => {
      if (!curlPointerDown) return;
      if (
         updateFunctionMap.size !== 0 &&
         !updateFunctionMap.has("updateRelease")
      )
         return;
      updateCurl((event.offsetY / windowHeight) * 2 - 1);
   });

   curlScreen.addEventListener("pointerup", (event) => {
      curlPointerDown = false;
      if (
         updateFunctionMap.size !== 0 &&
         !updateFunctionMap.has("updateRelease")
      )
         return;
      updateCurl((event.offsetY / windowHeight) * 2 - 1);
   });

   gameScreen.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary) return;
      let x = min(addDirection(event.offsetX), hogLine - stoneRadius);
      let y = event.offsetY;
      if (!checkMouseY(y, event.clientY)) return;

      if (updateFunctionMap.size !== 0) return;

      createReleaseStone(x, y);
      updateReleaseStoneValues(x, y);

      updateFunctionMap.set("updateRelease", updateReleaseStone);
   });

   gameScreen.addEventListener("pointermove", (event) => {
      if (!event.isPrimary) return;
      let x = addDirection(event.offsetX);
      let y = event.offsetY;
      if (!checkMouseY(y, event.clientY)) return;

      if (updateFunctionMap.has("updateRelease")) {
         updateReleaseStoneValues(x, y);
      } else if (
         !updateFunctionMap.has("resetScreen") &&
         !updateFunctionMap.has("updateRound")
      ) {
         updateSweepValues(x, y);
      }
   });

   gameScreen.addEventListener("pointerup", (event) => {
      if (!event.isPrimary) return;
      let x = min(addDirection(event.offsetX), hogLine - stoneRadius);
      let y = event.offsetY;
      if (!checkMouseY(y, event.clientY)) return;

      if (!updateFunctionMap.has("updateRelease")) return;

      updateFunctionMap.delete("updateRelease");

      let speed = findDist(x - startX, y - startY) / 60;
      let angle = atan2(y - startY, x - startX);

      if (speed > 1) {
         createDynamicStone(
            x,
            y,
            speed,
            angle,
            0,
            releaseCurl,
            releaseStyle,
            false
         );
      }
   });

   createScoreboard();
   updateRound();
   updateFunctionMap.set("updateRound", accScreen);

   window.requestAnimationFrame(gameFunction);
}
