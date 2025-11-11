document.addEventListener('DOMContentLoaded', () => {
    const policySections = document.querySelectorAll('.policy-section');
    const tocLinks = document.querySelectorAll('.toc a');
    const tocToggle = document.querySelector('.toc-toggle');

    // --- 1. Accordion Logic ---
    policySections.forEach(section => {
        const header = section.querySelector('.policy-header');
        if (header) {
            header.addEventListener('click', () => {
                const content = section.querySelector('.policy-body');
                const isExpanded = section.classList.contains('active');

                if (isExpanded) {
                    section.classList.remove('active');
                    content.style.maxHeight = null;
                } else {
                    // Close other sections when one is opened
                    policySections.forEach(s => {
                        s.classList.remove('active');
                        s.querySelector('.policy-body').style.maxHeight = null;
                    });

                    section.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        }
    });

    // --- 2. Scroll-activated Table of Contents (Scrollspy) ---
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Get the ID of the section that is intersecting
                const id = entry.target.getAttribute('id');
                const tocLink = document.querySelector(`.toc a[href="#${id}"]`);

                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                    // Remove active from all links
                    tocLinks.forEach(link => link.classList.remove('active'));
                    // Add active to the current one
                    if (tocLink) {
                        tocLink.classList.add('active');
                    }
                }
            });
        }, {
            rootMargin: '0px',
            threshold: 0.5 // Trigger when 50% of the section is visible
        });

        // Observe each section heading target
        document.querySelectorAll('.policy-text .section-heading').forEach(section => {
            observer.observe(section);
        });
    }

    // --- 3. Mobile Table of Contents Toggle ---
    if (tocToggle) {
        const tocLinkList = document.getElementById('toc-link-list');
        tocToggle.addEventListener('click', () => {
            const isExpanded = tocToggle.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                tocToggle.setAttribute('aria-expanded', 'false');
                tocLinkList.style.maxHeight = null;
            } else {
                tocToggle.setAttribute('aria-expanded', 'true');
                tocLinkList.style.maxHeight = tocLinkList.scrollHeight + 'px';
            }
        });
    }
});