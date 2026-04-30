console.log("ROLLER ACTIVE ✅");

window.showRoller = function(text = "Please wait...") {
  let overlay = document.getElementById("rollerOverlay");
  let txt = document.getElementById("rollerText");

  if (!overlay) {
    console.error("rollerOverlay missing in HTML");
    return;
  }

  txt.innerText = text;
  overlay.style.display = "flex";
};

window.hideRoller = function(success = true) {
  let overlay = document.getElementById("rollerOverlay");
  if (overlay) overlay.style.display = "none";

  let toast = document.getElementById("successToast");
  if (!toast) return;

  let box = toast.querySelector(".toastBox");
  box.innerText = success ? "✅ Success" : "❌ Failed";

  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
};
