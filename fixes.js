// =======================
// FIXES.JS (PATCH FILE)
// =======================

// ---------- CHECK SUPABASE LOADED ----------
window.addEventListener("load", () => {
  if (!window.supabase) {
    alert("❌ Supabase not loaded. Check your CDN link.");
  }
});

// ---------- CLOSE BUTTON FIX ----------
document.addEventListener("click", function(e){
  if(e.target.classList.contains("closeBtn")){
    let overlay = e.target.closest(".overlay");
    if(overlay) overlay.style.display = "none";
  }
});

// ---------- PASSWORD TOGGLE FIX ----------
document.addEventListener("click", function(e){
  if(e.target.innerText === "👁️"){
    let input = e.target.parentElement.querySelector("input");
    if(input){
      input.type = input.type === "password" ? "text" : "password";
    }
  }
});

// ---------- ADMIN BUTTON FIX ----------
document.addEventListener("DOMContentLoaded", () => {
  let adminBtn = document.querySelector("button[onclick='adminClick()']");
  
  if(adminBtn){
    adminBtn.onclick = function(){
      if(window.admin){
        document.getElementById("adminPanel").style.display = "flex";
      }else{
        document.getElementById("adminLogin").style.display = "flex";
      }
    };
  }
});

// ---------- LOGIN TRIAL SYSTEM ----------
const MAX_TRIALS = 5;
const LOCK_TIME = 24 * 60 * 60 * 1000;

function getTrials(){
  return JSON.parse(localStorage.getItem("login_trials")) || {count:0,time:0};
}

function saveTrials(data){
  localStorage.setItem("login_trials", JSON.stringify(data));
}

function isLocked(){
  let t = getTrials();
  if(t.count >= MAX_TRIALS){
    let diff = Date.now() - t.time;
    if(diff < LOCK_TIME){
      alert("⛔ Too many attempts. Try again in 24hrs.");
      return true;
    }else{
      saveTrials({count:0,time:0});
    }
  }
  return false;
}

// ---------- PATCH ADMIN LOGIN ----------
const oldLogin = window.adminLogin;

window.adminLogin = async function(){
  if(isLocked()) return;

  try{
    await oldLogin();

    // success reset
    saveTrials({count:0,time:0});

  }catch(err){

    let t = getTrials();
    t.count++;
    t.time = Date.now();
    saveTrials(t);

    alert("❌ Wrong login ("+t.count+"/"+MAX_TRIALS+")");
  }
};
