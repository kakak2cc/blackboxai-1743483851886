export function initListings(store) {
    function createListingCard(listing) {
        return `
            <div class="book-card transform transition-all duration-300 hover:-translate-y-1">
                <img src="${listing.image}" alt="${listing.title}" class="w-full h-48 object-cover rounded-t-lg">
                <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-lg font-semibold text-gray-800">${listing.title}</h3>
                        <span class="px-2 py-1 rounded-full text-sm font-medium ${
                            listing.condition === 'new' ? 'bg-green-100 text-green-800' :
                            listing.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                            listing.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }">${listing.condition}</span>
                    </div>
                    <p class="text-gray-600 mb-2">by ${listing.author}</p>
                    <div class="flex items-center justify-between">
                        <span class="text-lg font-bold text-blue-600">₹${listing.price}</span>
                        <button onclick="window.location.hash='/listing/${listing.id}'" 
                                class="text-blue-600 hover:text-blue-800 font-medium">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function createDetailedListingPage(listing) {
        return `
            <div class="max-w-4xl mx-auto p-6">
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="md:flex">
                        <div class="md:w-1/2">
                            <img src="${listing.image}" alt="${listing.title}" class="w-full h-96 object-cover">
                        </div>
                        <div class="p-8 md:w-1/2">
                            <div class="flex justify-between items-start mb-4">
                                <h1 class="text-2xl font-bold text-gray-800">${listing.title}</h1>
                                <span class="px-3 py-1 rounded-full text-sm font-medium ${
                                    listing.condition === 'new' ? 'bg-green-100 text-green-800' :
                                    listing.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                                    listing.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }">${listing.condition}</span>
                            </div>
                            <p class="text-xl text-gray-600 mb-4">by ${listing.author}</p>
                            <div class="mb-6">
                                <span class="text-3xl font-bold text-blue-600">₹${listing.price}</span>
                            </div>
                            <div class="mb-6">
                                <h2 class="text-lg font-semibold mb-2">Description</h2>
                                <p class="text-gray-700">${listing.description}</p>
                            </div>
                            <div class="mb-6">
                                <h2 class="text-lg font-semibold mb-2">Education Level</h2>
                                <p class="text-gray-700">${listing.educationLevel}</p>
                            </div>
                            <div class="mb-6">
                                <h2 class="text-lg font-semibold mb-2">Location</h2>
                                <p class="text-gray-700">${listing.seller.location || 'Location not specified'}</p>
                            </div>
                            <div class="space-y-4">
                                <button onclick="initChat(${listing.id})" 
                                        class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200">
                                    Chat with Seller
                                </button>
                                <a href="#home" 
                                   class="block w-full text-center border border-blue-600 text-blue-600 py-3 px-6 rounded-lg hover:bg-blue-50 transition duration-200">
                                    Back to Listings
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderListings() {
        const container = document.querySelector('#home-page .grid');
        if (!container) return;

        container.innerHTML = store.listings.map(listing => createListingCard(listing)).join('');
    }

    function renderDetailedListing(id) {
        const listing = store.listings.find(l => l.id === parseInt(id));
        if (!listing) return;

        const container = document.getElementById('listing-page');
        if (!container) return;

        container.innerHTML = createDetailedListingPage(listing);
    }

    // Listen for custom event to show listing detail
    document.addEventListener('show-listing-detail', (event) => {
        renderDetailedListing(event.detail.id);
    });

    // Handle hash-based routing for listing details
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash.startsWith('#/listing/')) {
            const id = hash.split('/')[2];
            renderDetailedListing(parseInt(id));
        }
    });

    // Subscribe to store updates
    store.subscribe('listings', renderListings);

    // Initial render
    renderListings();

    // Check if we should show a listing detail on initial load
    const hash = window.location.hash;
    if (hash.startsWith('#/listing/')) {
        const id = hash.split('/')[2];
        renderDetailedListing(parseInt(id));
    }
}