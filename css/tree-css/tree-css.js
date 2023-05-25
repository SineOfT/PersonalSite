const min = Math.min;

const stump = document
   .getElementById("tree")
   .appendChild(document.createElement("div"));
stump.classList.add("branches");
stump.id = "stump";

const branch = stump.appendChild(document.createElement("div"));
branch.classList.add("branches");

let screenHeight = min(window.innerHeight, 600);
let branchStyle;
let parentLeft;
let parentBottom;
let parentWidth = Math.floor(Math.random() * 25 + 50);
let parentHeight;
let newHeight;
let splitWidth;
let branchSplit;

let splitScale = 1.45;
let maxLength = screenHeight / 20;

stump.style.left = -parentWidth / 2 + "px";
stump.style.bottom = "10px";
stump.style.width = parentWidth + "px";
stump.style.height = screenHeight / 8 + "px";

branch.style.left = 0;
branch.style.bottom = screenHeight / 8 + "px";
branch.style.width = parentWidth + "px";
branch.style.height = (screenHeight * 7) / 8 + "px";

function createSplit(parentBranches) {
   let childBranches = [];
   for (let parentBranch of parentBranches) {
      let branchStyle = window.getComputedStyle(parentBranch);
      let parentWidth = parseInt(branchStyle.getPropertyValue("width"));
      let parentHeight = parseInt(branchStyle.getPropertyValue("height"));
      let newWidth = Math.floor(Math.random() * parentWidth);
      let newHeight = min(
         Math.floor(Math.random() * parentWidth * 5 + 10),
         maxLength
      );
      let splitAngle = Math.floor(Math.random() * 60);

      if (newHeight > parentHeight) {
         continue;
      }

      parentBranch.style.height = newHeight + "px";

      let branch1 = parentBranch.appendChild(document.createElement("div"));
      branch1.classList.add("branches");
      let branch2 = parentBranch.appendChild(document.createElement("div"));
      branch2.classList.add("branches");

      branch1.style.left = 0;
      branch1.style.bottom = newHeight + "px";
      branch1.style.width = min(newWidth * splitScale, parentWidth) + "px";
      branch1.style.height = parentHeight - newHeight + "px";
      branch1.style.transformOrigin = "100% 100%";
      branch1.style.rotate =
         -splitAngle * ((parentWidth - newWidth) / parentWidth) + "deg";
      if (newWidth <= 1) {
         branch1.style.width = "1px";
         branch1.style.height = Math.floor(Math.random() * 30) + "px";
         let leaf = branch1.appendChild(document.createElement("div"));
         leaf.classList.add("leaves");
         Math.floor(Math.random() * 3) === 0
            ? (leaf.style.background =
                 "radial-gradient(circle at 10px 5px, #1A3, #162)")
            : Math.floor(Math.random() * 2) === 0
            ? (leaf.style.background =
                 "radial-gradient(circle at 10px 5px, #1C3, #172)")
            : (leaf.style.background =
                 "radial-gradient(circle at 10px 5px, #1E3, #182)");
      } else {
         childBranches.push(branch1);
      }

      let width2 = min((parentWidth - newWidth) * splitScale, parentWidth);
      branch2.style.left = parentWidth - width2 + "px";
      branch2.style.bottom = newHeight + "px";
      branch2.style.width = width2 + "px";
      branch2.style.height = parentHeight - newHeight + "px";
      branch2.style.transformOrigin = "0 100%";
      branch2.style.rotate = splitAngle * (newWidth / parentWidth) + "deg";
      if (parentWidth - newWidth <= 1) {
         branch2.style.width = "1px";
         branch2.style.height = Math.floor(Math.random() * 30) + "px";
         let leaf = branch2.appendChild(document.createElement("div"));
         leaf.classList.add("leaves");
         Math.floor(Math.random() * 3) === 0
            ? (leaf.style.background =
                 "radial-gradient(circle at 10px 5px, #1A3, #162)")
            : Math.floor(Math.random() * 2) === 0
            ? (leaf.style.background =
                 "radial-gradient(circle at 10px 5px, #1C3, #172)")
            : (leaf.style.background =
                 "radial-gradient(circle at 10px 5px, #1E3, #182)");
      } else {
         childBranches.push(branch2);
      }
   }
   if (childBranches.length === 0) return;
   window.setTimeout(() => createSplit(childBranches), 100);
}

createSplit([branch]);
