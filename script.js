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
window.toggleSidebar = toggleSidebar;
window.adminClick = adminClick;
window.adminLogin = adminLogin;
window.adminLogout = adminLogout;
window.searchPosts = searchPosts;
window.toggleTheme = toggleTheme;
window.watchAds = watchAds;

// =======================
// INIT
// =======================
window.onload = () => {
  loadPosts();
  setupRealtime();
};

// =======================
// UI FIX
// =======================
function toggleSidebar(){
  document.getElementById("sidebar").classList.toggle("open");
}

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
function adminClick(){
  adminLogin.style.display="flex";
}

// =======================
// LOGIN
// =======================
async function adminLogin(){
  const email = adminEmail.value;
  const password = adminPass.value;

  const { error } = await db.auth.signInWithPassword({
    email, password
  });

  if(error){
    alert(error.message);
    return;
  }

  admin = true;
  adminLogin.style.display="none";
  adminPanel.style.display="flex";
}

// =======================
// POSTS
// =======================
async function loadPosts(){

  const { data } = await db
    .from("posts")
    .select("*")
    .order("id",{ascending:false});

  const container = document.getElementById("posts");
  container.innerHTML = "";

  if(!data) return;

  data.forEach(p=>{

    const div = document.createElement("div");
    div.className="post";

    div.innerHTML=`
      <h3>${p.title}</h3>
      <p>${p.body}</p>
      ${renderMedia(p.media || "")}
      <div>ID: ${p.id}</div>
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

  const title = postTitle.value;
  const body = postBody.value;

  let file = mediaFile.files[0];
  let media = mediaURL.value;

  await db.from("posts").insert({
    title,
    body,
    media
  });

  loadPosts();
  alert("Posted successfully");
}

// =======================
// DELETE POST
// =======================
async function deletePost(){
  let id = prompt("Post ID");
  if(!id) return;

  await db.from("posts").delete().eq("id",id);
  loadPosts();
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
  await db.auth.signOut();
  admin=false;
  adminPanel.style.display="none";
}
