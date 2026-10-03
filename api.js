// api.js 前端，clientside/js/api.js
const BASE_URL = "http://127.0.0.1:3000";
//本地模拟数据 一共8条活动
const mockEvents = [
    {
        id: 1,
        title: "Sydney Fun Run",
        description: "Community run activity",
        location: "Sydney",
        category: "Food",
        event_date: "2026-10-05",
        price: 0,
        progress_percent: 40,
        imageUrl: "https://picsum.photos/id/1043/1200/450"
    },
    {
        id: 2,
        title: "Singapore Gala Dinner",
        description: "Charity gala dinner",
        location: "Singapore",
        category: "Elderly",
        event_date: "2026-11-12",
        price: 80,
        progress_percent: 65,
        imageUrl: "https://picsum.photos/id/1048/1200/450"
    },
    {
        id: 3,
        title: "Melbourne Auction",
        description: "Silent charity auction",
        location: "Melbourne",
        category: "Education",
        event_date: "2026-12-01",
        price: 25,
        progress_percent: 22,
        imageUrl: "https://picsum.photos/id/1039/1200/450"
    },
    {
        id: 4,
        title: "Brisbane Charity Concert",
        description: "Live music fundraiser",
        location: "Brisbane",
        category: "Environment",
        event_date: "2026-10-18",
        price: 35,
        progress_percent: 50,
        imageUrl: "https://picsum.photos/id/1050/1200/450"
    },
    {
        id: 5,
        title: "Perth Beach Cleanup",
        description: "Environmental community event",
        location: "Perth",
        category: "Environment",
        event_date: "2026-10-25",
        price: 0,
        progress_percent: 30,
        imageUrl: "https://picsum.photos/id/1052/1200/450"
    },
    {
        id: 6,
        title: "Auckland Youth Workshop",
        description: "Education workshop for young people",
        location: "Auckland",
        category: "Education",
        event_date: "2026-11-02",
        price: 15,
        progress_percent: 55,
        imageUrl: "https://picsum.photos/id/1059/1200/450"
    },
    {
        id: 7,
        title: "Hong Kong Charity Walk",
        description: "Charity walk for families",
        location: "Hong Kong",
        category: "Health",
        event_date: "2026-11-20",
        price: 0,
        progress_percent: 45,
        imageUrl: "https://picsum.photos/id/1067/1200/450"
    },
    {
        id: 8,
        title: "Dubai Luxury Auction",
        description: "Premium silent auction fundraiser",
        location: "Dubai",
        category: "Health",
        event_date: "2026-12-10",
        price: 120,
        progress_percent: 28,
        imageUrl: "https://picsum.photos/id/1070/1200/450"
    }
];
const mockCategories = [
    {id:1,name:"Food"},
    {id:2,name:"Elderly"},
    {id:3,name:"Education"},
    {id:4,name:"Environment"},
    {id:5,name:"Health"}
];
// 获取所有活动分类，给下拉筛选用
export async function fetchCategories() {
    //模拟网络延时
    await new Promise(r=>setTimeout(r,150));
    return mockCategories;
}
// 【新增】提取mock数据里面真实存在的价格，去重、从小到大排序，给价格下拉
export async function fetchPriceOptions(){
    await new Promise(r=>setTimeout(r,120));
    const priceSet = new Set(mockEvents.map(e => e.price));
    return Array.from(priceSet).sort((a,b)=> a - b);
}
// 获取全部活动
export async function fetchAllEvents() {
    await new Promise(r=>setTimeout(r,150));
    return mockEvents;
}
// 搜索筛选活动：兼容老多参数 和 新对象参数两种调用
export async function fetchSearchEvents(arg1, arg2, arg3, arg4, arg5, arg6) {
    await new Promise(r=>setTimeout(r,150));
    let params;
    if(arg1 && typeof arg1 === 'object'){
        params = arg1;
    }else{
        params = {
            category: arg1,
            location: arg2,
            event_date: arg3
        }
    }
    const {category, location, event_date, maxPrice, onlyUpcoming, onlyFree} = params;

    let list = [...mockEvents];

    if(category && category !== "all"){
        list = list.filter(item=>item.category === category);
    }
    if(location && location !== "all"){
        list = list.filter(item=>item.location === location);
    }
    if(event_date && event_date !== "all"){
        const selectDay = new Date(event_date);
        list = list.filter(item => new Date(item.event_date) >= selectDay);
    }
    //价格筛选：小于等于选中的maxPrice
    if(maxPrice !== "" && maxPrice !== null && maxPrice !== undefined){
        list = list.filter(item => item.price <= Number(maxPrice));
    }
    //只显示即将到来（活动日期 >=今天）
    if(onlyUpcoming){
        const today = new Date();
        today.setHours(0,0,0,0);
        list = list.filter(item => new Date(item.event_date) >= today);
    }
    //只显示免费
    if(onlyFree){
        list = list.filter(item => item.price === 0);
    }
    return list;
}
// 根据id获取单个活动（详情页event-detail.html）
export async function fetchEventById(id) {
    await new Promise(r=>setTimeout(r,150));
    const found = mockEvents.find(item=> String(item.id) === String(id));
    if(!found) return null;
    return found;
}