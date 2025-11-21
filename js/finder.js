// js/finder.js

// Global variables
let legalCasesDatabase = null
let currentResults = []
let currentFilters = {
  category: "",
  year: "",
  jurisdiction: "",
  outcome: "",
}

// DOM elements
const searchBtn = document.getElementById("search-btn")
const clearBtn = document.getElementById("clear-btn")
const caseInput = document.getElementById("case-description")
const resultsSection = document.getElementById("results-section")
const resultsContainer = document.getElementById("results-container")
const noResultsSection = document.getElementById("no-results")
const resultsSummary = document.getElementById("results-summary")
const buttonText = document.querySelector(".button-text")
const loadingSpinner = document.querySelector(".loading-spinner")
const toggleFiltersBtn = document.getElementById("toggle-filters")
const filtersSection = document.getElementById("filters-section")
const filterToggleText = document.getElementById("filter-toggle-text")
const filterArrow = document.querySelector(".filter-arrow")

// Filter elements
const categoryFilter = document.getElementById("category-filter")
const yearFilter = document.getElementById("year-filter")
const jurisdictionFilter = document.getElementById("jurisdiction-filter")
const outcomeFilter = document.getElementById("outcome-filter")
const applyFiltersBtn = document.getElementById("apply-filters-btn")
const sortSelect = document.getElementById("sort-select")

const suggestionChips = document.querySelectorAll(".suggestion-chip")

async function fetchLegalCasesData() {
  try {
    const response = await fetch("./data/legal-cases.json")

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.cases || !Array.isArray(data.cases)) {
      throw new Error("Invalid JSON structure: cases array not found")
    }

    legalCasesDatabase = data
    return data
  } catch (error) {
    console.error("Error fetching legal cases data:", error)
    showNotification(`Error loading legal cases database: ${error.message}. Using fallback data.`, "error")
    return getFallbackData()
  }
}

function getFallbackData() {
  return {
    metadata: {
      version: "1.0-fallback",
      lastUpdated: "2024-01-15",
      totalCases: 3,
      description: "Fallback database of Indian legal cases",
    },
    cases: [
      {
        id: 1,
        title: "Sample Property Dispute Case",
        year: 2023,
        summary: "Sample property boundary dispute case for demonstration purposes.",
        keywords: ["property", "dispute", "boundary", "sample"],
        category: "Property Law",
        jurisdiction: "Delhi High Court",
        outcome: "Plaintiff Victory",
        legalProvisions: ["Transfer of Property Act, 1882"],
        caseNumber: "Sample/2023",
        judge: "Sample Judge",
      },
    ],
    categories: ["Property Law", "Employment Law", "Consumer Law"],
    jurisdictions: ["Delhi High Court", "Labour Court", "Consumer Commission"],
  }
}

async function initializeApp() {
  try {
    showLoadingState(true)
    await fetchLegalCasesData()
    populateFilterOptions()
    updateStats()
    setupEventListeners()
    showLoadingState(false)
    console.log("LegalEase India initialized successfully with", legalCasesDatabase.cases.length, "cases")
  } catch (error) {
    console.error("Error initializing app:", error)
    showNotification("Error initializing application. Please refresh the page.", "error")
    showLoadingState(false)
  }
}

function showLoadingState(isLoading) {
  const mainContent = document.querySelector(".main")
  if (isLoading) {
    mainContent.style.opacity = "0.5"
    mainContent.style.pointerEvents = "none"
  } else {
    mainContent.style.opacity = "1"
    mainContent.style.pointerEvents = "auto"
  }
}

function populateFilterOptions() {
  if (!legalCasesDatabase || !legalCasesDatabase.cases) {
    console.error("Legal cases database not loaded")
    return
  }

  const cases = legalCasesDatabase.cases

  const categories = legalCasesDatabase.categories || [...new Set(cases.map((c) => c.category))].sort()
  const years = [...new Set(cases.map((c) => c.year))].sort((a, b) => b - a)
  const jurisdictions = legalCasesDatabase.jurisdictions || [...new Set(cases.map((c) => c.jurisdiction))].sort()
  const outcomes = [...new Set(cases.map((c) => c.outcome))].sort()

  categoryFilter.innerHTML = '<option value="">All Categories</option>'
  yearFilter.innerHTML = '<option value="">All Years</option>'
  jurisdictionFilter.innerHTML = '<option value="">All Courts</option>'
  outcomeFilter.innerHTML = '<option value="">All Outcomes</option>'

  categories.forEach((category) => {
    const option = document.createElement("option")
    option.value = category
    option.textContent = category
    categoryFilter.appendChild(option)
  })

  years.forEach((year) => {
    const option = document.createElement("option")
    option.value = year
    option.textContent = year
    yearFilter.appendChild(option)
  })

  jurisdictions.forEach((jurisdiction) => {
    const option = document.createElement("option")
    option.value = jurisdiction
    option.textContent = jurisdiction
    jurisdictionFilter.appendChild(option)
  })

  outcomes.forEach((outcome) => {
    const option = document.createElement("option")
    option.value = outcome
    option.textContent = outcome
    outcomeFilter.appendChild(option)
  })
}

function updateStats() {
  if (!legalCasesDatabase || !legalCasesDatabase.cases) {
    return
  }

  const cases = legalCasesDatabase.cases
  const categories = legalCasesDatabase.categories || [...new Set(cases.map((c) => c.category))]

  document.getElementById("total-cases").textContent = cases.length
  document.getElementById("categories-count").textContent = categories.length
}

function searchSimilarCases(query) {
  if (!query.trim() || !legalCasesDatabase || !legalCasesDatabase.cases) {
    return []
  }

  const searchTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 2)

  const results = []
  const cases = legalCasesDatabase.cases

  cases.forEach((case_) => {
    let score = 0

    searchTerms.forEach((term) => {
      const titleMatches = (case_.title.toLowerCase().match(new RegExp(term, "g")) || []).length
      const summaryMatches = (case_.summary.toLowerCase().match(new RegExp(term, "g")) || []).length
      const keywordMatches = case_.keywords.filter((keyword) => keyword.toLowerCase().includes(term)).length
      const categoryMatches = case_.category.toLowerCase().includes(term) ? 1 : 0
      const jurisdictionMatches = case_.jurisdiction.toLowerCase().includes(term) ? 1 : 0
      const legalProvisionMatches = case_.legalProvisions
        ? case_.legalProvisions.filter((provision) => provision.toLowerCase().includes(term)).length
        : 0

      score += titleMatches * 6
      score += keywordMatches * 4
      score += categoryMatches * 5
      score += jurisdictionMatches * 3
      score += summaryMatches * 2
      score += legalProvisionMatches * 4

      if (case_.title.toLowerCase().includes(term)) score += 3
      if (case_.category.toLowerCase().includes(term)) score += 4

      const indianLegalTerms = [
        "ipc", "crpc", "cpc", "constitution", "supreme court",
        "high court", "tribunal", "act", "section", "article", "pil", "writ", "petition"
      ]
      if (indianLegalTerms.some((legalTerm) => term.includes(legalTerm))) {
        score += 2
      }
    })

    if (score > 0) {
      results.push({
        ...case_,
        score,
        relevance: Math.min(100, Math.round((score / Math.max(searchTerms.length, 1)) * 8)),
      })
    }
  })

  return results.sort((a, b) => b.score - a.score)
}

function applyFilters(results) {
  return results.filter((case_) => {
    return (
      (!currentFilters.category || case_.category === currentFilters.category) &&
      (!currentFilters.year || case_.year.toString() === currentFilters.year) &&
      (!currentFilters.jurisdiction || case_.jurisdiction === currentFilters.jurisdiction) &&
      (!currentFilters.outcome || case_.outcome === currentFilters.outcome)
    )
  })
}

function sortResults(results, sortBy) {
  const sortedResults = [...results]

  switch (sortBy) {
    case "year":
      return sortedResults.sort((a, b) => b.year - a.year)
    case "year-old":
      return sortedResults.sort((a, b) => a.year - b.year)
    case "title":
      return sortedResults.sort((a, b) => a.title.localeCompare(b.title))
    case "relevance":
    default:
      return sortedResults.sort((a, b) => b.score - a.score)
  }
}

function displayResults(cases) {
  resultsContainer.innerHTML = ""

  if (cases.length === 0) {
    resultsSection.style.display = "none"
    resultsSummary.style.display = "none"
    noResultsSection.style.display = "block"
    return
  }

  noResultsSection.style.display = "none"
  resultsSection.style.display = "block"
  resultsSummary.style.display = "flex"

  updateResultsSummary(cases)

  cases.forEach((case_, index) => {
    const caseCard = document.createElement("div")
    caseCard.className = "case-card"
    caseCard.style.animationDelay = `${index * 0.1}s`

    // Helper to format currency safely
    const formatIndianCurrency = (text) => {
      // Security: Escape text first, then add the bold tag
      return escapeHTML(text).replace(/₹(\d+)/g, "<strong>₹$1</strong>")
    }

    // Helper to format provisions safely
    const formatLegalProvisions = (provisions) => {
      if (!provisions || provisions.length === 0) return ""
      // Security: Escape each provision before joining
      const safeProvisions = provisions.map(p => escapeHTML(p)).join(", ")
      return `<div class="legal-provisions">
        <strong>Legal Provisions:</strong> ${safeProvisions}
      </div>`
    }

    // Security: Use escapeHTML on all dynamic values injected into innerHTML
    caseCard.innerHTML = `
      <div class="case-header">
        <h3 class="case-title">${escapeHTML(case_.title)}</h3>
        <div class="relevance-score">${escapeHTML(case_.relevance)}% Match</div>
      </div>
      <div class="case-meta">
        <span class="case-year">${escapeHTML(case_.year)}</span>
        <span class="case-category">${escapeHTML(case_.category)}</span>
        <span class="case-jurisdiction">${escapeHTML(case_.jurisdiction)}</span>
        <span class="case-outcome">${escapeHTML(case_.outcome)}</span>
      </div>
      ${case_.caseNumber ? `<div class="case-number"><strong>Case No:</strong> ${escapeHTML(case_.caseNumber)}</div>` : ""}
      ${case_.judge ? `<div class="case-judge"><strong>Judge:</strong> ${escapeHTML(case_.judge)}</div>` : ""}
      <p class="case-summary">${formatIndianCurrency(case_.summary)}</p>
      ${formatLegalProvisions(case_.legalProvisions)}
      <div class="case-actions">
        <button class="read-more-btn" onclick="handleReadMore(${case_.id})">
          📖 Read More
        </button>
        <button class="bookmark-btn" onclick="handleBookmark(${case_.id})" title="Bookmark this case">
          🔖
        </button>
      </div>
    `

    resultsContainer.appendChild(caseCard)
  })

  resultsSummary.scrollIntoView({ behavior: "smooth", block: "start" })
}

function updateResultsSummary(cases) {
  const resultsCount = document.getElementById("results-count")
  const avgRelevance = document.getElementById("avg-relevance")
  const commonCategory = document.getElementById("common-category")

  resultsCount.textContent = `${cases.length} Similar Case${cases.length !== 1 ? "s" : ""} Found`

  const avgRel = Math.round(cases.reduce((sum, case_) => sum + case_.relevance, 0) / cases.length)
  avgRelevance.textContent = `${avgRel}%`

  const categoryCount = {}
  cases.forEach((case_) => {
    categoryCount[case_.category] = (categoryCount[case_.category] || 0) + 1
  })

  const mostCommon = Object.keys(categoryCount).reduce((a, b) => (categoryCount[a] > categoryCount[b] ? a : b))
  commonCategory.textContent = mostCommon
}

function handleSearch() {
  const query = caseInput.value.trim()

  if (!query) {
    showNotification("Please enter a description of your legal case.", "warning")
    return
  }

  if (!legalCasesDatabase || !legalCasesDatabase.cases) {
    showNotification("Legal cases database not loaded. Please refresh the page.", "error")
    return
  }

  searchBtn.disabled = true
  buttonText.style.display = "none"
  loadingSpinner.style.display = "block"

  // PERFORMANCE FIX: Removed unnecessary setTimeout (1800ms delay)
  try {
    let results = searchSimilarCases(query)
    results = applyFilters(results)
    results = sortResults(results, sortSelect.value)

    currentResults = results
    displayResults(results)
    addToSearchHistory(query, results.length)
  } catch (error) {
    console.error("Search error:", error)
    showNotification("Error performing search. Please try again.", "error")
  } finally {
    searchBtn.disabled = false
    buttonText.style.display = "block"
    loadingSpinner.style.display = "none"
  }
}

function handleClear() {
  caseInput.value = ""
  resultsSection.style.display = "none"
  resultsSummary.style.display = "none"
  noResultsSection.style.display = "none"

  categoryFilter.value = ""
  yearFilter.value = ""
  jurisdictionFilter.value = ""
  outcomeFilter.value = ""
  currentFilters = { category: "", year: "", jurisdiction: "", outcome: "" }

  caseInput.focus()
  showNotification("Search cleared successfully!", "info")
}

function toggleFilters() {
  const isVisible = filtersSection.style.display !== "none"

  if (isVisible) {
    filtersSection.style.display = "none"
    filterToggleText.textContent = "Show Advanced Filters"
    filterArrow.classList.remove("rotated")
  } else {
    filtersSection.style.display = "block"
    filterToggleText.textContent = "Hide Advanced Filters"
    filterArrow.classList.add("rotated")
  }
}

function applyFiltersToResults() {
  currentFilters = {
    category: categoryFilter.value,
    year: yearFilter.value,
    jurisdiction: jurisdictionFilter.value,
    outcome: outcomeFilter.value,
  }

  if (currentResults.length > 0) {
    let filteredResults = applyFilters(currentResults)
    filteredResults = sortResults(filteredResults, sortSelect.value)
    displayResults(filteredResults)
  }

  showNotification("Filters applied successfully!", "success")
}

function handleSuggestionClick(query) {
  caseInput.value = query
  handleSearch()
}

function handleReadMore(caseId) {
  if (!legalCasesDatabase || !legalCasesDatabase.cases) {
    showNotification("Case details not available.", "error")
    return
  }

  const case_ = legalCasesDatabase.cases.find((c) => c.id === caseId)
  if (case_) {
    showCaseModal(case_)
  }
}

function handleBookmark(caseId) {
  const bookmarks = JSON.parse(localStorage.getItem("indian-legal-bookmarks") || "[]")
  const case_ = legalCasesDatabase.cases.find((c) => c.id === caseId)

  if (case_ && !bookmarks.find((b) => b.id === caseId)) {
    bookmarks.push(case_)
    localStorage.setItem("indian-legal-bookmarks", JSON.stringify(bookmarks))
    showNotification("Case bookmarked successfully!", "success")
  } else {
    showNotification("Case already bookmarked!", "info")
  }
}

function showCaseModal(case_) {
  const legalProvisions = case_.legalProvisions ? case_.legalProvisions.join("\n• ") : "Not specified"

  const modalContent = `
🏛️ INDIAN LEGAL CASE DETAILS

📋 Case Title: ${case_.title}
📅 Year: ${case_.year}
📄 Case Number: ${case_.caseNumber || "Not specified"}
👨‍⚖️ Judge: ${case_.judge || "Not specified"}
⚖️ Legal Category: ${case_.category}
🏢 Court/Jurisdiction: ${case_.jurisdiction}
🎯 Case Outcome: ${case_.outcome}

📝 Case Summary:
${case_.summary}

📚 Legal Provisions:
• ${legalProvisions}

🔍 Keywords: ${case_.keywords.join(", ")}

💡 Note: This information is for reference purposes only. Please consult with a qualified legal practitioner for specific legal advice.
  `

  alert(modalContent)
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = message

  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "1rem 1.5rem",
    borderRadius: "12px",
    color: "white",
    fontWeight: "500",
    zIndex: "1000",
    transform: "translateX(100%)",
    transition: "transform 0.3s ease",
    maxWidth: "400px",
    fontSize: "0.9rem",
    lineHeight: "1.4",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
  })

  const colors = {
    success: "#16a34a",
    warning: "#f59e0b",
    error: "#dc2626",
    info: "#3b82f6",
  }
  notification.style.backgroundColor = colors[type] || colors.info

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, 4000)
}

function addToSearchHistory(query, resultCount) {
  const history = JSON.parse(localStorage.getItem("indian-legalease-search-history") || "[]")
  const searchEntry = {
    query,
    resultCount,
    timestamp: new Date().toISOString(),
    locale: "India",
  }

  history.unshift(searchEntry)
  history.splice(15)

  localStorage.setItem("indian-legalease-search-history", JSON.stringify(history))
}

function setupEventListeners() {
  searchBtn.addEventListener("click", handleSearch)
  clearBtn.addEventListener("click", handleClear)

  caseInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSearch()
    }
  })

  caseInput.addEventListener("input", function () {
    this.style.height = "auto"
    this.style.height = this.scrollHeight + "px"
  })

  toggleFiltersBtn.addEventListener("click", toggleFilters)
  applyFiltersBtn.addEventListener("click", applyFiltersToResults)

  sortSelect.addEventListener("change", () => {
    if (currentResults.length > 0) {
      const sortedResults = sortResults(currentResults, sortSelect.value)
      displayResults(sortedResults)
    }
  })

  suggestionChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const query = chip.getAttribute("data-query")
      handleSuggestionClick(query)
    })
  })
}

document.addEventListener("DOMContentLoaded", initializeApp)

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && !legalCasesDatabase) {
    console.log("Page became visible and data not loaded, reinitializing...")
    initializeApp()
  }
})
