// =====================
// SUPABASE INIT
// =====================
const SUPABASE_URL = "https://fjiwrdecjftkflchjptr.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaXdyZGVjamZ0a2ZsY2hqcHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzk0OTQsImV4cCI6MjA4ODU1NTQ5NH0.tXe06ol03x8M0FLfk55_Wj6A2Y3mNny5t028gqZzYoU";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// =====================
// GLOBAL STATE
// =====================
let admin = false;
let dark = false;

// =====================
// COOKIE SYSTEM
// =====================
function setCookie(n,v,d){
let date=new Date();
date.setTime(date.getTime()+d*86400000);
document.cookie=`${n}=${v};expires=${date.toUTCString()};path=/`;
}

function getCookie(n){
return document.cookie.split("; ").find(r=>r.startsWith(n+"="))?.split("=")[1];
}

// =====================
// SAFE DOM READY
// =====================
document.addEventListener("DOMContentLoaded",()=>{
loadPosts();
setupSidebar();
});

// =====================
// SIDEBAR FIX (ALL BUTTONS WORK)
// =====================
function setupSidebar(){
document.querySelectorAll("[data-action]").forEach(btn=>{
btn.addEventListener("click",handleAction);
});
}

function handleAction(e){
let action=e.target.dataset.action;

switch(action){
case "admin": openOverlay("adminLogin"); break;
case "contact": openOverlay("contactOverlay"); break;
case "theme": toggleTheme(); break;
case "ads": openAd(); break;
case "about": openOverlay("aboutOverlay"); break;
}
}

// =====================
// OVERLAYS
// =====================
function openOverlay(id){
document.getElementById(id).style.display="flex";
}

function closeOverlay(id){
document.getElementById(id).style.display="none";
}

// =====================
// THEME FIX (TEXT AUTO WHITE)
// =====================
function toggleTheme(){
dark=!dark;

document.body.style.background = dark ? "#e9e9e9" : "#f2f2f2";
document.body.style.color = dark ? "white" : "black";

document.querySelectorAll(".post").forEach(p=>{
p.style.color = dark ? "white" : "black";
});
}

// =====================
// LINK DETECTOR
// =====================
function linkify(t){
return t.replace(
/(https?:\/\/[^\s]+|www\.[^\s]+|[\w-]+\.(com|ng|org|io|net))/g,
m=>`<a target="_blank" href="https://${m.replace("https://","")}">${m}</a>`
);
}

// =====================
// LOAD POSTS (FIXED SAFE)
// =====================
async function loadPosts(){

let {data} = await db.from("posts")
.select("*")
.order("id",{ascending:false});

let box=document.getElementById("posts");
if(!box) return;

box.innerHTML="";

(data||[]).forEach(p=>{

let media="";

if(p.media){
if(p.media.match(/\.(jpg|png|jpeg)$/)) media=`<img src="${p.media}">`;
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
<button onclick="openComments(${p.id})">💬 Comment</button>
<button onclick="sharePost('${p.title}','${p.body}')">📤 Share</button>
</div>
`;
});
}

// =====================
// LIKE SYSTEM (DB + COOKIE)
// =====================
async function likePost(id){

if(getCookie("like_"+id)) return alert("Already liked");

await db.rpc("like_increment",{post_id:id});

setCookie("like_"+id,"1",365);

loadPosts();
}

// =====================
// COMMENTS
// =====================
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

let {data}=await db.from("comments")
.select("*")
.eq("post_id",id);

let box=document.getElementById("commentList");
box.innerHTML="";

(data||[]).forEach(c=>{
box.innerHTML+=`
<div oncontextmenu="deleteComment(${c.id})">
<b>${c.name}</b>: ${c.text}
</div>
`;
});
}

async function deleteComment(id){
if(!confirm("Delete?")) return;
await db.from("comments").delete().eq("id",id);
}

// =====================
// SHARE WITH AD DELAY
// =====================
function sharePost(title,body){

openAd();

setTimeout(()=>{
if(navigator.share){
navigator.share({title,text:body});
}
},5000);
}

// =====================
// ADS SYSTEM
// =====================
function openAd(){
document.getElementById("adOverlay").style.display="flex";

let s=document.createElement("script");
s.src="https://pl29052599.profitablecpmratenetwork.com/24/cb/b7/24cbb72257475dcd544b0346aee1dd35.js";

document.getElementById("adContainer").innerHTML="";
document.getElementById("adContainer").appendChild(s);

setTimeout(closeAd,8000);
}

function closeAd(){
document.getElementById("adOverlay").style.display="none";
document.getElementById("adContainer").innerHTML="";
}

// =====================
// ADMIN LOGIN (FIXED STATE)
// =====================
async function adminLogin(){

let email=document.getElementById("adminEmail").value;
let pass=document.getElementById("adminPass").value;

document.getElementById("loginStatus").innerText="Please wait...";

let {error}=await db.auth.signInWithPassword({
email,
password:pass
});

if(error){
document.getElementById("loginStatus").innerText="Invalid login";
return;
}

admin=true;
closeOverlay("adminLogin");
openOverlay("adminPanel");
}

// =====================
// INIT SAFE
// =====================
window.onload=()=>{
loadPosts();
};
