import { fetchSearchEvents, fetchAllEvents } from './api.js';
import { initScrollFade, initNavbarScroll, initHamburgerMenu, setBreadcrumb, initBackToTop, generateSkeletonCards } from './ui-components.js';
//原有首页DOM
const skeletonWrap = document.querySelector("#skeleton-wrap");
const eventGridHome = document.querySelector("#event-grid-home");
//轮播DOM
const carouselTrack = document.querySelector("#carouselTrack");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");
//弹窗DOM
const eventModal = document.querySelector("#eventModal");
const modalClose = document.querySelector("#modalClose");
const modalImage = document.querySelector("#modalImage");
const modalTitle = document.querySelector("#modalTitle");
const modalDesc = document.querySelector("#modalDesc");
const modalDate = document.querySelector("#modalDate");
const modalLocation = document.querySelector("#modalLocation");
const modalPrice = document.querySelector("#modalPrice");
const modalDetailLink = document.querySelector("#modalDetailLink");
let carouselData = [];
let currentIndex = 0;

//渲染轮播卡片：直接使用接口返回item的title、description，不再维护本地数组
function renderCarousel(list) {
  carouselData = list;
  currentIndex = 0;
  carouselTrack.innerHTML = "";
  list.forEach((item)=>{
    const card = document.createElement('div');
    card.className = "carousel-event-card";
    const title = item.title || "Charity Event";
    const desc = item.description || "Support people in need with our community charity events.";
    card.innerHTML = `
      <img src="${item.imageUrl || 'https://picsum.photos/id/1043/600/320'}" alt="${title}">
      <div class="carousel-card-body">
        <h3>${title}</h3>
        <p>${desc}</p>
      </div>
    `;
    card.addEventListener('click',()=>openModal(item));
    carouselTrack.appendChild(card);
  })
  updateCarouselPosition(false);
}

// 更新轮播位移
function updateCarouselPosition(animate = true){
  if(!carouselTrack.querySelector('.carousel-event-card')) return;
  const cardWidth = carouselTrack.querySelector('.carousel-event-card').offsetWidth;
  const offset = -currentIndex * cardWidth;
  if(!animate){
    carouselTrack.style.transition = "none";
  }else{
    carouselTrack.style.transition = "transform 0.35s ease-out";
  }
  carouselTrack.style.transform = `translateX(${offset}px)`;
}

//打开预览弹窗：直接拿后端返回对象，不再依赖下标索引取本地数组
function openModal(evt){
  modalImage.src = evt.imageUrl || "https://picsum.photos/id/1043/600/320";
  modalTitle.innerText = evt.title || "Charity Event";
  modalDesc.innerText = evt.description || "Support people in need with our community charity events.";
  modalDate.innerText = new Date(evt.event_date).toLocaleDateString();
  modalLocation.innerText = evt.location;
  modalPrice.innerText = Number(evt.price) > 0 ? `$${evt.price}` : "Free";
  modalDetailLink.href = `./event-detail.html?id=${evt.id}`;
  eventModal.classList.add("show");
}

//关闭弹窗
function closeModal(){
  eventModal.classList.remove("show");
}

//轮播按钮监听
prevBtn.addEventListener('click',()=>{
  currentIndex--;
  if(currentIndex < 0){
    currentIndex = carouselData.length - 1;
  }
  updateCarouselPosition();
})
nextBtn.addEventListener('click',()=>{
  currentIndex++;
  if(currentIndex >= carouselData.length){
    currentIndex = 0;
  }
  updateCarouselPosition();
})
modalClose.addEventListener('click', closeModal);
eventModal.addEventListener('click', (e)=>{
  if(e.target === eventModal) closeModal();
})

/**
 * 数字动画：匹配HTML的 .stat-number 四个元素
 * values顺序：[筹款总额, 活跃活动数, 参与者, 合作方数量]
 */
function animateStatNumbers(values) {
  const statNodes = document.querySelectorAll('.stat-number');
  statNodes.forEach((el, i) => {
    const targetVal = values[i];
    let cur = 0;
    const step = Math.ceil(targetVal / 40);
    const timer = setInterval(() => {
      cur += step;
      if (cur >= targetVal) {
        cur = targetVal;
        clearInterval(timer);
      }
      if (i === 0) {
        el.textContent = "$" + cur.toLocaleString();
      } else {
        el.textContent = cur.toLocaleString();
      }
    }, 30);
  });
}

async function loadHomeData(){
  const allEvents = await fetchAllEvents();
  const dataList = await fetchSearchEvents();
  if(skeletonWrap){
    generateSkeletonCards(skeletonWrap,4);
    skeletonWrap.innerHTML = "";
  }
  if(Array.isArray(dataList)){
    renderCarousel(dataList);
  }
  //统计计算
  const today = new Date();
  today.setHours(0,0,0,0);
  const activeList = allEvents.filter(e=> new Date(e.event_date) >= today);
  const activeCount = activeList.length;
  const fundsRaised = activeList.reduce((s,item)=> s + item.progress_percent * 120, 0);
  const participants = activeCount * 130;
  const partnerCount = 5;
  //直接操作页面上的 .stat-number，不再使用不存在的id
  animateStatNumbers([fundsRaised, activeCount, participants, partnerCount]);
}

document.addEventListener('DOMContentLoaded',()=>{
  initNavbarScroll();
  initHamburgerMenu();
  initBackToTop();
  initScrollFade();
  setBreadcrumb([{text:"Home"}]);
  loadHomeData();
})