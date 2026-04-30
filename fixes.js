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

  // SAFE fallback if roller missing
  const useRoller = typeof showRoller === "function";

  if (useRoller) showRoller("Logging in...");

  const email = document.getElementById("adminEmail")?.value;
  const password = document.getElementById("adminPass")?.value;

  if (!email || !password) {
    if (useRoller) hideRoller();
    alert("Missing login fields");
    return;
  }

  const { error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    if (useRoller) hideRoller();
    alert("❌ Wrong password");
    return;
  }

  window.admin = true;
  localStorage.setItem("admin", "true");

  if (useRoller) hideRoller();

  document.getElementById("adminLogin").style.display = "none";
  document.getElementById("adminPanel").style.display = "flex";

  alert("Login successful");
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
