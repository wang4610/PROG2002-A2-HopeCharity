const express = require('express');
const cors = require('cors');
const pool = require('./event_db');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
// 新增这一行！托管public文件夹里面所有html/css/js前端文件
app.use(express.static('public'));

//首页活动接口
app.get('/api/home-events', async (req, res) => {
    try {
        const sql = `
        SELECT e.*, c.cat_name, o.org_name, o.org_logo_url
        FROM charity_events e
        JOIN event_categories c ON e.cat_id = c.cat_id
        JOIN charity_organisations o ON e.org_id = o.org_id
        WHERE e.is_suspended = 0
        ORDER BY e.event_date ASC
        `;
        const [rows] = await pool.query(sql);
        const now = new Date();
        const enriched = rows.map(row => {
            const eventDate = new Date(row.event_date);
            const status = eventDate >= now ? 'upcoming' : 'past';
            const progressPercent = row.charity_goal_amount > 0
                ? Math.min(100, Number((row.current_raised / row.charity_goal_amount)*100))
                : 0;
            return {
                ...row,
                event_status: status,
                progress_percent: Number(progressPercent.toFixed(1))
            };
        });
        res.json({success:true, data:enriched});
    } catch(err) {
        console.error(err);
        res.status(500).json({success:false, message:"Database error"});
    }
});
//分类接口
app.get('/api/categories', async (req,res)=>{
    try{
        const [rows] = await pool.query("SELECT * FROM event_categories");
        res.json({success:true, data:rows});
    }catch(err){
        console.error(err);
        res.status(500).json({success:false, message:"Failed fetch categories"});
    }
});
//搜索接口
app.get('/api/events/search', async(req,res)=>{
    try{
        let baseSql = `
        SELECT e.*, c.cat_name, o.org_name
        FROM charity_events e
        JOIN event_categories c ON e.cat_id = c.cat_id
        JOIN charity_organisations o ON e.org_id = o.org_id
        WHERE e.is_suspended = 0
        `;
        const params = [];
        if(req.query.date){
            baseSql += " AND DATE(e.event_date) = ? ";
            params.push(req.query.date);
        }
        if(req.query.location){
            baseSql += " AND e.location LIKE ? ";
            params.push(`%${req.query.location}%`);
        }
        if(req.query.cat_id){
            baseSql += " AND e.cat_id = ? ";
            params.push(req.query.cat_id);
        }
        if(req.query.maxPrice !== undefined){
            baseSql += " AND e.ticket_price <= ? ";
            params.push(Number(req.query.maxPrice));
        }
        if(req.query.onlyUpcoming === 'true'){
            baseSql += " AND e.event_date >= NOW() ";
        }
        if(req.query.onlyFree === 'true'){
            baseSql += " AND e.ticket_price = 0 ";
        }
        baseSql += " ORDER BY e.event_date ASC ";
        const [rows] = await pool.query(baseSql, params);
        const now = new Date();
        const enriched = rows.map(r=>{
            const st = new Date(r.event_date)>=now ? 'upcoming':'past';
            const progressPercent = r.charity_goal_amount>0
                ? Math.min(100, Number((r.current_raised/r.charity_goal_amount)*100))
                :0;
            return {
                ...r,
                event_status:st,
                progress_percent: Number(progressPercent.toFixed(1))
            };
        });
        res.json({success:true, count:enriched.length, data:enriched});
    }catch(err){
        console.error(err);
        res.status(500).json({success:false, message:"Search error"});
    }
});
//单个活动详情接口
app.get('/api/events/:eventId', async(req,res)=>{
    const eid = req.params.eventId;
    try{
        const sql = `
        SELECT e.*, c.cat_name, c.cat_description, o.*
        FROM charity_events e
        JOIN event_categories c ON e.cat_id = c.cat_id
        JOIN charity_organisations o ON e.org_id = o.org_id
        WHERE e.event_id = ? AND e.is_suspended = 0
        `;
        const [rows] = await pool.query(sql, [eid]);
        if(rows.length === 0){
            return res.status(404).json({success:false, message:"Event not found or suspended"});
        }
        const item = rows[0];
        const now = new Date();
        const status = new Date(item.event_date)>=now ? 'upcoming':'past';
        const progressPercent = item.charity_goal_amount>0
            ? Math.min(100, Number((item.current_raised/item.charity_goal_amount)*100))
            :0;
        res.json({
            success:true,
            data:{
                ...item,
                event_status:status,
                progress_percent: Number(progressPercent.toFixed(1))
            }
        });
    }catch(err){
        console.error(err);
        res.status(500).json({success:false, message:"Server error fetching single event"});
    }
});

app.listen(PORT, ()=>{
    console.log(`✅ API Server running http://localhost:${PORT}`);
});
