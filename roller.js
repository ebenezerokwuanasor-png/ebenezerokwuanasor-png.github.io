// =======================
// ROLLER SYSTEM
// =======================

window.showRoller = function(text="Please wait..."){
  const r = document.getElementById("rollerOverlay");
  const t = document.getElementById("rollerText");

  if(!r) return;

  r.style.display = "flex";
  if(t) t.innerText = text;
};

window.hideRoller = function(success=true){
  const r = document.getElementById("rollerOverlay");
  if(r) r.style.display = "none";

  if(success){
    showToast("✅ Success");
  }else{
    showToast("❌ Failed");
  }
};

// =======================
// TOAST
// =======================
window.showToast = function(msg){
  let toast = document.getElementById("successToast");
  if(!toast) return;

  toast.querySelector(".toastBox").innerText = msg;
  toast.style.display = "block";

  setTimeout(()=> toast.style.display="none", 2500);
};
