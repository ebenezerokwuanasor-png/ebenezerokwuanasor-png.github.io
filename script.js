// ==============================
// SUPABASE INIT (UNCHANGED)
// ==============================
const SUPABASE_URL = "https://fjiwrdecjftkflchjptr.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaXdyZGVjamZ0a2ZsY2hqcHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzk0OTQsImV4cCI6MjA4ODU1NTQ5NH0.tXe06ol03x8MFLfk55_Wj6A2Y3mNny5t028gqZzYoU";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

let admin = false;

// ==============================
// LOADER (SPINNER)
// ==============================
function showLoader(msg = "Please wait...") {
    let l = document.createElement("div");
    l.id = "loader";
    l.innerHTML = `<div class="spinner"></div><p>${msg}</p>`;
    document.body.appendChild(l);
}

function hideLoader() {
    let l = document.getElementById("loader");
    if (l) l.remove();
}

// ==============================
// SAFE ADS (REAL IMPRESSION)
// ==============================
function watchAds() {
    let overlay = document.getElementById("adOverlay");
    overlay.style.display = "flex";

    let container = document.getElementById("adContainer");
    container.innerHTML = "";

    let script = document.createElement("script");
    script.src = "https://pl29052599.profitablecpmratenetwork.com/24/cb/b7/24cbb72257475dcd544b0346aee1dd35.js";
    script.async = true;

    container.appendChild(script);

    setTimeout(() => {
        closeAds();
    }, 8000);
}

function closeAds() {
    document.getElementById("adOverlay").style.display = "none";
    document.getElementById("adContainer").innerHTML = "";
}

// ==============================
// COOKIES (for likes control)
// ==============================
function setCookie(name, value) {
    document.cookie = name + "=" + value + "; path=/";
}

function getCookie(name) {
    let v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}

// ==============================
// ADMIN LOGIN
// ==============================
async function adminLogin() {
    showLoader("Logging in...");

    try {
        let email = document.getElementById("adminEmail").value;
        let pass = document.getElementById("adminPass").value;

        const { error } = await db.auth.signInWithPassword({
            email,
            password: pass
        });

        if (error) throw error;

        admin = true;
        alert("✅ Login successful");

    } catch (e) {
        alert("❌ " + e.message);
    }

    hideLoader();
}

// ==============================
// CREATE POST
// ==============================
async function createPost() {
    showLoader("Publishing...");

    const { data: user } = await db.auth.getUser();

    if (!user || !user.user) {
        hideLoader();
        return alert("❌ Not authorized");
    }

    let title = document.getElementById("postTitle").value;
    let body = detectLinks(document.getElementById("postBody").value);

    await db.from("posts").insert({
        title,
        body,
        likes: 0,
        user_id: user.user.id
    });

    hideLoader();
    loadPosts();
}

// ==============================
// DELETE POST
// ==============================
async function deletePost() {
    let id = prompt("Post ID");

    showLoader("Deleting...");

    await db.from("posts").delete().eq("id", id);

    hideLoader();
    loadPosts();
}

// ==============================
// LIKE SYSTEM
// ==============================
async function likePost(id) {

    if (getCookie("liked_" + id)) {
        alert("Already liked");
        return;
    }

    let { data } = await db.from("posts").select("likes").eq("id", id).single();

    let newLikes = (data.likes || 0) + 1;

    await db.from("posts").update({ likes: newLikes }).eq("id", id);

    setCookie("liked_" + id, "1");

    loadPosts();
}

// ==============================
// COMMENTS SYSTEM
// ==============================
async function addComment(postId) {

    let name = prompt("Your name");
    let text = prompt("Your comment");

    if (!name || !text) return;

    await db.from("comments").insert({
        post_id: postId,
        name,
        text
    });

    loadComments(postId);
}

async function loadComments(postId) {

    let { data } = await db.from("comments")
        .select("*")
        .eq("post_id", postId);

    let box = document.getElementById("comments_" + postId);

    box.innerHTML = "";

    data.forEach(c => {
        box.innerHTML += `
        <div class="comment">
            <b>${c.name}</b>: ${c.text}
            <span onclick="deleteComment(${c.id})">🗑️</span>
        </div>`;
    });
}

async function deleteComment(id) {

    let confirmDelete = confirm("Delete comment?");
    if (!confirmDelete) return;

    await db.from("comments").delete().eq("id", id);

    loadPosts();
}

// ==============================
// SHARE (WITH ADS)
// ==============================
function shareWithAd(title, body) {

    watchAds();

    setTimeout(() => {
        if (navigator.share) {
            navigator.share({
                title,
                text: body,
                url: window.location.href
            });
        }
    }, 4000);
}

// ==============================
// LINK DETECTOR
// ==============================
function detectLinks(text) {
    return text.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank">$1</a>'
    );
}

// ==============================
// LOAD POSTS (FULL SYSTEM)
// ==============================
async function loadPosts() {

    let { data } = await db.from("posts").select("*").order("id", { ascending: false });

    let container = document.getElementById("posts");
    container.innerHTML = "";

    data.forEach(p => {

        let div = document.createElement("div");
        div.className = "post";

        div.innerHTML = `
        <h3>${p.title}</h3>
        <p>${p.body}</p>

        <div>
            ❤️ ${p.likes || 0}
            <button onclick="likePost(${p.id})">Like</button>

            💬 <button onclick="addComment(${p.id})">Comment</button>

            🔗 <button onclick="shareWithAd('${p.title}','${p.body}')">Share</button>
        </div>

        <div id="comments_${p.id}"></div>
        `;

        container.appendChild(div);

        loadComments(p.id);
    });
}

// ==============================
// INIT
// ==============================
window.onload = () => {
    loadPosts();
};
