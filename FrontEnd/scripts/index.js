// Data for the image slider (Use 10-20 images as per spec)
const sliderImages = [
    'Assets/Images/im2.jpg',
    'Assets/Images/image 1.jpg',
    'Assets/Images/logo edu pay.jpg',
    // Add remaining images here using forward slashes and URL-encoded spaces if needed
];

// Data for the sliding inspirational message
const messages = [
    "Just Clicks, No Memorizations Needed",
    "Digital Payments, Smarter Education",
    "Pay Fees Anytime, Anywhere",
    "Join the Digital Education Movement"
];

// --- Variables will be set after DOM is ready ---
let currentImageIndex = 0;
let sliderElement = null;
let currentMessageIndex = 0;
let messageTextElement = null;
let menuToggle = null;
let mainNav = null;

function updateSlider() {
    if (!sliderElement) return;
    const slides = sliderElement.querySelectorAll('.slide');
    if (!slides.length) return;
    slides.forEach(slide => slide.classList.remove('active-slide'));
    slides[currentImageIndex % slides.length].classList.add('active-slide');
    currentImageIndex = (currentImageIndex + 1) % slides.length;
}

// Function to dynamically create the image elements
function setupSlider() {
    if (!sliderElement) return;
    sliderElement.innerHTML = '';
    sliderImages.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = `Slide ${index + 1}`;
        img.classList.add('slide');
        if (index === 0) img.classList.add('active-slide');
        sliderElement.appendChild(img);
    });
    // Start the slider auto-move (every 2 seconds)
    setInterval(updateSlider, 2000);
}

function updateMessage() {
    if (!messageTextElement) return;
    messageTextElement.textContent = messages[currentMessageIndex];
    currentMessageIndex = (currentMessageIndex + 1) % messages.length;
}

document.addEventListener('DOMContentLoaded', () => {
    // Query DOM elements after they exist
    sliderElement = document.getElementById('image-slider');
    messageTextElement = document.getElementById('message-text');
    menuToggle = document.querySelector('.menu-toggle');
    mainNav = document.querySelector('.main-nav');

    // Safety: log if elements are missing
    if (!sliderElement) console.warn('image-slider element not found');
    if (!messageTextElement) console.warn('message-text element not found');

    // Init features
    setupSlider();
    updateMessage(); // show first message immediately
    setInterval(updateMessage, 4000);

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('open');
        });
    }
});