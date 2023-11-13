let isAnimatingToggled = true;

const root = document.querySelector(":root");

/////////////////////////////

const imageObserver = new IntersectionObserver(
   (entries) => {
      if (!isAnimatingToggled) return;

      entries.forEach((entry) => {
         if (entry.isIntersecting) {
            entry.target.dataset.visible = "true";
         } else {
            entry.target.dataset.visible = "false";
         }
      });
   },
   {
      rootMargin: "-25% 100%",
   }
);

const programContainers = document.querySelectorAll(".program-container");
programContainers.forEach((programContainer) => {
   imageObserver.observe(programContainer);

   let index = 0.2;
   const delayStagger = programContainer.querySelectorAll(".delay-stagger");
   delayStagger.forEach((item) => {
      item.style.transitionDelay = index + "s";
      index += 0.1;
   });
   const delayEnd = programContainer.querySelectorAll(".delay-end");
   delayEnd.forEach((item) => {
      item.style.transitionDelay = index + "s";
   });
});

////////////////////////////////////

const siteNavBtnExpand = document.querySelector(".site-nav-btn.expand");
const siteNavBtnContract = document.querySelector(".site-nav-btn.contract");
const siteNavigation = document.querySelector(".site-navigation");
const siteNavItemAnchors = siteNavigation.querySelectorAll(
   ".site-nav-item-anchor"
);

function expandNavigation() {
   siteNavigation.dataset.expanded = "true";
}

function contractNavigation() {
   siteNavigation.dataset.expanded = "false";
}

siteNavBtnExpand.addEventListener("click", expandNavigation);
siteNavBtnContract.addEventListener("click", contractNavigation);
siteNavItemAnchors.forEach((anchor) => {
   anchor.addEventListener("click", contractNavigation);
});

///////////////////////////////////////

const siteScroll = document.querySelector(".site-scroll");
const siteScrollPercentage = document.querySelector(".site-scroll-percentage");
const siteScrollAnimation = document.querySelector(".site-scroll-animation");
const maxScrollRelative = 1;
const walkFrameRelative = 0.1;
const walkFrames = [
   "animations/redpanda-and-duck/0000.png",
   "animations/redpanda-and-duck/0001.png",
   "animations/redpanda-and-duck/0002.png",
   "animations/redpanda-and-duck/0003.png",
];
const idleFrames = [
   "animations/redpanda-and-duck/0004.png",
   "animations/redpanda-and-duck/0005.png",
   "animations/redpanda-and-duck/0006.png",
   "animations/redpanda-and-duck/0007.png",
];

let prevTime;
let prevScrollProportion;
let walkElapsed = 0;
let idleElapsed = 0;
let idleIndex = -1;

beginAnimation();

function beginAnimation() {
   prevTime = undefined;
   prevScrollProportion = undefined;
   walkElapsed = 0;
   idleElapsed = 0;
   idleIndex = -1;
   window.requestAnimationFrame(animationLoop);
}

function animationLoop(timeStamp) {
   if (!isAnimatingToggled) return;

   let deltaTime = timeStamp - prevTime;

   prevScrollProportion = animateScroll(deltaTime);

   prevTime = timeStamp;
   window.requestAnimationFrame(animationLoop);
}

function animateScroll(deltaTime) {
   let scrollProportion = calculateScrollProportion(prevScrollProportion);

   if (isApproxiatelyEqual(scrollProportion, prevScrollProportion)) {
      walkElapsed = 0;

      if (idleIndex >= 3) return scrollProportion;
      if (deltaTime == undefined) return scrollProportion;

      idleElapsed += deltaTime;

      if (idleElapsed > 150) {
         idleElapsed = 0;
         idleIndex++;

         siteScrollAnimation.src = idleFrames[idleIndex];
      }
   } else {
      idleElapsed = 0;

      if (idleIndex >= 0) {
         scrollProportion = prevScrollProportion;
         if (deltaTime == undefined) return scrollProportion;
         walkElapsed += deltaTime;

         if (walkElapsed > 150) {
            walkElapsed = 0;
            idleIndex--;

            if (idleIndex < 0) return scrollProportion;
            siteScrollAnimation.src = idleFrames[idleIndex];
         }
      } else {
         siteScrollPercentage.style.right = 100 - scrollProportion * 100 + "%";

         animationIndex =
            Math.round(
               scrollProportion * window.innerWidth * walkFrameRelative
            ) % walkFrames.length;
         siteScrollAnimation.src = walkFrames[animationIndex];
      }
   }

   return scrollProportion;
}

function calculateScrollProportion(prevScrollProportion) {
   let scrollProportion =
      window.scrollY / (document.body.offsetHeight - window.innerHeight);
   let maxScrollStep = maxScrollRelative / window.innerWidth;

   if (prevScrollProportion == undefined) return scrollProportion;

   if (scrollProportion < prevScrollProportion - maxScrollStep) {
      scrollProportion = prevScrollProportion - maxScrollStep;
   } else if (scrollProportion > prevScrollProportion + maxScrollStep) {
      scrollProportion = prevScrollProportion + maxScrollStep;
   }

   return clamp01(scrollProportion);
}

function isApproxiatelyEqual(a, b) {
   return a > b - 0.000001 && a < b + 0.000001;
}

function clamp01(a) {
   return a < 0 ? 0 : a > 1 ? 1 : a;
}

///////////////////////////////////////

const siteAnimationBtn = document.querySelector(".site-animation-btn");

function toggleAnimation() {
   isAnimatingToggled = siteAnimationBtn.dataset.toggled == "false";

   root.style.setProperty(
      "--site-footer-height",
      isAnimatingToggled
         ? root.style.getPropertyValue("--default-site-footer-height")
         : "0rem"
   );

   siteAnimationBtn.dataset.toggled = isAnimatingToggled;

   if (!isAnimatingToggled) {
      programContainers.forEach((programContainer) => {
         programContainer.dataset.visible = true;
      });
   }

   siteScroll.style.display = isAnimatingToggled ? "inherit" : "none";
   if (isAnimatingToggled) {
      beginAnimation();
   }
}

siteAnimationBtn.addEventListener("click", toggleAnimation);
