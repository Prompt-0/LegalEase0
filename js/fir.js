    // Global variables
    let firPortalsData = []
    let filteredData = []
    let currentFilter = "all"

    // DOM Elements
    const searchInput = document.getElementById("searchInput")
    const clearSearchBtn = document.getElementById("clearSearch")
    const stateSelect = document.getElementById("stateSelect")
    const statesGrid = document.getElementById("statesGrid")
    const loadingContainer = document.getElementById("loadingContainer")
    const resultsInfo = document.getElementById("resultsInfo")
    const resultsCount = document.getElementById("resultsCount")
    const resetFiltersBtn = document.getElementById("resetFilters")
    const noResults = document.getElementById("noResults")
    const totalStatesSpan = document.getElementById("totalStates")
    const mobileMenuBtn = document.getElementById("mobileMenuBtn")
    const mobileNav = document.getElementById("mobileNav")
    const filterButtons = document.querySelectorAll(".filter-btn")

    // Initialize the application
    document.addEventListener("DOMContentLoaded", () => {
    initializeApp()
    setupEventListeners()
    })

    // Initialize the application
    async function initializeApp() {
    showLoading()
    try {
        await loadFIRPortalsData()
        populateStateDropdown()
        renderStates(firPortalsData)
        updateResultsInfo()
        updateTotalStates()
    } catch (error) {
        console.error("Error initializing app:", error)
        showError("Failed to load FIR portals data. Please refresh the page.")
    } finally {
        hideLoading()
    }
    }

    // Load FIR portals data from JSON file
    async function loadFIRPortalsData() {
    try {
        const response = await fetch("data/fir.json")
        if (!response.ok) {
        throw new Error("Failed to fetch data")
        }
        const data = await response.json()
        firPortalsData = data.firPortals
        filteredData = [...firPortalsData]
    } catch (error) {
        // Fallback data if JSON file is not available
        firPortalsData = getFallbackData()
        filteredData = [...firPortalsData]
    }
    }

    // Setup event listeners
    function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener("input", debounce(handleSearch, 300))
    clearSearchBtn.addEventListener("click", clearSearch)

    // Dropdown functionality
    stateSelect.addEventListener("change", handleStateSelect)

    // Filter buttons
    filterButtons.forEach((btn) => {
        btn.addEventListener("click", handleFilterChange)
    })

    // Reset filters
    resetFiltersBtn.addEventListener("click", resetAllFilters)

    // Mobile menu
    mobileMenuBtn.addEventListener("click", toggleMobileMenu)

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
        if (!mobileMenuBtn.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove("active")
        }
    })

    // Show/hide clear search button
    searchInput.addEventListener("input", function () {
        clearSearchBtn.style.display = this.value ? "block" : "none"
    })
    }

    // Handle search input
    function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim()
    applyFilters(searchTerm, stateSelect.value, currentFilter)
    }

    // Handle state selection from dropdown
    function handleStateSelect(e) {
    const selectedStateId = e.target.value
    applyFilters(searchInput.value.toLowerCase().trim(), selectedStateId, currentFilter)
    }

    // Handle filter button changes
    function handleFilterChange(e) {
    const filterValue = e.target.dataset.filter

    // Update active filter button
    filterButtons.forEach((btn) => btn.classList.remove("active"))
    e.target.classList.add("active")

    currentFilter = filterValue
    applyFilters(searchInput.value.toLowerCase().trim(), stateSelect.value, filterValue)
    }

    // Apply all filters
    function applyFilters(searchTerm = "", stateId = "", filter = "all") {
    let filtered = [...firPortalsData]

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(
        (state) =>
            state.name.toLowerCase().includes(searchTerm) ||
            state.fullName.toLowerCase().includes(searchTerm) ||
            state.region.toLowerCase().includes(searchTerm),
        )
    }

    // Apply state selection filter
    if (stateId) {
        filtered = filtered.filter((state) => state.id === stateId)
    }

    // Apply status filter
    if (filter !== "all") {
        switch (filter) {
        case "active":
            filtered = filtered.filter((state) => state.status === "active")
            break
        case "popular":
            filtered = filtered.filter((state) => state.popular === true)
            break
        }
    }

    filteredData = filtered
    renderStates(filteredData)
    updateResultsInfo()
    }

    // Clear search
    function clearSearch() {
    searchInput.value = ""
    clearSearchBtn.style.display = "none"
    applyFilters("", stateSelect.value, currentFilter)
    }

    // Reset all filters
    function resetAllFilters() {
    searchInput.value = ""
    stateSelect.value = ""
    clearSearchBtn.style.display = "none"

    // Reset filter buttons
    filterButtons.forEach((btn) => btn.classList.remove("active"))
    document.querySelector('[data-filter="all"]').classList.add("active")

    currentFilter = "all"
    filteredData = [...firPortalsData]
    renderStates(filteredData)
    updateResultsInfo()
    }

    // Populate state dropdown
    function populateStateDropdown() {
    const sortedStates = [...firPortalsData].sort((a, b) => a.name.localeCompare(b.name))

    stateSelect.innerHTML = '<option value="">All States & UTs</option>'

    sortedStates.forEach((state) => {
        const option = document.createElement("option")
        option.value = state.id
        option.textContent = state.name
        stateSelect.appendChild(option)
    })
    }

    // Render states grid
    function renderStates(states) {
    if (states.length === 0) {
        statesGrid.style.display = "none"
        noResults.style.display = "block"
        return
    }

    statesGrid.style.display = "grid"
    noResults.style.display = "none"

    statesGrid.innerHTML = states.map((state) => createStateCard(state)).join("")

    // Add click event listeners to info buttons
    document.querySelectorAll(".info-button").forEach((btn) => {
        btn.addEventListener("click", function () {
        const stateId = this.dataset.stateId
        showStateInfo(stateId)
        })
    })
    }

    // Create state card HTML
    function createStateCard(state) {
    const statusClass = state.status === "active" ? "status-active" : "status-maintenance"
    const statusText = state.status === "active" ? "Active" : "Maintenance"

    return `
            <div class="state-card" data-state="${state.id}">
                <div class="state-header">
                    <div>
                        <h3 class="state-name">${state.name}</h3>
                        <div class="state-region">${state.region}</div>
                    </div>
                    <span class="state-status ${statusClass}">${statusText}</span>
                </div>
                <p class="state-info">${state.info}</p>
                <div class="state-features">
                    ${state.features.map((feature) => `<span class="feature-tag">${feature}</span>`).join("")}
                </div>
                <div class="state-actions">
                    <a href="${state.url}" target="_blank"  class="fir-button">
                        <i class="fas fa-external-link-alt"></i>
                        Access FIR Portal
                    </a>
                    <button class="info-button" data-state-id="${state.id}" title="More Information">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </div>
        `
    }
    // rel="noopener noreferrer"

    // Show state information modal (simplified version)
    function showStateInfo(stateId) {
    const state = firPortalsData.find((s) => s.id === stateId)
    if (state) {
        alert(
        `${state.name} FIR Portal Information:\n\n${state.fullName}\n\nFeatures:\n${state.features.join("\n")}\n\nStatus: ${state.status}\n\nLast Updated: ${state.lastUpdated}`,
        )
    }
    }

    // Update results information
    function updateResultsInfo() {
    const count = filteredData.length
    const total = firPortalsData.length

    if (count === total) {
        resultsCount.textContent = `Showing all ${total} states & UTs`
    } else {
        resultsCount.textContent = `Showing ${count} of ${total} results`
    }

    resultsInfo.style.display = count > 0 ? "flex" : "none"
    }

    // Update total states counter
    function updateTotalStates() {
    if (totalStatesSpan) {
        totalStatesSpan.textContent = firPortalsData.length
    }
    }

    // Toggle mobile menu
    function toggleMobileMenu() {
    mobileNav.classList.toggle("active")
    }

    // Show loading state
    function showLoading() {
    loadingContainer.style.display = "block"
    statesGrid.style.display = "none"
    resultsInfo.style.display = "none"
    noResults.style.display = "none"
    }

    // Hide loading state
    function hideLoading() {
    loadingContainer.style.display = "none"
    }

    // Show error message
    function showError(message) {
    statesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: #fee2e2; border: 1px solid #fecaca; border-radius: 12px; color: #dc2626;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <h3>Error Loading Data</h3>
                <p>${message}</p>
            </div>
        `
    }

    // Debounce function for search
    function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
        clearTimeout(timeout)
        func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
    }

    // Global function for reset button in no results section
    window.resetAllFilters = resetAllFilters
