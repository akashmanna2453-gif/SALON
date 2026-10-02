const SALON_CONFIG = {
  name: "Luxe Studio",
  phone: "+91 99675 90265",
  whatsapp: "+919967590265",
  address: "123 Oak Avenue, New York, NY 10012",
  instagram: "https://instagram.com/luxestudio",
  maps: "https://www.google.com/maps?q=SoHo%20New%20York&output=embed"
};

const app = {
  phoneNumber: SALON_CONFIG.whatsapp.replace(/\D/g, ""),
  navToggle: document.querySelector(".nav-toggle"),
  navPanel: document.querySelector(".nav-panel"),
  navLinks: [...document.querySelectorAll(".nav-link")],
  header: document.querySelector(".site-header"),
  revealEls: [...document.querySelectorAll(".reveal")],
  numbers: [...document.querySelectorAll(".stat-value")],
  backToTop: document.querySelector(".back-to-top"),
  mapFrame: document.getElementById("google-map"),
  serviceButtons: [...document.querySelectorAll("[data-service]")],
  form: document.getElementById("appointment-form"),
  instagramLink: document.getElementById("instagram-link"),
  whatsappCta: document.getElementById("cta-whatsapp"),
  testimonials: [...document.querySelectorAll(".testimonial")],
  dots: [...document.querySelectorAll(".dot")],
  testimonialIndex: 0,
  reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
};

function sanitizeNumber(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatDateForMessage(dateString) {
  if (!dateString) return "Not specified";
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Not specified";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function formatTimeForMessage(timeString) {
  if (!timeString) return "Not specified";
  const [hours, minutes] = timeString.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHours = ((hours + 11) % 12) + 1;
  return `${normalizedHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function buildWhatsAppMessage(details = {}) {
  const {
    service = "",
    name = "",
    phone = "",
    date = "",
    time = "",
    message = ""
  } = details;

  const formattedDate = formatDateForMessage(date);
  const formattedTime = formatTimeForMessage(time);

  const lines = [
    "Hi, I would like to book an appointment.",
    "",
    `Name: ${name || "Not provided"}`,
    `Phone: ${phone || "Not provided"}`,
    `Service: ${service || "General consultation"}`,
    `Date: ${formattedDate}`,
    `Time: ${formattedTime}`
  ];

  if (message && message.trim()) {
    lines.push(`Message: ${message.trim()}`);
  }

  return lines.join("\n");
}

function bookOnWhatsApp(service = "", details = {}) {
  const whatsappNumber = sanitizeNumber(SALON_CONFIG.whatsapp);
  const payload = {
    service,
    name: details.name || "",
    phone: details.phone || "",
    date: details.date || "",
    time: details.time || "",
    message: details.message || ""
  };

  const generatedMessage = buildWhatsAppMessage(payload);
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(generatedMessage)}`;

  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function toggleNavMenu(forceOpen) {
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !app.navPanel.classList.contains("open");
  app.navPanel.classList.toggle("open", shouldOpen);
  app.navToggle.classList.toggle("is-open", shouldOpen);
  app.navToggle.setAttribute("aria-expanded", String(shouldOpen));
}

function handleScrollEffects() {
  if (window.scrollY > 24) {
    app.header.classList.add("scrolled");
  } else {
    app.header.classList.remove("scrolled");
  }

  if (window.scrollY > 500) {
    app.backToTop.classList.add("visible");
  } else {
    app.backToTop.classList.remove("visible");
  }
}

function setupRevealAnimations() {
  if (!app.revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  app.revealEls.forEach((element) => observer.observe(element));
}

function animateStatValue(element) {
  const target = Number(element.dataset.target || 0);
  const suffix = element.dataset.suffix || "";
  const duration = 1400;
  const startTime = performance.now();

  function updateFrame(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = target * eased;

    element.textContent = target % 1 === 0 ? Math.round(currentValue) + suffix : currentValue.toFixed(1) + suffix;

    if (progress < 1) {
      requestAnimationFrame(updateFrame);
    } else {
      element.textContent = `${target}${suffix}`;
    }
  }

  requestAnimationFrame(updateFrame);
}

function setupCounterAnimations() {
  if (!app.numbers.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateStatValue(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.45 }
  );

  app.numbers.forEach((number) => observer.observe(number));
}

function setupNavBehavior() {
  app.navToggle.addEventListener("click", () => toggleNavMenu());

  app.navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      toggleNavMenu(false);
    });
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        app.navLinks.forEach((link) => {
          const active = link.getAttribute("href") === `#${id}`;
          link.classList.toggle("active", active);
        });
      });
    },
    { threshold: 0.55 }
  );

  document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));
}

function setupBackToTop() {
  app.backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: app.reduceMotion ? "auto" : "smooth" });
  });
}

function setupMap() {
  if (app.mapFrame) {
    app.mapFrame.src = SALON_CONFIG.maps;
  }
}

function setupServiceBooking() {
  app.serviceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const serviceName = button.dataset.service || "Salon Service";
      bookOnWhatsApp(serviceName);
    });
  });
}

function setupInstagram() {
  if (app.instagramLink) {
    app.instagramLink.href = SALON_CONFIG.instagram;
  }
}

function setupWhatsappCta() {
  if (app.whatsappCta) {
    app.whatsappCta.addEventListener("click", () => bookOnWhatsApp("General consultation"));
  }
}

function showTestimonial(index) {
  app.testimonialIndex = (index + app.testimonials.length) % app.testimonials.length;

  app.testimonials.forEach((card, cardIndex) => {
    card.classList.toggle("active", cardIndex === app.testimonialIndex);
  });

  app.dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === app.testimonialIndex);
  });
}

function setupTestimonials() {
  const prevButton = document.querySelector(".carousel-btn.prev");
  const nextButton = document.querySelector(".carousel-btn.next");

  if (prevButton) {
    prevButton.addEventListener("click", () => showTestimonial(app.testimonialIndex - 1));
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => showTestimonial(app.testimonialIndex + 1));
  }

  app.dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showTestimonial(index));
  });

  setInterval(() => {
    showTestimonial(app.testimonialIndex + 1);
  }, 5000);
}

function validateForm(formData) {
  const errors = [];

  if (!formData.name.trim()) {
    errors.push("Name is required.");
  }

  if (!formData.phone.trim()) {
    errors.push("Phone number is required.");
  }

  if (!formData.service) {
    errors.push("Please select a service.");
  }

  if (!formData.date) {
    errors.push("Please select a preferred date.");
  } else {
    const chosenDate = new Date(`${formData.date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (chosenDate < today) {
      errors.push("Appointment date cannot be in the past.");
    }
  }

  if (!formData.time) {
    errors.push("Please select a preferred time.");
  }

  if (formData.message && formData.message.trim().length > 250) {
    errors.push("Message must be under 250 characters.");
  }

  return errors;
}

function setupFormSubmission() {
  if (!app.form) return;

  app.form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = {
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      service: document.getElementById("service").value,
      date: document.getElementById("date").value,
      time: document.getElementById("time").value,
      message: document.getElementById("message").value
    };

    const errors = validateForm(formData);

    if (errors.length) {
      alert(errors.join("\n"));
      return;
    }

    bookOnWhatsApp(formData.service, formData);
  });
}

function initialize() {
  handleScrollEffects();
  setupRevealAnimations();
  setupCounterAnimations();
  setupNavBehavior();
  setupBackToTop();
  setupMap();
  setupServiceBooking();
  setupInstagram();
  setupWhatsappCta();
  setupTestimonials();
  setupFormSubmission();
  window.addEventListener("scroll", handleScrollEffects, { passive: true });
}

initialize();
