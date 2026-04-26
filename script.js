// ==========================
// SUPABASE INIT
// ==========================
const SUPABASE_URL = "https://fjiwrdecjftkflchjptr.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaXdyZGVjamZ0a2ZsY2hqcHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5Nzk0OTQsImV4cCI6MjA4ODU1NTQ5NH0.tXe06ol03x8M0FLfk55_Wj6A2Y3mNny5t028gqZzYoU";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

let admin = false;

// ==========================
// SAFE INIT GUARD (PREVENT UI BREAK)
// ==========================
window.onerror = function(e){
    console.log("JS Error caught:", e);
};

// ==========================
// SIDEBAR FIX (MAIN ISSUE FIXED)
// ==========================
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");

    if (!sidebar) {
        console.log("Sidebar not found");
        return;
    }

    sidebar.classList.toggle("open");
}

// close sidebar when clicking outside (optional but stable)
document.addEventListener("click", function(e){
    const sidebar = document.getElementById("sidebar");
    const menu = document.querySelector(".menu");

    if (!sidebar || !menu) return;

    if (
        sidebar.classList.contains("open") &&
        !sidebar.contains(e.target) &&
        !menu.contains(e.target)
    ) {
        sidebar.classList.remove("open");
    }
});

// ==========================
// OVERLAYS (SAFE)
// ==========================
function openOverlay(id){
    let el = document.getElementById(id);
    if(el) el.style.display = "flex";
}

function closeOverlay(id){
    let el = document.getElementById(id);
    if(el) el.style.display = "none";
}

// ==========================
// SIDEBAR BUTTON FUNCTIONS (ALL FIXED)
// ==========================
function openContact(){ openOverlay("contactOverlay"); }
function openAbout(){ openOverlay("aboutOverlay"); }
function openPrivacy(){ openOverlay("privacyOverlay"); }
function openTerms(){ openOverlay("termsOverlay"); }

// ==========================
// THEME
// ==========================
let dark = false;
function toggleTheme(){
    dark = !dark;
    document.body.style.background = dark ? "#111" : "#f2f2f2";
    document.body.style.color = dark ? "#fff" : "#000";
}

// ==========================
// LOADER (LOGIN / UPLOAD FEEDBACK)
// ==========================
function showLoader(text="Loading..."){
    let d = document.createElement("div");
    d.id = "loader";
    d.innerHTML = `
        <div class="spinner"></div>
        <p>${text}</p>
    `;
    document.body.appendChild(d);
}

function hideLoader(){
    let d = document.getElementById("loader");
    if(d) d.remove();
}

// ==========================
// ADMIN LOGIN (SAFE)
// ==========================
async function adminLogin(){
    showLoader("Please wait...");

    try{
        let email = document.getElementById("adminEmail").value;
        let pass = document.getElementById("adminPass").value;

        const { error } = await db.auth.signInWithPassword({
            email,
            password: pass
        });

        if(error) throw error;

        admin = true;
        closeOverlay("adminLogin");
        openOverlay("adminPanel");

        alert("Login successful");
    }catch(err){
        alert("Login failed: " + err.message);
    }

    hideLoader();
}

// ==========================
// ADMIN LOGOUT
// ==========================
async function adminLogout(){
    await db.auth.signOut();
    admin = false;
    closeOverlay("adminPanel");
    alert("Logged out");
}

// ==========================
// POSTS LOAD (SAFE)
// ==========================
async function loadPosts(){
    let { data } = await db.from("posts").select("*").order("id",{ascending:false});

    let container = document.getElementById("posts");
    if(!container) return;

    container.innerHTML = "";

    (data || []).forEach(p=>{
        let div = document.createElement("div");
        div.className = "post";

        div.innerHTML = `
            <h3>${p.title || ""}</h3>
            <p>${p.body || ""}</p>

            <div style="margin-top:10px;">
                ❤️ ${p.likes || 0}
            </div>

            <button onclick="likePost(${p.id})">Like</button>
            <button onclick="sharePost('${p.title}','${p.body}')">Share</button>
        `;

        container.appendChild(div);
    });
}

// ==========================
// LIKE SYSTEM
// ==========================
async function likePost(id){
    let { data } = await db.from("posts").select("likes").eq("id",id).single();

    await db.from("posts")
        .update({ likes: (data.likes || 0) + 1 })
        .eq("id",id);

    loadPosts();
}

// ==========================
// SHARE
// ==========================
function sharePost(title,body){
    if(navigator.share){
        navigator.share({
            title,
            text: body,
            url: location.href
        });
    }else{
        alert("Sharing not supported");
    }
}

// ==========================
// INIT (IMPORTANT FIX)
// ==========================
window.onload = function(){
    loadPosts();

    // safety check for sidebar
    let sb = document.getElementById("sidebar");
    if(sb) sb.classList.remove("open");
};
