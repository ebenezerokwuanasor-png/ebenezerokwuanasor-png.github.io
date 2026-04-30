console.log("SCRIPT LOADED ✅");

// =======================
// SUPABASE INIT
// =======================
const SUPABASE_URL = "https://fjiwrdecjftkflchjptr.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaXdyZGVjamZ0a2ZsY2hqcHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzk0OTQsImV4cCI6MjA4ODU1NTQ5NH0.tXe06ol03x8M0FLfk55_Wj6A2Y3mNny5t028gqZzYoU";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// =======================
// STATE
// =======================
let admin = false;
let theme = false;

// =======================
// WINDOW EXPORT FIX
// =======================
window.adminClick = adminClick;
window.adminLogin = adminLogin;
window.adminLogout = adminLogout;
window.searchPosts = searchPosts;
window.toggleTheme = toggleTheme;
window.watchAds = watchAds;

// =======================
// INIT
// =======================
window.onload = async () => {
  try {
    if (typeof loadPosts === "function") loadPosts();
    if (typeof setupRealtime === "function") setupRealtime();
    if (typeof loadFavicon === "function") loadFavicon();
  } catch (e) {
    console.log("Init error:", e);
  }
};

// =======================
// UI FIX
// =======================

// =======================
// SIDEBAR FIX (100% SAFE)
// =======================
window.toggleSidebar = function () {
  const sidebar = document.getElementById("sidebar");

  if (!sidebar) {
    console.log("Sidebar element not found");
    return;
  }

  sidebar.classList.toggle("open");
};

function closeOverlay(id){
  document.getElementById(id).style.display="none";
}

function togglePassword(){
  const p = document.getElementById("adminPass");
  p.type = p.type === "password" ? "text" : "password";
}

// =======================
// OVERLAYS
// =======================
function openAbout(){ aboutOverlay.style.display="flex"; }
function openPrivacy(){ privacyOverlay.style.display="flex"; }
function openTerms(){ termsOverlay.style.display="flex"; }
function openContact(){ contactOverlay.style.display="flex"; }

// =======================
// ADMIN
// =======================
function adminClick() {
  const login = document.getElementById("adminLogin");
  const panel = document.getElementById("adminPanel");

  if (!login || !panel) {
    alert("Admin UI missing");
    return;
  }

  if (admin) {
    panel.style.display = "flex";
  } else {
    login.style.display = "flex";
  }
}

//  ================
// POSTS
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
  if (!container) return;

  container.innerHTML = "";

  data.forEach(p => {
    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      <h3>${p.title || ""}</h3>
      <p>${p.body || ""}</p>

      ${renderMedia(p.media)}

      <div class="actions">
        <span onclick="likePost(${p.id})">❤️ Like</span>
        <span onclick="commentPost(${p.id})">💬 Comment</span>
        <span onclick="sharePost(${p.id})">🔗 Share</span>
        <span onclick="downloadMedia('${p.media || ""}')">⬇ Download</span>
      </div>

      <div style="font-size:12px;color:gray;">ID: ${p.id}</div>
    `;

    container.appendChild(div);
  });
}

// =======================
// MEDIA
// =======================
function renderMedia(url){
  if(!url) return "";

  if(url.match(/\.(mp4|webm)$/)) return `<video controls src="${url}"></video>`;
  if(url.match(/\.(mp3|wav)$/)) return `<audio controls src="${url}"></audio>`;

  return `<img src="${url}">`;
}

// =======================
// CREATE POST
// =======================

async function createPost(){

  showRoller("Publishing post...");

  const title = postTitle.value;
  const body = postBody.value;

  const { error } = await db.from("posts").insert({
    title,
    body,
    media: mediaURL.value
  });

  if(error){
    hideRoller(false);
    return alert(error.message);
  }

  loadPosts();
  hideRoller(true);
}
  =======================
// DELETE POST
// =======================

  async function deletePost(){

  const id = prompt("Post ID");
  if(!id) return;

  showRoller("Deleting post...");

  const { error } = await db.from("posts").delete().eq("id", id);

  if(error){
    hideRoller(false);
    return alert(error.message);
  }

  loadPosts();
  hideRoller(true);
}

// =======================
// SEARCH
// =======================
function searchPosts(){
  let q = searchInput.value.toLowerCase();

  document.querySelectorAll(".post").forEach(p=>{
    p.style.display =
      p.innerText.toLowerCase().includes(q)
      ? "block":"none";
  });
}

// =======================
// ADS
// =======================
function watchAds(){
  adOverlay.style.display="flex";

  const script = document.createElement("script");
  script.src="https://pl29052599.profitablecpmratenetwork.com/24/cb/b7/24cbb72257475dcd544b0346aee1dd35.js";

  adContainer.innerHTML="";
  adContainer.appendChild(script);

  setTimeout(()=>{
    adOverlay.style.display="none";
  },7000);
}

// =======================
// THEME
// =======================
function toggleTheme(){
  theme=!theme;
  document.body.style.background = theme ? "#ddd":"#f2f2f2";
  document.body.style.color="#111";
}

// =======================
// REALTIME
// =======================
function setupRealtime(){
  db.channel("posts")
    .on("postgres_changes",
      {event:"*",schema:"public",table:"posts"},
      loadPosts
    )
    .subscribe();
}

// =======================
// LOGOUT
// =======================
async function adminLogout(){

  showRoller("Logging out...");

  await db.auth.signOut();

  admin=false;
  document.getElementById("adminPanel").style.display="none";

  hideRoller(true);
}

async function changeFavicon(){

  if(!admin) return alert("Admin only!");

  const input = document.createElement("input");
  input.type="file";

  input.onchange = async ()=>{

    showRoller("Uploading favicon...");

    const file = input.files[0];

    const { error } = await db.storage
      .from("favicon")
      .upload("favicon.png", file, { upsert:true });

    if(error){
      hideRoller(false);
      return alert(error.message);
    }

    hideRoller(true);
  };

  input.click();
}
