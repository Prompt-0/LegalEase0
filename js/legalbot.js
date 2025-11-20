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
  sendBtn.addEventListener('click', () => {
    sendMessage();
  });

  // Send message when pressing Enter
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Quick question buttons
  quickQuestionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      messageInput.value = this.textContent;
      sendMessage();
    });
  });

  // Language selector
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
    chatMessages.innerHTML = '';
    addMessage(welcomeMessage, 'bot');
  });

  function sendMessage() {
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
      return "To file an FIR (First Information Report):\n\n1. Visit the nearest police station\n2. Provide details of the incident\n3.\
