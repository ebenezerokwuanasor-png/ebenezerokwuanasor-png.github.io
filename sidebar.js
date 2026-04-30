console.log("SIDEBAR JS LOADED ✅");

// =======================
// SIDEBAR TOGGLE
// =======================
window.toggleSidebar = function () {
  const sidebar = document.getElementById("sidebar");

  if (!sidebar) {
    console.log("Sidebar not found ❌");
    return;
  }

  sidebar.classList.toggle("open");
};

// =======================
// SIDEBAR BUTTON ACTIONS
// =======================
document.addEventListener("DOMContentLoaded", () => {

  const buttons = document.querySelectorAll(".sidebar button");

  buttons.forEach(btn => {

    btn.addEventListener("click", () => {

      const text = btn.innerText.toLowerCase();

      if (text.includes("admin")) {
        if (window.admin) {
          document.getElementById("adminPanel").style.display = "flex";
        } else {
          document.getElementById("adminLogin").style.display = "flex";
        }
      }

      if (text.includes("contact")) {
        document.getElementById("contactOverlay").style.display = "flex";
      }

      if (text.includes("about")) {
        document.getElementById("aboutOverlay").style.display = "flex";
      }

      if (text.includes("privacy")) {
        document.getElementById("privacyOverlay").style.display = "flex";
      }

      if (text.includes("terms")) {
        document.getElementById("termsOverlay").style.display = "flex";
      }

      if (text.includes("watch")) {
        if (typeof watchAds === "function") {
          watchAds();
        }
      }

      if (text.includes("theme")) {
        if (typeof toggleTheme === "function") {
          toggleTheme();
        }
      }

    });

  });

});
