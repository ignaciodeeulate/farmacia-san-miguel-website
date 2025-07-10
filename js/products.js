// Products Management System
class ProductManager {
    constructor() {
        this.products = [
            {
                id: 1,
                nameKey: "product_paracetamol_name",
                descriptionKey: "product_paracetamol_desc",
                price: 3.50,
                category: "otc",
                image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center",
                stock: 50,
                inStock: true
            },
            {
                id: 2,
                nameKey: "product_vitamin_c_name",
                descriptionKey: "product_vitamin_c_desc",
                price: 12.90,
                category: "vitamins",
                image: "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=400&h=400&fit=crop&crop=center&auto=format",
                stock: 30,
                inStock: true
            },
            {
                id: 3,
                nameKey: "product_moisturizer_name",
                descriptionKey: "product_moisturizer_desc",
                price: 8.75,
                category: "skincare",
                image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&crop=center",
                stock: 25,
                inStock: true
            },
            {
                id: 4,
                nameKey: "product_diapers_name",
                descriptionKey: "product_diapers_desc",
                price: 15.99,
                category: "baby",
                image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop&crop=center",
                stock: 20,
                inStock: true
            },
            {
                id: 5,
                nameKey: "product_ibuprofen_name",
                descriptionKey: "product_ibuprofen_desc",
                price: 4.25,
                category: "otc",
                image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop&crop=center",
                stock: 40,
                inStock: true
            },
            {
                id: 6,
                nameKey: "product_multivitamin_name",
                descriptionKey: "product_multivitamin_desc",
                price: 18.50,
                category: "vitamins",
                image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center",
                stock: 15,
                inStock: true
            }
        ];
        
        this.currentCategory = 'all';
        this.init();
        
        // Listen for language changes
        document.addEventListener('languageChanged', () => {
            this.renderProducts();
        });
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
        const t = window.translations ? window.translations.t : (key) => key;
        
        productsGrid.innerHTML = products.map(product => {
            const productName = t(product.nameKey);
            const productDescription = t(product.descriptionKey);
            const addToCartText = product.inStock ? t('add_to_cart') : t('out_of_stock');
            
            return `
                <div class="product-card" data-category="${product.category}">
                    <div class="product-image">
                        <img src="${product.image}" alt="${productName}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <h3 class="product-name" data-translate="${product.nameKey}">${productName}</h3>
                        <p class="product-description" data-translate="${product.descriptionKey}">${productDescription}</p>
                        <div class="product-price">€${product.price.toFixed(2)}</div>
                        <button class="btn btn-primary product-btn"
                                onclick="productManager.addToCart(${product.id})"
                                ${!product.inStock ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i>
                            ${addToCartText}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
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
        
        const t = window.translations ? window.translations.t : (key) => key;
        
        const results = this.products.filter(product => {
            const productName = t(product.nameKey).toLowerCase();
            const productDescription = t(product.descriptionKey).toLowerCase();
            return productName.includes(query.toLowerCase()) ||
                   productDescription.includes(query.toLowerCase());
        });
        
        resultsContainer.innerHTML = results.map(product => {
            const productName = t(product.nameKey);
            const productDescription = t(product.descriptionKey);
            
            return `
                <div class="search-result-item" onclick="productManager.addToCart(${product.id})">
                    <img src="${product.image}" alt="${productName}">
                    <div class="search-result-info">
                        <h4>${productName}</h4>
                        <p>${productDescription}</p>
                        <span class="price">€${product.price.toFixed(2)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product && product.inStock && window.cartManager) {
            const t = window.translations ? window.translations.t : (key) => key;
            const productName = t(product.nameKey);
            
            // Create a product object with translated name for the cart
            const productForCart = {
                ...product,
                name: productName,
                description: t(product.descriptionKey)
            };
            
            window.cartManager.addItem(productForCart);
            this.showNotification(`${productName} ${t('added_to_cart')}`);
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