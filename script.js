// =========================
// SUPABASE
// =========================
const SUPABASE_URL = "https://fjiwrdecjftkflchjptr.supabase.co";
const SUPABASE_ANON = "
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaXdyZGVjamZ0a2ZsY2hqcHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzk0OTQsImV4cCI6MjA4ODU1NTQ5NH0.tXe06ol03x8M0FLfk55_Wj6A2Y3mNny5t028gqZzYoU";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// =========================
// STATE
// =========================
let admin = false;
let darkMode = false;

// =========================
// SIDEBAR FIX
// =========================
function toggleSidebar(){
    document.getElementById("sidebar").classList.toggle("open");
}

// =========================
// OVERLAYS
// =========================
function openOverlay(id){
    document.getElementById(id).style.display = "flex";
}

function closeOverlay(id){
    document.getElementById(id).style.display = "none";
}

// =========================
// SAFE BUTTON MAPPING (FIXES YOUR BUG)
// =========================
function adminClick(){
    openOverlay("adminLogin");
}

function watchAds(){
    openOverlay("adOverlay");

    let adBox = document.getElementById("adContainer");
    adBox.innerHTML = "";

    let script = document.createElement("script");
    script.src = "https://pl29052599.profitablecpmratenetwork.com/24/cb/b7/24cbb72257475dcd544b0346aee1dd35.js";
    script.async = true;

    adBox.appendChild(script);

    setTimeout(closeAds, 8000);
}

function closeAds(){
    closeOverlay("adOverlay");
}

// =========================
// THEME (SOFT DIM)
// =========================
function toggleTheme(){
    darkMode = !darkMode;

    document.body.style.background = darkMode ? "#1a1a1a" : "#f2f2f2";
    document.body.style.color = darkMode ? "#f5f5f5" : "#111";

    document.querySelectorAll(".post").forEach(p=>{
        p.style.background = darkMode ? "#2a2a2a" : "white";
    });
}

// =========================
// LINK DETECTOR (FIXED)
// =========================
function detectLinks(text){
    return text
    .replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank">$1</a>')
    .replace(/(www\.[^\s]+)/g,'<a href="https://$1" target="_blank">$1</a>')
    .replace(/(\b[a-z0-9.-]+\.(com|org|net|ng|io)\b)/g,
        '<a href="https://$1" target="_blank">$1</a>'
    );
}

// =========================
// STORAGE (200 BUCKET FIX)
// =========================
const MEDIA_BUCKETS = Array.from({length:200},(_,i)=>`media${i+1}`);

async function uploadFile(file){
    if(!file) return "";

    for(let bucket of MEDIA_BUCKETS){
        try{
            let name = Date.now()+"_"+file.name;

            const { error } = await db.storage.from(bucket).upload(name,file);

            if(!error){
                return SUPABASE_URL+
                "/storage/v1/object/public/"+bucket+"/"+name;
            }
        }catch(e){}
    }

    return "";
}

// =========================
// RENDER MEDIA FIX
// =========================
function renderMedia(url){
    if(!url) return "";

    if(url.match(/\.(jpg|jpeg|png|gif)$/i))
        return `<img src="${url}">`;

    if(url.match(/\.(mp4|webm)$/i))
        return `<video controls src="${url}"></video>`;

    if(url.match(/\.(mp3|wav)$/i))
        return `<audio controls src="${url}"></audio>`;

    return "";
}

// =========================
// POSTS
// =========================
async function loadPosts(){
    let { data } = await db.from("posts")
    .select("*")
    .order("id",{ascending:false});

    let box = document.getElementById("posts");
    box.innerHTML = "";

    (data || []).forEach(p=>{
        let div = document.createElement("div");
        div.className = "post";

        div.innerHTML = `
            <h3>${p.title}</h3>
            <p>${detectLinks(p.body)}</p>

            ${renderMedia(p.media)}

            <div>Post ID: ${p.id}</div>

            ❤️ ${p.likes || 0}

            <br>

            <button onclick="likePost(${p.id})">Like</button>
            <button onclick="openComments(${p.id})">Comments</button>
            <button onclick="sharePost('${p.title}','${p.body}')">Share</button>
        `;

        box.appendChild(div);
    });
}

// =========================
// LIKE (FIXED)
// =========================
async function likePost(id){

    let key = "liked_"+id;
    if(localStorage.getItem(key)) return;

    let { data } = await db.from("posts")
    .select("likes").eq("id",id).single();

    await db.from("posts")
    .update({ likes:(data.likes||0)+1 })
    .eq("id",id);

    localStorage.setItem(key,"1");
    loadPosts();
}

// =========================
// COMMENTS
// =========================
async function openComments(postId){

    let name = prompt("Your name:");
    if(!name) return;

    let text = prompt("Comment:");
    if(!text) return;

    await db.from("comments").insert({
        post_id: postId,
        name,
        text
    });

    alert("Comment added");
}

// =========================
// SHARE WITH ADS + TIMER
// =========================
function sharePost(title,body){

    watchAds();

    let start = Date.now();

    let interval = setInterval(()=>{

        let diff = Date.now() - start;

        if(diff > 200000){
            clearInterval(interval);

            if(navigator.share){
                navigator.share({
                    title,
                    text: body,
                    url: location.href
                });
            }
        }

    },2000);
}

// =========================
// ADMIN LOGIN TRIAL SYSTEM (5 FAIL LIMIT)
// =========================
async function adminLogin(){

    let email = document.getElementById("adminEmail").value;
    let pass = document.getElementById("adminPass").value;

    let key = "login_trials";

    let trials = JSON.parse(localStorage.getItem(key) || "0");

    if(trials >= 5){
        alert("🔒 Locked for 24hrs");
        return;
    }

    const { error } = await db.auth.signInWithPassword({
        email,
        password: pass
    });

    if(error){
        trials++;
        localStorage.setItem(key, JSON.stringify(trials));

        alert("❌ Wrong login ("+trials+"/5)");
        return;
    }

    admin = true;
    localStorage.removeItem(key);

    closeOverlay("adminLogin");
    openOverlay("adminPanel");

    alert("✅ Welcome Admin");
}

// =========================
// ADMIN POSTS
// =========================
async function createPost(){

    let title = document.getElementById("postTitle").value;
    let body = detectLinks(document.getElementById("postBody").value);

    let file = document.getElementById("mediaFile").files[0];

    let media = await uploadFile(file);

    await db.from("posts").insert({
        title,
        body,
        media,
        likes:0
    });

    loadPosts();
    alert("Posted");
}

// =========================
// FAVICON (SAFE)
// =========================
async function changeFavicon(){

    let input = document.createElement("input");
    input.type = "file";

    input.onchange = async ()=>{

        let file = input.files[0];

        let img = new Image();

        img.onload = async ()=>{

            if(img.width!==128 || img.height!==128){
                alert("Must be 128x128");
                return;
            }

            await db.storage.from("favicon")
            .upload("favicon.png",file,{upsert:true});

            alert("Updated");
        };

        img.src = URL.createObjectURL(file);
    };

    input.click();
}

// =========================
// INIT
// =========================
window.onload = ()=>{
    loadPosts();
};
