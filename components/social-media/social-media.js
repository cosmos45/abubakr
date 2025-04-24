export function initializeSocialMedia() {
    
    // Add loading indicators
    document.querySelectorAll('.embed-placeholder').forEach(placeholder => {
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'embed-loading';
      placeholder.appendChild(loadingDiv);
    });
    
    // Process Instagram embeds
    if (window.instgrm) {
      window.instgrm.Embeds.process();
      removeLoadingIndicators('instagram-container');
    } else {
      // Load Instagram embed script if not already loaded
      const instaScript = document.createElement('script');
      instaScript.async = true;
      instaScript.src = "//www.instagram.com/embed.js";
      instaScript.onload = function() {
        setTimeout(() => {
          if (window.instgrm) {
            window.instgrm.Embeds.process();
            removeLoadingIndicators('instagram-container');
          }
        }, 1000);
      };
      document.body.appendChild(instaScript);
    }
    
    // Process TikTok embeds
    if (document.querySelector('.tiktok-embed')) {
      const tiktokScript = document.createElement('script');
      tiktokScript.async = true;
      tiktokScript.src = "https://www.tiktok.com/embed.js";
      tiktokScript.onload = function() {
        setTimeout(() => removeLoadingIndicators('tiktok-container'), 1000);
      };
      document.body.appendChild(tiktokScript);
    }
    
    // Process Facebook embeds
    if (window.FB) {
      window.FB.XFBML.parse();
      removeLoadingIndicators('facebook-container');
    } else {
      // Load Facebook SDK if not already loaded
      const fbScript = document.createElement('script');
      fbScript.async = true;
      fbScript.defer = true;
      fbScript.crossOrigin = "anonymous";
      fbScript.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v17.0";
      fbScript.onload = function() {
        setTimeout(() => {
          if (window.FB) {
            window.FB.XFBML.parse();
            removeLoadingIndicators('facebook-container');
          }
        }, 1000);
      };
      document.body.appendChild(fbScript);
    }
    
    // Ensure embeds are processed after a delay
    setTimeout(() => {
      if (window.instgrm) window.instgrm.Embeds.process();
      if (window.FB) window.FB.XFBML.parse();
      
      // Force reload TikTok embeds if not loaded
      const tiktokEmbeds = document.querySelectorAll('.tiktok-embed');
      if (tiktokEmbeds.length > 0) {
        const tiktokScript = document.createElement('script');
        tiktokScript.async = true;
        tiktokScript.src = "https://www.tiktok.com/embed.js";
        document.body.appendChild(tiktokScript);
      }
      
      // Remove all remaining loading indicators after 5 seconds
      setTimeout(() => {
        document.querySelectorAll('.embed-loading').forEach(loader => {
          loader.remove();
        });
      }, 5000);
    }, 3000);
    
    function removeLoadingIndicators(containerClass) {
      document.querySelectorAll(`.${containerClass} .embed-loading`).forEach(loader => {
        loader.remove();
      });
    }
  }
  
  // Add this to ensure the function runs when the component is loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize immediately
    setTimeout(initializeSocialMedia, 500);
    
    // Also wait for the social media container to be populated
    const observer = new MutationObserver((mutations, obs) => {
      const container = document.querySelector('.social-feed-container');
      if (container && container.children.length > 0) {
        initializeSocialMedia();
        obs.disconnect(); // Stop observing once initialized
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
  