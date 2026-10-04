import { fetchCategories, fetchAllEvents, fetchPriceOptions } from './api.js';
import {
    initScrollFade, initNavbarScroll, initHamburgerMenu, generateSkeletonCards,
    setBreadcrumb, initLightbox, initBackToTop, showToast
} from './ui-components.js';
const formEl = document.querySelector("#search-event-form");
const catSelect = document.querySelector("#filter-cat");
const dateSelect = document.querySelector("#filter-date");
const locSelect = document.querySelector("#filter-location");
const priceSelect = document.querySelector("#filter-price");

const btnClear = document.querySelector("#btn-clear-filters");
const resultGrid = document.querySelector("#search-result-grid");
const skeletonWrap = document.querySelector("#skeleton-search-wrap");
const errorBox = document.querySelector("#error-box");
const chipsWrap = document.querySelector("#filter-chips-wrap");
const onlyUpcoming = document.querySelector("#only-upcoming");
const onlyFree = document.querySelector("#only-free");
const sortSelect = document.querySelector("#sort-events");
const resultCountText = document.querySelector("#result-count-text");
let activeFilters = {};
let rawEventList = [];
let categoryList = [];

window.addEventListener("DOMContentLoaded", async () => {
    initNavbarScroll();
    initHamburgerMenu();
    initBackToTop();
    setBreadcrumb([
        { text: "Home", link: "./index.html" },
        { text: "Search Events" }
    ]);

    const urlParams = new URLSearchParams(window.location.search);
    const urlCatId = urlParams.get('cat_id');
    if(urlCatId) activeFilters.cat_id = urlCatId;

    skeletonWrap.innerHTML = generateSkeletonCards(4);
    try {
        const catResp = await fetchCategories();
        categoryList = catResp;
        catResp.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.name;
            opt.textContent = c.name;
            catSelect.appendChild(opt);
        });

        //填充价格下拉（从mock拿真实价格）
        const priceOpts = await fetchPriceOptions();
        priceOpts.forEach(p =>{
            const opt = document.createElement("option");
            opt.value = p;
            opt.textContent = `Under $${p}`;
            priceSelect.appendChild(opt);
        })

        const allEventsResp = await fetchAllEvents();
        skeletonWrap.innerHTML = "";
        rawEventList = [...allEventsResp];

        const uniqueDates = [...new Set(rawEventList.map(item => item.event_date))].sort();
        uniqueDates.forEach(dateStr => {
            const opt = document.createElement("option");
            opt.value = dateStr;
            opt.textContent = dateStr;
            dateSelect.appendChild(opt);
        });

        const uniqueLocations = [...new Set(rawEventList.map(item => item.location))].sort();
        uniqueLocations.forEach(locStr => {
            if(!locStr) return;
            const opt = document.createElement("option");
            opt.value = locStr;
            opt.textContent = locStr;
            locSelect.appendChild(opt);
        });

        applyLocalFilterAndRender();
    } catch (e) {
        skeletonWrap.innerHTML = "";
        console.error(e);
        showToast("error", "Failed to load event data");
    }

    btnClear.addEventListener('click', () => {
        formEl.reset();
        catSelect.value = "all";
        locSelect.value = "all";
        dateSelect.value = "all";
        priceSelect.value = "";

        activeFilters = {};
        chipsWrap.innerHTML = "";
        resultGrid.innerHTML = '';
        errorBox.innerHTML = '';
        resultCountText.innerText = "Use the filters to find charity events.";
        localStorage.removeItem("charitySearchFilters");
        applyLocalFilterAndRender();
    });

    sortSelect.addEventListener("change", () => {
        applyLocalFilterAndRender();
    });

    formEl.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const dateVal = dateSelect.value.trim();
        const locVal = locSelect.value.trim();
        const catVal = catSelect.value;
        const priceVal = priceSelect.value;

        activeFilters = {};
        if(dateVal !== "all") activeFilters.date = dateVal;
        if(locVal !== "all") activeFilters.location = locVal;
        if(catVal !== "all") activeFilters.category = catVal;
        if(priceVal !== "") activeFilters.maxPrice = Number(priceVal);

        activeFilters.onlyUpcoming = onlyUpcoming.checked;
        activeFilters.onlyFree = onlyFree.checked;

        localStorage.setItem("charitySearchFilters", JSON.stringify(activeFilters));
        renderFilterChips();
        applyLocalFilterAndRender();
    });
});

function applyLocalFilterAndRender() {
    let list = [...rawEventList];
    const now = new Date();
    if(activeFilters.location){
        list = list.filter(item => item.location === activeFilters.location);
    }
    if(activeFilters.category){
        list = list.filter(item => item.category === activeFilters.category);
    }
    if(activeFilters.date){
        const selectDay = new Date(activeFilters.date);
        list = list.filter(item => new Date(item.event_date) >= selectDay);
    }
    if (activeFilters.maxPrice !== undefined) {
        list = list.filter(item => Number(item.price) <= Number(activeFilters.maxPrice));
    }
    if (activeFilters.onlyUpcoming) {
        list = list.filter(item => new Date(item.event_date) >= now);
    }
    if (activeFilters.onlyFree) {
        list = list.filter(item => Number(item.price) === 0);
    }

    const sortVal = sortSelect.value;
    switch (sortVal) {
        case "date-asc":
            list.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
            break;
        case "date-desc":
            list.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));
            break;
        case "price-low":
            list.sort((a, b) => Number(a.price) - Number(b.price));
            break;
        case "price-high":
            list.sort((a, b) => Number(b.price) - Number(a.price));
            break;
        case "progress":
            list.sort((a, b) => Number(b.progress_percent||0) - Number(a.progress_percent||0));
            break;
        default:
            list.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    }

    resultCountText.innerText = `Found ${list.length} matching event(s)`;
    console.log("过滤完成 list =", list);
    if (list.length === 0) {
        if(skeletonWrap) skeletonWrap.innerHTML = "";
        const recommendEvents = [...rawEventList]
            .sort((a,b)=>new Date(b.event_date)-new Date(a.event_date))
            .slice(0,2);
        let recommendHtml = '';
        recommendEvents.forEach(ev=>{
            const evtDate = new Date(ev.event_date);
            const statusBadge = evtDate >= now
                ? `<span class="badge-upcoming">Upcoming</span>`
                : `<span class="badge-past">Past</span>`;
            const title = ev.title || "Event";
            const desc = ev.description || "";
            const imgSrc = ev.imageUrl ?? "https://picsum.photos/id/1043/600/320";
            recommendHtml += `
            <div class="event-card" data-id="${ev.id}">
                <img src="${imgSrc}" alt="${title}" data-lightbox>
                <div class="card-body">
                    <div class="badge-row">${statusBadge}<span class="event-category-tag">${ev.category||''}</span></div>
                    <h3>${title}</h3>
                    <p>${desc}</p>
                    <div class="event-meta">
                        <span>📍 ${ev.location||''}</span>
                        <span>🗓 ${evtDate.toLocaleDateString()}</span>
                    </div>
                    <div class="card-footer">
                        <span class="price-tag">${Number(ev.price)>0?"$"+Number(ev.price).toFixed(2):"Free"}</span>
                        <span class="btn-link">View Details</span>
                    </div>
                </div>
            </div>`;
        })
        resultGrid.innerHTML = `
        <div class="empty-note" style="text-align:center;padding:3rem 1rem;grid-column:1/-1;">
            <h4>No matching charity events found</h4>
            <p>No events fit your selected filters. Try changing your filter options.</p>
            <button class="btn btn-secondary" onclick="document.querySelector('#btn-clear-filters').click()">Reset All Filters</button>
            <h4 style="margin:24px 0 12px">Recommended events for you</h4>
        </div>
        ${recommendHtml}
        `;
        resultGrid.querySelectorAll('.event-card').forEach(card =>{
            card.addEventListener('click',()=>{
                const eid = card.dataset.id;
                window.location.href=`./event-detail.html?id=${eid}`;
            })
        })
        return;
    }
    renderCards(list);
    initScrollFade(".event-card");
    initLightbox();
}

function renderFilterChips() {
    chipsWrap.innerHTML = "";
    if (Object.keys(activeFilters).length === 0) return;
    if (activeFilters.date) {
        const chip = createChip(`Date: ${activeFilters.date}`, () => {
            delete activeFilters.date;
            dateSelect.value = "all";
            localStorage.setItem("charitySearchFilters", JSON.stringify(activeFilters));
            renderFilterChips();
            applyLocalFilterAndRender();
        });
        chipsWrap.appendChild(chip);
    }
    if (activeFilters.location) {
        const chip = createChip(`Location: ${activeFilters.location}`, () => {
            delete activeFilters.location;
            locSelect.value = "all";
            localStorage.setItem("charitySearchFilters", JSON.stringify(activeFilters));
            renderFilterChips();
            applyLocalFilterAndRender();
        });
        chipsWrap.appendChild(chip);
    }
    if (activeFilters.category) {
        const chip = createChip(`Category: ${activeFilters.category}`, () => {
            delete activeFilters.category;
            catSelect.value = "all";
            localStorage.setItem("charitySearchFilters", JSON.stringify(activeFilters));
            renderFilterChips();
            applyLocalFilterAndRender();
        });
        chipsWrap.appendChild(chip);
    }
    //新增价格筛选标签
    if(activeFilters.maxPrice !== undefined){
        const chip = createChip(`Max Price: $${activeFilters.maxPrice}`,()=>{
            delete activeFilters.maxPrice;
            priceSelect.value = "";
            localStorage.setItem("charitySearchFilters", JSON.stringify(activeFilters));
            renderFilterChips();
            applyLocalFilterAndRender();
        })
        chipsWrap.appendChild(chip);
    }
}

function createChip(text, onClose) {
    const div = document.createElement("div");
    div.className = "chip-tag";
    div.innerHTML = `${text}<span class="chip-close">×</span>`;
    div.querySelector(".chip-close").addEventListener("click", onClose);
    return div;
}

function renderCards(eventList) {
    console.log("renderCards 接收数组", eventList);
    if(skeletonWrap) skeletonWrap.innerHTML = "";
    let html = '';
    const now = new Date();
    eventList.forEach(ev => {
        const evtDate = new Date(ev.event_date);
        const statusBadge = evtDate >= now
            ? `<span class="badge-upcoming">Upcoming</span>`
            : `<span class="badge-past">Past</span>`;
        const title = ev.title || "Event";
        const desc = ev.description || "";
        const imgSrc = ev.imageUrl ?? "https://picsum.photos/id/1043/600/320";
        html += `
        <div class="event-card" data-id="${ev.id}">
            <img src="${imgSrc}" alt="${title}" data-lightbox>
            <div class="card-body">
                <div class="badge-row">
                    ${statusBadge}
                    <span class="event-category-tag">${ev.category||''}</span>
                </div>
                <h3>${title}</h3>
                <p>${desc}</p>
                <div class="event-meta">
                    <span>📍 ${ev.location||''}</span>
                    <span>🗓 ${evtDate.toLocaleDateString()}</span>
                </div>
                <div class="card-footer">
                    <span class="price-tag">${Number(ev.price)>0?"$"+Number(ev.price).toFixed(2):"Free"}</span>
                    <span class="btn-link">View Details</span>
                </div>
            </div>
        </div>
        `;
    });
    console.log("生成的html字符串长度：", html.length);
    resultGrid.innerHTML = html;
    document.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => {
            const eid = card.dataset.id;
            window.location.href = `./event-detail.html?id=${eid}`;
        });
    });
}
