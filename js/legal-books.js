document.addEventListener("DOMContentLoaded", () => {
  let legalData = null
  let currentSearchResults = []
  const MAX_RESULTS = 50 // OPTIMIZATION: Hard limit on results to prevent DOM freezing

  const searchInput = document.getElementById("legal-search")
  const searchBtn = document.getElementById("search-btn")
  const actFilter = document.getElementById("act-filter")
  const searchType = document.getElementById("search-type")
  const searchResults = document.getElementById("search-results")
  const resultsList = document.getElementById("results-list")
  const resultsCount = document.getElementById("results-count")
  const clearSearchBtn = document.getElementById("clear-search")
  const tabContents = document.getElementById("tab-contents")
  const quickReferenceGrid = document.getElementById("quick-reference-grid")
  const loading = document.getElementById("loading")

  init()

  async function init() {
    try {
      loading.classList.remove("hidden")
      await loadLegalData()
      renderTabs()
      renderQuickReference()
      setupEventListeners()
      loading.classList.add("hidden")
    } catch (error) {
      console.error("Error initializing legal books:", error)
      loading.innerHTML = '<div class="error">Error loading legal acts data. Please try again later.</div>'
    }
  }

  async function loadLegalData() {
    try {
      const response = await fetch("data/legal-acts.json")
      if (!response.ok) throw new Error("Failed to load legal acts data")
      legalData = await response.json()
    } catch (error) {
      console.error("Error loading legal data:", error)
      throw error
    }
  }

  function setupEventListeners() {
    searchBtn.addEventListener("click", performSearch)
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") performSearch()
    })

    let searchTimeout
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        if (searchInput.value.trim().length > 2) performSearch()
        else if (searchInput.value.trim().length === 0) clearSearch()
      }, 300)
    })

    actFilter.addEventListener("change", () => {
      if (searchInput.value.trim()) performSearch()
    })

    searchType.addEventListener("change", () => {
      if (searchInput.value.trim()) performSearch()
    })

    clearSearchBtn.addEventListener("click", clearSearch)
  }

  function performSearch() {
    const query = searchInput.value.trim().toLowerCase()
    const actFilterValue = actFilter.value
    const searchTypeValue = searchType.value

    if (!query || query.length < 3) {
      return // Don't search for very short queries
    }

    currentSearchResults = []
    let resultsFound = 0

    // OPTIMIZED SEARCH LOOP
    // We use a label to break out of nested loops efficiently once limit is reached
    searchLoop:
    for (const act of legalData.acts) {
      if (actFilterValue !== "all" && act.id !== actFilterValue) continue

      for (const chapter of act.chapters) {
        for (const section of chapter.sections) {
          if (resultsFound >= MAX_RESULTS) break searchLoop // Stop searching if limit reached

          let matchField = ""
          let isMatch = false

          switch (searchTypeValue) {
            case "section":
              matchField = String(section.number).toLowerCase()
              if (matchField.includes(query)) isMatch = true
              break
            case "title":
              matchField = section.title.toLowerCase()
              if (matchField.includes(query)) isMatch = true
              break
            case "content":
              matchField = section.content.toLowerCase()
              if (matchField.includes(query)) isMatch = true
              break
            default:
              // For 'all', check all fields but break early if match found
              if (String(section.number).includes(query) ||
                  section.title.toLowerCase().includes(query) ||
                  section.content.toLowerCase().includes(query)) {
                isMatch = true
              }
          }

          if (isMatch) {
            currentSearchResults.push({
              act,
              chapter,
              section
            })
            resultsFound++
          }
        }
      }
    }

    displaySearchResults(resultsFound >= MAX_RESULTS)
  }

  function highlightMatch(text, query) {
    if (!query) return text
    // Simple highlight to avoid complex regex performance hit on large text
    const lowerText = text.toLowerCase()
    const index = lowerText.indexOf(query.toLowerCase())
    if (index >= 0) {
      return text.substring(0, index) +
             `<mark>${text.substring(index, index + query.length)}</mark>` +
             text.substring(index + query.length)
    }
    return text
  }

  function displaySearchResults(limitReached = false) {
    if (currentSearchResults.length === 0) {
      searchResults.classList.add("hidden")
      return
    }

    let countText = `Search Results (${currentSearchResults.length} found)`
    if (limitReached) {
      countText += ` - Showing top ${MAX_RESULTS} matches. Please refine your search.`
    }
    resultsCount.textContent = countText

    resultsList.innerHTML = ""

    const query = searchInput.value.trim()

    // Use a document fragment for better performance when appending multiple items
    const fragment = document.createDocumentFragment()

    currentSearchResults.forEach((result) => {
      const resultItem = document.createElement("div")
      resultItem.className = "search-result-item"

      // Only highlight title for performance; highlighting massive content blocks is heavy
      const highlightedTitle = highlightMatch(result.section.title, query)

      // For content, just show a snippet if it's long
      let contentDisplay = result.section.content
      if (contentDisplay.length > 300) {
         const matchIndex = contentDisplay.toLowerCase().indexOf(query.toLowerCase())
         if (matchIndex > 50) {
            contentDisplay = "..." + contentDisplay.substring(matchIndex - 50, matchIndex + 250) + "..."
         } else {
            contentDisplay = contentDisplay.substring(0, 300) + "..."
         }
      }
      const highlightedContent = highlightMatch(contentDisplay, query)

      resultItem.innerHTML = `
        <div class="result-header">
          <div class="result-act-info">
            <span class="result-act">${result.act.title}</span>
            <span class="result-chapter">${result.chapter.title}</span>
          </div>
        </div>
        <div class="result-section">
          <h4>Section ${result.section.number}: ${highlightedTitle}</h4>
          <p class="result-content">${highlightedContent}</p>
        </div>
      `

      resultItem.addEventListener("click", () => {
        navigateToSection(result.act.id, result.section.id)
      })

      fragment.appendChild(resultItem)
    })

    resultsList.appendChild(fragment)
    searchResults.classList.remove("hidden")
  }

  function clearSearch() {
    searchInput.value = ""
    currentSearchResults = []
    searchResults.classList.add("hidden")
  }

  function renderTabs() {
    if (!legalData) return
    tabContents.innerHTML = ""

    legalData.acts.forEach((act, index) => {
      const tabContent = document.createElement("div")
      tabContent.className = `tab-content ${index === 0 ? "active" : ""}`
      tabContent.id = `${act.id}-tab`

      const actHeader = document.createElement("div")
      actHeader.className = "card mb-4"
      actHeader.innerHTML = `
        <div class="card-header">
          <h2>${act.title}</h2>
          <p>${act.description}</p>
        </div>
      `

      const chaptersList = document.createElement("div")
      chaptersList.className = "chapters-list"

      act.chapters.forEach((chapter) => {
        const chapterCard = document.createElement("div")
        chapterCard.className = "chapter-card"

        const chapterHeader = document.createElement("div")
        chapterHeader.className = "chapter-header collapsible"
        chapterHeader.innerHTML = `
          <h3>${chapter.title}</h3>
          <i class="fas fa-chevron-right"></i>
        `

        const chapterContent = document.createElement("div")
        chapterContent.className = "chapter-content"

        // Lazy rendering for sections could be added here, but for now we render all
        // since the main issue was the search loop, not initial render.
        chapter.sections.forEach((section) => {
          const sectionItem = document.createElement("div")
          sectionItem.className = "section-item"
          sectionItem.setAttribute("data-section-id", section.id)
          sectionItem.innerHTML = `
            <h4>Section ${section.number}: ${section.title}</h4>
            <p>${section.content}</p>
          `
          chapterContent.appendChild(sectionItem)
        })

        chapterHeader.addEventListener("click", function () {
          const icon = this.querySelector("i")
          chapterContent.classList.toggle("show")
          icon.classList.toggle("fa-chevron-down")
          icon.classList.toggle("fa-chevron-right")
        })

        chapterCard.appendChild(chapterHeader)
        chapterCard.appendChild(chapterContent)
        chaptersList.appendChild(chapterCard)
      })

      tabContent.appendChild(actHeader)
      tabContent.appendChild(chaptersList)
      tabContents.appendChild(tabContent)
    })
  }

  function renderQuickReference() {
    if (!legalData) return

    quickReferenceGrid.innerHTML = ""

    Object.entries(legalData.quickReference).forEach(([actId, refData]) => {
      const refItem = document.createElement("div")
      refItem.className = "quick-reference-item"

      const sectionsHtml = refData.sections
        .map((section) => `<li>• Section ${section.section}: ${section.title}</li>`)
        .join("")

      refItem.innerHTML = `
        <h4>${refData.title}</h4>
        <ul>${sectionsHtml}</ul>
      `

      refItem.addEventListener("click", (e) => {
        if (e.target.tagName === "LI") {
          const sectionMatch = e.target.textContent.match(/Section\s+(\d+)/)
          if (sectionMatch) {
             const sectionNumber = sectionMatch[1]
             searchForSection(sectionNumber, actId)
          }
        }
      })

      quickReferenceGrid.appendChild(refItem)
    })
  }

  function searchForSection(sectionNumber, actId) {
    searchInput.value = sectionNumber
    actFilter.value = actId
    searchType.value = "section"
    performSearch()
  }

  function navigateToSection(actId, sectionId) {
    switchTab(actId)
    // Don't clear search immediately so user can go back to results if needed
    // But hide the results pane to show the content
    searchResults.classList.add("hidden")

    setTimeout(() => {
      const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`)
      if (sectionElement) {
        const chapterContent = sectionElement.closest(".chapter-content")
        const chapterHeader = chapterContent.previousElementSibling

        if (!chapterContent.classList.contains("show")) {
          chapterHeader.click()
        }

        setTimeout(() => {
          sectionElement.scrollIntoView({ behavior: "smooth", block: "center" })
          sectionElement.classList.add("highlighted")
          setTimeout(() => sectionElement.classList.remove("highlighted"), 3000)
        }, 300)
      }
    }, 100)
  }

  function switchTab(tabId) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active")
    })

    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active")
    })

    const tabBtn = document.querySelector(`[data-tab="${tabId}"]`)
    if (tabBtn) tabBtn.classList.add("active")

    const tabContent = document.getElementById(`${tabId}-tab`)
    if (tabContent) tabContent.classList.add("active")
  }
})
