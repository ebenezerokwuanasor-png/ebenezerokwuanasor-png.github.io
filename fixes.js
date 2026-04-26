// ==========================
// GLOBAL INIT (SAFE)
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  bindAllButtons();
  fixCloseButtons();
  fixPasswordEye();
});

// ==========================
// 🔄 LOADER (MANUAL ONLY)
// ==========================
window.showLoader = function(text="Please wait..."){
  let el = document.getElementById("loaderOverlay");
  let txt = document.getElementById("loaderText");

  if(el){
    txt.innerText = text;
    el.style.display = "flex";
  }
};

window.hideLoader = function(){
  let el = document.getElementById("loaderOverlay");
  if(el) el.style.display = "none";
};

// ==========================
// ✅ SUCCESS / ERROR ANIMATION
// ==========================
window.toast = function(msg, success=true){
  let box = document.getElementById("successToast");
  if(!box) return;

  box.querySelector(".toastBox").innerText =
    (success ? "✅ " : "❌ ") + msg;

  box.style.display = "block";

  setTimeout(()=> box.style.display="none", 2500);
};

// ==========================
// 🔘 FIX ALL BUTTONS
// ==========================
function bindAllButtons(){

  document.querySelectorAll(".sidebar button").forEach(btn => {

    let t = btn.innerText.toLowerCase();

    btn.onclick = () => {

      if(t.includes("admin")){
        if(window.admin){
          document.getElementById("adminPanel").style.display = "flex";
        }else{
          document.getElementById("adminLogin").style.display = "flex";
        }
      }

      if(t.includes("contact"))
        document.getElementById("contactOverlay").style.display = "flex";

      if(t.includes("about"))
        document.getElementById("aboutOverlay").style.display = "flex";

      if(t.includes("privacy"))
        document.getElementById("privacyOverlay").style.display = "flex";

      if(t.includes("terms"))
        document.getElementById("termsOverlay").style.display = "flex";

      if(t.includes("watch"))
        watchAds();
    };

  });

  // search fix
  let searchBtn = document.querySelector(".search-bar button");
  if(searchBtn){
    searchBtn.onclick = () => searchPosts();
  }
}

// ==========================
// ❌ CLOSE BUTTON FIX (CRITICAL)
// ==========================
function fixCloseButtons(){
  document.querySelectorAll(".closeBtn").forEach(btn => {
    btn.onclick = () => {
      let overlay = btn.closest(".overlay");
      if(overlay) overlay.style.display = "none";
    };
  });
}

// ==========================
// 👁 PASSWORD EYE FIX
// ==========================
function fixPasswordEye(){
  let pass = document.getElementById("adminPass");
  if(!pass) return;

  let btn = pass.parentElement.querySelector("button");
  if(btn){
    btn.onclick = () => {
      pass.type = pass.type === "password" ? "text" : "password";
    };
  }
}

// ==========================
// 🔐 ADMIN LOGIN (FIXED)
// ==========================
window.adminLogin = async function(){

  showLoader("Logging in...");

  try{

    let email = document.getElementById("adminEmail").value;
    let pass = document.getElementById("adminPass").value;

    const { error } = await db.auth.signInWithPassword({
      email,
      password: pass
    });

    if(error) throw error;

    window.admin = true;

    hideLoader();
    toast("Login successful", true);

    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("adminPanel").style.display = "flex";

  }catch(e){

    hideLoader();
    toast("Login failed", false);

  }
};

// ==========================
// 🚪 LOGOUT FIX
// ==========================
window.adminLogout = async function(){

  showLoader("Logging out...");

  await db.auth.signOut();

  window.admin = false;

  hideLoader();
  toast("Logged out", true);

  document.getElementById("adminPanel").style.display = "none";
};

// ==========================
// 📝 PUBLISH POST FIX
// ==========================
window.createPost = async function(){

  if(!window.admin) return toast("Admin only", false);

  showLoader("Publishing post...");

  try{

    let title = document.getElementById("postTitle").value;
    let body = document.getElementById("postBody").value;

    let file = document.getElementById("mediaFile").files[0];
    let url = document.getElementById("mediaURL").value;

    let media = file ? await uploadFile(file) : url;

    await db.from("posts").insert({
      title,
      body,
      media,
      date: Date.now()
    });

    hideLoader();
    toast("Post published", true);

    loadPosts();

  }catch(e){
    hideLoader();
    toast("Publish failed", false);
  }
};

// ==========================
// 🗑 DELETE POST FIX
// ==========================
window.deletePost = async function(){

  if(!window.admin) return toast("Admin only", false);

  let id = prompt("Post ID");
  if(!id) return;

  showLoader("Deleting post...");

  await db.from("posts").delete().eq("id", id);

  hideLoader();
  toast("Post deleted", true);

  loadPosts();
};

// ==========================
// 🖼 FAVICON FIX (ADMIN ONLY WORKING)
// ==========================
window.changeFavicon = async function(){

  if(!window.admin){
    toast("Admin only", false);
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
        toast("Must be 128x128", false);
        return;
      }

      showLoader("Uploading favicon...");

      const { error } = await db.storage
        .from("favicon")
        .upload("favicon.png", file, { upsert: true });

      if(error){
        hideLoader();
        toast("Upload failed", false);
        return;
      }

      let url = SUPABASE_URL + "/storage/v1/object/public/favicon/favicon.png";

      document.getElementById("faviconTag").href = url;
      document.getElementById("sidebarFavicon").src = url;

      hideLoader();
      toast("Favicon updated", true);

    };

    img.src = URL.createObjectURL(file);
  };

  input.click();
};

// ==========================
// 📢 ADS (SAFE)
// ==========================
window.watchAds = function(){

  let o = document.getElementById("adOverlay");
  let c = document.getElementById("adContainer");

  if(!o || !c) return;

  o.style.display = "flex";
  c.innerHTML = "";

  let s = document.createElement("script");
  s.src = "https://pl29052599.profitablecpmratenetwork.com/24/cb/b7/24cbb72257475dcd544b0346aee1dd35.js";

  c.appendChild(s);

  setTimeout(()=>{
    o.style.display = "none";
    c.innerHTML = "";
  },8000);
};
