export function initChat() {
    const chatList = document.getElementById('chat-list');
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    let currentChatId = null;

    function createChatListItem(chat) {
        const listing = store.listings.find(l => l.id === chat.listingId);
        if (!listing) return '';

        return `
            <div class="chat-item ${chat.id === currentChatId ? 'active' : ''}" 
                 onclick="selectChat(${chat.id})">
                <div class="flex items-center space-x-3">
                    <img src="${listing.image}" alt="${listing.title}" 
                         class="w-12 h-12 object-cover rounded">
                    <div>
                        <h4 class="font-medium text-gray-800">${listing.title}</h4>
                        <p class="text-sm text-gray-500">₹${listing.price}</p>
                    </div>
                </div>
            </div>
        `;
    }

    function createChatMessage(message, isSent) {
        return `
            <div class="chat-message ${isSent ? 'sent' : 'received'}">
                <p>${message.text}</p>
                <span class="chat-time">${new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
        `;
    }

    function renderChatList() {
        if (!chatList) return;

        const userChats = store.chats.filter(chat => 
            chat.participants.includes(auth.currentUser?.id)
        );

        chatList.innerHTML = userChats.map(createChatListItem).join('');
    }

    function renderChatMessages(chatId) {
        if (!chatMessages) return;

        const chat = store.chats.find(c => c.id === chatId);
        if (!chat) return;

        chatMessages.innerHTML = chat.messages.map(msg => 
            createChatMessage(msg, msg.senderId === auth.currentUser?.id)
        ).join('');

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Handle chat selection
    window.selectChat = function(chatId) {
        currentChatId = chatId;
        renderChatList();
        renderChatMessages(chatId);
    };

    // Handle new message submission
    chatForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!auth.isAuthenticated) {
            ToastNotification.show('Please sign in to send messages', 'error');
            document.querySelector('[data-page="login"]').click();
            return;
        }

        if (!currentChatId) {
            ToastNotification.show('Please select a chat first', 'error');
            return;
        }

        const input = chatForm.querySelector('input');
        const text = input.value.trim();
        if (!text) return;

        const chat = store.chats.find(c => c.id === currentChatId);
        if (!chat) return;

        const message = {
            id: Date.now(),
            text,
            senderId: auth.currentUser.id,
            timestamp: new Date().toISOString()
        };

        chat.messages.push(message);
        store.notify('chats');
        renderChatMessages(currentChatId);
        input.value = '';
    });

    // Listen for chat selection events
    document.addEventListener('select-chat', (event) => {
        selectChat(event.detail.chatId);
    });

    // Subscribe to store updates
    store.subscribe('chats', () => {
        renderChatList();
        if (currentChatId) {
            renderChatMessages(currentChatId);
        }
    });

    // Initial render
    renderChatList();
}