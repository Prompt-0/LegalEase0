document.getElementById("tip-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = document.getElementById("submit-tip-btn");
    const originalBtnText = submitBtn.innerHTML;

    // Visual feedback
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    // Collect data
    const formData = new FormData(form);

    // SIMULATION: Log data instead of failing fetch
    console.log("Anonymous Tip Submitted:", Object.fromEntries(formData));
    if(document.getElementById("evidence-upload").files.length > 0) {
        console.log("Evidence file attached:", document.getElementById("evidence-upload").files[0].name);
    }

    // Simulate network delay
    setTimeout(() => {
        // Show success
        alert("Tip submitted successfully! (Demo Mode)\n\nYour Access Key: AN-" + Math.random().toString(36).substr(2, 9).toUpperCase());

        form.reset();
        document.getElementById("file-selected").classList.add("hidden");

        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }, 1500);
});
