// =======================
// PERFECT ROLLER SYSTEM
// =======================

window.showRoller = function(text="Please wait..."){
  let r = document.getElementById("rollerOverlay");
  if(!r) return;

  r.classList.remove("success","error");
  r.style.display = "flex";

  const t = document.getElementById("rollerText");
  if(t) t.innerText = text;
};

window.updateRoller = function(text){
  const t = document.getElementById("rollerText");
  if(t) t.innerText = text;
};

window.successRoller = function(msg="Success"){
  const r = document.getElementById("rollerOverlay");

  if(r){
    r.classList.add("success");
    r.classList.remove("error");
  }

  updateRoller(msg);

  setTimeout(()=>{
    r.style.display = "none";
  },1000);
};

window.errorRoller = function(msg="Failed"){
  const r = document.getElementById("rollerOverlay");

  if(r){
    r.classList.add("error");
    r.classList.remove("success");
  }

  updateRoller(msg);

  setTimeout(()=>{
    r.style.display = "none";
  },1500);
};
