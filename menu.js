const menuInfoBtnExpand = document.querySelector(".menu-info-btn-expand");
const menuInfoBtnContract = document.querySelector(".menu-info-btn-contract");
const menuInfo = document.querySelector(".menu-info");

function expandNavigation() {
   menuInfo.showModal();
}

function contractNavigation() {
   menuInfo.close();
}

menuInfoBtnExpand.addEventListener("click", expandNavigation);
menuInfoBtnContract.addEventListener("click", contractNavigation);
