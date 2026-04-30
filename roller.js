console.log("ROLLER ACTIVE ✅");

window.showRoller = function (text = "Please wait...") {
  const el = document.getElementById("rollerOverlay");
  const txt = document.getElementById("rollerText");

  if (!el) return;

  if (txt) txt.innerText = text;

  el.style.display = "flex";
  el.style.position = "fixed";
  el.style.top = "0";
  el.style.left = "0";
  el.style.width = "100%";
  el.style.height = "100%";
  el.style.zIndex = "999999";
};

window.hideRoller = function (success = true) {
  const el = document.getElementById("rollerOverlay");
  if (el) el.style.display = "none";

  if (window.toast) {
    toast(success ? "Success" : "Failed", success);
  }
};
