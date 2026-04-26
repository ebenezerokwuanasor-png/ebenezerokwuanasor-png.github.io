// =======================
// SUPABASE INIT
// =======================
const SUPABASE_URL = "https://fjiwrdecjftkflchjptr.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaXdyZGVjamZ0a2ZsY2hqcHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzk0OTQsImV4cCI6MjA4ODU1NTQ5NH0.tXe06ol03x8M0FLfk55_Wj6A2Y3mNny5t028gqZzYoU";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// =======================
// GLOBAL STATE
// =======================
let admin = false;
let theme = false;
let cooldown = 0;

// =======================
// GLOBAL FIX (IMPORTANT)
// =======================
window.toggleSidebar = toggleSidebar;
window.adminClick = adminClick;
window.adminLogin = adminLogin;
window.adminLogout = adminLogout;
window.searchPosts = searchPosts;
window.toggleTheme = toggleTheme;
window.watchAds = watchAds;
window.likePost = likePost;
window.commentPost = commentPost;
window.sharePost = sharePost;

// =======================
// INIT
// =======================
window.onload = () => {
  loadPosts();
  setupRealtime();
  loadFavicon();
};

// =======================
// SAFE CLICK GUARD
// =======================
function guard() {
  const now = Date.now();
  if (now - cooldown < 800) return false;
  cooldown = now;
  return true;
}

// =======================
// SIDEBAR FIX
// =======================
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

// =======================
// THEME FIX (NO TEXT DISAPPEAR)
// =======================
function toggleTheme() {
  theme = !theme;

  document.body.style.background = theme ? "#d6d6d6" : "#f2f2f2";
  document.body.style.color = "#111";

  document.querySelectorAll(".post").forEach(p => {
    p.style.background = "#fff";
    p.style.color = "#111";
  });
}

// =======================
// ADMIN FIX
// =======================
function adminClick() {
  if (admin) {
    document.getElementById("adminPanel").style.display = "flex";
  } else {
    document.getElementById("adminLogin").style.display = "flex";
  }
}

// =======================
// ADMIN LOGIN (SUPABASE ONLY)
// =======================
async function adminLogin() {

  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPass").value;

  const { error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  admin = true;

  document.getElementById("adminLogin").style.display = "none";
  document.getElementById("adminPanel").style.display = "flex";

  alert("Login successful");
}

// =======================
// LOAD POSTS (FIXED RENDER PIPELINE)
// =======================
async function loadPosts() {

  const { data, error } = await db
    .from("posts")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.log(error);
    return;
  }

  const container = document.getElementById("posts");
  container.innerHTML = "";

  for (let p of data) {

    const { count: likeCount } = await db
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", p.id);

    const { count: commentCount } = await db
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", p.id);

    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      <h3>${p.title}</h3>
      <p>${p.body}</p>

      ${renderMedia(p.media)}

      <div>
        ❤️ ${likeCount || 0} |
        💬 ${commentCount || 0}
      </div>

      <button onclick="likePost(${p.id})">Like</button>
      <button onclick="commentPost(${p.id})">Comment</button>
      <button onclick="sharePost(${p.id})">Share</button>
      <button onclick="downloadMedia('${p.media}')">Download</button>

      <div style="font-size:12px;color:gray">ID: ${p.id}</div>
    `;

    container.appendChild(div);
  }
}

// =======================
// MEDIA FIX
// =======================
function renderMedia(url) {
  if (!url) return "";

  if (url.match(/\.(mp4|webm)$/i))
    return `<video controls src="${url}"></video>`;

  if (url.match(/\.(mp3|wav)$/i))
    return `<audio controls src="${url}"></audio>`;

  return `<img src="${url}">`;
}

// =======================
// LIKE SYSTEM (DB ENFORCED)
// =======================
async function likePost(id) {

  const user = localStorage.getItem("user") ||
               (localStorage.setItem("user", crypto.randomUUID()), localStorage.getItem("user"));

  const { data } = await db
    .from("likes")
    .select("*")
    .eq("post_id", id)
    .eq("fingerprint", user);

  if (data.length > 0) {
    alert("Already liked");
    return;
  }

  await db.from("likes").insert({
    post_id: id,
    fingerprint: user
  });

  loadPosts();
}


// =======================
// COMMENT SYSTEM
// =======================
async function commentPost(id) {

  const name = prompt("Your name:");
  const text = prompt("Your comment:");

  if (!name || !text) return;

  await db.from("comments").insert({
    post_id: id,
    name,
    comment: text
  });

  loadPosts();
}

// =======================
// SHARE (WITH AD GATE)
// =======================
function sharePost(id) {

  const url = window.location.origin + "?post=" + id;

  if (navigator.share) {
    navigator.share({ url });
  } else {
    prompt("Copy link:", url);
  }
}


// =======================
// ADS (NO REDIRECT SAFE)
// =======================
function watchAds(callback) {
  const overlay = document.getElementById("adOverlay");
  const box = document.getElementById("adContainer");

  overlay.style.display = "flex";
  box.innerHTML = "";

  const script = document.createElement("script");
  script.src = "https://pl29052599.profitablecpmratenetwork.com/24/cb/b7/24cbb72257475dcd544b0346aee1dd35.js";

  box.appendChild(script);

  setTimeout(() => {
    overlay.style.display = "none";
    callback?.();
  }, 7000);
}

// =======================
// SEARCH FIX
// =======================
function searchPosts() {

  const q = document.getElementById("searchInput").value.toLowerCase();

  document.querySelectorAll(".post").forEach(p => {
    p.style.display =
      p.innerText.toLowerCase().includes(q)
      ? "block"
      : "none";
  });
}

// ======================
// REALTIME FIX
// ======================
function setupRealtime() {

  db.channel("realtime-posts")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "posts" },
      () => loadPosts()
    )
    .subscribe();

  db.channel("realtime-likes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "likes" },
      () => loadPosts()
    )
    .subscribe();

  db.channel("realtime-comments")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "comments" },
      () => loadPosts()
    )
    .subscribe();
}

// =======================
// FAVICON FIX
// =======================
async function changeFavicon() {
  if (!admin) return alert("Admin only!");

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/png,image/jpeg,image/webp";

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    // size check (optional safety)
    if (file.size > 500000) {
      alert("❌ File too large (max 500KB)");
      return;
    }

    const fileName = "favicon_" + Date.now();

    const { error } = await db.storage
      .from("favicon")
      .upload(fileName, file, { upsert: true });

    if (error) {
      alert("❌ Upload failed: " + error.message);
      return;
    }

    // get public URL
    const { data } = db.storage.from("favicon").getPublicUrl(fileName);
    const url = data.publicUrl;

    // apply instantly
    document.getElementById("faviconTag").href = url;

    alert("✅ Favicon updated!");
  };

  input.click();
}

function downloadMedia(url) {
  if (!url) return alert("No media");

  const a = document.createElement("a");
  a.href = url;
  a.download = "download";
  a.click();
}
