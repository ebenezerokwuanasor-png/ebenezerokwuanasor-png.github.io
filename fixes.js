// ==========================
// FIXES.JS (SAFE UI ONLY)
// ==========================

document.addEventListener("DOMContentLoaded", () => {
  fixCloseButtons();
  fixPasswordEye();
});

// ==========================
// CLOSE BUTTONS
// ==========================
function fixCloseButtons(){
  document.querySelectorAll(".closeBtn").forEach(btn=>{
    btn.onclick = () => {
      const overlay = btn.closest(".overlay");
      if(overlay) overlay.style.display = "none";
    };
  });
}

// ==========================
// PASSWORD TOGGLE
// ==========================
function fixPasswordEye(){
  const pass = document.getElementById("adminPass");
  if(!pass) return;

  const btn = pass.parentElement.querySelector("button");
  if(!btn) return;

  btn.onclick = () => {
    pass.type = pass.type === "password" ? "text" : "password";
  };
}

// ==========================
// SIMPLE OVERLAY HELPERS
// ==========================
window.openOverlay = function(id){
  const el = document.getElementById(id);
  if(el) el.style.display = "flex";
};

window.closeOverlay = function(id){
  const el = document.getElementById(id);
  if(el) el.style.display = "none";
};
