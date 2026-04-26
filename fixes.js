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
};
