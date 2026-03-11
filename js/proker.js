function showVM(divisiId, element) {
  if (element.classList.contains("active")) {
    return;
  }

  // 1. Ambil semua elemen konten
  const allBoxes = document.querySelectorAll(".box");

  allBoxes.forEach((box) => {
    // Sembunyikan dan hapus class active
    box.style.display = "none";
    box.classList.remove("active");

    // Hapus juga class active dari anak-anaknya (box-proker) jika perlu
    const innerProkers = box.querySelectorAll(".box-proker");
    innerProkers.forEach((item) => item.classList.remove("active"));
  });

  // 2. Tampilkan target box
  const targetBox = document.getElementById(divisiId);
  if (targetBox) {
    targetBox.style.display = "flex"; // Atau 'grid' sesuai layoutmu

    // Tambahkan class active ke box induk dan semua box-proker di dalamnya
    setTimeout(() => {
      targetBox.classList.add("active");
      const targetInner = targetBox.querySelectorAll(".box-proker");
      targetInner.forEach((item) => item.classList.add("active"));
      
    }, 10); // Timeout kecil agar transisi CSS terbaca
  }

  // 3. Update style tombol menu
  const allCards = document.querySelectorAll(".card-text");
  allCards.forEach((card) => card.classList.remove("active"));
  element.classList.add("active");
}
