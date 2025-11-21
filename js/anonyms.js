document.getElementById("tip-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = document.getElementById("submit-tip-btn");
    const originalBtnText = submitBtn.innerHTML;

    // Visual feedback
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Encrypting & Submitting...';

    // Collect data
    const formData = new FormData(form);
    const reportData = Object.fromEntries(formData.entries());

    // Add metadata
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    reportData.id = "AN-" + array[0].toString(36).toUpperCase();
    reportData.timestamp = new Date().toISOString();
    reportData.status = "Received";

    // SIMULATION: Save to LocalStorage to persist data (Demo Backend)
    try {
        const existingReports = JSON.parse(localStorage.getItem('legalease_reports') || '[]');
        existingReports.push(reportData);
        localStorage.setItem('legalease_reports', JSON.stringify(existingReports));

        console.log("Report saved to local storage:", reportData);
    } catch (err) {
        console.error("Storage failed", err);
    }

    // Simulate network delay
    setTimeout(() => {
        // Show success
        alert(`Report submitted successfully!\n\nYour Secret Access Key: ${reportData.id}\n\nPlease save this key to track your report status.`);

        form.reset();
        document.getElementById("file-selected").classList.add("hidden");

        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }, 1500);
});

// Handle file selection text
const fileInput = document.getElementById("evidence-upload");
if (fileInput) {
    fileInput.addEventListener("change", function() {
        const fileNameDisplay = document.getElementById("file-selected");
        if (this.files.length > 0) {
            fileNameDisplay.textContent = `Selected: ${this.files[0].name}`;
            fileNameDisplay.classList.remove("hidden");
        } else {
            fileNameDisplay.classList.add("hidden");
        }
    });
}
