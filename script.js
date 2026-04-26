// =========================
// SUPABASE INIT
// =========================
const SUPABASE_URL = "https://fjiwrdecjftkflchjptr.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaXdyZGVjamZ0a2ZsY2hqcHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzk0OTQsImV4cCI6MjA4ODU1NTQ5NH0.tXe06ol03x8M0FLfk55_Wj6A2Y3mNny5t028gqZzYoU";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// =========================
// GLOBAL STATE
// =========================
let admin = false;
let dark = false;

// cookies helpers
function setCookie(name,value,days){
let d=new Date();
d.setTime(d.getTime()+(days*24*60*60*1000));
document.cookie = name+"="+value+";expires="+d.toUTCString()+";path=/";
}

function getCookie(name){
let v=document.cookie.match('(^|;) ?'+name+'=([^;]*)(;|$)');
return v?v[2]:null;
}

// =========================
// ADSTERA SAFE LOAD
// =========================
function loadAd(){
let s=document.createElement("script");
s.src="https://pl29052599.profitablecpmratenetwork.com/24/cb/b7/24cbb72257475dcd544b0346aee1dd35.js";
s.async=true;
document.getElementById("adContainer").innerHTML="";
document.getElementById("adContainer").appendChild(s);
}

// =========================
// SIDEBAR
// =========================
function toggleSidebar(){
document.getElementById("sidebar").classList.toggle("open");
}

// =========================
// OVERLAYS
// =========================
function openOverlay(id){
document.getElementById(id).style.display="flex";
}
function closeOverlay(id){
document.getElementById(id).style.display="none";
}

// =========================
// THEME (SOFT DIM FIX)
// =========================
function toggleTheme(){
dark=!dark;
document.body.style.background = dark ? "#e6e6e6" : "#f2f2f2";
}

// =========================
// LINK DETECTOR
// =========================
function linkify(text){
return text.replace(
/(https?:\/\/[^\s]+|www\.[^\s]+|[\w-]+\.(com|ng|org|io|net))/g,
match=>`<a href="https://${match.replace("https://","")}" target="_blank">${match}</a>`
);
}

// =========================
// LOAD POSTS
// =========================
async function loadPosts(){

let {data} = await db.from("posts").select("*").order("id",{ascending:false});

let box=document.getElementById("posts");
box.innerHTML="";

data.forEach(p=>{

let media="";
if(p.media){
if(p.media.match(/\.(jpg|png|jpeg|gif)$/)) media=`<img src="${p.media}">`;
else if(p.media.match(/\.(mp4|webm)$/)) media=`<video controls src="${p.media}"></video>`;
else if(p.media.match(/\.(mp3|wav)$/)) media=`<audio controls src="${p.media}"></audio>`;
}

box.innerHTML+=`
<div class="post">
<h3>${p.title}</h3>
<p>${linkify(p.body)}</p>
${media}

<div>ID: ${p.id}</div>

<button onclick="likePost(${p.id})">👍 Like</button>
<button onclick="openComments(${p.id})">💬 Comments</button>
<button onclick="sharePost('${p.title}','${p.body}')">📤 Share</button>
</div>
`;
});
}

// =========================
// LIKE SYSTEM (1 PER BROWSER)
// =========================
async function likePost(id){

if(getCookie("liked_"+id)) return alert("Already liked");

await db.rpc("increment_like",{post_id:id});

setCookie("liked_"+id,true,365);

loadPosts();
}

// =========================
// COMMENTS
// =========================
function openComments(id){
openOverlay("commentOverlay");
document.getElementById("commentPostId").value=id;
loadComments(id);
}

async function addComment(){
let id=document.getElementById("commentPostId").value;
let name=document.getElementById("cName").value;
let text=document.getElementById("cText").value;

if(!name||!text) return alert("Fill all");

await db.from("comments").insert({
post_id:id,
name,
text
});

loadComments(id);
}

async function loadComments(id){

let {data}=await db.from("comments").select("*").eq("post_id",id);

let box=document.getElementById("commentList");
box.innerHTML="";

data.forEach(c=>{
box.innerHTML+=`
<div oncontextmenu="deleteComment(${c.id})">
<b>${c.name}</b>: ${c.text}
</div>
`;
});
}

async function deleteComment(id){
if(!confirm("Delete comment?")) return;
await db.from("comments").delete().eq("id",id);
}

// =========================
// SHARE WITH ADS DELAY
// =========================
function sharePost(title,body){

openAd();

setTimeout(()=>{
if(navigator.share){
navigator.share({title,text:body});
}
},5000);
}

// =========================
// ADS
// =========================
function openAd(){
document.getElementById("adOverlay").style.display="flex";
loadAd();
setTimeout(()=>closeAd(),8000);
}

function closeAd(){
document.getElementById("adOverlay").style.display="none";
document.getElementById("adContainer").innerHTML="";
}

// =========================
// ADMIN LOGIN (LOADER FIX)
// =========================
async function adminLogin(){

let email=document.getElementById("adminEmail").value;
let pass=document.getElementById("adminPass").value;

document.getElementById("loginStatus").innerText="⏳ Please wait...";

let {error}=await db.auth.signInWithPassword({
email,
password:pass
});

if(error){
document.getElementById("loginStatus").innerText="❌ Invalid login";
return;
}

admin=true;
document.getElementById("loginStatus").innerText="✅ Success";
closeOverlay("adminLogin");
openOverlay("adminPanel");
}

// =========================
// INIT
// =========================
window.onload=()=>{
loadPosts();
};
