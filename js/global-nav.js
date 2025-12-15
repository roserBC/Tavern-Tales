document.addEventListener("DOMContentLoaded", () => {
    const newGameBtn = document.getElementById("navNewGame");
    if (!newGameBtn) return;
  
    newGameBtn.addEventListener("click", (e) => {
      e.preventDefault();
  
      // Si ja som al home
      if (location.pathname.endsWith("home.html")) {
        const dlg = document.getElementById("addDialog");
        if (dlg && !dlg.open) dlg.showModal();
        return;
      }
  
      // Si estem a qualsevol altra pàgina
      location.href = "home.html?newGame=1";
    });
  });
  