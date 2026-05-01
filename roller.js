window.showRoller = function(text="Please wait..."){
  let r = document.getElementById("rollerOverlay");

  if(!r){
    r = document.createElement("div");
    r.id = "rollerOverlay";
    r.className = "rollerOverlay";
    r.innerHTML = `
      <div class="rollerBox">
        <div class="spinner"></div>
        <p id="rollerText"></p>
      </div>
    `;
    document.body.appendChild(r);
  }

  document.getElementById("rollerText").innerText = text;
  r.style.display = "flex";
};

window.updateRoller = function(text){
  const t = document.getElementById("rollerText");
  if(t) t.innerText = text;
};

window.successRoller = function(text="Success"){
  updateRoller(text);
  setTimeout(()=> document.getElementById("rollerOverlay").style.display="none", 900);
};

window.errorRoller = function(text="Failed"){
  updateRoller(text);
  setTimeout(()=> document.getElementById("rollerOverlay").style.display="none", 1200);
};
