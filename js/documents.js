class LegalNoticeGenerator {
  constructor() {
    this.form = document.getElementById("noticeForm")
    this.previewSection = document.getElementById("previewSection")
    this.noticeContent = document.getElementById("noticeContent")
    this.downloadBtn = document.getElementById("downloadBtn")
    this.printBtn = document.getElementById("printBtn")
    this.editPdfBtn = document.getElementById("editPdfBtn")
    this.pdfEditorModal = document.getElementById("pdfEditorModal")
    this.closePdfEditor = document.getElementById("closePdfEditor")
    this.editableContent = document.getElementById("editableContent")
    this.saveEdits = document.getElementById("saveEdits")
    this.downloadEditedPDF = document.getElementById("downloadEditedPDF")
    this.realTimePreview = document.getElementById("realTimePreview")

    this.editedContent = null
    this.realTimeEnabled = true

    this.init()
  }

  init() {
    this.loadSavedData()
    this.bindEvents()
    this.setDefaultDate()
    this.setupRealTimePreview()
    this.showPreview() // Show preview immediately
  }

  bindEvents() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e))
    this.downloadBtn.addEventListener("click", () => this.downloadPDF())
    this.printBtn.addEventListener("click", () => this.printNotice())
    this.editPdfBtn.addEventListener("click", () => this.openPdfEditor())
    this.closePdfEditor.addEventListener("click", () => this.closePdfEditorModal())
    this.saveEdits.addEventListener("click", () => this.saveEditedContent())
    this.downloadEditedPDF.addEventListener("click", () => this.downloadEditedPDF())
    this.realTimePreview.addEventListener("change", (e) => this.toggleRealTimePreview(e))

    // Auto-save on input changes
    this.form.addEventListener("input", () => {
      this.saveData()
      if (this.realTimeEnabled) {
        this.updateRealTimePreview()
      }
    })

    // PDF Editor toolbar events
    this.setupEditorToolbar()

    // Close modal when clicking outside
    this.pdfEditorModal.addEventListener("click", (e) => {
      if (e.target === this.pdfEditorModal) {
        this.closePdfEditorModal()
      }
    })

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.pdfEditorModal.classList.contains("show")) {
        this.closePdfEditorModal()
      }
    })
  }

  setupRealTimePreview() {
    // Add visual indicators for form fields with content
    const formInputs = this.form.querySelectorAll("input, textarea, select")
    formInputs.forEach((input) => {
      input.addEventListener("input", () => {
        const formGroup = input.closest(".form-group")
        if (input.value.trim()) {
          formGroup.classList.add("has-content")
        } else {
          formGroup.classList.remove("has-content")
        }
      })
    })
  }

  setupEditorToolbar() {
    const editorBtns = document.querySelectorAll(".editor-btn")
    const fontSizeSelect = document.getElementById("fontSizeSelect")

    editorBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault()
        const action = btn.dataset.action
        this.executeEditorCommand(action, btn)
      })
    })

    fontSizeSelect.addEventListener("change", () => {
      document.execCommand("fontSize", false, "7")
      const fontElements = this.editableContent.querySelectorAll("font[size='7']")
      fontElements.forEach((el) => {
        el.removeAttribute("size")
        el.style.fontSize = fontSizeSelect.value + "pt"
      })
    })
  }

  executeEditorCommand(action, btn) {
    switch (action) {
      case "bold":
        document.execCommand("bold")
        btn.classList.toggle("active")
        break
      case "italic":
        document.execCommand("italic")
        btn.classList.toggle("active")
        break
      case "underline":
        document.execCommand("underline")
        btn.classList.toggle("active")
        break
    }
    this.editableContent.focus()
  }

  toggleRealTimePreview(e) {
    this.realTimeEnabled = e.target.checked
    if (this.realTimeEnabled) {
      this.updateRealTimePreview()
      this.previewSection.classList.add("real-time")
      this.noticeContent.classList.add("real-time-updating")
    } else {
      this.previewSection.classList.remove("real-time")
      this.noticeContent.classList.remove("real-time-updating")
    }
  }

  updateRealTimePreview() {
    const formData = this.getFormData()
    this.generateNotice(formData, true)

    // Add highlight animation to updated content
    this.noticeContent.classList.add("updated-field")
    setTimeout(() => {
      this.noticeContent.classList.remove("updated-field")
    }, 500)
  }

  openPdfEditor() {
    // Populate editor with current notice content
    const currentContent = this.noticeContent.innerHTML
    this.editableContent.innerHTML = currentContent
    this.pdfEditorModal.classList.add("show")
    document.body.style.overflow = "hidden"
  }

  closePdfEditorModal() {
    this.pdfEditorModal.classList.remove("show")
    document.body.style.overflow = "auto"
  }

  saveEditedContent() {
    this.editedContent = this.editableContent.innerHTML
    this.noticeContent.innerHTML = this.editedContent

    // Show success message
    const originalText = this.saveEdits.textContent
    this.saveEdits.textContent = "Saved!"
    this.saveEdits.style.background = "#10b981"

    setTimeout(() => {
      this.saveEdits.textContent = originalText
      this.saveEdits.style.background = "#059669"
    }, 2000)
  }

  setDefaultDate() {
    const today = new Date().toISOString().split("T")[0]
    document.getElementById("noticeDate").value = today
  }

  handleSubmit(e) {
    e.preventDefault()
    const formData = this.getFormData()

    if (this.validateForm(formData)) {
      this.generateNotice(formData)
      this.saveData()
      this.showPreview()
    }
  }

  getFormData() {
    return {
      advocateName: document.getElementById("advocateName").value.trim(),
      enrollmentNumber: document.getElementById("enrollmentNumber").value.trim(),
      advocateAddress: document.getElementById("advocateAddress").value.trim(),
      clientName: document.getElementById("clientName").value.trim(),
      clientAddress: document.getElementById("clientAddress").value.trim(),
      opponentName: document.getElementById("opponentName").value.trim(),
      opponentAddress: document.getElementById("opponentAddress").value.trim(),
      noticeSubject: document.getElementById("noticeSubject").value.trim(),
      noticeBody: document.getElementById("noticeBody").value.trim(),
      demandAmount: document.getElementById("demandAmount").value.trim(),
      compliancePeriod: document.getElementById("compliancePeriod").value,
      noticeDate: document.getElementById("noticeDate").value,
    }
  }

  validateForm(data) {
    const requiredFields = [
      "advocateName",
      "enrollmentNumber",
      "clientName",
      "opponentName",
      "noticeSubject",
      "noticeBody",
      "noticeDate",
    ]

    for (const field of requiredFields) {
      if (!data[field]) {
        if (!this.realTimeEnabled) {
          alert(`Please fill in the ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`)
          document.getElementById(field).focus()
          return false
        }
      }
    }
    return true
  }

  generateNotice(data, isRealTime = false) {
    const formattedDate = data.noticeDate
      ? new Date(data.noticeDate).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "<span class='placeholder-text'>[Date will appear here]</span>"

    const demandSection = data.demandAmount
      ? `<p class="section-title">DEMAND FOR PAYMENT:</p>
             <p>You are hereby called upon to pay the sum of Rs. <span class="highlight">${this.formatCurrency(data.demandAmount)}</span> (Rupees ${this.numberToWords(data.demandAmount)} only) along with interest and costs.</p>`
      : ""

    // Use placeholder text for empty fields in real-time mode
    const getFieldValue = (value, placeholder) => {
      if (isRealTime && !value) {
        return `<span class="placeholder-text">[${placeholder}]</span>`
      }
      return value || `[${placeholder}]`
    }

    const noticeTemplate = `
            <div class="notice-header">
                <div class="notice-title">LEGAL NOTICE</div>
                <div class="notice-subtitle">Under Section 80 of the Code of Civil Procedure, 1908</div>
            </div>
            
            <div class="notice-body">
                <p class="no-indent"><strong>TO:</strong></p>
                <p class="no-indent"><span class="highlight">${getFieldValue(data.opponentName, "Opponent's Name")}</span></p>
                ${
                  data.opponentAddress
                    ? `<p class="no-indent">${data.opponentAddress.replace(/\n/g, "<br>")}</p>`
                    : isRealTime
                      ? `<p class="no-indent placeholder-text">[Opponent's Address]</p>`
                      : ""
                }
                
                <p class="no-indent" style="margin-top: 25px;"><strong>THROUGH:</strong></p>
                <p class="no-indent"><span class="highlight">${getFieldValue(data.advocateName, "Advocate's Name")}</span></p>
                <p class="no-indent">Advocate (Enrollment No. <span class="highlight">${getFieldValue(data.enrollmentNumber, "Enrollment Number")}</span>)</p>
                ${
                  data.advocateAddress
                    ? `<p class="no-indent">${data.advocateAddress.replace(/\n/g, "<br>")}</p>`
                    : isRealTime
                      ? `<p class="no-indent placeholder-text">[Advocate's Address]</p>`
                      : ""
                }
                
                <p class="no-indent" style="margin-top: 25px;"><strong>ON BEHALF OF:</strong></p>
                <p class="no-indent"><span class="highlight">${getFieldValue(data.clientName, "Client's Name")}</span></p>
                ${
                  data.clientAddress
                    ? `<p class="no-indent">${data.clientAddress.replace(/\n/g, "<br>")}</p>`
                    : isRealTime
                      ? `<p class="no-indent placeholder-text">[Client's Address]</p>`
                      : ""
                }
                
                <p class="section-title">SUBJECT: ${getFieldValue(data.noticeSubject, "Subject of Notice")}</p>
                
                <p class="no-indent">Sir/Madam,</p>
                
                <p>I, <span class="highlight">${getFieldValue(data.advocateName, "Advocate's Name")}</span>, Advocate (Enrollment No. <span class="highlight">${getFieldValue(data.enrollmentNumber, "Enrollment Number")}</span>), acting on behalf of my client <span class="highlight">${getFieldValue(data.clientName, "Client's Name")}</span>, hereby serve upon you this Legal Notice under Section 80 of the Code of Civil Procedure, 1908.</p>
                
                <p class="section-title">FACTS AND CIRCUMSTANCES:</p>
                
                ${
                  data.noticeBody
                    ? this.formatNoticeBody(data.noticeBody)
                    : isRealTime
                      ? `<p class="placeholder-text">[Detailed notice body will appear here as you type...]</p>`
                      : `<p>[Notice Body]</p>`
                }
                
                ${demandSection}
                
                <p class="section-title">LEGAL NOTICE:</p>
                
                <p>You are hereby called upon to remedy the aforesaid grievances and comply with the demands mentioned herein within <span class="highlight">${data.compliancePeriod} (${this.numberToWords(data.compliancePeriod)}) days</span> from the receipt of this notice.</p>
                
                <p>Please take notice that if you fail to comply with the demands mentioned in this notice within the stipulated time, my client shall be constrained to initiate appropriate legal proceedings against you for recovery of damages, compensation, interest, and costs, without any further reference to you.</p>
                
                <p>You are further put to notice that this legal notice is issued without prejudice to any other rights and remedies available to my client under law, equity, and justice.</p>
                
                <p class="no-indent" style="margin-top: 30px;">Yours faithfully,</p>
            </div>
            
            <div class="signature-section">
                <div class="signature-left">
                    <p><strong>Date:</strong> ${formattedDate}</p>
                    <p><strong>Place:</strong> _____________</p>
                </div>
                <div class="signature-right">
                    <p style="margin-bottom: 40px;">_________________________</p>
                    <p><strong>${getFieldValue(data.advocateName, "Advocate's Name")}</strong></p>
                    <p>Advocate for ${getFieldValue(data.clientName, "Client's Name")}</p>
                    <p>Enrollment No. ${getFieldValue(data.enrollmentNumber, "Enrollment Number")}</p>
                </div>
            </div>
        `

    this.noticeContent.innerHTML = noticeTemplate
  }

  // ... (keep all other existing methods like formatNoticeBody, formatCurrency, numberToWords, etc.)

  async downloadEditedPDF() {
    // Use edited content if available, otherwise use current content
    const contentToDownload = this.editedContent || this.noticeContent.innerHTML
    await this.generatePDFFromContent(contentToDownload)
  }

  async generatePDFFromContent(htmlContent) {
    try {
      const { jsPDF } = window.jspdf
      const pdf = new jsPDF("p", "mm", "a4")

      // Parse the HTML content and extract text for PDF generation
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = htmlContent

      // Get form data for PDF generation
      const formData = this.getFormData()
      const formattedDate = formData.noticeDate
        ? new Date(formData.noticeDate).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : new Date().toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })

      // PDF styling constants
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const lineHeight = 6
      let yPosition = margin

      // Helper function to add text with proper wrapping
      const addText = (text, x, y, options = {}) => {
        const fontSize = options.fontSize || 11
        const fontStyle = options.fontStyle || "normal"
        const align = options.align || "left"
        const maxWidth = options.maxWidth || pageWidth - 2 * margin

        pdf.setFontSize(fontSize)
        pdf.setFont("times", fontStyle)

        // Clean text from HTML tags and placeholders
        const cleanText = text
          .replace(/<[^>]*>/g, "")
          .replace(/\[.*?\]/g, "")
          .trim()

        if (!cleanText) return y

        const lines = pdf.splitTextToSize(cleanText, maxWidth)

        if (align === "center") {
          x = pageWidth / 2
        }

        lines.forEach((line, index) => {
          if (y + index * lineHeight > pageHeight - margin) {
            pdf.addPage()
            y = margin
          }
          pdf.text(line, x, y + index * lineHeight, { align: align })
        })

        return y + lines.length * lineHeight
      }

      // Extract and format content from edited HTML
      const titleElement = tempDiv.querySelector(".notice-title")
      const subtitleElement = tempDiv.querySelector(".notice-subtitle")
      const bodyElement = tempDiv.querySelector(".notice-body")

      // Header
      if (titleElement) {
        yPosition = addText(titleElement.textContent, pageWidth / 2, yPosition, {
          fontSize: 16,
          fontStyle: "bold",
          align: "center",
        })
      }

      yPosition += 3
      if (subtitleElement) {
        yPosition = addText(subtitleElement.textContent, pageWidth / 2, yPosition, {
          fontSize: 12,
          align: "center",
        })
      }

      // Add line under header
      yPosition += 5
      pdf.setLineWidth(0.5)
      pdf.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10

      // Process body content
      if (bodyElement) {
        const paragraphs = bodyElement.querySelectorAll("p")
        paragraphs.forEach((p) => {
          const text = p.textContent.trim()
          if (text) {
            const isBold = p.querySelector(".highlight, strong") || p.classList.contains("section-title")
            yPosition = addText(text, margin, yPosition, {
              fontStyle: isBold ? "bold" : "normal",
            })
            yPosition += 4
          }
        })
      }

      // Signature section
      const signatureSection = tempDiv.querySelector(".signature-section")
      if (signatureSection) {
        yPosition = Math.max(yPosition + 20, pageHeight - 80)

        const leftSection = signatureSection.querySelector(".signature-left")
        const rightSection = signatureSection.querySelector(".signature-right")

        if (leftSection) {
          const leftText = leftSection.textContent.trim()
          pdf.text(leftText, margin, yPosition)
        }

        if (rightSection) {
          const rightText = rightSection.textContent.trim()
          const rightX = pageWidth - margin - 80
          pdf.text("_________________________", rightX, yPosition)

          const rightLines = rightText.split("\n").filter((line) => line.trim())
          rightLines.forEach((line, index) => {
            pdf.text(line.trim(), rightX, yPosition + 8 + index * 8)
          })
        }
      }

      // Save the PDF
      const fileName = `Legal_Notice_${formData.opponentName ? formData.opponentName.replace(/\s+/g, "_") : "Draft"}_${formattedDate.replace(/\s+/g, "_")}.pdf`
      pdf.save(fileName)

      // Close modal after successful download
      this.closePdfEditorModal()
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again or use the print option.")
    }
  }

  // Keep all existing methods (formatNoticeBody, formatCurrency, numberToWords, etc.)
  formatNoticeBody(body) {
    return body
      .split("\n")
      .map((paragraph) => (paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ""))
      .join("")
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace("₹", "")
  }

  numberToWords(num) {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ]
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

    if (num === 0) return "Zero"
    if (num < 10) return ones[num]
    if (num < 20) return teens[num - 10]
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + ones[num % 10] : "")
    if (num < 1000)
      return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 !== 0 ? " " + this.numberToWords(num % 100) : "")

    return num.toString()
  }

  showPreview() {
    this.previewSection.classList.add("show")
    if (this.realTimeEnabled) {
      this.updateRealTimePreview()
    }
  }

  async downloadPDF() {
    await this.generatePDFFromContent(this.noticeContent.innerHTML)
  }

  printNotice() {
    window.print()
  }

  saveData() {
    const formData = this.getFormData()
    localStorage.setItem("legalNoticeData", JSON.stringify(formData))
  }

  loadSavedData() {
    const savedData = localStorage.getItem("legalNoticeData")
    if (savedData) {
      try {
        const data = JSON.parse(savedData)

        Object.keys(data).forEach((key) => {
          const element = document.getElementById(key)
          if (element && data[key]) {
            element.value = data[key]
            // Trigger has-content class for visual feedback
            const formGroup = element.closest(".form-group")
            if (formGroup) {
              formGroup.classList.add("has-content")
            }
          }
        })
      } catch (error) {
        console.error("Error loading saved data:", error)
      }
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new LegalNoticeGenerator()
})
