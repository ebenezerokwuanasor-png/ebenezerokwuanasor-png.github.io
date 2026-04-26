// ===============================
// SUPABASE INIT
// ===============================
const SUPABASE_URL = "https://fjiwrdecjftkflchjptr.supabase.co";
const SUPABASE_ANON = "YOUR_ANON_KEY_HERE";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// ===============================
// STATE
// ===============================
let admin = false;
let dark = false;

// ===============================
// ELEMENT HELPERS
// ===============================
const $ = (id) => document.getElementById(id);

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadPosts();
  initButtons();
  checkCookies();
});

// ===============================
// BUTTON BINDING (FIXED)
// ===============================
function initButtons() {

  // sidebar
  $("menuBtn").addEventListener("click", toggleSidebar);

  $("adminBtn").addEventListener("click", adminClick);
  $("adsBtn").addEventListener("click", watchAd);
  $("themeBtn").addEventListener("click", toggleTheme);
  $("contactBtn").addEventListener("click", () => openOverlay("contactOverlay"));

  $("searchBtn").addEventListener("click", searchPosts);

}

// ===============================
// SIDEBAR
// ===============================
function toggleSidebar() {
  $("sidebar").classList.toggle("open");
}

// ===============================
// THEME (FIXED DARK DIM)
// ===============================
function toggleTheme() {
  dark = !dark;

  document.body.style.background = dark ? "#1a1a1a" : "#f2f2f2";
  document.body.style.color = dark ? "#ffffff" : "#000000";

  document.querySelectorAll(".post").forEach(p => {
    p.style.color = dark ? "#fff" : "#000";
    p.style.background = dark ? "#2a2a2a" : "#fff";
  });
}

// ===============================
// OVERLAYS
// ===============================
function openOverlay(id) {
  $(id).style.display = "flex";
}

function closeOverlay(id) {
  $(id).style.display = "none";
}

// ===============================
// ADMIN LOGIN (SUPABASE ONLY)
// ===============================
async function adminLogin() {
  const email = $("adminEmail").value;
  const pass = $("adminPass").value;

  const { error } = await db.auth.signInWithPassword({
    email,
    password: pass
  });

  if (error) {
    alert("❌ Invalid login");
    return;
  }

  admin = true;
  closeOverlay("adminLogin");
  openOverlay("adminPanel");
}

// ===============================
// POSTS LOAD (FIXED + MEDIA + COUNTERS)
// ===============================
async function loadPosts() {

  const { data } = await db.from("posts").select("*").order("id", { ascending: false });

  const container = $("posts");
  container.innerHTML = "";

  for (let p of data) {

    const media = renderMedia(p.media);

    const likes = await getLikes(p.id);
    const comments = await getCommentsCount(p.id);

    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      <h3>${p.title}</h3>
      <p>${linkify(p.body)}</p>

      ${media}

      <small>ID: ${p.id}</small>

      <div class="actions">

        <button onclick="likePost(${p.id})">❤️ ${likes}</button>

        <button onclick="openComments(${p.id})">💬 ${comments}</button>

        <button onclick="sharePost(${p.id}, '${p.title}')">🔗 Share</button>

        <button onclick="downloadMedia('${p.media}')">⬇ Download</button>

      </div>
    `;

    container.appendChild(div);
  }
}

// ===============================
// MEDIA
// ===============================
function renderMedia(url) {
  if (!url) return "";

  if (url.match(/\.(jpg|png|jpeg|gif)$/)) {
    return `<img src="${url}" />`;
  }

  if (url.match(/\.(mp4|webm)$/)) {
    return `<video controls src="${url}"></video>`;
  }

  if (url.match(/\.(mp3)$/)) {
    return `<audio controls src="${url}"></audio>`;
  }

  return "";
}

// ===============================
// LINK DETECTOR (FIXED)
// ===============================
function linkify(text) {
  return text.replace(
    /(https?:\/\/[^\s]+)/g,
    `<a href="$1" target="_blank">$1</a>`
  );
}

// ===============================
// LIKES (DB CONTROLLED)
// ===============================
async function likePost(id) {

  const already = localStorage.getItem("liked_" + id);

  if (already) return alert("Already liked");

  await db.from("likes").insert({ post_id: id });

  localStorage.setItem("liked_" + id, "1");

  loadPosts();
}

async function getLikes(id) {
  const { count } = await db
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", id);

  return count || 0;
}

// ===============================
// COMMENTS (COUNT ONLY HERE)
// ===============================
async function getCommentsCount(id) {
  const { count } = await db
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", id);

  return count || 0;
}

// ===============================
// SHARE (AD GATED)
// ===============================
function sharePost(id, title) {

  watchAd();

  setTimeout(() => {
    const url = `${window.location.origin}?post=${id}`;

    navigator.share?.({
      title,
      url
    }) || alert(url);

  }, 3000);
}

// ===============================
// DOWNLOAD
// ===============================
function downloadMedia(url) {
  if (!url) return;

  const a = document.createElement("a");
  a.href = url;
  a.download = "media";
  a.click();
}

// ===============================
// ADS (ADSTERRA INTEGRATION)
// ===============================
function watchAd() {
  const container = $("adContainer");
  container.innerHTML = "";

  const script = document.createElement("script");
  script.src = "https://pl29052599.profitablecpmratenetwork.com/24/cb/b7/24cbb72257475dcd544b0346aee1dd35.js";

  container.appendChild(script);

  openOverlay("adOverlay");

  setTimeout(() => {
    closeOverlay("adOverlay");
  }, 8000);
}

// ===============================
// SEARCH (FIXED)
// ===============================
function searchPosts() {

  const q = $("searchInput").value.toLowerCase();

  document.querySelectorAll(".post").forEach(p => {

    const text = p.innerText.toLowerCase();

    p.style.display = text.includes(q) ? "block" : "none";

  });

}

// ===============================
// COOKIES CONSENT
// ===============================
function checkCookies() {
  if (!localStorage.getItem("cookies")) {
    alert("This site uses cookies");
    localStorage.setItem("cookies", "accepted");
  }
}
