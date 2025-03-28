// components/loader/loader.js
export default class Loader {
  constructor() {
    this.loaderElement = null;
    this.initialized = false;
    this.progressBar = null;
    this.customMessages = [
      "Stocking the shelves...",
      "Finding the freshest items...",
      "Preparing your shopping experience...",
      "Getting the best deals ready...",
      "Almost there...",
      "Curating products just for you..."
    ];
    this.messageInterval = null;
  }

  init() {
    if (this.initialized) return;
    
    // Create loader if it doesn't exist
    if (!document.getElementById('globalLoader')) {
      const loaderHTML = `
        <div class="global-loader" id="globalLoader">
          <div class="loader-container">
            <div class="loader-brand">
              <div class="loader-icon">
                <div class="pulse-container">
                  <div class="pulse-circle"></div>
                  <div class="pulse-circle"></div>
                  <div class="pulse-circle"></div>
                </div>
                <div class="spinner-container">
                  <div class="spinner"></div>
                </div>
              </div>
              <div class="loader-text">Abu Bakr Store</div>
            </div>
            <div class="loader-message">Preparing your shopping experience...</div>
            <div class="loader-progress">
              <div class="progress-bar"></div>
            </div>
          </div>
        </div>
      `;
      
      const loaderContainer = document.createElement('div');
      loaderContainer.innerHTML = loaderHTML;
      document.body.appendChild(loaderContainer.firstElementChild);
    }
    
    this.loaderElement = document.getElementById('globalLoader');
    this.progressBar = this.loaderElement.querySelector('.progress-bar');
    this.initialized = true;
    
    // Add CSS if not already added
    if (!document.querySelector('link[href="components/loader/loader.css"]')) {
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = 'components/loader/loader.css';
      document.head.appendChild(linkElement);
    }
  }

  show(customMessage = '') {
    this.init();
    
    // Set custom message or start rotating messages
    const messageElement = this.loaderElement.querySelector('.loader-message');
    if (customMessage) {
      messageElement.textContent = customMessage;
    } else {
      this._startRotatingMessages(messageElement);
    }
    
    // Reset progress bar animation
    if (this.progressBar) {
      this.progressBar.style.animation = 'none';
      // Force reflow
      this.progressBar.offsetHeight;
      this.progressBar.style.animation = 'progressAnimation 3s ease-in-out infinite';
    }
    
    this.loaderElement.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  hide() {
    if (!this.initialized) return;
    
    this._stopRotatingMessages();
    this.loaderElement.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  }
  
  // Method to show loader for specific time
  showFor(milliseconds, customMessage = '') {
    this.show(customMessage);
    return new Promise(resolve => {
      setTimeout(() => {
        this.hide();
        resolve();
      }, milliseconds);
    });
  }

  _startRotatingMessages(messageElement) {
    if (this.messageInterval) clearInterval(this.messageInterval);
    
    let index = 0;
    messageElement.textContent = this.customMessages[index];
    
    this.messageInterval = setInterval(() => {
      index = (index + 1) % this.customMessages.length;
      messageElement.style.opacity = '0';
      
      setTimeout(() => {
        messageElement.textContent = this.customMessages[index];
        messageElement.style.opacity = '1';
      }, 300);
    }, 3000);
  }

  _stopRotatingMessages() {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
      this.messageInterval = null;
    }
  }
}
