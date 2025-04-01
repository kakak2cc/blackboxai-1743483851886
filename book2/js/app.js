// Import modules
import { initRouter } from './router.js';
import { initListings } from './listings.js';
import { initChat } from './chat.js';

// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            console.log('ServiceWorker registration successful:', registration.scope);
        })
        .catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
}

// Store Management
const store = {
    listings: [
        {
            id: 1,
            title: 'NCERT Mathematics Class 10',
            author: 'NCERT',
            price: 299,
            condition: 'good',
            educationLevel: 'Class 9-10',
            description: 'Complete mathematics textbook for class 10 students. Includes all chapters with solved examples and practice questions.',
            image: 'https://source.unsplash.com/400x300/?textbook',
            seller: {
                id: 1,
                name: 'Rahul Kumar',
                location: 'Mumbai, Maharashtra'
            }
        },
        {
            id: 2,
            title: 'Introduction to Algorithms',
            author: 'Thomas H. Cormen',
            price: 899,
            condition: 'fair',
            educationLevel: 'Undergraduate',
            description: 'Essential computer science textbook for undergraduate students. Covers all major algorithms and data structures.',
            image: 'https://source.unsplash.com/400x300/?computer-science',
            seller: {
                id: 2,
                name: 'Priya Singh',
                location: 'Bangalore, Karnataka'
            }
        }
    ],
    users: [],
    chats: [],
    subscribers: {},

    addListing(listing) {
        this.listings.push(listing);
        this.notify('listings');
    },

    addUser(user) {
        this.users.push(user);
        this.notify('users');
    },

    addChat(chat) {
        this.chats.push(chat);
        this.notify('chats');
    },

    subscribe(event, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(callback);
    },

    notify(event) {
        if (this.subscribers[event]) {
            this.subscribers[event].forEach(callback => callback());
        }
    }
};

// Authentication Management
const auth = {
    currentUser: null,
    isAuthenticated: false,

    login(email, password) {
        // In a real app, this would make an API call
        const user = store.users.find(u => u.email === email);
        if (user && user.password === password) {
            this.currentUser = user;
            this.isAuthenticated = true;
            this.updateUI();
            return true;
        }
        return false;
    },

    signup(userData) {
        // In a real app, this would make an API call
        const existingUser = store.users.find(u => u.email === userData.email);
        if (existingUser) {
            return false;
        }
        
        const newUser = {
            id: Date.now(),
            ...userData
        };
        store.addUser(newUser);
        this.currentUser = newUser;
        this.isAuthenticated = true;
        this.updateUI();
        return true;
    },

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.updateUI();
    },

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const sellLoginPrompt = document.getElementById('sellLoginPrompt');

        if (this.isAuthenticated && loginBtn) {
            loginBtn.innerHTML = `
                <i class="fas fa-user"></i>
                <span>${this.currentUser.fullName}</span>
            `;
            if (sellLoginPrompt) {
                sellLoginPrompt.classList.add('hidden');
            }
        } else if (loginBtn) {
            loginBtn.innerHTML = `
                <i class="fas fa-user"></i>
                <span>Sign In</span>
            `;
            if (sellLoginPrompt) {
                sellLoginPrompt.classList.remove('hidden');
            }
        }
    }
};

// Toast Notification System
const ToastNotification = {
    show(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type} fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg transform translate-y-full transition-transform duration-300 z-50`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle text-green-500' : 'exclamation-circle text-red-500'} mr-2"></i>
                <p class="text-gray-800">${message}</p>
            </div>
        `;
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateY(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            toast.style.transform = 'translateY(100%)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Make store, auth, and ToastNotification globally available
    window.store = store;
    window.auth = auth;
    window.ToastNotification = ToastNotification;

    const router = initRouter();
    initListings(store);
    initChat();

    // Handle signup form submission
    const signupForm = document.getElementById('signup-form');
    signupForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(signupForm);
        const userData = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };

        if (userData.password !== userData.confirmPassword) {
            ToastNotification.show('Passwords do not match', 'error');
            return;
        }

        if (auth.signup(userData)) {
            ToastNotification.show('Account created successfully!');
            router.navigateTo('home');
        } else {
            ToastNotification.show('Email already exists', 'error');
        }
    });

    // Handle login form submission
    const loginForm = document.getElementById('login-form');
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const email = formData.get('email');
        const password = formData.get('password');

        if (auth.login(email, password)) {
            ToastNotification.show('Signed in successfully!');
            router.navigateTo('home');
        } else {
            ToastNotification.show('Invalid email or password', 'error');
        }
    });

    // Handle sell form submission
    const sellForm = document.getElementById('sell-form');
    sellForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!auth.isAuthenticated) {
            ToastNotification.show('Please sign in to list books', 'error');
            router.navigateTo('login');
            return;
        }

        const formData = new FormData(sellForm);
        const listingData = {
            id: Date.now(),
            title: formData.get('title'),
            author: formData.get('author'),
            price: parseInt(formData.get('price')),
            condition: formData.get('condition'),
            educationLevel: formData.get('educationLevel'),
            description: formData.get('description'),
            image: 'https://source.unsplash.com/400x300/?book',
            seller: {
                id: auth.currentUser.id,
                name: auth.currentUser.fullName,
                location: formData.get('location')
            }
        };

        store.addListing(listingData);
        ToastNotification.show('Book listed successfully!');
        sellForm.reset();
        router.navigateTo('home');
    });

    // Handle navigation between login and signup
    document.getElementById('signupLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigateTo('signup');
    });

    document.getElementById('loginLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigateTo('login');
    });

    // Initialize auth UI
    auth.updateUI();
});