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

  showRoller("Checking fields...");

  const emailInput = document.getElementById("adminEmail");
  const passInput = document.getElementById("adminPass");

  const email = emailInput.value.trim();
  const password = passInput.value.trim();

  if (!email || !password) {
    errorRoller("Missing email or password");

    emailInput.value = "";
    passInput.value = "";
    return;
  }

  updateRoller("Logging in...");

  const { error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    errorRoller("Login failed");

    emailInput.value = "";
    passInput.value = "";
    return;
  }

  successRoller("Login successful");

  window.admin = true;
  localStorage.setItem("admin", "true");

  setTimeout(() => {
    adminLogin.style.display = "none";
    adminPanel.style.display = "flex";
  }, 800);
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

window.openOverlay = function (id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.style.display = "flex";
};

window.closeOverlay = function (id) {
  const el = document.getElementById(id);
  if (!el) return;

  el.style.display = "none";
};
