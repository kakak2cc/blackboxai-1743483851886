export function initRouter() {
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('[data-page]');

    function showPage(pageId) {
        // Hide all pages
        pages.forEach(page => {
            page.classList.add('hidden');
            page.classList.remove('active');
        });

        // Show selected page
        const selectedPage = document.getElementById(`${pageId}-page`);
        if (selectedPage) {
            selectedPage.classList.remove('hidden');
            selectedPage.classList.add('active');
        }

        // Update active state of navigation links
        navLinks.forEach(link => {
            if (link.dataset.page === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Scroll to top
        window.scrollTo(0, 0);
    }

    // Handle navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.dataset.page;
            window.location.hash = pageId;
            showPage(pageId);
        });
    });

    // Handle hash-based routing
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1); // Remove the # symbol
        if (hash.startsWith('/listing/')) {
            // Show listing detail page
            showPage('listing');
            // Trigger custom event for listing detail
            const id = hash.split('/')[2];
            document.dispatchEvent(new CustomEvent('show-listing-detail', { 
                detail: { id: parseInt(id) }
            }));
        } else {
            // Show regular page
            const pageId = hash || 'home';
            showPage(pageId);
        }
    });

    // Initial route
    const initialHash = window.location.hash.slice(1);
    if (initialHash.startsWith('/listing/')) {
        showPage('listing');
        const id = initialHash.split('/')[2];
        document.dispatchEvent(new CustomEvent('show-listing-detail', { 
            detail: { id: parseInt(id) }
        }));
    } else {
        const initialPage = initialHash || 'home';
        showPage(initialPage);
    }

    return {
        navigateTo: (pageId) => {
            window.location.hash = pageId;
            showPage(pageId);
        }
    };
}