document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu toggle
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn")
  const mobileNav = document.querySelector(".mobile-nav")

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileNav.classList.toggle("show")
    })
  }

  // Close mobile menu when clicking outside
  document.addEventListener("click", (event) => {
    if (
      mobileNav &&
      mobileNav.classList.contains("show") &&
      !mobileNav.contains(event.target) &&
      !mobileMenuBtn.contains(event.target)
    ) {
      mobileNav.classList.remove("show")
    }
  })

  // Tab functionality
  const tabBtns = document.querySelectorAll(".tab-btn")

  if (tabBtns.length > 0) {
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const tabId = this.getAttribute("data-tab")

        // Remove active class from all tabs and contents
        document.querySelectorAll(".tab-btn").forEach((btn) => {
          btn.classList.remove("active")
        })

        document.querySelectorAll(".tab-content").forEach((content) => {
          content.classList.remove("active")
        })

        // Add active class to clicked tab and corresponding content
        this.classList.add("active")
        document.getElementById(`${tabId}-tab`).classList.add("active")
      })
    })
  }

  // Chapter collapsible functionality
  const chapterHeaders = document.querySelectorAll(".chapter-header.collapsible")

  if (chapterHeaders.length > 0) {
    chapterHeaders.forEach((header) => {
      header.addEventListener("click", function () {
        const content = this.nextElementSibling
        const icon = this.querySelector("i")

        content.classList.toggle("show")

        if (content.classList.contains("show")) {
          icon.classList.remove("fa-chevron-right")
          icon.classList.add("fa-chevron-down")
        } else {
          icon.classList.remove("fa-chevron-down")
          icon.classList.add("fa-chevron-right")
        }
      })
    })
  }

  // Close alert
  const closeAlertBtn = document.getElementById("close-alert")
  const securityNotice = document.getElementById("security-notice")

  if (closeAlertBtn && securityNotice) {
    closeAlertBtn.addEventListener("click", () => {
      securityNotice.style.display = "none"
    })
  }

  // File upload display
  const fileInputs = document.querySelectorAll('input[type="file"]')

  if (fileInputs.length > 0) {
    fileInputs.forEach((input) => {
      input.addEventListener("change", function () {
        const fileSelectedEl =
          document.getElementById(`${this.id}-selected`) || document.getElementById("file-selected")

        if (fileSelectedEl && this.files.length > 0) {
          fileSelectedEl.textContent = `File selected: ${this.files[0].name}`
          fileSelectedEl.classList.remove("hidden")
        }
      })
    })
  }
})
