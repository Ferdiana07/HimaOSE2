document.addEventListener("DOMContentLoaded", () => {
  const fadeSections = document.querySelectorAll(".fade-section");

  const startCountUp = (section) => {
    const numbers = section.querySelectorAll(".counter-number");
    numbers.forEach((el) => {
      const target = parseInt(el.getAttribute("data-target") || "0", 10);
      if (!target || el.dataset.counted === "true") return;

      el.dataset.counted = "true";
      let start = null;

      const duration = 1500;

      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const current = Math.floor(progress * target);
        el.textContent = current.toString();
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target.toString();
        }
      };

      window.requestAnimationFrame(step);
    });
  };

  if (!("IntersectionObserver" in window)) {
    fadeSections.forEach((el) => {
      el.classList.add("is-visible");
      if (el.classList.contains("counter")) {
        startCountUp(el);
      }
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const section = entry.target;
          section.classList.add("is-visible");
          if (section.classList.contains("counter")) {
            startCountUp(section);
          }
          obs.unobserve(section);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  fadeSections.forEach((el) => observer.observe(el));
});

