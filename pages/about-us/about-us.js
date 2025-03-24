// pages/about-us/about-us.js
import { loadComponent } from "../../scripts/utils/components.js";
import { GlobalSearch } from "../../scripts/modules/global-search.js";
import { MobileMenu } from "../../scripts/modules/mobile-menu.js";
import { initializeFooter } from "../../components/footer/footer.js";
import { initializeStickyHeader } from "../../scripts/modules/sticky-header.js";
import Loader from '../../components/loader/loader.js';

class AboutUsPage {
constructor() {
this.loader = new Loader();

    // About Us specific loading messages
    this.loader.customMessages = [
        "Loading our story...",
        "Preparing our journey...",
        "Getting to know us better...",
        "Sharing our values...",
        "Telling our story...",
        "Showcasing our commitment...",
        "Revealing our heritage...",
        "Presenting our mission...",
        "Sharing our vision..."
    ];
    
    this.currentSlide = 0;
    this.slideCount = 2; // We have 2 slides
}

async init() {
    try {
        // Show loader with about us specific message
        this.loader.show("Loading our story...");
        
        // Load header and footer
        await Promise.all([
            loadComponent("header", "/components/header/header.html"),
            loadComponent("footer", "/components/footer/footer.html")
        ]);
        
        // Initialize mobile menu
        const mobileMenu = new MobileMenu();
        mobileMenu.init();
        
        // Initialize global search
        const globalSearch = new GlobalSearch();
        await globalSearch.init();
        
        // Initialize sticky header
        initializeStickyHeader();

        
        // Initialize footer
        await initializeFooter();
        
        // Add "About Us" link to the header
        this.addAboutUsLinkToHeader();
        
        // Initialize video player
        this.initVideoPlayer();
        
        // Initialize manufacturers carousel
        this.initManufacturersCarousel();
        
        // Hide loader when everything is ready
        this.loader.hide();
        
    } catch (error) {
        console.error("Error initializing about us page:", error);
        // Hide loader on error
        this.loader.hide();
        
        // Show error message
        const mainContainer = document.querySelector("main.container");
        if (mainContainer) {
            mainContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    Sorry, we couldn't load the about us page. Please try again.
                </div>
            `;
        }
    }
}

addAboutUsLinkToHeader() {
    // Add About Us link next to Customer Support in top bar
    const leftLinks = document.querySelector('.left-links');
    // if (leftLinks) {
    //     const aboutUsLink = document.createElement('a');
    //     aboutUsLink.href = '/pages/about-us/about-us.html';
    //     aboutUsLink.textContent = 'About Us';
        
    //     // Insert after Customer Support link
    //     const customerSupportLink = leftLinks.querySelector('a');
    //     if (customerSupportLink) {
    //         leftLinks.insertBefore(aboutUsLink, customerSupportLink.nextSibling);
    //         // Add separator
    //         const separator = document.createElement('span');
    //         separator.className = 'link-separator';
    //         separator.textContent = '|';
    //         leftLinks.insertBefore(separator, aboutUsLink);
    //     } else {
    //         leftLinks.appendChild(aboutUsLink);
    //     }
    // }
}

initVideoPlayer() {
    const videoContainer = document.querySelector('.about-video-container');
    const video = videoContainer.querySelector('video');
    const playPauseBtn = videoContainer.querySelector('.play-pause-btn');
    const muteBtn = videoContainer.querySelector('.mute-btn');
    const timeline = videoContainer.querySelector('.timeline');
    const progressBar = videoContainer.querySelector('.progress-bar');
    
    // Make sure video autoplays
    video.muted = true;
    video.play().catch(error => {
        console.error("Autoplay failed:", error);
        // Show play button if autoplay fails
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    });
    
    // Toggle play/pause
    playPauseBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            video.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });
    
    // Video can also be toggled by clicking on it
    video.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            video.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });
    
    // Toggle mute
    muteBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        if (video.muted) {
            muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    });
    
    // Update progress bar
    video.addEventListener('timeupdate', () => {
        const percent = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${percent}%`;
    });
    
    // Seek on timeline click
    timeline.addEventListener('click', (e) => {
        const rect = timeline.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
    });
    
    // Reset UI when video ends
    video.addEventListener('ended', () => {
        video.currentTime = 0;
        video.play(); // Loop the video
    });
}

initManufacturersCarousel() {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const nextButton = document.querySelector('.next-btn');
    const prevButton = document.querySelector('.prev-btn');
    const indicators = Array.from(document.querySelectorAll('.indicator'));
    
    if (!track || !slides.length) return;
    
    // Set up automatic sliding
    let slideInterval = setInterval(() => this.nextSlide(), 5000);
    
    // Event listeners for controls
    nextButton.addEventListener('click', () => {
        clearInterval(slideInterval);
        this.nextSlide();
        slideInterval = setInterval(() => this.nextSlide(), 5000);
    });
    
    prevButton.addEventListener('click', () => {
        clearInterval(slideInterval);
        this.prevSlide();
        slideInterval = setInterval(() => this.nextSlide(), 5000);
    });
    
    // Indicator buttons
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            clearInterval(slideInterval);
            this.goToSlide(index);
            slideInterval = setInterval(() => this.nextSlide(), 5000);
        });
    });
}

nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slideCount;
    this.updateCarousel();
}

prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slideCount) % this.slideCount;
    this.updateCarousel();
}

goToSlide(index) {
    this.currentSlide = index;
    this.updateCarousel();
}
initInstagramVideos() {
    const instagramVideos = document.querySelectorAll('.instagram-video');
    
    instagramVideos.forEach(video => {
      // Ensure videos autoplay on mobile
      video.setAttribute('playsinline', '');
      video.setAttribute('muted', '');
      video.muted = true;
      
      // Play videos when they come into view
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            video.play().catch(error => {
              console.error("Autoplay failed:", error);
            });
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(video);
    });
  }

updateCarousel() {
    const track = document.querySelector('.carousel-track');
    const indicators = Array.from(document.querySelectorAll('.indicator'));
    
    if (!track || !indicators.length) return;
    
    // Update track position
    track.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    
    // Update indicators
    indicators.forEach((indicator, index) => {
        if (index === this.currentSlide) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
const loader = new Loader();
loader.show("Loading our story...");

const aboutUsPage = new AboutUsPage();
aboutUsPage.init().catch(error => {
    console.error("Failed to initialize about us page:", error);
    loader.hide();
});
});

