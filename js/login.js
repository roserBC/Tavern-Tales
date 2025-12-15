document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = document.getElementById("user").value?.trim() || "Usuari";
  localStorage.setItem("fakeUser", user);

  // Engega música aprofitant el gest d’usuari (això evita el bloqueig d’autoplay)
  if (window.__bgmStart) {
    await window.__bgmStart();
  }

  window.location.href = "home.html";
});
