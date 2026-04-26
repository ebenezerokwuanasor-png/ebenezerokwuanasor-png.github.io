// =====================
// SUPABASE INIT
// =====================
const SUPABASE_URL = "https://fjiwrdecjftkflchjptr.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaXdyZGVjamZ0a2ZsY2hqcHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzk0OTQsImV4cCI6MjA4ODU1NTQ5NH0.tXe06ol03x8M0FLfk55_Wj6A2Y3mNny5t028gqZzYoU";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// =====================
// STATE
// =====================
let admin = false;
let darkTheme = false;

// fingerprint (simple cookie-based identity)
function getFingerprint() {
  let id = localStorage.getItem("fp");
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now();
    localStorage.setItem("fp", id);
  }
  return id;
}

// =====================
// INIT
// =====================
window.onload = () => {
  loadPosts();
  setupRealtime();
  loadFavicon();
};

// =====================
// SIDEBAR FIX (IMPORTANT)
// =====================
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

function adminClick() {
  if (admin) {
    document.getElementById("adminPanel").style.display = "flex";
  } else {
    document.getElementById("adminLogin").style.display = "flex";
  }
}

function openContact() {
  document.getElementById("contactOverlay").style.display = "flex";
}

function openAbout() {
  document.getElementById("aboutOverlay").style.display = "flex";
}

function openPrivacy() {
  document.getElementById("privacyOverlay").style.display = "flex";
}

function openTerms() {
  document.getElementById("termsOverlay").style.display = "flex";
}

// =====================
// THEME FIX (DIM NOT BLACK)
// =====================
function toggleTheme() {
  darkTheme = !darkTheme;
  document.body.style.background = darkTheme ? "#dcdcdc" : "#f2f2f2";
  document.body.style.color = darkTheme ? "#111" : "#000";
}

// =====================
// OVERLAYS FIX
// =====================
function closeOverlay(id) {
  document.getElementById(id).style.display = "none";
}

// =====================
// ADMIN LOGIN (SUPABASE ONLY)
// =====================
async function adminLogin() {
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPass").value;

  const { error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) return alert("❌ " + error.message);

  admin = true;
  closeOverlay("adminLogin");
  document.getElementById("adminPanel").style.display = "flex";
  alert("✅ Admin logged in");
}

async function adminLogout() {
  await db.auth.signOut();
  admin = false;
  closeOverlay("adminPanel");
}

// =====================
// POSTS LOADING (FIXED MEDIA)
// =====================
async function loadPosts() {
  const { data } = await db
    .from("posts")
    .select("*")
    .order("id", { ascending: false });

  const container = document.getElementById("posts");
  container.innerHTML = "";

  data.forEach(post => {
    renderPost(post);
  });
}

// =====================
// POST RENDER
// =====================
async function renderPost(p) {
  const container = document.getElementById("posts");

  // get likes
  const { count: likes } = await db
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", p.id);

  // get comments
  const { count: comments } = await db
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", p.id);

  let media = "";
  if (p.media) {
    if (p.media.match(/\.(mp4|webm)$/)) {
      media = `<video controls src="${p.media}"></video>`;
    } else if (p.media.match(/\.(mp3|wav)$/)) {
      media = `<audio controls src="${p.media}"></audio>`;
    } else {
      media = `<img src="${p.media}">`;
    }
  }

  const div = document.createElement("div");
  div.className = "post";

  div.innerHTML = `
    <h3>${p.title}</h3>
    <p>${p.body}</p>

    ${media}

    <div style="margin-top:10px">
      ❤️ ${likes || 0}
      💬 ${comments || 0}
    </div>

    <button onclick="likePost(${p.id})">❤️ Like</button>
    <button onclick="openComments(${p.id})">💬 Comments</button>
    <button onclick="sharePost(${p.id})">🔗 Share</button>
    <button onclick="downloadMedia('${p.media}')">⬇️ Download</button>

    <div>ID: ${p.id}</div>
  `;

  container.appendChild(div);
}

// =====================
// LIKE SYSTEM (1 PER DEVICE)
// =====================
async function likePost(postId) {
  const fp = getFingerprint();

  await db.from("likes").insert({
    post_id: postId,
    user_fingerprint: fp
  });

  loadPosts();
}

// =====================
// COMMENTS SYSTEM
// =====================
async function openComments(postId) {
  const name = prompt("Your name:");
  const comment = prompt("Write comment:");

  if (!name || !comment) return;

  await db.from("comments").insert({
    post_id: postId,
    name,
    comment
  });

  loadPosts();
}

// =====================
// SHARE (WITH AD GATE)
// =====================
function sharePost(postId) {
  showAd(() => {
    const url = window.location.href + "?post=" + postId;

    if (navigator.share) {
      navigator.share({ title: "Post", url });
    } else {
      alert(url);
    }
  });
}

// =====================
// ADS SYSTEM (FIXED)
// =====================
function showAd(callback) {
  const box = document.getElementById("adOverlay");
  box.style.display = "flex";

  let script = document.createElement("script");
  script.src = "https://pl29052599.profitablecpmratenetwork.com/24/cb/b7/24cbb72257475dcd544b0346aee1dd35.js";
  document.getElementById("adContainer").appendChild(script);

  setTimeout(() => {
    box.style.display = "none";
    document.getElementById("adContainer").innerHTML = "";
    callback();
  }, 6000);
}

// =====================
// SEARCH FIX
// =====================
function searchPosts() {
  const q = document.getElementById("searchInput").value.toLowerCase();

  document.querySelectorAll(".post").forEach(p => {
    p.style.display = p.innerText.toLowerCase().includes(q)
      ? "block"
      : "none";
  });
}

// =====================
// VIEW TRACKING (AD REVENUE LOGIC)
// =====================
async function trackView(postId) {
  await db.from("views").insert({
    post_id: postId,
    user_fingerprint: getFingerprint()
  });
}

// =====================
// DOWNLOAD MEDIA
// =====================
function downloadMedia(url) {
  if (!url) return alert("No media");
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  a.click();
}

// =====================
// REALTIME FIX
// =====================
function setupRealtime() {
  db.channel("posts-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, loadPosts)
    .subscribe();

  db.channel("comments-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, loadPosts)
    .subscribe();

  db.channel("likes-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, loadPosts)
    .subscribe();
}

async function changeFavicon() {
  if (!admin) return alert("Admin only!");

  let input = document.createElement("input");
  input.type = "file";
  input.accept = "image/png";

  input.onchange = async () => {
    let file = input.files[0];
    if (!file) return;

    let img = new Image();

    img.onload = async () => {
      if (img.width !== 128 || img.height !== 128) {
        alert("❌ Favicon must be 128x128");
        return;
      }

      const { error } = await db.storage
        .from("favicon")
        .upload("favicon.png", file, { upsert: true });

      if (error) {
        alert("❌ Upload failed");
        return;
      }

      const { data } = db.storage.from("favicon")
        .getPublicUrl("favicon.png");

      document.getElementById("faviconTag").href = data.publicUrl;
      document.querySelector("#sidebar img").src = data.publicUrl;

      alert("✅ Favicon updated!");
    };

    img.src = URL.createObjectURL(file);
  };

  input.click();
}
// =====================
// FAVICON FIX
// =====================
async function loadFavicon() {
  const { data } = await db.storage.from("favicon").download("favicon.png");
  if (data) {
    const url = URL.createObjectURL(data);
    document.getElementById("faviconTag").href = url;
  }
}
