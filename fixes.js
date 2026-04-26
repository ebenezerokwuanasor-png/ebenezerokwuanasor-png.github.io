// =======================
// SAFE INIT
// =======================
document.addEventListener("DOMContentLoaded", () => {
  bindUI();
});

// =======================
// LOADER
// =======================
function showLoader(text="Please wait..."){
  let o = document.getElementById("loaderOverlay");
  let t = document.getElementById("loaderText");
  if(o){
    t.innerText = text;
    o.style.display = "flex";
  }
}

function hideLoader(){
  let o = document.getElementById("loaderOverlay");
  if(o) o.style.display = "none";
}

// =======================
// SUCCESS TOAST
// =======================
function showSuccess(msg){
  let t = document.getElementById("successToast");
  if(!t) return;
  t.querySelector(".toastBox").innerText = "✅ " + msg;
  t.style.display = "block";
  setTimeout(()=> t.style.display="none",3000);
}

// =======================
// FIX BUTTONS (ALL)
// =======================
function bindUI(){

  // SIDEBAR BUTTONS
  document.querySelectorAll(".sidebar button").forEach(btn=>{
    let text = btn.innerText.toLowerCase();

    btn.onclick = () => {

      if(text.includes("admin")){
        if(window.admin){
          openOverlay("adminPanel");
        }else{
          openOverlay("adminLogin");
        }
      }

      if(text.includes("contact")) openOverlay("contactOverlay");
      if(text.includes("about")) openOverlay("aboutOverlay");
      if(text.includes("privacy")) openOverlay("privacyOverlay");
      if(text.includes("terms")) openOverlay("termsOverlay");

      if(text.includes("watch")) watchAds();
    };
  });

  // CLOSE BUTTONS
  document.querySelectorAll(".closeBtn").forEach(btn=>{
    btn.onclick = ()=> btn.closest(".overlay").style.display="none";
  });

  // PASSWORD TOGGLE
  let pass = document.getElementById("adminPass");
  if(pass){
    let eye = pass.parentElement.querySelector("button");
    if(eye){
      eye.onclick = ()=>{
        pass.type = pass.type==="password"?"text":"password";
      };
    }
  }

  // SEARCH FIX
  let searchBtn = document.querySelector(".search-bar button");
  if(searchBtn){
    searchBtn.onclick = ()=> searchPosts();
  }

}

// =======================
// OVERLAY HELPER
// =======================
function openOverlay(id){
  let el = document.getElementById(id);
  if(el) el.style.display = "flex";
}

// =======================
// ADMIN SESSION FIX
// =======================
supabase.auth.getSession().then(({data})=>{
  if(data.session){
    window.admin = true;
  }
});

// =======================
// LOGIN
// =======================
window.adminLogin = async function(){

  showLoader("Checking login...");

  try{
    let email = document.getElementById("adminEmail").value;
    let pass = document.getElementById("adminPass").value;

    const { error } = await db.auth.signInWithPassword({email,password:pass});
    if(error) throw error;

    window.admin = true;

    hideLoader();
    showSuccess("Login successful");

    openOverlay("adminPanel");
    document.getElementById("adminLogin").style.display="none";

  }catch(e){
    hideLoader();
    alert("❌ "+e.message);
  }
};

// =======================
// LOGOUT (FIXED)
// =======================
window.adminLogout = async function(){

  showLoader("Logging out...");

  await db.auth.signOut();

  window.admin = false;

  hideLoader();
  showSuccess("Logged out");

  document.getElementById("adminPanel").style.display="none";
};

// =======================
// PUBLISH POST (FIXED)
// =======================
window.createPost = async function(){

  if(!window.admin) return alert("Admin only");

  let title = document.getElementById("postTitle").value;
  let body = document.getElementById("postBody").value;

  if(!title || !body) return alert("Fill all fields");

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
      date: Date.now()
    });

    hideLoader();
    showSuccess("Post published");

    loadPosts();

  }catch(e){
    hideLoader();
    alert("❌ Failed");
  }
};

// =======================
// DELETE POST (FIXED)
// =======================
window.deletePost = async function(){

  if(!window.admin) return alert("Admin only");

  let id = prompt("Post ID");
  if(!id) return;

  showLoader("Deleting...");

  await db.from("posts").delete().eq("id",id);

  hideLoader();
  showSuccess("Deleted");

  loadPosts();
};

// =======================
// FAVICON (FULL FIX)
// =======================
window.changeFavicon = async function(){

  if(!window.admin) return alert("Admin only");

  let input = document.createElement("input");
  input.type="file";
  input.accept="image/png";

  input.onchange = async ()=>{

    let file = input.files[0];
    if(!file) return;

    let img = new Image();

    img.onload = async ()=>{

      if(img.width!==128 || img.height!==128){
        alert("Must be 128x128");
        return;
      }

      showLoader("Uploading favicon...");

      const { error } = await db.storage
        .from("favicon")
        .upload("favicon.png",file,{upsert:true});

      if(error){
        hideLoader();
        return alert("Upload failed");
      }

      let url = SUPABASE_URL+"/storage/v1/object/public/favicon/favicon.png";

      document.getElementById("faviconTag").href = url;
      document.getElementById("sidebarFavicon").src = url;

      hideLoader();
      showSuccess("Favicon updated");

    };

    img.src = URL.createObjectURL(file);
  };

  input.click();
};

// =======================
// ADS (REAL FIX)
// =======================
window.watchAds = function(){

  let overlay = document.getElementById("adOverlay");
  let box = document.getElementById("adContainer");

  if(!overlay || !box) return alert("Ad container missing");

  overlay.style.display="flex";
  box.innerHTML="";

  let script = document.createElement("script");
  script.src="https://pl29052599.profitablecpmratenetwork.com/24/cb/b7/24cbb72257475dcd544b0346aee1dd35.js";
  script.async=true;

  box.appendChild(script);

  setTimeout(()=>{
    overlay.style.display="none";
    box.innerHTML="";
  },8000);
};
