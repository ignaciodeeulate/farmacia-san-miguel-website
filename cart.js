// Shopping Cart Management System
class CartManager {
    constructor() {
        this.items = [];
        this.isOpen = false;
        this.init();
    }
    
    init() {
        this.loadCartFromStorage();
        this.setupEventListeners();
        this.updateCartDisplay();
    }
    
    setupEventListeners() {
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => this.openCart());
        }
        
        // Close cart when clicking outside
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            cartModal.addEventListener('click', (e) => {
                if (e.target === cartModal) {
                    this.closeCart();
                }
            });
        }
    }
    
    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }
        
        this.saveCartToStorage();
        this.updateCartDisplay();
        this.showNotification(`${product.name} añadido al carrito`);
    }
    
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCartToStorage();
        this.updateCartDisplay();
        this.renderCartItems();
    }
    
    updateQuantity(productId, newQuantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = newQuantity;
                this.saveCartToStorage();
                this.updateCartDisplay();
                this.renderCartItems();
            }
        }
    }
    
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }
    
    getPointsToEarn() {
        // 1 point per euro spent
        return Math.floor(this.getTotal());
    }
    
    updateCartDisplay() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const count = this.getItemCount();
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'block' : 'none';
        }
    }
    
    openCart() {
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            this.renderCartItems();
            cartModal.classList.add('active');
            this.isOpen = true;
        }
    }
    
    closeCart() {
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            cartModal.classList.remove('active');
            this.isOpen = false;
        }
    }
    
    renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalAmount = document.getElementById('cart-total-amount');
        const pointsToEarn = document.getElementById('points-to-earn');
        
        if (!cartItemsContainer) return;
        
        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <h3 data-translate="cart_empty">Tu carrito está vacío</h3>
                    <p data-translate="cart_empty_desc">Añade algunos productos para empezar</p>
                </div>
            `;
        } else {
            cartItemsContainer.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">€${item.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="cartManager.updateQuantity(${item.id}, ${item.quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <button class="remove-btn" onclick="cartManager.removeItem(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="cart-item-total">
                        €${(item.price * item.quantity).toFixed(2)}
                    </div>
                </div>
            `).join('');
        }
        
        // Update totals
        if (cartTotalAmount) {
            cartTotalAmount.textContent = `€${this.getTotal().toFixed(2)}`;
        }
        
        if (pointsToEarn) {
            pointsToEarn.textContent = this.getPointsToEarn();
        }
    }
    
    clearCart() {
        this.items = [];
        this.saveCartToStorage();
        this.updateCartDisplay();
        this.renderCartItems();
    }
    
    saveCartToStorage() {
        try {
            localStorage.setItem('pharmacy_cart', JSON.stringify(this.items));
        } catch (error) {
            console.warn('Could not save cart to localStorage:', error);
        }
    }
    
    loadCartFromStorage() {
        try {
            const savedCart = localStorage.getItem('pharmacy_cart');
            if (savedCart) {
                this.items = JSON.parse(savedCart);
            }
        } catch (error) {
            console.warn('Could not load cart from localStorage:', error);
            this.items = [];
        }
    }
    
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Checkout function
function proceedToCheckout() {
    if (window.cartManager.items.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    // For now, show a simple alert
    // In a real implementation, this would redirect to a payment gateway
    const total = window.cartManager.getTotal();
    const points = window.cartManager.getPointsToEarn();
    
    alert(`Procediendo al pago...\nTotal: €${total.toFixed(2)}\nPuntos a ganar: ${points}\n\n(Esta es una demostración. En la versión final se integraría con un sistema de pago real.)`);
    
    // Simulate successful purchase
    if (window.loyaltyManager) {
        window.loyaltyManager.addPoints(points);
    }
    
    window.cartManager.clearCart();
    window.cartManager.closeCart();
}

// Initialize cart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});