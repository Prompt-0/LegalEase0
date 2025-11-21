document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.getElementById('chat-messages');
  const messageInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');
  const quickQuestions = document.getElementById('quick-questions');
  const quickQuestionBtns = document.querySelectorAll('.quick-question-btn');
  const languageSelector = document.getElementById('language-selector');

  // Initial bot message
  addMessage('Hello! I\'m LegalBot, your AI legal assistant. I can help you with legal questions, procedures, and guide you to the right institutions. How can I assist you today?', 'bot');

  // Send message when clicking the send button
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      sendMessage();
    });
  }

  // Send message when pressing Enter
  if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  // Quick question buttons
  if (quickQuestionBtns) {
    quickQuestionBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        if (messageInput) {
          messageInput.value = this.textContent;
          sendMessage();
        }
      });
    });
  }

  // Language selector
  if (languageSelector) {
    languageSelector.addEventListener('change', function() {
      const language = this.value;
      let welcomeMessage = '';

      switch(language) {
        case 'hindi':
          welcomeMessage = 'नमस्ते! मैं लीगलबॉट हूँ, आपका AI कानूनी सहायक। मैं आपको कानूनी प्रश्नों, प्रक्रियाओं और सही संस्थानों के मार्गदर्शन में मदद कर सकता हूँ। मैं आपकी कैसे सहायता कर सकता हूँ?';
          break;
        case 'bengali':
          welcomeMessage = 'হ্যালো! আমি লিগ্যালবট, আপনার AI আইনি সহকারী। আমি আইনি প্রশ্ন, পদ্ধতি এবং সঠিক প্রতিষ্ঠানগুলিতে আপনাকে গাইড করতে সাহায্য করতে পারি। আমি আপনাকে কীভাবে সাহায্য করতে পারি?';
          break;
        default:
          welcomeMessage = 'Hello! I\'m LegalBot, your AI legal assistant. I can help you with legal questions, procedures, and guide you to the right institutions. How can I assist you today?';
      }

      // Clear chat and add new welcome message
      if (chatMessages) {
        chatMessages.innerHTML = '';
        addMessage(welcomeMessage, 'bot');
      }
    });
  }

  function sendMessage() {
    if (!messageInput) return;
    const message = messageInput.value.trim();

    if (message) {
      // Add user message to chat
      addMessage(message, 'user');

      // Clear input
      messageInput.value = '';

      // Hide quick questions after first message
      if (quickQuestions) {
        quickQuestions.style.display = 'none';
      }

      // Show typing indicator
      showTypingIndicator();

      // Simulate bot response after delay
      setTimeout(() => {
        removeTypingIndicator();
        const botResponse = getBotResponse(message);
        addMessage(botResponse, 'bot');
      }, 1500);
    }
  }

  function addMessage(text, sender) {
    if (!chatMessages) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${sender}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (sender === 'bot') {
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'message-avatar';
      avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';
      contentDiv.appendChild(avatarDiv);
    }

    const textP = document.createElement('p');
    textP.textContent = text;
    contentDiv.appendChild(textP);

    const timeP = document.createElement('p');
    timeP.className = 'message-time';
    timeP.textContent = new Date().toLocaleTimeString();
    contentDiv.appendChild(timeP);

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTypingIndicator() {
    if (!chatMessages) return;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message message-bot typing-indicator';
    typingDiv.innerHTML = `
      <div class="message-content">
        <div class="message-avatar">
          <i class="fas fa-robot"></i>
        </div>
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  function getBotResponse(userInput) {
    const input = userInput.toLowerCase();

    if (input.includes('fir') || input.includes('police')) {
      return "To file an FIR (First Information Report):\n\n1. Visit the nearest police station\n2. Provide details of the incident\n3. Sign the report and get a free copy\n\nYou can also file e-FIRs for certain offences on state police portals.";
    } else if (input.includes('rti') || input.includes('information')) {
      return "Right to Information (RTI):\n\n1. Identify the department you need info from\n2. Write your application (format varies by state)\n3. Pay the fee (usually ₹10)\n4. Submit to the Public Information Officer.";
    } else if (input.includes('lawyer') || input.includes('advocate')) {
      return "You can find qualified lawyers using our 'Lawyer Connect' feature. It allows you to filter by specialization (Criminal, Civil, Family, etc.) and location.";
    } else if (input.includes('property') || input.includes('land')) {
      return "For property disputes, you typically need to file a civil suit. Important documents include:\n- Title deeds\n- Sale agreements\n- Property tax receipts\n\nConsult a property lawyer for case-specific advice.";
    } else if (input.includes('consumer')) {
      return "Consumer Rights:\nYou can file a complaint in the Consumer Court for:\n- Defective goods\n- Deficiency in services\n- Unfair trade practices\n\nVisit the 'Documents' section to generate a Legal Notice.";
    } else if (input.includes('divorce') || input.includes('marriage')) {
      return "Family Law matters like divorce are handled under personal laws (Hindu Marriage Act, Special Marriage Act, etc.). It's advisable to consult a family lawyer. Our 'Legal Books' section has the bare acts for reference.";
    } else {
      return "I'm a basic legal assistant. For specific advice, please consult a lawyer. You can use the 'Find Lawyers' section to connect with a professional.";
    }
  }
});
