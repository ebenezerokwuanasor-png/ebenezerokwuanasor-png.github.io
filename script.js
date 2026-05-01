 console.log("SCRIPT FIXED ✅");

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
// INIT
// =======================
window.onload = async () => {

  // restore session
  if(localStorage.getItem("admin")==="true"){
    admin = true;
  }

  loadPosts();
  setupRealtime();
};

// =======================
// SIDEBAR
// =======================
window.toggleSidebar = function(){
  document.getElementById("sidebar").classList.toggle("open");
};

// =======================
// ADMIN CLICK
// =======================
window.adminClick = function(){
  if(admin){
    openOverlay("adminPanel");
  }else{
    openOverlay("adminLogin");
  }
};

// =======================
// LOGIN (FINAL)
// =======================
window.adminLogin = async function(){

  const email = adminEmail.value.trim();
  const password = adminPass.value.trim();

  if(!email || !password){
    errorRoller("Fill all fields");
    return;
  }

  showRoller("Logging in...");

  const { data, error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if(error){
    errorRoller("Wrong login");
    adminPass.value="";
    return;
  }

  if(!data.session){
    errorRoller("Login failed");
    return;
  }

  // SUCCESS
  admin = true;
  localStorage.setItem("admin","true");

  document.getElementById("adminLogin").style.display="none";
  document.getElementById("adminPanel").style.display="flex";

  successRoller("Welcome Admin");

  adminEmail.value="";
  adminPass.value="";
};

// =======================
// LOGOUT
// =======================
window.adminLogout = async function(){

  showRoller("Logging out...");

  await db.auth.signOut();

  admin = false;
  localStorage.removeItem("admin");

  adminPanel.style.display="none";

  successRoller("Logged out");
};

// =======================
// POSTS
// =======================
async function loadPosts(){

  const { data } = await db
    .from("posts")
    .select("*")
    .order("id",{ascending:false});

  const container = document.getElementById("posts");
  container.innerHTML="";

  if(!data) return;

  data.forEach(p=>{
    const div = document.createElement("div");
    div.className="post";

    div.innerHTML=`
      <h3>${p.title}</h3>
      <p>${p.body}</p>
      ${renderMedia(p.media)}
    `;

    container.appendChild(div);
  });
  <div style="font-size:12px;color:gray;">Post ID: ${p.id}</div>
}

// =======================
// CREATE POST
// =======================
window.createPost = async function(){

  if(!admin) return errorRoller("Admin only");

  const title = postTitle.value.trim();
  const body = postBody.value.trim();
  const file = mediaFile.files[0];
  const url = mediaURL.value.trim();

  if(!title || !body){
    return errorRoller("Title & body required");
  }

  showRoller("Publishing post...");

  let media = url;

  try {

    // ✅ FILE UPLOAD (if selected)
    if(file){
      updateRoller("Uploading media...");

      const fileName = Date.now() + "_" + file.name;

      const { error: uploadError } = await db.storage
        .from("posts")
        .upload(fileName, file);

      if(uploadError) throw uploadError;

      const res = db.storage.from("posts").getPublicUrl(fileName);
      media = res.data.publicUrl;
    }

    // ✅ SAVE POST
    updateRoller("Saving post...");

    const id = "POST_" + Math.random().toString(36).substring(2,10);

    const { error } = await db.from("posts").insert({
      id,
      title,
      body,
      media
    });

    if(error) throw error;

    successRoller("Post published");

    // clear inputs
    postTitle.value="";
    postBody.value="";
    mediaFile.value="";
    mediaURL.value="";

    loadPosts();

  } catch(e){
    console.log(e);
    errorRoller("Post failed");
  }
};

// =======================
// DELETE POST
// =======================
window.deletePost = async function(){

  if(!admin) return errorRoller("Admin only");

  const id = prompt("Enter Post ID");
  if(!id) return;

  showRoller("Deleting post...");

  const { error } = await db.from("posts").delete().eq("id", id);

  if(error){
    return errorRoller("Delete failed");
  }

  successRoller("Post deleted");
  loadPosts();
}; 

// =======================
// FAVICON
// =======================
window.changeFavicon = function(){

  if(!admin) return errorRoller("Admin only");

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/png";

  input.onchange = async ()=>{

    const file = input.files[0];
    if(!file) return;

    const img = new Image();

    img.onload = async ()=>{

      // ✅ SIZE CHECK
      if(img.width !== 128 || img.height !== 128){
        return errorRoller("Image must be 128x128");
      }

      showRoller("Uploading favicon...");

      const { error } = await db.storage
        .from("favicon")
        .upload("favicon.png", file, { upsert:true });

      if(error){
        return errorRoller("Upload failed");
      }

      // ✅ UPDATE UI
      const url = SUPABASE_URL + "/storage/v1/object/public/favicon/favicon.png";

      document.getElementById("faviconTag").href = url;
      document.getElementById("sidebarFavicon").src = url;

      successRoller("Favicon updated");
    };

    img.src = URL.createObjectURL(file);
  };

  input.click();
};

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
// SEARCH
// =======================
window.searchPosts = function(){
  let q = searchInput.value.toLowerCase();
  document.querySelectorAll(".post").forEach(p=>{
    p.style.display = p.innerText.toLowerCase().includes(q) ? "block":"none";
  });
};

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
