// Products Management System
class ProductManager {
    constructor() {
        this.products = [
            {
                id: 1,
                name: "Paracetamol 500mg",
                price: 3.50,
                category: "otc",
                image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center",
                description: "Analgésico y antipirético para dolor y fiebre",
                stock: 50,
                inStock: true
            },
            {
                id: 2,
                name: "Vitamina C 1000mg",
                price: 12.90,
                category: "vitamins",
                image: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=400&fit=crop&crop=center",
                description: "Suplemento vitamínico para reforzar el sistema inmune",
                stock: 30,
                inStock: true
            },
            {
                id: 3,
                name: "Crema Hidratante",
                price: 8.75,
                category: "skincare",
                image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&crop=center",
                description: "Crema hidratante para piel seca y sensible",
                stock: 25,
                inStock: true
            },
            {
                id: 4,
                name: "Pañales Bebé Talla 3",
                price: 15.99,
                category: "baby",
                image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop&crop=center",
                description: "Pañales ultra absorbentes para bebés de 6-10kg",
                stock: 20,
                inStock: true
            },
            {
                id: 5,
                name: "Ibuprofeno 400mg",
                price: 4.25,
                category: "otc",
                image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop&crop=center",
                description: "Antiinflamatorio para dolor y inflamación",
                stock: 40,
                inStock: true
            },
            {
                id: 6,
                name: "Multivitamínico",
                price: 18.50,
                category: "vitamins",
                image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center",
                description: "Complejo vitamínico completo para toda la familia",
                stock: 15,
                inStock: true
            }
        ];
        
        this.currentCategory = 'all';
        this.init();
    }
    
    init() {
        this.renderProducts();
        this.setupFilters();
        this.setupSearch();
    }
    
    renderProducts(productsToRender = null) {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;
        
        const products = productsToRender || this.getFilteredProducts();
        
        productsGrid.innerHTML = products.map(product => `
            <div class="product-card" data-category="${product.category}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="product-badge ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                        ${product.inStock ? 'En Stock' : 'Agotado'}
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">€${product.price.toFixed(2)}</div>
                    <div class="product-stock">Stock: ${product.stock}</div>
                    <button class="btn btn-primary product-btn" 
                            onclick="productManager.addToCart(${product.id})"
                            ${!product.inStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        ${product.inStock ? 'Añadir al Carrito' : 'Agotado'}
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    getFilteredProducts() {
        if (this.currentCategory === 'all') {
            return this.products;
        }
        return this.products.filter(product => product.category === this.currentCategory);
    }
    
    setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Update current category and render products
                this.currentCategory = e.target.dataset.category;
                this.renderProducts();
            });
        });
    }
    
    setupSearch() {
        const searchBtn = document.getElementById('search-btn');
        const searchOverlay = document.getElementById('search-overlay');
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        
        if (searchBtn && searchOverlay) {
            searchBtn.addEventListener('click', () => {
                searchOverlay.classList.add('active');
                searchInput.focus();
            });
            
            searchOverlay.addEventListener('click', (e) => {
                if (e.target === searchOverlay) {
                    searchOverlay.classList.remove('active');
                }
            });
            
            searchInput.addEventListener('input', (e) => {
                this.performSearch(e.target.value, searchResults);
            });
        }
    }
    
    performSearch(query, resultsContainer) {
        if (!query.trim()) {
            resultsContainer.innerHTML = '';
            return;
        }
        
        const results = this.products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase())
        );
        
        resultsContainer.innerHTML = results.map(product => `
            <div class="search-result-item" onclick="productManager.addToCart(${product.id})">
                <img src="${product.image}" alt="${product.name}">
                <div class="search-result-info">
                    <h4>${product.name}</h4>
                    <p>${product.description}</p>
                    <span class="price">€${product.price.toFixed(2)}</span>
                </div>
            </div>
        `).join('');
    }
    
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product && product.inStock && window.cartManager) {
            window.cartManager.addItem(product);
            this.showNotification(`${product.name} añadido al carrito`);
        }
    }
    
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
    
    getProductById(id) {
        return this.products.find(product => product.id === id);
    }
    
    updateStock(productId, newStock) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            product.stock = newStock;
            product.inStock = newStock > 0;
            this.renderProducts();
        }
    }
}

// Initialize product manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productManager = new ProductManager();
});