$(document).ready(function () {
  // 1. Intersection Observer (Tetap pakai API native karena jQuery tidak punya wrapper khusus ini)
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        $(entry.target).addClass("active"); // Versi jQuery
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // 2. Apply observer ke semua elemen .scroll-reveal
  $(".scroll-reveal").each(function () {
    observer.observe(this);
  });

  // 3. Auto-open visi by default
  if ($("#visi").length) {
    const $firstCard = $(".vm-card").first();
    showVM("visi", $firstCard);
  }

  // 4. Feather icons
  if (window.feather) {
    feather.replace();
  }
});

// --- Functions (Dibuat global agar bisa dipanggil dari HTML onclick) ---

// Toggle description function
window.toggleDesc = function (id) {
  const $el = $("#" + id);

  if ($el.is(":visible")) {
    $el.hide();
  } else {
    $(".philo-desc").hide();
    $el.show();
  }
};

// Show vision or mission
window.showVM = function (id, card) {
  // Hide contents
  $(".vm-content").removeClass("show");
  $("#" + id).addClass("show");

  // Card highlight
  $(".vm-card").removeClass("selected");
  $(card).addClass("selected");
};
