// =======================
// GLOBAL SAFE INIT
// =======================
window.addEventListener("DOMContentLoaded", () => {
  bindButtons();
  fixCloseButtons();
  fixPasswordToggle();
});

// =======================
// 🔥 FIX ALL SIDEBAR BUTTONS
// =======================
function bindButtons(){

  // ABOUT
  document.querySelectorAll("button").forEach(btn => {
    let text = btn.innerText.toLowerCase();

    if(text.includes("about")){
      btn.onclick = () => {
        document.getElementById("aboutOverlay").style.display = "flex";
      };
    }

    if(text.includes("privacy")){
      btn.onclick = () => {
        document.getElementById("privacyOverlay").style.display = "flex";
      };
    }

    if(text.includes("terms")){
      btn.onclick = () => {
        document.getElementById("termsOverlay").style.display = "flex";
      };
    }

    if(text.includes("contact")){
      btn.onclick = () => {
        document.getElementById("contactOverlay").style.display = "flex";
      };
    }

    if(text.includes("watch ads")){
      btn.onclick = () => watchAds();
    }

    if(text.includes("admin")){
      btn.onclick = () => {
        if(window.admin){
          document.getElementById("adminPanel").style.display = "flex";
        }else{
          document.getElementById("adminLogin").style.display = "flex";
        }
      };
    }

  });

}

// =======================
// 🔥 CLOSE BUTTON FIX
// =======================
function fixCloseButtons(){
  document.querySelectorAll(".closeBtn").forEach(btn => {
    btn.onclick = () => {
      let overlay = btn.closest(".overlay");
      if(overlay) overlay.style.display = "none";
    };
  });
}

// =======================
// 🔥 PASSWOTOGGfunctionX
// =======================
function fixPasswordToggle(){
  let pass = document.getElementById("adminPass");
  if(!pass) return;

  let btn = pass.parentElement.querySelector("button");

  if(btn){
    btn.onclick = () => {
      pass.type = pass.type === "password" ? "text" : "password";
    };
  }
}

// =======================
// 🔥 REAL ADSTERA FIX (PLAYS)
// =======================
function watchAds(){

  let overlay = document.getElementById("adOverlay");
  let box = document.getElementById("adContainer");

  if(!overlay || !box){
    alert("Ad container missing");
    return;
  }

  overlay.style.display = "flex";
  box.innerHTML = "";

  // inject your real ad
  let script = document.createElement("script");
  script.src = "https://pl29052599.profitablecpmratenetwork.com/24/cb/b7/24cbb72257475dcd544b0346aee1dd35.js";
  script.async = true;

  box.appendChild(script);

  // auto close
  setTimeout(() => {
    overlay.style.display = "none";
    box.innerHTML = "";
  }, 8000);
}

// =======================
// 🔥 TRIAL SYSTEM (FIXED)
// =======================
const MAX = 5;
const LOCK = 24 * 60 * 60 * 1000;

function trials(){
  return JSON.parse(localStorage.getItem("trial")) || {count:0,time:0};
}

function save(t){
  localStorage.setItem("trial", JSON.stringify(t));
}

function locked(){
  let t = trials();

  if(t.count >= MAX){
    let diff = Date.now() - t.time;

    if(diff < LOCK){
      alert("⛔ Locked for 24 hours");
      return true;
    }else{
      save({count:0,time:0});
    }
  }

  return false;
}

// =======================
// 🔥 LOGIN PATCH (REAL FIX)
// =======================
const originalLogin = window.adminLogin;

window.adminLogin = async function(){

  if(locked()) return;

  let email = document.getElementById("adminEmail").value;
  let pass = document.getElementById("adminPass").value;

  try{

    const { error } = await db.auth.signInWithPassword({
      email,
      password: pass
    });

    if(error) throw error;

    window.admin = true;

    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("adminPanel").style.display = "flex";

    save({count:0,time:0});

    alert("✅ Login successful");

  }catch(e){

    let t = trials();
    t.count++;
    t.time = Date.now();
    save(t);

    alert("❌ Wrong login ("+t.count+"/"+MAX+")");
  }

  // =======================
// 🔄 LOADER SYSTEM
// =======================
function showLoader(text="Please wait..."){
  let overlay = document.getElementById("loaderOverlay");
  let txt = document.getElementById("loaderText");

  if(overlay){
    txt.innerText = text;
    overlay.style.display = "flex";
  }
}

function hideLoader(){
  let overlay = document.getElementById("loaderOverlay");
  if(overlay) overlay.style.display = "none";
}

// =======================
// 🔐 FIX ADMIN STATE (IMPORTANT)
// =======================
supabase.auth.getSession().then(({data})=>{
  if(data.session){
    window.admin = true;
  }
});

// =======================
// 🔥 PATCH ADMIN LOGIN (WITH LOADER)
// =======================
window.adminLogin = async function(){

  if(typeof locked === "function" && locked()) return;

  showLoader("Checking login...");

  let email = document.getElementById("adminEmail").value;
  let pass = document.getElementById("adminPass").value;

  try{

    const { error } = await db.auth.signInWithPassword({
      email,
      password: pass
    });

    if(error) throw error;

    window.admin = true;

    hideLoader();

    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("adminPanel").style.display = "flex";

    alert("✅ Login successful");

    if(typeof save === "function"){
      save({count:0,time:0});
    }

  }catch(e){

    hideLoader();

    let t = (typeof trials === "function") ? trials() : {count:0,time:0};
    t.count++;
    t.time = Date.now();
    if(typeof save === "function") save(t);

    alert("❌ Wrong login ("+t.count+"/5)");
  }
};

// =======================
// 🔥 PATCH DELETE POST (WITH LOADER)
// =======================
const oldDelete = window.deletePost;

window.deletePost = async function(){

  if(!window.admin) return alert("Admin only!");

  let id = prompt("Enter Post ID");
  if(!id) return;

  showLoader("Deleting post...");

  try{
    await db.from("posts").delete().eq("id", id);

    hideLoader();
    alert("✅ Post deleted");

    if(typeof loadPosts === "function") loadPosts();

  }catch(e){
    hideLoader();
    alert("❌ Failed");
  }
};

// =======================
// 🔥 FIX FAVICON ADMIN BUG
// =======================
window.changeFavicon = async function(){

  if(!window.admin){
    alert("❌ Admin only!");
    return;
  }

  let input = document.createElement("input");
  input.type = "file";
  input.accept = "image/png";

  input.onchange = async () => {

    let file = input.files[0];
    if(!file) return;

    let img = new Image();

    img.onload = async () => {

      if(img.width !== 128 || img.height !== 128){
        alert("❌ Must be 128x128");
        return;
      }

      showLoader("Uploading favicon...");

      const { error } = await db.storage
        .from("favicon")
        .upload("favicon.png", file, { upsert:true });

      if(error){
        hideLoader();
        alert("❌ Upload failed");
        return;
      }

      let url = SUPABASE_URL + "/storage/v1/object/public/favicon/favicon.png";

      document.getElementById("faviconTag").href = url;
      document.getElementById("sidebarFavicon").src = url;

      hideLoader();
      alert("✅ Favicon updated");

    };

    img.src = URL.createObjectURL(file);
  };

  input.click();
}

  // =======================
// ✅ SUCCESS TOAST
// =======================
function showSuccess(msg="Success"){
  let toast = document.getElementById("successToast");
  let box = toast.querySelector(".toastBox");

  box.innerText = "✅ " + msg;
  toast.style.display = "block";

  setTimeout(()=>{
    toast.style.display = "none";
  },3000);
}

// =======================
// 🔥 PATCH CREATE POST (WITH LOADER + SUCCESS)
// =======================
const oldCreate = window.createPost;

window.createPost = async function(){

  if(!window.admin) return alert("Admin only!");

  let title = document.getElementById("postTitle").value;
  let body = document.getElementById("postBody").value;

  if(!title.trim() || !body.trim()){
    return alert("❌ Fill all fields");
  }

  showLoader("Publishing post...");

  try{

    let file = document.getElementById("mediaFile").files[0];
    let url = document.getElementById("mediaURL").value;

    let media = "";

    if(file){
      media = await uploadFile(file);
    }else if(url){
      media = url;
    }

    await db.from("posts").insert({
      title,
      body,
      media,
      created_at: new Date()
    });

    hideLoader();

    showSuccess("Post Published 🎉");

    // reload posts
    if(typeof loadPosts === "function") loadPosts();

    // clear inputs
    document.getElementById("postTitle").value = "";
    document.getElementById("postBody").value = "";
    document.getElementById("mediaFile").value = "";
    document.getElementById("mediaURL").value = "";

  }catch(e){
    hideLoader();
    alert("❌ Failed to publish");
  }
};
