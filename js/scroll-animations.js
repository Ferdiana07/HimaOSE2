window.initAnimations = () => {
  console.log("Inisialisasi animasi Profil & Home...");

  // 1. INTERSECTION OBSERVER (Tetap sama)
  const animElements = document.querySelectorAll(".fade-section, .scroll-reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible", "active");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animElements.forEach((el) => observer.observe(el));

  // 2. LOGIKA VISI MISI (Disederhanakan agar tidak bentrok)
  // Kita cek dulu apakah ada elemennya, jika tidak ada (seperti di Home), script tidak error
  const vmCards = document.querySelectorAll(".vm-card");
  if (vmCards.length > 0) {
    // Jalankan auto-open visi saat awal load profil
    const firstCard = document.querySelector(".vm-card");
    // Kita panggil fungsi global yang sudah kamu buat sebelumnya
    if (typeof window.showVM === 'function') {
      window.showVM('visi', firstCard);
    }
  }
};