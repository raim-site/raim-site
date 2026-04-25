const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav]");
const navLinks = document.querySelectorAll("[data-nav] a");
const yearNode = document.querySelector("[data-year]");
const megaItems = document.querySelectorAll(".has-mega");
const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector("[data-form-status]");
const revealNodes = document.querySelectorAll("[data-reveal]");
const connectionCanvas = document.getElementById("connection-canvas");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navMenu.classList.toggle("is-open");
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (navToggle && navMenu) {
      navToggle.setAttribute("aria-expanded", "false");
      navMenu.classList.remove("is-open");
    }
  });
});

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

if (revealNodes.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealNodes.forEach((node, index) => {
    node.style.setProperty("--reveal-delay", `${Math.min(index * 35, 260)}ms`);
    observer.observe(node);
  });
}

megaItems.forEach((item) => {
  const trigger = item.querySelector(":scope > a");
  if (!trigger) {
    return;
  }

  trigger.addEventListener("click", (event) => {
    if (window.innerWidth > 760) {
      return;
    }
    event.preventDefault();
    item.classList.toggle("is-open");
  });
});

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const projectType = String(formData.get("projectType") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !projectType || !message) {
      formStatus.textContent = "Please fill in all fields before sending.";
      return;
    }

    const subject = encodeURIComponent(`Project Inquiry - ${projectType}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nProject Type: ${projectType}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:info@raiminternational.sa.com?subject=${subject}&body=${body}`;
    formStatus.textContent = "Your email app is opening with the project inquiry details.";
    contactForm.reset();
  });
}

if (connectionCanvas) {
  const ctx = connectionCanvas.getContext("2d");
  let animationId = 0;
  let points = [];
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let mouse = { x: -9999, y: -9999, active: false };

  const buildPoints = () => {
    const rect = connectionCanvas.getBoundingClientRect();
    const area = rect.width * rect.height;
    const count = Math.max(18, Math.min(40, Math.floor(area / 28000)));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      z: Math.random() * 1 + 0.2,
      vx: (Math.random() - 0.5) * 0.26,
      vy: (Math.random() - 0.5) * 0.26,
    }));
  };

  const resizeCanvas = () => {
    const rect = connectionCanvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    connectionCanvas.width = rect.width * dpr;
    connectionCanvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildPoints();
  };

  const draw = () => {
    const { width, height } = connectionCanvas.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);

    for (const point of points) {
      point.x += point.vx * point.z;
      point.y += point.vy * point.z;

      if (point.x < -40 || point.x > width + 40) point.vx *= -1;
      if (point.y < -40 || point.y > height + 40) point.vy *= -1;
    }

    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i];
        const b = points[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        const maxDist = 180;

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.32;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(229, 141, 34, ${alpha})`;
          ctx.lineWidth = 1 + ((a.z + b.z) / 2) * 0.6;
          ctx.stroke();
        }
      }
    }

    if (mouse.active) {
      for (const point of points) {
        const dx = point.x - mouse.x;
        const dy = point.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 220) {
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(247, 241, 231, ${(1 - dist / 220) * 0.22})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    for (const point of points) {
      const radius = 2 + point.z * 2.4;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(229, 141, 34, 0.08)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = point.z > 0.8 ? "rgba(247, 241, 231, 0.95)" : "rgba(229, 141, 34, 0.92)";
      ctx.fill();
    }

    animationId = window.requestAnimationFrame(draw);
  };

  resizeCanvas();
  draw();

  connectionCanvas.addEventListener("pointermove", (event) => {
    const rect = connectionCanvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
    mouse.active = true;
  });

  connectionCanvas.addEventListener("pointerleave", () => {
    mouse.active = false;
  });

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("beforeunload", () => {
    window.cancelAnimationFrame(animationId);
  });
}
