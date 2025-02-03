document.addEventListener('DOMContentLoaded', function() {
    // Sample cart items
    const cartItems = [
        { id: 1, item: "Item 1", count: 2, price: "$10" },
        { id: 2, item: "Item 2", count: 1, price: "$20" },
        { id: 3, item: "Item 3", count: 3, price: "$15" }
    ];

    // Sample items with prices
    const itemCatalog = [
        { name: "Apple", price: "$2" },
        { name: "Banana", price: "$1" },
        { name: "Orange", price: "$1.5" },
        { name: "Milk", price: "$3" },
        { name: "Bread", price: "$2.5" },
        { name: "Eggs", price: "$3" },
        { name: "Coffee", price: "$5" },
        { name: "Tea", price: "$4" }
    ];

    // Function to render cart items
    function renderCartItems() {
        const cartTableBody = document.getElementById('cart-items');
        cartTableBody.innerHTML = '';
        
        cartItems.forEach(item => {
            const basePrice = parseFloat(item.price.replace('$', ''));
            const totalPrice = (basePrice * item.count).toFixed(2);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td class="item-cell" data-id="${item.id}">
                    ${item.item}
                    <div class="price-tooltip">Unit Price: ${item.price}</div>
                </td>
                <td>${item.count}</td>
                <td>$${totalPrice}</td>
                <td>
                    <button class="delete-btn" data-id="${item.id}">🗑️</button>
                </td>
            `;
            cartTableBody.appendChild(row);
        });

        // Add click handlers for item cells
        document.querySelectorAll('.item-cell').forEach(cell => {
            cell.addEventListener('click', handleItemClick);
        });

        // Add delete button handlers
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });

        // Update cart total
        updateCartTotal();
    }

    // Function to update cart total
    function updateCartTotal() {
        const total = cartItems.reduce((sum, item) => {
            const price = parseFloat(item.price.replace('$', ''));
            return sum + (price * item.count);
        }, 0);
        
        document.querySelector('.total-amount').textContent = `$${total.toFixed(2)}`;
    }

    // Function to handle item click
    function handleItemClick(e) {
        const cell = e.target;
        if (cell.classList.contains('item-cell')) {
            // Toggle price tooltip
            document.querySelectorAll('.item-cell').forEach(c => c.classList.remove('show-price'));
            cell.classList.add('show-price');
            
            // Show suggestions
            showItemSuggestions(e);
        }
    }

    // Function to show item suggestions
    function showItemSuggestions(e) {
        const cell = e.target;
        const itemId = parseInt(cell.dataset.id);
        
        // Remove any existing dropdowns
        document.querySelectorAll('.suggestions-dropdown').forEach(el => el.remove());

        const dropdown = document.createElement('div');
        dropdown.className = 'suggestions-dropdown';
        
        itemCatalog.forEach(item => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.textContent = `${item.name} (${item.price})`;
            suggestionItem.addEventListener('click', () => {
                const cartItem = cartItems.find(item => item.id === itemId);
                cartItem.item = item.name;
                cartItem.price = item.price;
                cartItem.count = 1; // Reset count to 1 when changing item
                renderCartItems();
            });
            dropdown.appendChild(suggestionItem);
        });

        cell.appendChild(dropdown);

        // Close dropdown and price tooltip when clicking outside
        document.addEventListener('click', function closeDropdown(e) {
            if (!e.target.closest('.item-cell')) {
                dropdown.remove();
                document.querySelectorAll('.item-cell').forEach(c => c.classList.remove('show-price'));
                document.removeEventListener('click', closeDropdown);
            }
        });
    }

    // Handle delete button click
    function handleDelete(e) {
        const itemId = parseInt(e.target.dataset.id);
        const index = cartItems.findIndex(item => item.id === itemId);
        if (index !== -1) {
            cartItems.splice(index, 1);
            renderCartItems();
        }
    }

    // Function to cancel order - will be called from iframe
    window.cancelOrder = function() {
        // Only hide QR code container
        const qrContainer = document.querySelector('.qr-container');
        qrContainer.classList.remove('show');
    };

    // Initialize cart items
    renderCartItems();

    // Menu button click handler - shows/hides a side menu
    const menuBtn = document.querySelector('.menu-btn');
    menuBtn.addEventListener('click', () => {
        const sideMenu = document.createElement('div');
        sideMenu.className = 'side-menu';
        sideMenu.innerHTML = `
            <button class="close-menu">×</button>
            <ul>
                <li>Home</li>
                <li>Categories</li>
                <li>Orders</li>
                <li>Settings</li>
            </ul>
        `;
        document.body.appendChild(sideMenu);
        
        // Close menu handler
        const closeBtn = sideMenu.querySelector('.close-menu');
        closeBtn.addEventListener('click', () => {
            sideMenu.classList.add('closing');
            setTimeout(() => {
                document.body.removeChild(sideMenu);
            }, 300); // Match the animation duration
        });
    });

    // Pay Now button click handler - shows payment modal
    const payNowBtn = document.querySelector('.pay-now');
    payNowBtn.addEventListener('click', () => {
        const paymentModal = document.createElement('div');
        paymentModal.className = 'payment-modal';
        paymentModal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal">×</button>
                <h2>Payment Options</h2>
                <div class="payment-options">
                    <button data-payment="credit">Credit Card</button>
                    <button data-payment="debit">Debit Card</button>
                    <button data-payment="netbanking">Net Banking</button>
                    <button data-payment="upi">UPI</button>
                </div>
            </div>
        `;
        document.body.appendChild(paymentModal);
        
        // Add click handlers to payment options
        const paymentOptions = paymentModal.querySelectorAll('.payment-options button');
        paymentOptions.forEach(button => {
            button.addEventListener('click', () => {
                // Show QR code container
                const qrContainer = document.querySelector('.qr-container');
                qrContainer.classList.add('show');
                
                // Update QR code in iframe
                const qrFrame = document.getElementById('qr-frame');
                const paymentMethod = button.dataset.payment;
                qrFrame.contentWindow.updateQRCode(paymentMethod);
                
                // Update total in QR frame
                const totalAmount = document.querySelector('.total-amount').textContent;
                qrFrame.contentWindow.updateTotal(totalAmount);
                
                // Close payment modal
                document.body.removeChild(paymentModal);
            });
        });
        
        // Close modal handler
        const closeModal = paymentModal.querySelector('.close-modal');
        closeModal.addEventListener('click', () => {
            document.body.removeChild(paymentModal);
        });
    });

    // Help button click handler - shows help popup
    const helpBtn = document.querySelector('.help');
    helpBtn.addEventListener('click', () => {
        const helpModal = document.createElement('div');
        helpModal.className = 'help-modal';
        helpModal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal">×</button>
                <h2>Help Center</h2>
                <div class="help-options">
                    <p>Need assistance? Contact us:</p>
                    <ul>
                        <li>📞 Call: 1800-123-4567</li>
                        <li>✉️ Email: support@shop.com</li>
                        <li>💬 Live Chat</li>
                        <li>📱 WhatsApp Support</li>
                    </ul>
                </div>
            </div>
        `;
        document.body.appendChild(helpModal);
        
        // Close help modal handler
        const closeModal = helpModal.querySelector('.close-modal');
        closeModal.addEventListener('click', () => {
            document.body.removeChild(helpModal);
        });
    });
}); 