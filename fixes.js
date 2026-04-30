// =======================
// LOGIN SECURITY SYSTEM
// =======================
let loginAttempts = 0;
let lockedUntil = 0;

window.adminLogin = adminLogin;

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

window.adminLogin = async function () {

  const now = Date.now();

  // BLOCK IF LOCKED
  if (now < lockedUntil) {
    toast("Try again later", false);
    return;
  }

  // LIMIT ATTEMPTS
  if (loginAttempts >= 3) {
    lockedUntil = Date.now() + 60000; // 1 minute lock
    loginAttempts = 0;
    toast("Too many attempts. Locked for 60s", false);
    return;
  }

  showRoller("Authenticating...");

  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPass").value;

  const { error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) {

    loginAttempts++;

    hideRoller(false);
    toast(`Wrong credentials (${loginAttempts}/3)`, false);

    return;
  }

  // SUCCESS RESET
  loginAttempts = 0;

  window.admin = true;
  localStorage.setItem("admin", "true");

  hideRoller(true);
  toast("Login successful", true);

  document.getElementById("adminLogin").style.display = "none";
  document.getElementById("adminPanel").style.display = "flex";
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
