export function initNavbarScroll(){
    const nav = document.querySelector(".main-nav");
    if(!nav) return;
    window.addEventListener("scroll",()=>{
        if(window.scrollY > 40){
            nav.classList.add("nav-scrolled");
        }else{
            nav.classList.remove("nav-scrolled");
        }
    })
}

export function initHamburgerMenu(){
    const btn = document.querySelector("#hamburgerBtn");
    const menu = document.querySelector("#navMenu");
    if(!btn||!menu) return;
    btn.onclick = ()=> menu.classList.toggle("open");
}

export function initBackToTop(){
    const btn = document.querySelector("#backToTop");
    if(!btn) return;
    window.addEventListener("scroll",()=>{
        btn.style.display = window.scrollY>400 ? "block":"none";
    })
    btn.onclick = ()=> window.scrollTo({top:0,behavior:"smooth"});
}

export function setBreadcrumb(list){
    const wrap = document.querySelector(".breadcrumb");
    if(!wrap) return;
    wrap.innerHTML = list.map((item,i)=>{
        if(item.link){
            return `<a href="${item.link}">${item.text}</a>${i<list.length-1?" / ":""}`
        }else{
            return `<span>${item.text}</span>${i<list.length-1?" / ":""}`
        }
    }).join("");
}

export function generateSkeletonCards(count){
    let html = "";
    for(let i=0;i<count;i++){
        html += `<div class="skeleton-card"></div>`
    }
    return html;
}

export function showToast(type="info", msg){
    console.log(`Toast ${type}:`,msg);
}

export function animateCounter(el){
    const target = Number(el.dataset.target);
    let current = 0;
    const step = target / 60;
    const timer = setInterval(()=>{
        current += step;
        if(current >= target){
            el.innerText = target.toLocaleString();
            clearInterval(timer);
        }else{
            el.innerText = Math.floor(current).toLocaleString();
        }
    },20)
}

export function initScrollFade(selector){
    const items = document.querySelectorAll(selector);
    const observer = new IntersectionObserver((entries)=>{
        entries.forEach(en=>{
            if(en.isIntersecting){
                en.target.classList.add("fade-in");
            }
        })
    },{threshold:0.1})
    items.forEach(x=>observer.observe(x));
}

export function initLightbox(){
    const allImgs = document.querySelectorAll('[data-lightbox]');
    allImgs.forEach(img=>{
        img.style.cursor = "pointer";
    })
}
