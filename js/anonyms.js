
    document.getElementById("tip-form").addEventListener("submit", async function(e) {
    e.preventDefault();

    const form = e.target;

    const formData = new FormData();
    formData.append("category", document.getElementById("category").value);
    formData.append("urgency", document.getElementById("urgency").value);
    formData.append("location", document.getElementById("location").value);
    formData.append("description", document.getElementById("description").value);

    const fileInput = document.getElementById("evidence-upload");
    if (fileInput.files.length > 0) {
        formData.append("evidence", fileInput.files[0]);
    }

    try {
        const response = await fetch("https://legalease-anonymous.onrender.com/submit-tips/", {
        method: "POST",
        body: formData
        });

        const data = await response.json();

        if (response.ok) {
        alert("Tip submitted successfully! Keep your key safe: " + data.access_key);
        form.reset();
        } else {
        alert("Submission failed: " + (data.detail || "Unknown error"));
        }
    } catch (err) {
        console.error("Error submitting tip:", err);
        alert("There was a problem submitting your tip. Try again.");
    }
    });