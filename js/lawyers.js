    // Reference DOM elements
    const searchInput = document.getElementById("search");
    const specializationSelect = document.getElementById("specialization");
    const locationSelect = document.getElementById("location");
    const searchBtn = document.getElementById("search-lawyers-btn");
    const resultsSection = document.getElementById("lawyers-results");
    const noResultsSection = document.getElementById("no-lawyers-found");
    const lawyersGrid = document.getElementById("lawyers-grid");
    const lawyersCount = document.getElementById("lawyers-count");
    const showAllBtn = document.getElementById("show-all-lawyers-btn");

    let lawyersData = []; // Will hold the fetched data

    // Render lawyer cards to grid
    function renderLawyers(lawyers) {
    lawyersGrid.innerHTML = ""; // clear previous results
    lawyers.forEach(lawyer => {
        const card = document.createElement("div");
        card.classList.add("lawyer-card");
        card.innerHTML = `
        <div class="card">
            <div class="card-body">
            <h3 class="lawyer-name">${lawyer.name}</h3>
            <p><strong>Specialization:</strong> ${lawyer.specialization}</p>
            <p><strong>Location:</strong> ${lawyer.location}</p>
            <p><strong>Experience:</strong> ${lawyer.experience}</p>
            <p><strong>Contact:</strong> <a href="tel:${lawyer.phone}">${lawyer.phone}</a></p>
            </div>
        </div>
        `;
        lawyersGrid.appendChild(card);
    });
    }

    // Perform search/filter
    function searchLawyers() {
    const query = searchInput.value.trim().toLowerCase();
    const specialization = specializationSelect.value;
    const location = locationSelect.value;

    const filtered = lawyersData.filter(lawyer => {
        const matchesQuery =
        query === "" ||
        lawyer.name.toLowerCase().includes(query) ||
        lawyer.specialization.toLowerCase().includes(query);

        const matchesSpecialization =
        specialization === "all" || lawyer.specialization === specialization;

        const matchesLocation =
        location === "all" || lawyer.location === location;

        return matchesQuery && matchesSpecialization && matchesLocation;
    });

    if (filtered.length > 0) {
        resultsSection.classList.remove("hidden");
        noResultsSection.classList.add("hidden");
        lawyersCount.textContent = `Available Lawyers (${filtered.length} found)`;
        renderLawyers(filtered);
    } else {
        resultsSection.classList.add("hidden");
        noResultsSection.classList.remove("hidden");
    }
    }

    // Show all lawyers when "Show All Lawyers" is clicked
    function showAllLawyers() {
    searchInput.value = "";
    specializationSelect.value = "all";
    locationSelect.value = "all";
    lawyersCount.textContent = `Available Lawyers (${lawyersData.length} found)`;
    renderLawyers(lawyersData);
    resultsSection.classList.remove("hidden");
    noResultsSection.classList.add("hidden");
    }

    // Event listeners
    searchBtn.addEventListener("click", searchLawyers);
    showAllBtn.addEventListener("click", showAllLawyers);

    // Load data from lawyers.json on page load
    fetch("data/lawyers.json")
    .then(response => {
        if (!response.ok) {
        throw new Error("Failed to load lawyers.json");
        }
        return response.json();
    })
    .then(data => {
        lawyersData = data;
        showAllLawyers();
    })
    .catch(error => {
        console.error("Error fetching lawyers data:", error);
        noResultsSection.classList.remove("hidden");
        noResultsSection.querySelector("h3").textContent = "Failed to load lawyers";
        noResultsSection.querySelector("p").textContent = "Please try again later.";
    });
