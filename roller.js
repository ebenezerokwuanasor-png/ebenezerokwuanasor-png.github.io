// =======================
// ROLLER SYSTEM
// =======================

function showRoller(text="Please wait..."){
  const overlay = document.getElementById("rollerOverlay");
  const msg = document.getElementById("rollerText");

  msg.innerText = text;
  overlay.style.display = "flex";
}

function hideRoller(success=true){

  const msg = document.getElementById("rollerText");

  if(success){
    msg.innerText = "✅ Success";
  }else{
    msg.innerText = "❌ Failed";
  }

  setTimeout(()=>{
    document.getElementById("rollerOverlay").style.display = "none";
  },1000);
}
