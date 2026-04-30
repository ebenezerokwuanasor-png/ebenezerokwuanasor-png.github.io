// =======================
// ROLLER SYSTEM
// =======================

window.showRoller = function(text="Please wait...") {

  const overlay = document.getElementById("rollerOverlay");
  const msg = document.getElementById("rollerText");

  if (!overlay || !msg) {
    console.log("ROLLER MISSING IN HTML");
    return;
  }

  overlay.style.display = "flex";
  msg.innerText = text;
};

window.hideRoller = function(success=true) {

  const overlay = document.getElementById("rollerOverlay");
  const msg = document.getElementById("rollerText");

  if (!overlay || !msg) return;

  msg.innerText = success ? "Success" : "Failed";

  setTimeout(() => {
    overlay.style.display = "none";
  }, 800);
};
