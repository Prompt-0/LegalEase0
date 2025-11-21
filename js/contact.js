class HelplineApp {
  constructor() {
    this.data = null;
    this.init();
  }

  async init() {
    try {
      await this.loadData();
      this.renderNavigation();
      this.renderContent();
      this.setupEventListeners();
      this.autoOpenEmergencySection();
    } catch (error) {
      this.showError("Failed to load helpline data. Please refresh the page.");
      console.error("Error initializing app:", error);
    }
  }

  async loadData() {
    try {
      const response = await fetch("./data/contact.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.data = await response.json();
    } catch (error) {
      throw new Error("Failed to load helpline data");
    }
  }

  renderNavigation() {
    const navLinks = document.querySelector(".nav-links");
    if (!navLinks || !this.data) return;

    navLinks.innerHTML = this.data.categories
      .map((category) => {
        // Security: escapeHTML ensures category titles are safe
        const title = escapeHTML(category.title.replace(/[^\w\s]/gi, "").trim());
        return `<li><a href="#${category.id}">${title}</a></li>`;
      })
      .join("");
  }

  renderContent() {
    const mainContainer = document.querySelector(".main .container");
    if (!mainContainer || !this.data) return;

    // Remove loading indicator
    const loading = mainContainer.querySelector(".loading");
    if (loading) loading.remove();

    mainContainer.innerHTML = this.data.categories.map((category) => this.createCategorySection(category)).join("");
  }

  createCategorySection(category) {
    // NOTE: Removed onclick="helplineApp.toggleAccordion(this)"
    return `
            <section id="${category.id}" class="accordion">
                <div class="accordion-header">
                    <div class="accordion-title">
                        ${escapeHTML(category.title)}
                    </div>
                    <div class="accordion-icon">▼</div>
                </div>
                <div class="accordion-content">
                    <div class="accordion-body">
                        ${category.helplines.map((helpline) => this.createHelplineCard(helpline)).join("")}
                    </div>
                </div>
            </section>
        `;
  }

  createHelplineCard(helpline) {
    const cleanNumber = helpline.number.replace(/[^\d]/g, "");
    return `
            <div class="helpline-card">
                <div class="helpline-name">${escapeHTML(helpline.name)}</div>
                <div class="helpline-number">
                    <a href="tel:${cleanNumber}">${escapeHTML(helpline.number)}</a>
                </div>
                <div class="helpline-desc">${escapeHTML(helpline.description)}</div>
            </div>
        `;
  }

  toggleAccordion(element) {
    const content = element.nextElementSibling;

    // Close all other accordions
    document.querySelectorAll(".accordion-header").forEach((header) => {
      if (header !== element) {
        header.classList.remove("active");
        if(header.nextElementSibling) {
            header.nextElementSibling.classList.remove("active");
        }
      }
    });

    // Toggle current accordion
    element.classList.toggle("active");
    content.classList.toggle("active");
  }

  callEmergency() {
    if (confirm("Call Emergency Number 112?")) {
      window.location.href = "tel:112";
    }
  }

  setupEventListeners() {
    // 1. Navigation Links
    document.addEventListener("click", (e) => {
      if (e.target.matches(".nav-links a")) {
        e.preventDefault();
        const targetId = e.target.getAttribute("href");
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });

    // 2. Emergency button
    const emergencyBtn = document.querySelector(".emergency-btn");
    if (emergencyBtn) {
      emergencyBtn.addEventListener("click", () => this.callEmergency());
    }

    // 3. Accordion Toggle (Delegated Event Listener)
    const mainContainer = document.querySelector(".main .container");
    if (mainContainer) {
        mainContainer.addEventListener('click', (e) => {
            // Find the closest header
            const header = e.target.closest('.accordion-header');
            if (header) {
                this.toggleAccordion(header);
            }
        });
    }
  }

  autoOpenEmergencySection() {
    setTimeout(() => {
      const emergencySection = document.querySelector("#emergency .accordion-header");
      if (emergencySection) {
        this.toggleAccordion(emergencySection);
      }
    }, 100);
  }

  showError(message) {
    const mainContainer = document.querySelector(".main .container");
    if (mainContainer) {
      mainContainer.innerHTML = `
                <div class="error">
                    <h2>⚠️ Error</h2>
                    <p>${escapeHTML(message)}</p>
                </div>
            `;
    }
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  window.helplineApp = new HelplineApp();
});
