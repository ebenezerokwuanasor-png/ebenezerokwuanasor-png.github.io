// ==========================
// FIXES.JS (CLEAN STABLE VERSION)
// ==========================

// ==========================
// GLOBAL INIT (SAFE UI FIXES ONLY)
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  fixCloseButtons();
  fixPasswordEye();
}); 

window.adminLogin = async function(){

  showRoller("Logging in...");

  try{

    let email = document.getElementById("adminEmail").value;
    let pass = document.getElementById("adminPass").value;

    const { error } = await db.auth.signInWithPassword({
      email,
      password: pass
    });

    if(error){
      hideRoller(false);
      alert("❌ " + error.message); // ← THIS FIXES YOUR ISSUE
      return;
    }

    window.admin = true;

    hideRoller(true);

    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("adminPanel").style.display = "flex";

  }catch(e){
    hideRoller(false);
    alert("Login failed");
  }
};
// ==========================
// 🔔 TOAST SYSTEM
// ==========================
window.toast = function (msg, success = true) {
  const box = document.getElementById("successToast");
  if (!box) return;

  const inner = box.querySelector(".toastBox");
  if (inner) {
    inner.innerText = (success ? "✅ " : "❌ ") + msg;
  }

  box.style.display = "block";

  setTimeout(() => {
    box.style.display = "none";
  }, 2500);
};

// ==========================
// ❌ CLOSE BUTTON FIX
// ==========================
function fixCloseButtons() {
  document.querySelectorAll(".closeBtn").forEach((btn) => {
    btn.onclick = () => {
      const overlay = btn.closest(".overlay");
      if (overlay) overlay.style.display = "none";
    };
  });
}

// ==========================
// 👁 PASSWORD TOGGLE FIX
// ==========================
function fixPasswordEye() {
  const pass = document.getElementById("adminPass");
  if (!pass) return;

  const btn = pass.parentElement.querySelector("button");
  if (!btn) return;

  btn.onclick = () => {
    pass.type = pass.type === "password" ? "text" : "password";
  };
}

// ==========================
// 📢 ADS SYSTEM (SAFE)
// ==========================
window.watchAds = function () {
  const overlay = document.getElementById("adOverlay");
  const container = document.getElementById("adContainer");

  if (!overlay || !container) return;

  overlay.style.display = "flex";
  container.innerHTML = "";

  const script = document.createElement("script");
  script.src =
    "https://pl29052599.profitablecpmratenetwork.com/24/cb/b7/24cbb72257475dcd544b0346aee1dd35.js";

  container.appendChild(script);

  setTimeout(() => {
    overlay.style.display = "none";
    container.innerHTML = "";
  }, 8000);
};
