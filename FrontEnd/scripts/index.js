// Data for the image slider (Use 10-20 images as per spec)
const sliderImages = [
    'Assets\Images\im2.jpg', 
    'Assets\Images\image 1.jpg', 
    'Assets\Images\logo edu pay.jpg',
    // Add paths to your other 17 images here: 'images/slide4.jpg', ...
];

// Data for the sliding inspirational message
const messages = [
    "Just Clicks, No Memorizations Needed",
    "Digital Payments, Smarter Education",
    "Pay Fees Anytime, Anywhere",
    "Join the Digital Education Movement"
];

// --- 1. Image Slider Logic ---
let currentImageIndex = 0;
const sliderElement = document.getElementById('image-slider');

function updateSlider() {
    const slides = sliderElement.querySelectorAll('.slide');
    // Hide all slides
    slides.forEach(slide => slide.classList.remove('active-slide'));
    
    // Show the current slide
    slides[currentImageIndex].classList.add('active-slide');
    
    // Advance to the next index
    currentImageIndex = (currentImageIndex + 1) % slides.length;
}

// Function to dynamically create the image elements
function setupSlider() {
    // Clear any existing placeholders
    sliderElement.innerHTML = ''; 
    
    // Add images from the array
    sliderImages.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Slide ${index + 1}`;
        img.classList.add('slide');
        if (index === 0) {
            img.classList.add('active-slide');
        }
        sliderElement.appendChild(img);
    });
    
    // Start the slider auto-move (every 2 seconds)
    setInterval(updateSlider, 2000); 
}


// --- 2. Floating Message Logic ---
let currentMessageIndex = 0;
const messageTextElement = document.getElementById('message-text');

function updateMessage() {
    // Set the text content
    messageTextElement.textContent = messages[currentMessageIndex];
    
    // Advance to the next index
    currentMessageIndex = (currentMessageIndex + 1) % messages.length;
}

// Start the message auto-move (e.g., every 4 seconds)
setInterval(updateMessage, 4000);


// --- 3. Mobile Navigation Toggle Logic ---
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
});


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Run initial setup functions
    setupSlider(); 
    updateMessage(); // Display the first message immediately
});