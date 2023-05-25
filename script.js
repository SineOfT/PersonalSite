const imageObserver = new IntersectionObserver(
   (entries) => {
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

// const siteBanner = document.querySelector(".site-banner");

// const bannerObserver = new IntersectionObserver(
//    (entries) => {
//       entries.forEach((entry) => {
//          if (entry.isIntersecting) {
//             entry.target.dataset.overlaping = "true";
//          } else {
//             entry.target.dataset.overlaping = "false";
//          }
//       });
//    },
//    {
//       root: siteBanner,
//       threshold: 0,
//    }
// );

// const siteHeader = document.querySelector(".site-header");
// bannerObserver.observe(siteHeader);
