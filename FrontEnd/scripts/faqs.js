// --- Accordion Logic (Specific to the FAQs page) ---
document.addEventListener('DOMContentLoaded', () => {
    // Note: The modular-loader.js loads the header/footer and runs first.
    // We attach this logic after the DOM is fully loaded.
    
    const headers = document.querySelectorAll('.accordion-header');

    headers.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            // Toggle current item
            if (isExpanded) {
                header.setAttribute('aria-expanded', 'false');
                content.style.maxHeight = null;
                item.classList.remove('active');
            } else {
                // Close all other open items
                document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                    activeItem.classList.remove('active');
                    activeItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                    activeItem.querySelector('.accordion-content').style.maxHeight = null;
                });
                
                // Open current item
                header.setAttribute('aria-expanded', 'true');
                // Use scrollHeight to set max-height for smooth transition
                content.style.maxHeight = content.scrollHeight + "px"; 
                item.classList.add('active');
            }
        });
    });
});