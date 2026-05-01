// =======================
// ROLLER SYSTEM (FORCED SAFE)
// =======================

window.showRoller = function(text="Please wait..."){

  let r = document.getElementById("rollerOverlay");

  // 🔥 AUTO-CREATE if missing
  if(!r){
    r = document.createElement("div");
    r.id = "rollerOverlay";
    r.className = "rollerOverlay";

    r.innerHTML = `
      <div class="rollerBox">
        <div class="spinner"></div>
        <p id="rollerText">${text}</p>
      </div>
    `;

    document.body.appendChild(r);
  }

  r.style.display = "flex";

  const t = document.getElementById("rollerText");
  if(t) t.innerText = text;
};

window.hideRoller = function(success=true){
  const r = document.getElementById("rollerOverlay");

  if(r) r.style.display = "none";

  if(success){
    showToast("✅ Done");
  }else{
    showToast("❌ Failed");
  }
};

// =======================
// TOAST
// =======================
window.showToast = function(msg){

  let toast = document.getElementById("successToast");

  // 🔥 auto-create toast if missing
  if(!toast){
    toast = document.createElement("div");
    toast.id = "successToast";

    toast.innerHTML = `<div class="toastBox">${msg}</div>`;
    document.body.appendChild(toast);
  }

  toast.querySelector(".toastBox").innerText = msg;
  toast.style.display = "block";

  setTimeout(()=> toast.style.display="none", 2500);
};
