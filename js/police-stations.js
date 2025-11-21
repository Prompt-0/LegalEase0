let policeData = { police_stations: [] };
let randomSample = [];

// Helper to normalize strings for searching
function normalize(str) {
  return str.toLowerCase().replace(/\s+/g, '');
}

// Helper to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function renderStations(stations) {
  const stationsGrid = document.getElementById('stations-grid');
  const stationsResults = document.getElementById('stations-results');
  const stationsCount = document.getElementById('stations-count');
  stationsGrid.innerHTML = '';

  stationsCount.textContent = `Police Stations (${stations.length} shown)`;

  if (stations.length === 0) {
    stationsResults.classList.remove('hidden');
    stationsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No stations found matching your criteria.</p>';
    return;
  }

  stations.forEach(station => {
    const card = document.createElement('div');
    card.classList.add('station-card');

    // Add distance badge if calculated
    let distanceHtml = '';
    if (station.distance !== undefined) {
        distanceHtml = `<span class="station-distance" style="float:right; color:#16a34a; font-weight:bold;">${station.distance.toFixed(1)} km away</span>`;
    }

    card.innerHTML = `
      ${distanceHtml}
      <h3>${station.name}</h3>
      <p><strong>Address:</strong> ${station.address}</p>
      <p><strong>Pincode:</strong> ${station.pincode}</p>
      <p><strong>District:</strong> ${station.district}</p>
      <p><strong>Phones:</strong> ${
        station.phones.length > 0
          ? station.phones.map(ph => `<a href="tel:${ph}">${ph}</a>`).join(', ')
          : 'N/A'
      }</p>
    `;
    stationsGrid.appendChild(card);
  });

  stationsResults.classList.remove('hidden');
}

function findStations() {
  const input = document.getElementById('location').value.trim();
  if (!input) {
    // No input? Show the initial random sample again
    renderStations(randomSample);
    return;
  }
  const inputNorm = normalize(input);

  const matches = policeData.police_stations.filter(station => {
    return normalize(station.address).includes(inputNorm) ||
           normalize(station.district).includes(inputNorm) ||
           normalize(station.pincode).includes(inputNorm);
  });

  renderStations(matches);
}

function useCurrentLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }

  const btn = document.getElementById('current-location-btn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';
  btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;

      // DELHI SPECIFIC CHECK (Issue #4 Fix)
      // Delhi Center approx: 28.6139, 77.2090
      const distFromDelhi = calculateDistance(latitude, longitude, 28.6139, 77.2090);

      if (distFromDelhi > 50) { // 50km radius allowance
            alert("📍 Location Alert:\n\nYou appear to be outside Delhi.\nCurrently, this service only supports locating Police Stations within Delhi.");
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
      }

      // Sort all stations by distance to user
      const sortedStations = policeData.police_stations.map(station => {
          const dist = calculateDistance(latitude, longitude, station.lat, station.lng);
          return { ...station, distance: dist };
      }).sort((a, b) => a.distance - b.distance);

      // Take top 10 closest
      const closest = sortedStations.slice(0, 10);

      renderStations(closest);
      document.getElementById('location').value = "Current Location";

      btn.innerHTML = originalText;
      btn.disabled = false;
    },
    (error) => {
        console.error(error);
        alert('Unable to retrieve your location. Please ensure location permissions are allowed.');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
  );
}

const findStationsBtn = document.getElementById('find-stations-btn');
if (findStationsBtn) findStationsBtn.addEventListener('click', findStations);

const currentLocationBtn = document.getElementById('current-location-btn');
if (currentLocationBtn) currentLocationBtn.addEventListener('click', useCurrentLocation);

// ✅ UPDATED: Fetch using explicit relative path (Issue #8 Fix)
fetch('./data/police_stations.json')
  .then(response => {
    if (!response.ok) throw new Error('Failed to load police stations data.');
    return response.json();
  })
  .then(data => {
    // Inject Mock Coordinates for Demo Purposes
    data.police_stations = data.police_stations.map(station => ({
        ...station,
        lat: 28.6139 + (Math.random() - 0.5) * 0.2,
        lng: 77.2090 + (Math.random() - 0.5) * 0.2
    }));

    policeData = data;
    console.log(`Loaded ${policeData.police_stations.length} police stations.`);

    const shuffled = policeData.police_stations
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    randomSample = shuffled.slice(0, 20);
    renderStations(randomSample);
  })
  .catch(err => {
    console.error(err);
    const stationsResults = document.getElementById('stations-results');
    if(stationsResults) stationsResults.innerHTML = "<p style='text-align:center; padding: 2rem;'>Unable to load police station data.</p>";
  });
