class HelplineApp {
  constructor() {
    this.data = null
    this.init()
  }

  async init() {
    try {
      await this.loadData()
      this.renderNavigation()
      this.renderContent()
      this.setupEventListeners()
      this.autoOpenEmergencySection()
    } catch (error) {
      this.showError("Failed to load helpline data. Please refresh the page.")
      console.error("Error initializing app:", error)
    }
  }

  async loadData() {
    try {
      const response = await fetch("./data/contact.json")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      this.data = await response.json()
    } catch (error) {
      throw new Error("Failed to load helpline data")
    }
  }

  renderNavigation() {
    const navLinks = document.querySelector(".nav-links")
    if (!navLinks || !this.data) return

    navLinks.innerHTML = this.data.categories
      .map((category) => {
        const title = category.title.replace(/[^\w\s]/gi, "").trim()
        return `<li><a href="#${category.id}">${title}</a></li>`
      })
      .join("")
  }

  renderContent() {
    const mainContainer = document.querySelector(".main .container")
    if (!mainContainer || !this.data) return

    // Remove loading indicator
    const loading = mainContainer.querySelector(".loading")
    if (loading) loading.remove()

    mainContainer.innerHTML = this.data.categories.map((category) => this.createCategorySection(category)).join("")
  }

  createCategorySection(category) {
    return `
            <section id="${category.id}" class="accordion">
                <div class="accordion-header" onclick="helplineApp.toggleAccordion(this)">
                    <div class="accordion-title">
                        ${category.title}
                    </div>
                    <div class="accordion-icon">▼</div>
                </div>
                <div class="accordion-content">
                    <div class="accordion-body">
                        ${category.helplines.map((helpline) => this.createHelplineCard(helpline)).join("")}
                    </div>
                </div>
            </section>
        `
  }

  createHelplineCard(helpline) {
    const cleanNumber = helpline.number.replace(/[^\d]/g, "")
    return `
            <div class="helpline-card">
                <div class="helpline-name">${helpline.name}</div>
                <div class="helpline-number">
                    <a href="tel:${cleanNumber}">${helpline.number}</a>
                </div>
                <div class="helpline-desc">${helpline.description}</div>
            </div>
        `
  }

  toggleAccordion(element) {
    const content = element.nextElementSibling

    // Close all other accordions
    document.querySelectorAll(".accordion-header").forEach((header) => {
      if (header !== element) {
        header.classList.remove("active")
        header.nextElementSibling.classList.remove("active")
      }
    })

    // Toggle current accordion
    element.classList.toggle("active")
    content.classList.toggle("active")
  }

  callEmergency() {
    if (confirm("Call Emergency Number 112?")) {
      window.location.href = "tel:112"
    }
  }

  setupEventListeners() {
    // Smooth scrolling for navigation links
    document.addEventListener("click", (e) => {
      if (e.target.matches(".nav-links a")) {
        e.preventDefault()
        const targetId = e.target.getAttribute("href")
        const targetElement = document.querySelector(targetId)
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      }
    })

    // Emergency button
    const emergencyBtn = document.querySelector(".emergency-btn")
    if (emergencyBtn) {
      emergencyBtn.addEventListener("click", () => this.callEmergency())
    }
  }

  autoOpenEmergencySection() {
    setTimeout(() => {
      const emergencySection = document.querySelector("#emergency .accordion-header")
      if (emergencySection) {
        this.toggleAccordion(emergencySection)
      }
    }, 100)
  }

  showError(message) {
    const mainContainer = document.querySelector(".main .container")
    if (mainContainer) {
      mainContainer.innerHTML = `
                <div class="error">
                    <h2>⚠️ Error</h2>
                    <p>${message}</p>
                </div>
            `
    }
  }

  showLoading() {
    const mainContainer = document.querySelector(".main .container")
    if (mainContainer) {
      mainContainer.innerHTML = '<div class="loading">Loading helpline data...</div>'
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Show loading initially
  const mainContainer = document.querySelector(".main .container")
  if (mainContainer) {
    mainContainer.innerHTML = '<div class="loading">Loading helpline data...</div>'
  }

  // Initialize the app
  window.helplineApp = new HelplineApp()
})

// Expose functions globally for onclick handlers
window.toggleAccordion = (element) => {
  if (window.helplineApp) {
    window.helplineApp.toggleAccordion(element)
  }
}

window.callEmergency = () => {
  if (window.helplineApp) {
    window.helplineApp.callEmergency()
  }
}
