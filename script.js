// =========================
// SUPABASE AUTH & URL CONFIG
// =========================
const SUPABASE_URL = "https://fjiwrdecjftkflchjptr.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaXdyZGVjamZ0a2ZsY2hqcHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzk0OTQsImV4cCI6MjA4ODU1NTQ5NH0.tXe06ol03x8M0FLfk55_Wj6A2Y3mNny5t028gqZzYoU";  // Replace with your actual anon key

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// =========================
// GLOBAL STATE
// =========================
let admin = false;
let darkMode = false;
let currentUser = null;

// =========================
// SIDEBAR FUNCTIONALITY
// =========================
function toggleSidebar(){
    document.getElementById("sidebar").classList.toggle("open");
}

// =========================
// OVERLAY HANDLERS (ADMIN, MODAL, ETC)
// =========================
function openOverlay(id){
    document.getElementById(id).style.display = "flex";
}

function closeOverlay(id){
    document.getElementById(id).style.display = "none";
}

// =========================
// THEME TOGGLE (SOFT DIM MODE)
// =========================
function toggleTheme(){
    darkMode = !darkMode;
    document.body.style.background = darkMode ? "#1a1a1a" : "#f2f2f2";
    document.body.style.color = darkMode ? "#f5f5f5" : "#111";
    document.querySelectorAll(".post").forEach(post => {
        post.style.background = darkMode ? "#2a2a2a" : "#fff";
    });
}

// =========================
// LINK DETECTOR (TO MAKE LINKS CLICKABLE)
// =========================
function detectLinks(text){
    return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
               .replace(/(www\.[^\s]+)/g, '<a href="https://$1" target="_blank">$1</a>');
}

// =========================
// STORAGE BUCKET (IMAGE, VIDEO, AUDIO, FAVICON)
// =========================
const MEDIA_BUCKETS = Array.from({length: 200}, (_, i) => `media${i+1}`);
const FAVICON_BUCKET = "favicon";

// File upload to Supabase
async function uploadFile(file) {
    if (!file) return "";
    for (let bucket of MEDIA_BUCKETS) {
        try {
            let name = Date.now() + "_" + file.name;
            const { error } = await db.storage.from(bucket).upload(name, file);
            if (!error) {
                return SUPABASE_URL + "/storage/v1/object/public/" + bucket + "/" + name;
            }
        } catch (e) {
            continue;
        }
    }
    return "";
}

// =========================
// POST RENDERING (MEDIA + COMMENTS + LIKES)
// =========================
async function loadPosts() {
    const { data } = await db.from("posts").select("*").order("id", { ascending: false });

    let container = document.getElementById("posts");
    container.innerHTML = "";

    (data || []).forEach(p => {
        let postDiv = document.createElement("div");
        postDiv.className = "post";

        postDiv.innerHTML = `
            <h3>${p.title}</h3>
            <p>${detectLinks(p.body)}</p>
            ${renderMedia(p.media)}
            <div>Post ID: ${p.id}</div>
            <div>❤️ ${p.likes || 0} <button onclick="likePost(${p.id})">Like</button></div>
            <div><button onclick="openComments(${p.id})">Comments</button></div>
            <button onclick="sharePost('${p.title}', '${p.body}')">Share</button>
        `;

        container.appendChild(postDiv);
    });
}

// =========================
// LIKE POST (1 PER USER)
// =========================
async function likePost(postId) {
    let hasLiked = localStorage.getItem(`liked_${postId}`);
    if (hasLiked) return alert("You've already liked this post.");

    const { data } = await db.from("posts").select("likes").eq("id", postId).single();

    await db.from("posts").update({ likes: (data.likes || 0) + 1 }).eq("id", postId);

    localStorage.setItem(`liked_${postId}`, "true");
    loadPosts();
}

// =========================
// COMMENT SYSTEM (STORED IN DB)
// =========================
async function openComments(postId) {
    let name = prompt("Your name:");
    let comment = prompt("Your comment:");
    
    if (!name || !comment) return;

    await db.from("comments").insert({
        post_id: postId,
        name,
        text: comment
    });

    alert("Comment added successfully!");
    loadPosts();
}

// =========================
// SHARE POST (WITH ADS)
// =========================
function sharePost(title, body) {
    watchAds();
    setTimeout(() => {
        if (navigator.share) {
            navigator.share({
                title: title,
                text: body,
                url: location.href
            });
        }
    }, 2000);
}

// =========================
// ADMIN LOGIN (WITH 5 TRIALS)
// =========================
async function adminLogin() {
    let email = document.getElementById("adminEmail").value;
    let pass = document.getElementById("adminPass").value;

    let trials = JSON.parse(localStorage.getItem("login_trials") || "0");

    if (trials >= 5) {
        alert("🔒 You are locked out. Try again in 24 hours.");
        return;
    }

    const { error } = await db.auth.signInWithPassword({ email, password: pass });

    if (error) {
        trials++;
        localStorage.setItem("login_trials", JSON.stringify(trials));
        alert(`❌ Incorrect credentials. Attempts: ${trials}/5`);
        return;
    }

    admin = true;
    localStorage.removeItem("login_trials");
    alert("✅ Admin login successful!");
    closeOverlay("adminLogin");
    openOverlay("adminPanel");
}

// =========================
// CREATE POST (ADMIN ONLY)
// =========================
async function createPost() {
    let title = document.getElementById("postTitle").value;
    let body = document.getElementById("postBody").value;
    body = detectLinks(body);  // Detect links in the body

    let file = document.getElementById("mediaFile").files[0];
    let media = await uploadFile(file);

    await db.from("posts").insert({ title, body, media, likes: 0 });
    loadPosts();
    alert("✅ Post created successfully!");
}

// =========================
// FAVICON UPDATE (ADMIN ONLY)
// =========================
async function changeFavicon() {
    let input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png";

    input.onchange = async () => {
        let file = input.files[0];

        let img = new Image();
        img.onload = async () => {
            if (img.width !== 128 || img.height !== 128) {
                alert("❌ Favicon must be 128x128!");
                return;
            }

            await db.storage.from("favicon").upload("favicon.png", file, { upsert: true });
            alert("✅ Favicon updated!");
        };
        img.src = URL.createObjectURL(file);
    };

    input.click();
}

// =========================
// INIT PAGE (LOAD POSTS ON START)
// =========================
window.onload = () => {
    loadPosts();
};
