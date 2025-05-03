class Display {
   constructor(input, gray) {
      this.value = [
         "0",
         "1",
         "2",
         "3",
         "4",
         "5",
         "6",
         "7",
         "8",
         "9",
         "A",
         "B",
         "C",
         "D",
         "E",
         "F",
         "G",
         "H",
         "I",
         "J",
         "K",
         "L",
         "M",
         "N",
         "O",
         "P",
         "Q",
         "R",
         "S",
         "T",
         "U",
         "V",
         "W",
         "X",
         "Y",
         "Z",
         "a",
         "b",
         "c",
         "d",
         "e",
         "f",
         "g",
         "h",
         "i",
         "j",
         "k",
         "l",
         "m",
         "n",
         "o",
         "p",
         "q",
         "r",
         "s",
         "t",
         "u",
         "v",
         "w",
         "x",
         "y",
         "z",
         "_",
         "-",
         "~",
         "?",
         "!",
         "@",
         "#",
         "$",
         "%",
         "^",
         "&",
         "/",
         "(",
         ")",
         "[",
         "]",
         "{",
         "}",
         "|",
      ];

      this.code = ["", ""];
      this.save = {
         rose: [
            "10o0o",
            "eeeee[|eeeeeeeee[|0&]ieeeeee}0yus0ieeeeeMI02u(8feeee@6LuFus_eeeee(yyKy(&leeeeM(K068pKfeee[$${Q2Q7_eeeesu2O0O07jeee/{s8&Qs2(deeMQ||(||(8leeelu|Q|||8sdeeM7&&^|Q9{Zeeeu80s}00{|dee@{{800&8|ceeeY]||||||8eee@j||||||}deeeMs|||||oaeeee7[||{|uSeeeee2D}_|cSeeeee@9I{&l0eeeeee[039a0eeeeeee@S043defeeeeeeaeDdezfeeheeeRAaeM6feMfeeebdeeKgeeuieeDWeezweeM1i}ekde7ogeel4QsDWeM^xeeMd4Cbkd@p|ceezMeeCWez|Pee@g7dVkd@$|cee7eQRAVe4}Neee2e}BbdeT^aee@ReMtSeedReeenReYCee40eeeeMR0@beeVeeeee4003eeYdeeeeee1TdeMbeeeeeeeMVeeBeeeeeee@FdeYdeeeeeeezbePbeeeeeeeM4ePUeeeeeeeecdPCeeeeeeeeYSPCdeeeeeee@CPCjeeeeeeeecI3yaeeeeeeeMw3!Lfeeeeeeec0dVUeeeeeeeY4de2deee",
         ],

         sunflower: [
            "10o0o",
            "eeeeeee}||reeeeeeeee||reeeeeeeeee[ieeee|eeeeeeeeeee|reeeeeeeee[[|#|eeeeeeee||||reeeeeee[||||feeeeeee|||||reeaeee[|||||fe4eeee||||feDDVVee[|||reeSbCdee|reeeRVAZCDa[reeeVSL{uACeeeeeemuxQP$beeeeeD|({({Z[eeeee/|yQ(|)ieeeee{_{K|(|eeeees|K_{Qaheee}a/|a&|daeee}Q}&HR|&Weee[|8|p0-(8eeee|{2I10v0deee|BR@000jDaeePOa}r00-|fabbJL}|500}|5UU0v8{8000|2CDDw{60B0R60DU3&t8&_50P|RdbJ{K?8|1)8raW3OQ0D|84|Z4)B1&06{Q(y|2AU3e00y|yQ(QUCA]Q0I|_{K|8AU3}00&Q_Q_|UCA1a0UNp{?uGAUUOH-CRuQFRSCAJ{B8IC/UA1AU3&t8P03VTUUCAAw{XAAbC9AARR0vZ0RRRYRR9AAJmIAA1b9A/333I1033343vEAAABAAAAbB1fRRRaRRRRRCsf400010000RSee000F00000Cf7400R10000Rb8e0sH300000d6e1see0000004e1",
         ],

         path: [
            "10o0o",
            "x|20s||Q00{||(Q00{||20s|QP|800||800||g_|RR&||00&|_q(QAA||HA~|Qr%{WU)||UU{|p@_|AA||HA/|_h](ZUv|rUU|8qhN|BA}|BA}Q(e@1rVw|rd!QXifM5ie}|fe|{mh@xxe@|re[(wfe[ppe[|e@QfpeeYPfe|ie}p/hend_e[|e[?GrfeVnge|ieQile@@/Pf[|e}mDienMeYe}f@Zf/eeec[g@re|pDfeeDeNdee[?hkee%k[Kee@8rD[ehV@Gb|i@&eV@e1eeJ||iJnnSe1enMz||Hk[ebReeez{||Kfebaeee@v||ZWVDdeb@dw{||ddR4bDDbGw||uDdR0a9C1d{|QdC9094AUd&||B9U00RS00&|||00R00000&||||00300003eeee49R100Is&^[h|02F0001UyOwK79R4909RbYs6G11b0101dA-BSD9a49090e1D4U90e01RURC7VUe4a390ddeaUjae0e01Reb4a04b0R400dee994bDS900RVDSdbAdDe100aeD413ReeD000ed111Addb000Re4edC4ee1DRabeR11SaeVeADeD4R0U0ededdeeD0S93ReDeeVeeS3939CeeD",
         ],

         pegasus: [
            "10o0o",
            "|^%}}|^|%%||roojoooo50mor%7a0-%70eDs%Y5eee00eD0e1m1D00deD000aDaD0000000000e0e400000Re00RDRD0000R4d004p1e000d4MC00q^8dD0d0-M40r^]P94a&|aV1-^rl^XS/||!A0]|_{xBv||QG1&|%OQQep{|Zb0}|_3&8&/||m3&qiyM|!u||QWDsr8f&8s|x|lCe1rS/{{|86OERa49u|(||HQ160Re{||Q]^|5QT00V|||(q|]|K409[|||{|^|_X00~Q&__|||r|209}9|((||r||00~Z(Q|p]|}r209[v|?Q^|||}00V8|H}(^||}80a)||d|{|o||00b}|V[H|||r50C||5@|x|||}0R{|8d||/^||80w(QE||E{|||098|&K|fA{%i50/{k{/EVD{|i09qwAwi34D)q504453r3D0Dah0R4Q0{1D00ea409^K{8R100d000kT&]69000d409}t^?110000004V{YSD000000R4V}S40000000RebV4000000000a0400aee10000dD00e10a40000000DRooRe1d400RD$%%%1aeRD0d4mo]oo%0-1ee0%%||}rooo50jo]||||",
         ],

         bunny: [
            "10j0o",
            "0C0C0C0C0C00a1a1a1a1a100404040404033Q33333Q33C0]2C0C0r2Ca1gQa1a1r7a14j}2404|M043v[Q333|#330Cf|2C0|fB00ag}Qa1|iY100k[|04{rM403ve|83{r@33C0f}Q0&|e2Ca1g[#2&[f7a14jer7s[fM043vVq||ri!330CWj|||NUB00aF&||||2Y100ks||||8L4033x|||||L33C0F|||||?0Ca1j{||||Z2a140]||||r20433$u|||&7330Cs2|||28C00a16(||u6a1004Iy||8K04033v0||Qs333C0CB{||3B0Ca19O&||281a140{&||Q{30433&|||||2330C&||}}|QC00at||8{||a100w|||{||84033%||(||G33C0!}|_||h0Ca1R%|x)|h0a140!||||i00433R@|||e0330CaeeeeeD9009&|fee[|2100{||AA}||003&||HD}||23C&|||A}||QCaS|||B/||ra14}||Eb|||143!}|HA}|^430R%|H9-|^4009![D00@f410",
         ],
      };

      if (!gray) this.white = true;

      this.type = 0;
      this.final = 0;

      this.open = 0;
      this.half = 0;
      this.full = 0;

      this.canvas = document.getElementById("canvas");
      this.ctx = this.canvas.getContext("2d");

      this.background = document.getElementById("background");
      this.bgctx = this.background.getContext("2d");

      this.codeText = document.getElementById("code-text");

      this.canvas.width = this.background.width = window.innerWidth;
      this.canvas.height = this.background.height = window.innerHeight;

      this.codeText.style.width =
         this.canvas.width < this.canvas.height ? "100%" : "calc(50vw - 50vh)";

      if (input.includes("*")) {
         this.gridWidth = Number(input.split("*")[0]);
         this.gridHeight = Number(input.split("*")[1]);

         if (
            this.canvas.height / this.canvas.width <
            this.gridHeight / this.gridWidth
         ) {
            this.height = (this.canvas.height * 2) / 3;
            this.width = (this.height / this.gridHeight) * this.gridWidth;
         } else {
            this.width = (this.canvas.width * 2) / 3;
            this.height = (this.width / this.gridWidth) * this.gridHeight;
         }

         this.new = true;

         this.code[0] +=
            0 +
            this.value[Math.floor(this.gridWidth / 81)] +
            this.value[this.gridWidth % 81] +
            this.value[Math.floor(this.gridHeight / 81)] +
            this.value[this.gridHeight % 81];

         for (
            this.i = 0;
            this.i <
            (Number(input.split("*")[0]) * Number(input.split("*")[1])) / 4;
            this.i++
         ) {
            this.code[1] += this.value[40 * input.split("*")[2]];
         }

         for (
            this.i = 0;
            this.i <
            ((Number(input.split("*")[0]) * Number(input.split("*")[1]) - 1) %
               4) +
               1;
            this.i++
         ) {
            this.final += Math.pow(3, this.i) * input.split("*")[2];
         }

         this.code[1] =
            this.code[1].substr(0, this.code[1].length - 1) +
            this.value[this.final];
      } else if (input === "compare") {
         this.name = Object.keys(this.save)[0];
         this.code = this.save[this.name];

         this.gridWidth =
            this.value.indexOf(this.code[0][1]) * 81 +
            this.value.indexOf(this.code[0][2]);
         this.gridHeight =
            this.value.indexOf(this.code[0][3]) * 81 +
            this.value.indexOf(this.code[0][4]);

         if (
            this.canvas.height / this.canvas.width <
            this.gridHeight / this.gridWidth
         ) {
            this.height = (this.canvas.height * 2) / 3;
            this.width = (this.height / this.gridHeight) * this.gridWidth;
         } else {
            this.width = (this.canvas.width * 2) / 3;
            this.height = (this.width / this.gridWidth) * this.gridHeight;
         }

         this.new = false;

         enableScroll();
      } else {
         if (input.includes("code")) {
            this.name = input.split(" ")[1];
            this.code = this.save[this.name];
         } else {
            this.code = input.split(" ");
         }

         this.gridWidth =
            this.value.indexOf(this.code[0][1]) * 81 +
            this.value.indexOf(this.code[0][2]);
         this.gridHeight =
            this.value.indexOf(this.code[0][3]) * 81 +
            this.value.indexOf(this.code[0][4]);

         if (
            this.canvas.height / this.canvas.width <
            this.gridHeight / this.gridWidth
         ) {
            this.height = (this.canvas.height * 2) / 3;
            this.width = (this.height / this.gridHeight) * this.gridWidth;
         } else {
            this.width = (this.canvas.width * 2) / 3;
            this.height = (this.width / this.gridWidth) * this.gridHeight;
         }

         if (this.code[0][0] === "0") {
            this.new = true;
         } else {
            this.new = false;
         }
      }

      if (this.white) {
         this.ctx.fillStyle = "#FFF";
         this.ctx.strokeStyle = "#FFF";
      } else {
         this.ctx.fillStyle = "#555";
         this.ctx.strokeStyle = "#555";
      }

      this.ctx.lineWidth = Math.floor(this.width / this.gridWidth / 4);

      for (this.i in this.code[1]) {
         if (this.value.indexOf(this.code[1][this.i]) % 3 === 1) {
            this.half += 1;

            if (
               (Math.floor((this.i * 4) / this.gridWidth) + this.gridHeight) %
                  2 ===
               0
            ) {
               this.ctx.beginPath();
               this.ctx.moveTo(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     (((this.i * 4) % this.gridWidth) + 1) *
                        (this.width / this.gridWidth),
                  this.canvas.height / 2 -
                     this.height / 2 +
                     Math.floor((this.i * 4) / this.gridWidth) *
                        (this.width / this.gridWidth)
               );
               this.ctx.lineTo(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     ((this.i * 4) % this.gridWidth) *
                        (this.width / this.gridWidth),
                  this.canvas.height / 2 -
                     this.height / 2 +
                     Math.floor((this.i * 4) / this.gridWidth + 1) *
                        (this.width / this.gridWidth)
               );
               this.ctx.stroke();
            } else {
               this.ctx.beginPath();
               this.ctx.moveTo(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     ((this.i * 4) % this.gridWidth) *
                        (this.width / this.gridWidth),
                  this.canvas.height / 2 -
                     this.height / 2 +
                     Math.floor((this.i * 4) / this.gridWidth) *
                        (this.width / this.gridWidth)
               );
               this.ctx.lineTo(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     (((this.i * 4) % this.gridWidth) + 1) *
                        (this.width / this.gridWidth),
                  this.canvas.height / 2 -
                     this.height / 2 +
                     Math.floor((this.i * 4) / this.gridWidth + 1) *
                        (this.width / this.gridWidth)
               );
               this.ctx.stroke();
            }
         } else if (
            (this.value.indexOf(this.code[1][this.i]) % 3 === 2 &&
               this.white) ||
            (this.value.indexOf(this.code[1][this.i]) % 3 === 0 && !this.white)
         ) {
            this.full += 1;

            this.ctx.fillRect(
               this.canvas.width / 2 -
                  this.width / 2 +
                  (((this.i * 4) % this.gridWidth) + 2 / 7) *
                     (this.width / this.gridWidth),
               this.canvas.height / 2 -
                  this.height / 2 +
                  Math.floor((this.i * 4) / this.gridWidth) *
                     (this.width / this.gridWidth),
               ((this.width / this.gridWidth) * 3) / 7,
               this.width / this.gridWidth
            );
         }

         if (
            Math.floor((this.value.indexOf(this.code[1][this.i]) % 9) / 3) === 1
         ) {
            this.half += 1;

            if (
               Math.floor((this.i * 4 + 1) / this.gridWidth + this.gridHeight) %
                  2 ===
               0
            ) {
               this.ctx.beginPath();
               this.ctx.moveTo(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     (((this.i * 4 + 1) % this.gridWidth) + 1) *
                        (this.width / this.gridWidth),
                  this.canvas.height / 2 -
                     this.height / 2 +
                     Math.floor((this.i * 4 + 1) / this.gridWidth) *
                        (this.width / this.gridWidth)
               );
               this.ctx.lineTo(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     ((this.i * 4 + 1) % this.gridWidth) *
                        (this.width / this.gridWidth),
                  this.canvas.height / 2 -
                     this.height / 2 +
                     Math.floor((this.i * 4 + 1) / this.gridWidth + 1) *
                        (this.width / this.gridWidth)
               );
               this.ctx.stroke();
            } else {
               this.ctx.beginPath();
               this.ctx.moveTo(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     ((this.i * 4 + 1) % this.gridWidth) *
                        (this.width / this.gridWidth),
                  this.canvas.height / 2 -
                     this.height / 2 +
                     Math.floor((this.i * 4 + 1) / this.gridWidth) *
                        (this.width / this.gridWidth)
               );
               this.ctx.lineTo(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     (((this.i * 4 + 1) % this.gridWidth) + 1) *
                        (this.width / this.gridWidth),
                  this.canvas.height / 2 -
                     this.height / 2 +
                     Math.floor((this.i * 4 + 1) / this.gridWidth + 1) *
                        (this.width / this.gridWidth)
               );
               this.ctx.stroke();
            }
         } else if (
            (Math.floor((this.value.indexOf(this.code[1][this.i]) % 9) / 3) ===
               2 &&
               this.white) ||
            (Math.floor((this.value.indexOf(this.code[1][this.i]) % 9) / 3) ===
               0 &&
               !this.white)
         ) {
            this.full += 1;

            this.ctx.fillRect(
               this.canvas.width / 2 -
                  this.width / 2 +
                  (((this.i * 4 + 1) % this.gridWidth) + 2 / 7) *
                     (this.width / this.gridWidth),
               this.canvas.height / 2 -
                  this.height / 2 +
                  Math.floor((this.i * 4 + 1) / this.gridWidth) *
                     (this.width / this.gridWidth),
               ((this.width / this.gridWidth) * 3) / 7,
               this.width / this.gridWidth
            );
         }

         if (
            Math.floor((this.value.indexOf(this.code[1][this.i]) % 27) / 9) ===
            1
         ) {
            this.half += 1;

            if (
               Math.floor((this.i * 4 + 2) / this.gridWidth + this.gridHeight) %
                  2 ===
               0
            ) {
               this.ctx.beginPath();
               this.ctx.moveTo(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     (((this.i * 4 + 2) % this.gridWidth) + 1) *
                        (this.width / this.gridWidth),
                  this.canvas.height / 2 -
                     this.height / 2 +
                     Math.floor((this.i * 4 + 2) / this.gridWidth) *
                        (this.width / this.gridWidth)
               );
               this.ctx.lineTo(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     ((this.i * 4 + 2) % this.gridWidth) *
                        (this.width / this.gridWidth),
                  this.canvas.height / 2 -
                     this.height / 2 +
                     Math.floor((this.i * 4 + 2) / this.gridWidth + 1) *
                        (this.width / this.gridWidth)
               );
               this.ctx.stroke();
            } else {
               this.ctx.beginPath();
               this.ctx.moveTo(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     ((this.i * 4 + 2) % this.gridWidth) *
                        (this.width / this.gridWidth),
                  this.canvas.height / 2 -
                     this.height / 2 +
                     Math.floor((this.i * 4 + 2) / this.gridWidth) *
                        (this.width / this.gridWidth)
               );
               this.ctx.lineTo(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     (((this.i * 4 + 2) % this.gridWidth) + 1) *
                        (this.width / this.gridWidth),
                  this.canvas.height / 2 -
                     this.height / 2 +
                     Math.floor((this.i * 4 + 2) / this.gridWidth + 1) *
                        (this.width / this.gridWidth)
               );
               this.ctx.stroke();
            }
         } else if (
            (Math.floor((this.value.indexOf(this.code[1][this.i]) % 27) / 9) ===
               2 &&
               this.white) ||
            (Math.floor((this.value.indexOf(this.code[1][this.i]) % 27) / 9) ===
               0 &&
               !this.white)
         ) {
            this.full += 1;

            this.ctx.fillRect(
               this.canvas.width / 2 -
                  this.width / 2 +
                  (((this.i * 4 + 2) % this.gridWidth) + 2 / 7) *
                     (this.width / this.gridWidth),
               this.canvas.height / 2 -
                  this.height / 2 +
                  Math.floor((this.i * 4 + 2) / this.gridWidth) *
                     (this.width / this.gridWidth),
               ((this.width / this.gridWidth) * 3) / 7,
               this.width / this.gridWidth
            );
         }

         if (Math.floor(this.value.indexOf(this.code[1][this.i]) / 27) === 1) {
            this.half += 1;

            if (
               Math.floor((this.i * 4 + 3) / this.gridWidth + this.gridHeight) %
                  2 ===
               0
            ) {
               this.ctx.beginPath();
               this.ctx.moveTo(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     (((this.i * 4 + 3) % this.gridWidth) + 1) *
                        (this.width / this.gridWidth),
                  this.canvas.height / 2 -
                     this.height / 2 +
                     Math.floor((this.i * 4 + 3) / this.gridWidth) *
                        (this.width / this.gridWidth)
               );
               this.ctx.lineTo(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     ((this.i * 4 + 3) % this.gridWidth) *
                        (this.width / this.gridWidth),
                  this.canvas.height / 2 -
                     this.height / 2 +
                     Math.floor((this.i * 4 + 3) / this.gridWidth + 1) *
                        (this.width / this.gridWidth)
               );
               this.ctx.stroke();
            } else {
               this.ctx.beginPath();
               this.ctx.moveTo(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     ((this.i * 4 + 3) % this.gridWidth) *
                        (this.width / this.gridWidth),
                  this.canvas.height / 2 -
                     this.height / 2 +
                     Math.floor((this.i * 4 + 3) / this.gridWidth) *
                        (this.width / this.gridWidth)
               );
               this.ctx.lineTo(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     (((this.i * 4 + 3) % this.gridWidth) + 1) *
                        (this.width / this.gridWidth),
                  this.canvas.height / 2 -
                     this.height / 2 +
                     Math.floor((this.i * 4 + 3) / this.gridWidth + 1) *
                        (this.width / this.gridWidth)
               );
               this.ctx.stroke();
            }
         } else if (
            (Math.floor(this.value.indexOf(this.code[1][this.i]) / 27) === 2 &&
               this.white) ||
            (Math.floor(this.value.indexOf(this.code[1][this.i]) / 27) === 0 &&
               !this.white)
         ) {
            this.full += 1;

            this.ctx.fillRect(
               this.canvas.width / 2 -
                  this.width / 2 +
                  (((this.i * 4 + 3) % this.gridWidth) + 2 / 7) *
                     (this.width / this.gridWidth),
               this.canvas.height / 2 -
                  this.height / 2 +
                  Math.floor((this.i * 4 + 3) / this.gridWidth) *
                     (this.width / this.gridWidth),
               ((this.width / this.gridWidth) * 3) / 7,
               this.width / this.gridWidth
            );
         }
      }

      this.open = this.gridWidth * this.gridHeight - this.half - this.full;

      if (this.white) {
         document.body.style.backgroundColor = "#AAA";
         this.bgctx.fillStyle = "#333";
         this.bgctx.fillRect(
            this.canvas.width / 2 - this.width / 2,
            this.canvas.height / 2 - this.height / 2,
            this.width,
            this.height
         );

         this.bgctx.strokeStyle = "#000";
         this.ctx.strokeStyle = "#FFF";
      } else {
         document.body.style.backgroundColor = "transparent";
         this.bgctx.fillStyle = "#FFF";
         this.bgctx.strokeStyle = "#000";
         this.ctx.strokeStyle = "#555";
      }

      this.bgctx.lineWidth = Math.floor(this.width / this.gridWidth / 8);
      this.ctx.lineWidth = Math.floor(this.width / this.gridWidth / 2);

      this.bgctx.beginPath();

      this.bgctx.moveTo(
         this.canvas.width / 2,
         this.canvas.height / 2 - (this.height * 2) / 3
      );
      this.bgctx.lineTo(
         this.canvas.width / 2,
         this.canvas.height / 2 + (this.height * 2) / 3
      );
      this.bgctx.moveTo(
         this.canvas.width / 2 - (this.width * 2) / 3,
         this.canvas.height / 2
      );
      this.bgctx.lineTo(
         this.canvas.width / 2 + (this.width * 2) / 3,
         this.canvas.height / 2
      );

      this.bgctx.moveTo(
         this.canvas.width / 2 - this.width / 6,
         this.canvas.height / 2 - (this.height * 2) / 3
      );
      this.bgctx.lineTo(
         this.canvas.width / 2 - this.width / 6,
         this.canvas.height / 2 + (this.height * 2) / 3
      );
      this.bgctx.moveTo(
         this.canvas.width / 2 + this.width / 6,
         this.canvas.height / 2 - (this.height * 2) / 3
      );
      this.bgctx.lineTo(
         this.canvas.width / 2 + this.width / 6,
         this.canvas.height / 2 + (this.height * 2) / 3
      );
      this.bgctx.moveTo(
         this.canvas.width / 2 - (this.width * 2) / 3,
         this.canvas.height / 2 - this.height / 6
      );
      this.bgctx.lineTo(
         this.canvas.width / 2 + (this.width * 2) / 3,
         this.canvas.height / 2 - this.height / 6
      );
      this.bgctx.moveTo(
         this.canvas.width / 2 - (this.width * 2) / 3,
         this.canvas.height / 2 + this.height / 6
      );
      this.bgctx.lineTo(
         this.canvas.width / 2 + (this.width * 2) / 3,
         this.canvas.height / 2 + this.height / 6
      );

      this.bgctx.stroke();

      for (this.i = 0; this.i <= this.gridWidth; this.i++) {
         this.ctx.beginPath();
         this.ctx.moveTo(
            this.canvas.width / 2 -
               this.width / 2 +
               (this.width / this.gridWidth) * this.i,
            this.canvas.height / 2 - this.height / 2
         );
         this.ctx.lineTo(
            this.canvas.width / 2 -
               this.width / 2 +
               (this.width / this.gridWidth) * this.i,
            this.canvas.height / 2 + this.height / 2
         );
         this.ctx.stroke();
      }

      this.ctx.beginPath();

      for (this.i = 0; this.i <= this.gridHeight; this.i++) {
         this.ctx.moveTo(
            this.canvas.width / 2 - this.width / 2,
            this.canvas.height / 2 -
               this.height / 2 +
               (this.width / this.gridWidth) * this.i
         );
         this.ctx.lineTo(
            this.canvas.width / 2 + this.width / 2,
            this.canvas.height / 2 -
               this.height / 2 +
               (this.width / this.gridWidth) * this.i
         );
      }

      this.ctx.stroke();

      this.white
         ? (this.bgctx.strokeStyle = "#FFF")
         : (this.bgctx.strokeStyle = "#555");

      this.bgctx.lineWidth = ((this.width / this.gridWidth) * 2) / 3;

      for (this.i = -1; this.i < this.gridWidth / 2 + 2; this.i++) {
         if (this.i !== -1 && this.i < this.gridWidth / 2 + 1) {
            this.bgctx.beginPath();

            this.bgctx.arc(
               this.canvas.width / 2 -
                  this.width / 2 +
                  (this.width / this.gridWidth) *
                     (this.i * 2 + (this.gridWidth % 2)),
               this.canvas.height / 2 - this.height / 2,
               this.width / this.gridWidth,
               0,
               Math.PI,
               true
            );

            this.bgctx.stroke();
         }

         this.bgctx.save();
         this.bgctx.beginPath();

         this.bgctx.translate(
            this.canvas.width / 2 -
               this.width / 2 +
               (this.width / this.gridWidth) *
                  (this.i * 2 + (this.gridWidth % 2)),
            this.canvas.height / 2 -
               this.height / 2 -
               (this.width / this.gridWidth) * 4
         );
         this.bgctx.scale(2, 1);
         this.bgctx.arc(0, 0, this.width / this.gridWidth / 2, 0, Math.PI * 2);

         this.bgctx.stroke();
         this.bgctx.restore();

         if (this.i < this.gridWidth / 2 + 1) {
            if (this.i % 2 === 0) {
               this.bgctx.beginPath();
               this.bgctx.save();

               this.bgctx.translate(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 1),
                  this.canvas.height / 2 -
                     this.height / 2 -
                     ((this.width / this.gridHeight) * 5) / 2
               );
               this.bgctx.scale(1, 2);
               this.bgctx.arc(
                  0,
                  0,
                  ((this.width / this.gridWidth) * 2) / 3,
                  0,
                  Math.PI * 2
               );

               this.bgctx.restore();
               this.bgctx.stroke();
            } else {
               this.bgctx.beginPath();

               this.bgctx.arc(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 1),
                  this.canvas.height / 2 -
                     this.height / 2 -
                     (this.width / this.gridHeight) * 4,
                  (this.width / this.gridWidth) * 2,
                  0,
                  Math.PI,
                  true
               );

               this.bgctx.stroke();

               this.bgctx.beginPath();

               this.bgctx.arc(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 0.5),
                  this.canvas.height / 2 -
                     this.height / 2 -
                     (this.width / this.gridHeight) * 6.2,
                  this.width / this.gridWidth / 10,
                  0,
                  Math.PI * 2
               );
               this.bgctx.arc(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 1),
                  this.canvas.height / 2 -
                     this.height / 2 -
                     (this.width / this.gridHeight) * 6.2,
                  this.width / this.gridWidth / 5,
                  0,
                  Math.PI * 2
               );
               this.bgctx.arc(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 1.5),
                  this.canvas.height / 2 -
                     this.height / 2 -
                     (this.width / this.gridHeight) * 6.2,
                  this.width / this.gridWidth / 10,
                  0,
                  Math.PI * 2
               );

               this.bgctx.stroke();
            }
         }
      }

      for (this.i = -1; this.i < this.gridWidth / 2 + 2; this.i++) {
         if (this.i !== -1 && this.i < this.gridWidth / 2 + 1) {
            this.bgctx.beginPath();

            this.bgctx.arc(
               this.canvas.width / 2 -
                  this.width / 2 +
                  (this.width / this.gridWidth) *
                     (this.i * 2 + (this.gridWidth % 2)),
               this.canvas.height / 2 + this.height / 2,
               this.width / this.gridWidth,
               0,
               Math.PI
            );

            this.bgctx.stroke();
         }

         this.bgctx.save();
         this.bgctx.beginPath();

         this.bgctx.translate(
            this.canvas.width / 2 -
               this.width / 2 +
               (this.width / this.gridWidth) *
                  (this.i * 2 + (this.gridWidth % 2)),
            this.canvas.height / 2 +
               this.height / 2 +
               (this.width / this.gridWidth) * 4
         );
         this.bgctx.scale(2, 1);
         this.bgctx.arc(0, 0, this.width / this.gridWidth / 2, 0, Math.PI * 2);

         this.bgctx.stroke();
         this.bgctx.restore();

         if (this.i < this.gridWidth / 2 + 1) {
            if (this.i % 2 === 0) {
               this.bgctx.beginPath();
               this.bgctx.save();

               this.bgctx.translate(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 1),
                  this.canvas.height / 2 +
                     this.height / 2 +
                     ((this.width / this.gridHeight) * 5) / 2
               );
               this.bgctx.scale(1, 2);
               this.bgctx.arc(
                  0,
                  0,
                  ((this.width / this.gridWidth) * 2) / 3,
                  0,
                  Math.PI * 2
               );

               this.bgctx.restore();
               this.bgctx.stroke();
            } else {
               this.bgctx.beginPath();

               this.bgctx.arc(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 1),
                  this.canvas.height / 2 +
                     this.height / 2 +
                     (this.width / this.gridHeight) * 4,
                  (this.width / this.gridWidth) * 2,
                  0,
                  Math.PI
               );

               this.bgctx.stroke();

               this.bgctx.beginPath();

               this.bgctx.arc(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 0.5),
                  this.canvas.height / 2 +
                     this.height / 2 +
                     (this.width / this.gridHeight) * 6.2,
                  this.width / this.gridWidth / 10,
                  0,
                  Math.PI * 2
               );
               this.bgctx.arc(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 1),
                  this.canvas.height / 2 +
                     this.height / 2 +
                     (this.width / this.gridHeight) * 6.2,
                  this.width / this.gridWidth / 5,
                  0,
                  Math.PI * 2
               );
               this.bgctx.arc(
                  this.canvas.width / 2 -
                     this.width / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 1.5),
                  this.canvas.height / 2 +
                     this.height / 2 +
                     (this.width / this.gridHeight) * 6.2,
                  this.width / this.gridWidth / 10,
                  0,
                  Math.PI * 2
               );

               this.bgctx.stroke();
            }
         }
      }

      for (this.i = -1; this.i < this.gridHeight / 2 + 2; this.i++) {
         if (this.i !== -1 && this.i < this.gridHeight / 2 + 1) {
            this.bgctx.beginPath();

            this.bgctx.arc(
               this.canvas.width / 2 - this.width / 2,
               this.canvas.height / 2 -
                  this.height / 2 +
                  (this.width / this.gridWidth) *
                     (this.i * 2 + (this.gridWidth % 2)),
               this.width / this.gridWidth,
               Math.PI / 2,
               (Math.PI * 3) / 2
            );

            this.bgctx.stroke();
         }

         this.bgctx.save();
         this.bgctx.beginPath();

         this.bgctx.translate(
            this.canvas.width / 2 -
               this.width / 2 -
               (this.width / this.gridWidth) * 4,
            this.canvas.height / 2 -
               this.height / 2 +
               (this.width / this.gridWidth) *
                  (this.i * 2 + (this.gridWidth % 2))
         );
         this.bgctx.scale(1, 2);
         this.bgctx.arc(0, 0, this.width / this.gridWidth / 2, 0, Math.PI * 2);

         this.bgctx.stroke();
         this.bgctx.restore();

         if (this.i < this.gridHeight / 2 + 1) {
            if (this.i % 2 === 0) {
               this.bgctx.beginPath();
               this.bgctx.save();

               this.bgctx.translate(
                  this.canvas.width / 2 -
                     this.width / 2 -
                     ((this.width / this.gridWidth) * 5) / 2,
                  this.canvas.height / 2 -
                     this.height / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 1)
               );
               this.bgctx.scale(2, 1);
               this.bgctx.arc(
                  0,
                  0,
                  ((this.width / this.gridWidth) * 2) / 3,
                  0,
                  Math.PI * 2
               );

               this.bgctx.restore();
               this.bgctx.stroke();
            } else {
               this.bgctx.beginPath();

               this.bgctx.arc(
                  this.canvas.width / 2 -
                     this.width / 2 -
                     (this.width / this.gridWidth) * 4,
                  this.canvas.height / 2 -
                     this.height / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 1),
                  (this.width / this.gridWidth) * 2,
                  Math.PI / 2,
                  (Math.PI * 3) / 2
               );

               this.bgctx.stroke();

               this.bgctx.beginPath();

               this.bgctx.arc(
                  this.canvas.width / 2 -
                     this.width / 2 -
                     (this.width / this.gridWidth) * 6.2,
                  this.canvas.height / 2 -
                     this.height / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 0.5),
                  this.width / this.gridWidth / 10,
                  0,
                  Math.PI * 2
               );
               this.bgctx.arc(
                  this.canvas.width / 2 -
                     this.width / 2 -
                     (this.width / this.gridWidth) * 6.2,
                  this.canvas.height / 2 -
                     this.height / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 1),
                  this.width / this.gridWidth / 5,
                  0,
                  Math.PI * 2
               );
               this.bgctx.arc(
                  this.canvas.width / 2 -
                     this.width / 2 -
                     (this.width / this.gridWidth) * 6.2,
                  this.canvas.height / 2 -
                     this.height / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 1.5),
                  this.width / this.gridWidth / 10,
                  0,
                  Math.PI * 2
               );

               this.bgctx.stroke();
            }
         }
      }

      for (this.i = -1; this.i < this.gridHeight / 2 + 2; this.i++) {
         if (this.i !== -1 && this.i < this.gridHeight / 2 + 1) {
            this.bgctx.beginPath();

            this.bgctx.arc(
               this.canvas.width / 2 + this.width / 2,
               this.canvas.height / 2 -
                  this.height / 2 +
                  (this.width / this.gridWidth) *
                     (this.i * 2 + (this.gridWidth % 2)),
               this.width / this.gridWidth,
               Math.PI / 2,
               (Math.PI * 3) / 2,
               true
            );

            this.bgctx.stroke();
         }

         this.bgctx.save();
         this.bgctx.beginPath();

         this.bgctx.translate(
            this.canvas.width / 2 +
               this.width / 2 +
               (this.width / this.gridWidth) * 4,
            this.canvas.height / 2 -
               this.height / 2 +
               (this.width / this.gridWidth) *
                  (this.i * 2 + (this.gridWidth % 2))
         );
         this.bgctx.scale(1, 2);
         this.bgctx.arc(0, 0, this.width / this.gridWidth / 2, 0, Math.PI * 2);

         this.bgctx.stroke();
         this.bgctx.restore();

         if (this.i < this.gridHeight / 2 + 1) {
            if (this.i % 2 === 0) {
               this.bgctx.beginPath();
               this.bgctx.save();

               this.bgctx.translate(
                  this.canvas.width / 2 +
                     this.width / 2 +
                     ((this.width / this.gridWidth) * 5) / 2,
                  this.canvas.height / 2 -
                     this.height / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 1)
               );
               this.bgctx.scale(2, 1);
               this.bgctx.arc(
                  0,
                  0,
                  ((this.width / this.gridWidth) * 2) / 3,
                  0,
                  Math.PI * 2
               );

               this.bgctx.restore();
               this.bgctx.stroke();
            } else {
               this.bgctx.beginPath();

               this.bgctx.arc(
                  this.canvas.width / 2 +
                     this.width / 2 +
                     (this.width / this.gridWidth) * 4,
                  this.canvas.height / 2 -
                     this.height / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 1),
                  (this.width / this.gridWidth) * 2,
                  Math.PI / 2,
                  (Math.PI * 3) / 2,
                  true
               );

               this.bgctx.stroke();

               this.bgctx.beginPath();

               this.bgctx.arc(
                  this.canvas.width / 2 +
                     this.width / 2 +
                     (this.width / this.gridWidth) * 6.2,
                  this.canvas.height / 2 -
                     this.height / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 0.5),
                  this.width / this.gridWidth / 10,
                  0,
                  Math.PI * 2
               );
               this.bgctx.arc(
                  this.canvas.width / 2 +
                     this.width / 2 +
                     (this.width / this.gridWidth) * 6.2,
                  this.canvas.height / 2 -
                     this.height / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 1),
                  this.width / this.gridWidth / 5,
                  0,
                  Math.PI * 2
               );
               this.bgctx.arc(
                  this.canvas.width / 2 +
                     this.width / 2 +
                     (this.width / this.gridWidth) * 6.2,
                  this.canvas.height / 2 -
                     this.height / 2 +
                     (this.width / this.gridWidth) *
                        (this.i * 2 + (this.gridWidth % 2) + 1.5),
                  this.width / this.gridWidth / 10,
                  0,
                  Math.PI * 2
               );

               this.bgctx.stroke();
            }
         }
      }

      this.bgctx.beginPath();
      this.bgctx.save();

      this.bgctx.translate(
         this.canvas.width / 2 -
            this.width / 2 +
            (this.width / this.gridWidth) * ((this.gridWidth % 2) - 2),
         this.canvas.height / 2 -
            this.height / 2 -
            ((this.width / this.gridHeight) * 5) / 2
      );
      this.bgctx.rotate(-Math.PI / 4);
      this.bgctx.scale(1, 2);
      this.bgctx.arc(
         0,
         0,
         ((this.width / this.gridWidth) * 2) / 3,
         0,
         Math.PI * 2
      );

      this.bgctx.restore();
      this.bgctx.stroke();

      this.bgctx.beginPath();
      this.bgctx.save();

      this.bgctx.translate(
         this.canvas.width / 2 -
            this.width / 2 +
            (this.width / this.gridWidth) *
               ((this.gridWidth % 2) + this.gridWidth + 2),
         this.canvas.height / 2 +
            this.height / 2 +
            ((this.width / this.gridHeight) * 5) / 2
      );
      this.bgctx.rotate(-Math.PI / 4);
      this.bgctx.scale(1, 2);
      this.bgctx.arc(
         0,
         0,
         ((this.width / this.gridWidth) * 2) / 3,
         0,
         Math.PI * 2
      );

      this.bgctx.restore();
      this.bgctx.stroke();

      this.bgctx.beginPath();
      this.bgctx.save();

      this.bgctx.translate(
         this.canvas.width / 2 -
            this.width / 2 -
            ((this.width / this.gridWidth) * 5) / 2,
         this.canvas.height / 2 -
            this.height / 2 +
            (this.width / this.gridWidth) *
               ((this.gridWidth % 2) + this.gridHeight + 2)
      );
      this.bgctx.rotate(-Math.PI / 4);
      this.bgctx.scale(2, 1);
      this.bgctx.arc(
         0,
         0,
         ((this.width / this.gridWidth) * 2) / 3,
         0,
         Math.PI * 2
      );

      this.bgctx.restore();
      this.bgctx.stroke();

      this.bgctx.beginPath();
      this.bgctx.save();

      this.bgctx.translate(
         this.canvas.width / 2 +
            this.width / 2 +
            ((this.width / this.gridWidth) * 5) / 2,
         this.canvas.height / 2 -
            this.height / 2 +
            (this.width / this.gridWidth) * ((this.gridWidth % 2) - 2)
      );
      this.bgctx.rotate(-Math.PI / 4);
      this.bgctx.scale(2, 1);
      this.bgctx.arc(
         0,
         0,
         ((this.width / this.gridWidth) * 2) / 3,
         0,
         Math.PI * 2
      );

      this.bgctx.restore();
      this.bgctx.stroke();

      this.ctx.font = "20px serif";
      this.ctx.fillStyle = "#000";

      this.codeText.innerHTML = this.code.join(" ");

      this.ctx.fillText(
         "Open: " + this.open,
         (this.canvas.width * 11) / 20 + this.width / 2,
         this.canvas.height / 2 - this.height / 2
      );
      this.ctx.fillText(
         "Half: " + this.half,
         (this.canvas.width * 11) / 20 + this.width / 2,
         (this.canvas.height * 11) / 20 - this.height / 2
      );
      this.ctx.fillText(
         "Full: " + this.full,
         (this.canvas.width * 11) / 20 + this.width / 2,
         (this.canvas.height * 3) / 5 - this.height / 2
      );
   }

   fill(posX, posY, indexX, indexY, direction) {
      if (this.type === 0) {
         this.open += 1;

         this.ctx.clearRect(
            posX + this.width / this.gridWidth / 4,
            posY + this.width / this.gridWidth / 4,
            this.width / this.gridWidth / 2,
            this.width / this.gridWidth / 2
         );
      } else if (this.type === 1) {
         this.half += 1;

         this.ctx.clearRect(
            posX + this.width / this.gridWidth / 4,
            posY + this.width / this.gridWidth / 4,
            this.width / this.gridWidth / 2,
            this.width / this.gridWidth / 2
         );

         if (direction === 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(posX + this.width / this.gridWidth, posY);
            this.ctx.lineTo(posX, posY + this.width / this.gridWidth);
            this.ctx.stroke();
         } else {
            this.ctx.beginPath();
            this.ctx.moveTo(posX, posY);
            this.ctx.lineTo(
               posX + this.width / this.gridWidth,
               posY + this.width / this.gridWidth
            );
            this.ctx.stroke();
         }
      } else if (this.type === 2) {
         this.full += 1;

         this.ctx.clearRect(
            posX + this.width / this.gridWidth / 4,
            posY + this.width / this.gridWidth / 4,
            this.width / this.gridWidth / 2,
            this.width / this.gridWidth / 2
         );

         this.ctx.fillRect(
            posX + ((this.width / this.gridWidth) * 2) / 7,
            posY,
            ((this.width / this.gridWidth) * 3) / 7,
            this.width / this.gridWidth
         );
      }

      if (
         Math.floor(
            (this.value.indexOf(
               this.code[1][Math.floor((indexY * this.gridWidth + indexX) / 4)]
            ) %
               Math.pow(3, ((indexY * this.gridWidth + indexX) % 4) + 1)) /
               Math.pow(3, (indexY * this.gridWidth + indexX) % 4)
         ) === 0
      ) {
         this.open -= 1;
      } else if (
         Math.floor(
            (this.value.indexOf(
               this.code[1][Math.floor((indexY * this.gridWidth + indexX) / 4)]
            ) %
               Math.pow(3, ((indexY * this.gridWidth + indexX) % 4) + 1)) /
               Math.pow(3, (indexY * this.gridWidth + indexX) % 4)
         ) === 1
      ) {
         this.half -= 1;
      } else if (
         Math.floor(
            (this.value.indexOf(
               this.code[1][Math.floor((indexY * this.gridWidth + indexX) / 4)]
            ) %
               Math.pow(3, ((indexY * this.gridWidth + indexX) % 4) + 1)) /
               Math.pow(3, (indexY * this.gridWidth + indexX) % 4)
         ) === 2
      ) {
         this.full -= 1;
      }

      this.code[1] =
         String(
            this.code[1].substr(
               0,
               Math.floor((indexY * this.gridWidth + indexX) / 4)
            )
         ) +
         String(
            this.value[
               this.value.indexOf(
                  this.code[1][
                     Math.floor((indexY * this.gridWidth + indexX) / 4)
                  ]
               ) -
                  Math.floor(
                     (this.value.indexOf(
                        this.code[1][
                           Math.floor((indexY * this.gridWidth + indexX) / 4)
                        ]
                     ) %
                        Math.pow(
                           3,
                           ((indexY * this.gridWidth + indexX) % 4) + 1
                        )) /
                        Math.pow(3, (indexY * this.gridWidth + indexX) % 4)
                  ) *
                     Math.pow(3, (indexY * this.gridWidth + indexX) % 4) +
                  Math.pow(3, (indexY * this.gridWidth + indexX) % 4) *
                     this.type
            ]
         ) +
         String(
            this.code[1].substr(
               Math.floor((indexY * this.gridWidth + indexX) / 4) + 1
            )
         );

      this.ctx.clearRect(
         0,
         0,
         this.canvas.width / 2 -
            this.width / 2 -
            this.width / this.gridWidth / 4,
         this.canvas.height
      );

      this.ctx.clearRect(
         this.canvas.width / 2 +
            this.width / 2 +
            this.width / this.gridWidth / 4,
         0,
         this.canvas.width / 2 -
            this.width / 2 -
            this.width / this.gridWidth / 4,
         this.canvas.height
      );
      this.ctx.save();

      this.ctx.fillStyle = "#000";

      this.codeText.innerHTML = this.code.join(" ");

      this.ctx.fillText(
         "Open: " + this.open,
         (this.canvas.width * 11) / 20 + this.width / 2,
         this.canvas.height / 2 - this.height / 2
      );
      this.ctx.fillText(
         "Half: " + this.half,
         (this.canvas.width * 11) / 20 + this.width / 2,
         (this.canvas.height * 11) / 20 - this.height / 2
      );
      this.ctx.fillText(
         "Full: " + this.full,
         (this.canvas.width * 11) / 20 + this.width / 2,
         (this.canvas.height * 3) / 5 - this.height / 2
      );

      this.ctx.restore();
   }

   draw() {
      if (this.white) {
         this.ctx.fillStyle = "#FFF";
         this.ctx.strokeStyle = "#FFF";
      } else {
         this.ctx.fillStyle = "#555";
         this.ctx.strokeStyle = "#555";
      }

      this.ctx.lineWidth = Math.floor(this.width / this.gridWidth / 4);

      document.addEventListener("keydown", (event) => {
         switch (event.key) {
            case "0":
               this.type = 0;
               break;

            case "1":
               this.type = 1;
               break;

            case "2":
               this.type = 2;
               break;
         }
      });

      btnColorBlack.addEventListener("click", () => (this.type = 0));
      btnColorGray.addEventListener("click", () => (this.type = 1));
      btnColorWhite.addEventListener("click", () => (this.type = 2));

      document.addEventListener("pointerdown", (event) => {
         if (
            Math.floor(
               (event.offsetX + this.width / 2 - this.canvas.width / 2) /
                  (this.width / this.gridWidth)
            ) >= 0 &&
            Math.floor(
               (event.offsetX + this.width / 2 - this.canvas.width / 2) /
                  (this.width / this.gridWidth)
            ) < this.gridWidth &&
            Math.floor(
               (event.offsetY + this.height / 2 - this.canvas.height / 2) /
                  (this.width / this.gridWidth)
            ) >= 0 &&
            Math.floor(
               (event.offsetY + this.height / 2 - this.canvas.height / 2) /
                  (this.width / this.gridWidth)
            ) < this.gridHeight
         ) {
            this.drawing = true;

            this.fill(
               this.canvas.width / 2 -
                  this.width / 2 +
                  (this.width / this.gridWidth) *
                     Math.floor(
                        (event.offsetX +
                           this.width / 2 -
                           this.canvas.width / 2) /
                           (this.width / this.gridWidth)
                     ),
               this.canvas.height / 2 -
                  this.height / 2 +
                  (this.width / this.gridWidth) *
                     Math.floor(
                        (event.offsetY +
                           this.height / 2 -
                           this.canvas.height / 2) /
                           (this.width / this.gridWidth)
                     ),
               Math.floor(
                  (event.offsetX + this.width / 2 - this.canvas.width / 2) /
                     (this.width / this.gridWidth)
               ),
               Math.floor(
                  (event.offsetY + this.height / 2 - this.canvas.height / 2) /
                     (this.width / this.gridWidth)
               ),
               Math.floor(
                  (event.offsetY + this.height / 2 - this.canvas.height / 2) /
                     (this.width / this.gridWidth) +
                     this.gridHeight
               ) % 2
            );
         }
      });

      document.addEventListener("pointermove", (event) => {
         if (
            this.drawing &&
            Math.floor(
               (event.offsetX + this.width / 2 - this.canvas.width / 2) /
                  (this.width / this.gridWidth)
            ) >= 0 &&
            Math.floor(
               (event.offsetX + this.width / 2 - this.canvas.width / 2) /
                  (this.width / this.gridWidth)
            ) < this.gridWidth &&
            Math.floor(
               (event.offsetY + this.height / 2 - this.canvas.height / 2) /
                  (this.width / this.gridWidth)
            ) >= 0 &&
            Math.floor(
               (event.offsetY + this.height / 2 - this.canvas.height / 2) /
                  (this.width / this.gridWidth)
            ) < this.gridHeight
         ) {
            this.fill(
               this.canvas.width / 2 -
                  this.width / 2 +
                  (this.width / this.gridWidth) *
                     Math.floor(
                        (event.offsetX +
                           this.width / 2 -
                           this.canvas.width / 2) /
                           (this.width / this.gridWidth)
                     ),
               this.canvas.height / 2 -
                  this.height / 2 +
                  (this.width / this.gridWidth) *
                     Math.floor(
                        (event.offsetY +
                           this.height / 2 -
                           this.canvas.height / 2) /
                           (this.width / this.gridWidth)
                     ),
               Math.floor(
                  (event.offsetX + this.width / 2 - this.canvas.width / 2) /
                     (this.width / this.gridWidth)
               ),
               Math.floor(
                  (event.offsetY + this.height / 2 - this.canvas.height / 2) /
                     (this.width / this.gridWidth)
               ),
               Math.floor(
                  (event.offsetY + this.height / 2 - this.canvas.height / 2) /
                     (this.width / this.gridWidth) +
                     this.gridHeight
               ) % 2
            );
         }
      });

      document.addEventListener("pointerup", (event) => (this.drawing = false));
   }
}

function code() {
   console.log(display.code);
}

const btnScrollLeft = document.getElementById("btn-scroll-left");
const btnScrollRight = document.getElementById("btn-scroll-right");
const btnScrollColor = document.getElementById("btn-scroll-color");

const btnColorBlack = document.getElementById("btn-color-black");
const btnColorGray = document.getElementById("btn-color-gray");
const btnColorWhite = document.getElementById("btn-color-white");

let gray = false;

function scrollLeft() {
   display.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

   if (Object.keys(display.save).indexOf(display.name) > 0) {
      display = new Display(
         "code " +
            Object.keys(display.save)[
               Object.keys(display.save).indexOf(display.name) - 1
            ],
         gray
      );
   } else {
      display = new Display(
         "code " +
            Object.keys(display.save)[Object.keys(display.save).length - 1],
         gray
      );
   }
}

function scrollRight() {
   display.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

   if (
      Object.keys(display.save).indexOf(display.name) <
      Object.keys(display.save).length - 1
   ) {
      display = new Display(
         "code " +
            Object.keys(display.save)[
               Object.keys(display.save).indexOf(display.name) + 1
            ],
         gray
      );
   } else {
      display = new Display("code " + Object.keys(display.save)[0], gray);
   }
}

function scrollColor() {
   display.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

   !gray ? (gray = true) : (gray = false);

   display = new Display(
      "code " +
         Object.keys(display.save)[
            Object.keys(display.save).indexOf(display.name)
         ],
      gray
   );
}

function enableScroll() {
   document.addEventListener("keyup", (event) => {
      switch (event.key) {
         case "ArrowLeft":
            scrollLeft();
            break;

         case "ArrowRight":
            scrollRight();
            break;

         case "ArrowUp":
         case "ArrowDown":
            scrollColor();
            break;
      }
   });

   btnScrollLeft.style.display = "inline";
   btnScrollRight.style.display = "inline";
   btnScrollColor.style.display = "inline";
   btnColorBlack.style.display = "none";
   btnColorGray.style.display = "none";
   btnColorWhite.style.display = "none";

   btnScrollLeft.addEventListener("click", scrollLeft);
   btnScrollRight.addEventListener("click", scrollRight);
   btnScrollColor.addEventListener("click", scrollColor);
}

let display = new Display(
   prompt('Type "compare" to see examples, or "width*height*color" to make own')
);

if (display.new) display.draw();
