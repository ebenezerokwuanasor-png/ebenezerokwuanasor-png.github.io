// =========================
// SUPABASE INIT
// =========================
const SUPABASE_URL = "https://fjiwrdecjftkflchjptr.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaXdyZGVjamZ0a2ZsY2hqcHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzk0OTQsImV4cCI6MjA4ODU1NTQ5NH0.tXe06ol03x8M0FLfk55_Wj6A2Y3mNny5t028gqZzYoU";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

let admin=false;

// =========================
// ADS (FIXED)
// =========================
function loadAd(){
let c=document.getElementById("adContainer");
c.innerHTML="";

let s=document.createElement("script");
s.src="https://pl29052599.profitablecpmratenetwork.com/24/cb/b7/24cbb72257475dcd544b0346aee1dd35.js";
s.async=true;

c.appendChild(s);
}

function openAd(){
document.getElementById("adOverlay").style.display="flex";
loadAd();
setTimeout(closeAd,8000);
}

function closeAd(){
document.getElementById("adOverlay").style.display="none";
document.getElementById("adContainer").innerHTML="";
}

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
document.getElementById(id).style.display="flex";
}
function closeOverlay(id){
document.getElementById(id).style.display="none";
}

// =========================
// LOAD POSTS (FULL FIX)
// =========================
async function loadPosts(){

let {data}=await db.from("posts").select("*").order("id",{ascending:false});

let box=document.getElementById("posts");
box.innerHTML="";

data.forEach(p=>{

box.innerHTML+=`
<div class="post">

<h3>${p.title}</h3>
<p>${p.body}</p>

<div>ID: ${p.id}</div>

<div>❤️ ${p.likes_count || 0} Likes</div>

<div>💬 ${p.comment_count || 0} Comments</div>

${renderMedia(p.media)}

<button onclick="likePost(${p.id})">👍 Like</button>
<button onclick="openComments(${p.id})">💬 Comment</button>
<button onclick="sharePost(${p.id})">📤 Share</button>
<button onclick="downloadMedia('${p.media}')">⬇ Download</button>

<!-- ADMIN EDIT -->
<button onclick="editPost(${p.id})">✏ Edit</button>

</div>
`;
});
}

// =========================
// MEDIA RENDER
// =========================
function renderMedia(url){
if(!url) return "";

if(url.match(/\.(jpg|png|jpeg|gif)$/)) return `<img src="${url}">`;
if(url.match(/\.(mp4|webm)$/)) return `<video controls src="${url}"></video>`;
if(url.match(/\.(mp3|wav)$/)) return `<audio controls src="${url}"></audio>`;

return "";
}

// =========================
// LIKE (FIXED COUNT REFRESH)
// =========================
async function likePost(id){
await db.rpc("like_increment",{post_id:id});
loadPosts();
}

// =========================
// COMMENTS (FIXED)
// =========================
function openComments(id){
document.getElementById("commentOverlay").style.display="flex";
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
loadPosts();
}

async function loadComments(id){

let {data}=await db.from("comments").select("*").eq("post_id",id);

let box=document.getElementById("commentList");
box.innerHTML="";

data.forEach(c=>{
box.innerHTML+=`
<div>
<b>${c.name}</b>: ${c.text}
</div>
`;
});
}

// =========================
// SEARCH FIX (TITLE + ID)
// =========================
function searchPosts(){

let q=document.getElementById("searchInput").value.toLowerCase();

document.querySelectorAll(".post").forEach(p=>{
p.style.display = p.innerText.toLowerCase().includes(q) ? "block":"none";
});
}

// =========================
// SHARE (DIRECT POST LINK FIX)
// =========================
function sharePost(id){
let url = window.location.origin + "?post=" + id;

if(navigator.share){
navigator.share({
title:"Check this post",
url:url
});
}else{
alert(url);
}
}

// =========================
// DOWNLOAD FIX
// =========================
function downloadMedia(url){
if(!url) return alert("No media");

let a=document.createElement("a");
a.href=url;
a.download="media";
a.click();
}

// =========================
// ADMIN EDIT POST
// =========================
async function editPost(id){

let title=prompt("New title");
let body=prompt("New body");
let media=prompt("New media URL (optional)");

await db.from("posts").update({
title,body,media
}).eq("id",id);

loadPosts();
}

// =========================
// INIT
// =========================
window.onload=()=>{
loadPosts();
};
