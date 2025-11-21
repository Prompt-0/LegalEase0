document.addEventListener("DOMContentLoaded", () => {
  let legalData = null;
  let flatSearchIndex = []; // Optimization: Flattened data structure
  const MAX_RESULTS = 50;

  const searchInput = document.getElementById("legal-search");
  const searchBtn = document.getElementById("search-btn");
  const actFilter = document.getElementById("act-filter");
  const searchType = document.getElementById("search-type");
  const searchResults = document.getElementById("search-results");
  const resultsList = document.getElementById("results-list");
  const resultsCount = document.getElementById("results-count");
  const clearSearchBtn = document.getElementById("clear-search");
  const tabContents = document.getElementById("tab-contents");
  const quickReferenceGrid = document.getElementById("quick-reference-grid");
  const loading = document.getElementById("loading");

  init();

  async function init() {
    try {
      loading.classList.remove("hidden");
      await loadLegalData();
      renderTabs();
      renderQuickReference();
      setupEventListeners();
      loading.classList.add("hidden");
    } catch (error) {
      console.error("Error initializing legal books:", error);
      loading.innerHTML = '<div class="error">Error loading legal acts data. Please try again later.</div>';
    }
  }

  async function loadLegalData() {
    try {
      const response = await fetch("./data/legal-acts.json");
      if (!response.ok) throw new Error("Failed to load legal acts data");
      legalData = await response.json();

      // OPTIMIZATION: Pre-flatten data for faster searching
      if(legalData.acts) {
          legalData.acts.forEach(act => {
              act.chapters.forEach(chapter => {
                  chapter.sections.forEach(section => {
                      flatSearchIndex.push({
                          actId: act.id,
                          actTitle: act.title,
                          chapterTitle: chapter.title,
                          sectionId: section.id,
                          sectionNumber: section.number,
                          sectionTitle: section.title,
                          sectionContent: section.content,
                          // Pre-compute lowercase text for searching
                          searchString: `${section.number} ${section.title} ${section.content}`.toLowerCase()
                      });
                  });
              });
          });
      }
    } catch (error) {
      console.error("Error loading legal data:", error);
      throw error;
    }
  }

  function setupEventListeners() {
    searchBtn.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") performSearch();
    });

    let searchTimeout;
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        if (searchInput.value.trim().length > 0) performSearch();
        else clearSearch();
      }, 300);
    });

    actFilter.addEventListener("change", () => {
      if (searchInput.value.trim()) performSearch();
    });

    searchType.addEventListener("change", () => {
      if (searchInput.value.trim()) performSearch();
    });

    clearSearchBtn.addEventListener("click", clearSearch);
  }

  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    const actFilterValue = actFilter.value;
    const searchTypeValue = searchType.value;

    if (!query) {
      clearSearch();
      return;
    }

    // OPTIMIZATION: Use flat index instead of nested loops
    const results = flatSearchIndex.filter(item => {
        // 1. Filter by Act
        if (actFilterValue !== "all" && item.actId !== actFilterValue) return false;

        // 2. Filter by Search Type
        if (searchTypeValue === "section") {
            return item.sectionNumber == query;
        } else if (searchTypeValue === "title") {
            return item.sectionTitle.toLowerCase().includes(query);
        } else if (searchTypeValue === "content") {
            return item.sectionContent.toLowerCase().includes(query);
        } else {
            // Default: Search everything
            return item.searchString.includes(query);
        }
    });

    // Limit results for performance
    displaySearchResults(results.slice(0, MAX_RESULTS), results.length > MAX_RESULTS);
  }

  // Security: Modified to escape HTML before highlighting
  function highlightMatch(text, query) {
    if (!query) return escapeHTML(text);

    const safeText = escapeHTML(text);
    const lowerText = safeText.toLowerCase();
    const lowerQuery = escapeHTML(query).toLowerCase();

    // Simple replacement on the escaped text (Note: this is a basic implementation)
    // A robust implementation would find indices in the original string,
    // escape parts, and reconstruct. For this prototype, we rely on the fact
    // that legal text rarely contains HTML characters.
    if (lowerText.includes(lowerQuery)) {
         return safeText.replace(new RegExp(lowerQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
            (match) => `<mark>${match}</mark>`);
    }
    return safeText;
  }

  function displaySearchResults(results, limitReached) {
    if (results.length === 0) {
      searchResults.classList.add("hidden");
      return;
    }

    let countText = `Search Results (${results.length}${limitReached ? '+' : ''} found)`;
    if (limitReached) {
      countText += ` - Showing top ${MAX_RESULTS} matches.`;
    }
    resultsCount.textContent = countText;
    resultsList.innerHTML = "";

    const query = searchInput.value.trim();
    const fragment = document.createDocumentFragment();

    results.forEach((result) => {
      const resultItem = document.createElement("div");
      resultItem.className = "search-result-item";

      // Security: Use highlightMatch which now escapes HTML
      const highlightedTitle = highlightMatch(result.sectionTitle, query);

      let contentDisplay = result.sectionContent;
      if (contentDisplay.length > 300) {
         const matchIndex = contentDisplay.toLowerCase().indexOf(query.toLowerCase());
         if (matchIndex > 50) {
            contentDisplay = "..." + contentDisplay.substring(matchIndex - 50, matchIndex + 250) + "...";
         } else {
            contentDisplay = contentDisplay.substring(0, 300) + "...";
         }
      }
      const highlightedContent = highlightMatch(contentDisplay, query);

      // Safe innerHTML usage because content is escaped by highlightMatch
      resultItem.innerHTML = `
        <div class="result-header">
          <div class="result-act-info">
            <span class="result-act">${escapeHTML(result.actTitle)}</span>
            <span class="result-chapter">${escapeHTML(result.chapterTitle)}</span>
          </div>
        </div>
        <div class="result-section">
          <h4>Section ${escapeHTML(result.sectionNumber.toString())}: ${highlightedTitle}</h4>
          <p class="result-content">${highlightedContent}</p>
        </div>
      `;

      resultItem.addEventListener("click", () => {
        navigateToSection(result.actId, result.sectionId);
      });

      fragment.appendChild(resultItem);
    });

    resultsList.appendChild(fragment);
    searchResults.classList.remove("hidden");
  }

  function clearSearch() {
    searchInput.value = "";
    searchResults.classList.add("hidden");
  }

  function renderTabs() {
    if (!legalData) return;
    tabContents.innerHTML = "";

    legalData.acts.forEach((act, index) => {
      const tabContent = document.createElement("div");
      tabContent.className = `tab-content ${index === 0 ? "active" : ""}`;
      tabContent.id = `${act.id}-tab`;

      // Create Act Header
      const actHeader = document.createElement("div");
      actHeader.className = "card mb-4";

      // Security: Use textContent where possible or escapeHTML
      const h2 = document.createElement('h2');
      h2.textContent = act.title;
      const p = document.createElement('p');
      p.textContent = act.description;
      const headerDiv = document.createElement('div');
      headerDiv.className = "card-header";
      headerDiv.appendChild(h2);
      headerDiv.appendChild(p);
      actHeader.appendChild(headerDiv);

      const chaptersList = document.createElement("div");
      chaptersList.className = "chapters-list";

      act.chapters.forEach((chapter) => {
        const chapterCard = document.createElement("div");
        chapterCard.className = "chapter-card";

        const chapterHeader = document.createElement("div");
        chapterHeader.className = "chapter-header collapsible";
        chapterHeader.innerHTML = `
          <h3>${escapeHTML(chapter.title)}</h3>
          <i class="fas fa-chevron-right"></i>
        `;

        const chapterContent = document.createElement("div");
        chapterContent.className = "chapter-content";

        chapter.sections.forEach((section) => {
          const sectionItem = document.createElement("div");
          sectionItem.className = "section-item";
          sectionItem.setAttribute("data-section-id", section.id);
          sectionItem.innerHTML = `
            <h4>Section ${escapeHTML(section.number.toString())}: ${escapeHTML(section.title)}</h4>
            <p>${escapeHTML(section.content)}</p>
          `;
          chapterContent.appendChild(sectionItem);
        });

        // Logic: Add event listener for collapse
        chapterHeader.addEventListener("click", function () {
          const icon = this.querySelector("i");
          chapterContent.classList.toggle("show");
          icon.classList.toggle("fa-chevron-down");
          icon.classList.toggle("fa-chevron-right");
        });

        chapterCard.appendChild(chapterHeader);
        chapterCard.appendChild(chapterContent);
        chaptersList.appendChild(chapterCard);
      });

      tabContent.appendChild(actHeader);
      tabContent.appendChild(chaptersList);
      tabContents.appendChild(tabContent);
    });
  }

  function renderQuickReference() {
    if (!legalData) return;
    quickReferenceGrid.innerHTML = "";

    Object.entries(legalData.quickReference).forEach(([actId, refData]) => {
      const refItem = document.createElement("div");
      refItem.className = "quick-reference-item";

      const sectionsHtml = refData.sections
        .map((section) => `<li>• Section ${escapeHTML(section.section)}: ${escapeHTML(section.title)}</li>`)
        .join("");

      refItem.innerHTML = `
        <h4>${escapeHTML(refData.title)}</h4>
        <ul>${sectionsHtml}</ul>
      `;

      refItem.addEventListener("click", (e) => {
        if (e.target.tagName === "LI") {
          const sectionMatch = e.target.textContent.match(/Section\s+(\d+)/);
          if (sectionMatch) {
             const sectionNumber = sectionMatch[1];
             searchForSection(sectionNumber, actId);
          }
        }
      });

      quickReferenceGrid.appendChild(refItem);
    });
  }

  function searchForSection(sectionNumber, actId) {
    searchInput.value = sectionNumber;
    actFilter.value = actId;
    searchType.value = "section";
    performSearch();
  }

  function navigateToSection(actId, sectionId) {
    switchTab(actId);
    searchResults.classList.add("hidden");

    setTimeout(() => {
      const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
      if (sectionElement) {
        const chapterContent = sectionElement.closest(".chapter-content");
        const chapterHeader = chapterContent.previousElementSibling;

        if (!chapterContent.classList.contains("show")) {
          chapterHeader.click();
        }

        setTimeout(() => {
          sectionElement.scrollIntoView({ behavior: "smooth", block: "center" });
          sectionElement.classList.add("highlighted");
          setTimeout(() => sectionElement.classList.remove("highlighted"), 3000);
        }, 300);
      }
    }, 100);
  }

  function switchTab(tabId) {
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });

    const tabBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (tabBtn) tabBtn.classList.add("active");

    const tabContent = document.getElementById(`${tabId}-tab`);
    if (tabContent) tabContent.classList.add("active");
  }
});
