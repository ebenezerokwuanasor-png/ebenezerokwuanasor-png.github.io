const roller = document.getElementById("rollerOverlay");
const text = document.getElementById("rollerText");

function ensureRoller() {
  if (!roller) console.warn("ROLLER NOT FOUND");
  return roller && text;
}

// ==========================
// SHOW LOADING STATE
// ==========================
window.showRoller = function (msg = "Please wait...") {
  if (!ensureRoller()) return;

  roller.style.display = "flex";
  roller.className = "rollerOverlay show";

  text.innerText = msg;
};

// ==========================
// UPDATE MESSAGE ONLY
// ==========================
window.updateRoller = function (msg) {
  if (!ensureRoller()) return;
  text.innerText = msg;
};

// ==========================
// SUCCESS STATE
// ==========================
window.successRoller = function (msg = "Success") {
  if (!ensureRoller()) return;

  text.innerText = msg;
  roller.className = "rollerOverlay success";

  setTimeout(() => {
    roller.style.display = "none";
    roller.className = "rollerOverlay";
  }, 900);
};

// ==========================
// ERROR STATE
// ==========================
window.errorRoller = function (msg = "Failed") {
  if (!ensureRoller()) return;

  text.innerText = msg;
  roller.className = "rollerOverlay error";

  setTimeout(() => {
    roller.style.display = "none";
    roller.className = "rollerOverlay";
  }, 1200);
};

// ==========================
// FORCE CLOSE
// ==========================
window.hideRoller = function () {
  if (!roller) return;
  roller.style.display = "none";
  roller.className = "rollerOverlay";
};
