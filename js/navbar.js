// Toogle class active
const navbarNav = document.querySelector(".nav");
const navbar = document.querySelector(".navbar");

// ketika hamburger menu di klik
document.querySelector("#hamburger-menu").onclick = () => {
  navbarNav.classList.toggle("active");
  navbar.classList.toggle("active");

  const existingLink = navbarNav.querySelector(".extra-link");

  if (navbarNav.classList.contains("active")) {
    // Jika menu dibuka dan link belum ada, buat linknya
    if (!existingLink) {
      const newNav = document.createElement("a");
      newNav.textContent = "Open Recruitment";
      newNav.href = "#/oprec";
      newNav.id = "oprec";
      newNav.setAttribute('data-navigo', "");
      newNav.classList.add("extra-link");
      navbarNav.appendChild(newNav);
    }
  } else {
    // Jika menu ditutup, hapus linknya agar tidak muncul di desktop
    if (existingLink) {
      existingLink.remove();
    }
  }

  const extraLink = navbarNav.querySelector(".extra-link");
  extraLink.onclick = () => {
    // hapus class active
    navbarNav.classList.remove("active");
    navbar.classList.remove("active");
  };
};

// klik diluar sidebar untuk menghilangkan nav
const hamburger = document.querySelector("#hamburger-menu");

document.addEventListener("click", function (e) {
  if (!hamburger.contains(e.target) && !navbarNav.contains(e.target)) {
    navbarNav.classList.remove("active");
    navbar.classList.remove("active");
  }
});

// menghilangkan nav jika sudah klik link
const navLink = document.querySelectorAll(".nav a");

navLink.forEach((link) => {
  link.onclick = () => {
    // hapus class active
    navbarNav.classList.remove("active");
    navbar.classList.remove("active");
  };
});

// ketika windows di scroll
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");

  if (window.scrollY > 100) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});
