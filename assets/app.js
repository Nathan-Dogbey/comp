document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const SELLER_PHONE = '+233240000000';
    const FORM_ENDPOINT = ''; // Example: 'https://formspree.io/f/your_form_id'
    const CURRENCY = 'GHS';

    // --- STATE ---
    let products = [];
    let cart = JSON.parse(localStorage.getItem('speedparts-cart')) || [];
    let filteredProducts = [];

    // --- DOM ELEMENTS ---
    const productGrid = document.getElementById('product-grid');
    const searchInput = document.getElementById('search-input');
    const makeFilter = document.getElementById('filter-make');
    const conditionFilter = document.getElementById('filter-condition');
    const noResults = document.getElementById('no-results');
    const cartButton = document.getElementById('cart-button');
    const cartBadge = document.getElementById('cart-badge');
    const cartDrawer = document.getElementById('cart-drawer');
    const closeCartButton = document.getElementById('close-cart-button');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');
    const productModal = document.getElementById('product-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutForm = document.getElementById('checkout-form');
    const deliveryMethodRadios = document.querySelectorAll('input[name="deliveryMethod"]');
    const shippingAddressGroup = document.getElementById('shipping-address-group');
    const whatsappContactButton = document.getElementById('whatsapp-contact-button');

    // --- INITIALIZATION ---
    const init = async () => {
        setupEventListeners();
        await fetchProducts();
        populateFilters();
        renderProducts();
        updateCartUI();
        setupWhatsappButton();
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch('assets/products.json');
            if (!response.ok) throw new Error('Network response was not ok');
            products = await response.json();
            filteredProducts = [...products];
        } catch (error) {
            console.error('Error fetching products:', error);
            showToast('Could not load products. Please refresh.', 'error');
            // Fallback to empty array
            products = [];
            filteredProducts = [];
        }
    };

    const populateFilters = () => {
        // Populate make filter
        const makes = [...new Set(products.map(p => p.make))];
        makes.sort().forEach(make => {
            if (make !== "Universal") {
                const option = document.createElement('option');
                option.value = make;
                option.textContent = make;
                makeFilter.appendChild(option);
            }
        });

        // Populate model filter
        const modelFilter = document.getElementById('filter-model');
        const models = [...new Set(products.map(p => p.model))];
        models.sort().forEach(model => {
            if (model !== "Various") {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelFilter.appendChild(option);
            }
        });

        // Populate year filter
        const yearFilter = document.getElementById('filter-year');
        const years = [...new Set(products.map(p => p.year))];
        years.sort().forEach(year => {
            if (year !== "N/A") {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearFilter.appendChild(option);
            }
        });
    };
    
    const setupWhatsappButton = () => {
        whatsappContactButton.href = `https://wa.me/${SELLER_PHONE}?text=Hello!%20I%20have%20a%20question.`;
    };

    // --- RENDERING ---
    const renderProducts = () => {
        productGrid.innerHTML = '';
        if (filteredProducts.length === 0) {
            noResults.style.display = 'block';
            return;
        }
        noResults.style.display = 'none';

        const fragment = document.createDocumentFragment();
        filteredProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.productId = product.id;

            const stockInfo = getStockInfo(product);

            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-part-number">Part #: ${product.part_number}</p>
                    <p class="product-price">${CURRENCY} ${product.price.toFixed(2)}</p>
                    <div class="product-details">
                        <span class="condition-badge ${product.condition}">${product.condition}</span>
                        <span class="stock-indicator ${stockInfo.className}">${stockInfo.text}</span>
                    </div>
                    <div class="product-actions">
                        <button class="button secondary view-details-btn">View</button>
                        <button class="button primary add-to-cart-btn" ${stockInfo.disabled ? 'disabled' : ''}>Add to Cart</button>
                    </div>
                </div>
            `;
            fragment.appendChild(card);
        });
        productGrid.appendChild(fragment);
    };

    const getStockInfo = (product) => {
        const cartItem = cart.find(item => item.id === product.id);
        const availableStock = product.stock - (cartItem ? cartItem.quantity : 0);

        if (availableStock <= 0) {
            return { text: 'Out of Stock', className: 'out-of-stock', disabled: true };
        }
        if (availableStock < 5) {
            return { text: `Low Stock (${availableStock} left)`, className: 'low-stock', disabled: false };
        }
        return { text: 'In Stock', className: 'in-stock', disabled: false };
    };

    // --- SEARCH & FILTER ---
    const handleFilterAndSearch = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedMake = makeFilter.value;
        const selectedModel = document.getElementById('filter-model').value;
        const selectedYear = document.getElementById('filter-year').value;
        const selectedCategory = document.getElementById('filter-category').value;
        const selectedCondition = conditionFilter.value;

        filteredProducts = products.filter(product => {
            const matchesSearch =
                product.name.toLowerCase().includes(searchTerm) ||
                product.part_number.toLowerCase().includes(searchTerm) ||
                product.make.toLowerCase().includes(searchTerm) ||
                product.model.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm);

            const matchesMake = !selectedMake || product.make === selectedMake;
            const matchesModel = !selectedModel || product.model === selectedModel;
            const matchesYear = !selectedYear || product.year === selectedYear;
            const matchesCategory = !selectedCategory || product.category === selectedCategory;
            const matchesCondition = !selectedCondition || product.condition === selectedCondition;

            return matchesSearch && matchesMake && matchesModel && matchesYear && matchesCategory && matchesCondition;
        });

        renderProducts();
    };

    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // --- MODALS & DRAWERS ---
    const openModal = (modal) => {
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        focusable[0]?.focus();
    };

    const closeModal = (modal) => {
        modal.hidden = true;
        document.body.style.overflow = '';
    };

    const showProductModal = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const modalContent = productModal.querySelector('.modal-content');
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2 id="modal-title" class="product-name">${product.name}</h2>
                <button class="close-button" aria-label="Close product details">&times;</button>
            </div>
            <div class="modal-product-layout">
                <img src="${product.images[0]}" alt="${product.name}" class="modal-product-image">
                <div class="modal-product-info">
                    <p class="product-part-number">Part #: ${product.part_number}</p>
                    <p class="product-price">${CURRENCY} ${product.price.toFixed(2)}</p>
                    <div class="spec-chips">
                        <span class="spec-chip"><strong>Make:</strong> ${product.make}</span>
                        <span class="spec-chip"><strong>Model:</strong> ${product.model}</span>
                        <span class="spec-chip"><strong>Year:</strong> ${product.year}</span>
                        <span class="spec-chip"><strong>Condition:</strong> <span class="condition-badge ${product.condition}">${product.condition}</span></span>
                    </div>
                    <p>${product.description}</p>
                    <br>
                    <button class="button primary add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `;
        openModal(productModal);
    };

    // --- CART LOGIC ---
    const addToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const cartItem = cart.find(item => item.id === productId);
        
        if (cartItem) {
            if (cartItem.quantity < product.stock) {
                cartItem.quantity++;
                showToast(`${product.name} quantity updated.`);
            } else {
                showToast(`${product.name} max stock for ${product.name} reached.`, 'error');
                return;
            }
        } else {
            if (product.stock > 0) {
                cart.push({ id: productId, quantity: 1 });
                showToast(`${product.name} added to cart.`);
            } else {
                showToast(`${product.name} is out of stock.`, 'error');
                return;
            }
        }
        saveCart();
        updateCartUI();
    };

    const updateCartQuantity = (productId, newQuantity) => {
        const cartItem = cart.find(item => item.id === productId);
        const product = products.find(p => p.id === productId);

        if (!cartItem || !product) return;

        if (newQuantity > product.stock) {
            newQuantity = product.stock;
            showToast(`Only ${product.stock} of ${product.name} available.`, 'error');
        }

        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            cartItem.quantity = newQuantity;
        }

        saveCart();
        updateCartUI();
    };

    const removeFromCart = (productId) => {
        const productName = products.find(p => p.id === productId)?.name || 'Item';
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartUI();
        showToast(`${productName} removed from cart.`);
    };

    const saveCart = () => {
        localStorage.setItem('speedparts-cart', JSON.stringify(cart));
    };

    const clearCart = () => {
        cart = [];
        saveCart();
        updateCartUI();
    };

    // --- CART UI ---
    const updateCartUI = () => {
        updateCartBadge();
        renderCartItems();
        updateCartTotals();
        renderProducts(); // Re-render products to update stock status
    };

    const updateCartBadge = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    };

    const renderCartItems = () => {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '';
            cartEmpty.style.display = 'block';
            return;
        }
        cartEmpty.style.display = 'none';
        cartItemsContainer.innerHTML = '';

        const fragment = document.createDocumentFragment();
        cart.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (!product) return;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.dataset.productId = product.id;
            itemEl.innerHTML = `
                <img src="${product.images[0]}" alt="${product.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <p class="cart-item-name">${product.name}</p>
                    <p class="cart-item-part">#${product.part_number}</p>
                    <p class="cart-item-price">${CURRENCY} ${product.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn decrease-qty">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="${product.stock}">
                        <button class="quantity-btn increase-qty">+</button>
                    </div>
                    <button class="remove-item-btn" aria-label="Remove item">&times;</button>
                </div>
            `;
            fragment.appendChild(itemEl);
        });
        cartItemsContainer.appendChild(fragment);
    };

    const updateCartTotals = () => {
        const subtotal = cart.reduce((sum, item) => {
            const product = products.find(p => p.id === item.id);
            return sum + (product ? product.price * item.quantity : 0);
        }, 0);

        cartSubtotalEl.textContent = `${CURRENCY} ${subtotal.toFixed(2)}`;
        cartTotalEl.textContent = `${CURRENCY} ${subtotal.toFixed(2)}`;
        checkoutButton.disabled = cart.length === 0;
    };

    // --- CHECKOUT ---
    const handleCheckout = async (e) => {
        e.preventDefault();
        const formData = new FormData(checkoutForm);
        const data = Object.fromEntries(formData.entries());

        const orderDetails = {
            customer: {
                name: data.name,
                phone: data.phone,
            },
            delivery: {
                method: data.deliveryMethod,
                address: data.deliveryMethod === 'shipping' ? data.address : 'N/A',
            },
            notes: data.notes,
            items: cart.map(item => {
                const product = products.find(p => p.id === item.id);
                return {
                    id: item.id,
                    name: product.name,
                    part_number: product.part_number,
                    quantity: item.quantity,
                    price: product.price,
                };
            }),
            total: cart.reduce((sum, item) => {
                const product = products.find(p => p.id === item.id);
                return sum + (product.price * item.quantity);
            }, 0),
        };

        // 1. Send to WhatsApp
        const whatsappMessage = generateWhatsappMessage(orderDetails);
        window.open(`https://wa.me/${SELLER_PHONE}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');

        // 2. Send to Form Endpoint
        if (FORM_ENDPOINT) {
            try {
                const response = await fetch(FORM_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(orderDetails)
                });
                if (!response.ok) throw new Error('Form submission failed');
                showToast('Order submitted successfully!');
            } catch (error) {
                console.error('Form submission error:', error);
                showToast('Order sent to WhatsApp, but failed to email seller.', 'error');
                // Fallback to mailto
                const mailtoLink = generateMailtoLink(orderDetails);
                window.location.href = mailtoLink;
            }
        } else {
            // Fallback to mailto if no endpoint
            const mailtoLink = generateMailtoLink(orderDetails);
            window.location.href = mailtoLink;
            showToast('Order sent to WhatsApp. Please also send the email.');
        }

        closeModal(checkoutModal);
        clearCart();
    };

    const generateWhatsappMessage = (order) => {
        let message = `*New Order from ${order.customer.name}*\n\n`;
        message += `*Customer:* ${order.customer.name}\n`;
        message += `*Phone:* ${order.customer.phone}\n\n`;
        message += `*Items:*\n`;
        order.items.forEach(item => {
            message += `- ${item.name} (#${item.part_number}) x ${item.quantity} @ ${CURRENCY} ${item.price.toFixed(2)}\n`;
        });
        message += `\n*Subtotal: ${CURRENCY} ${order.total.toFixed(2)}*\n\n`;
        message += `*Delivery Method:* ${order.delivery.method}\n`;
        if (order.delivery.method === 'shipping') {
            message += `*Address:* ${order.delivery.address}\n`;
        }
        if (order.notes) {
            message += `*Notes:* ${order.notes}\n`;
        }
        return message;
    };
    
    const generateMailtoLink = (order) => {
        const subject = `New Order from ${order.customer.name}`;
        const body = generateWhatsappMessage(order).replace(/\*/g, '\\n'); // Simple text version
        return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    // --- UI HELPERS ---
    const showToast = (message, type = 'success') => {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.style.backgroundColor = type === 'error' ? 'var(--danger-color)' : 'var(--dark-color)';
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    };

    // --- EVENT LISTENERS ---
    const setupEventListeners = () => {
        searchInput.addEventListener('input', debounce(handleFilterAndSearch, 300));
        makeFilter.addEventListener('change', handleFilterAndSearch);
        document.getElementById('filter-model').addEventListener('change', handleFilterAndSearch);
        document.getElementById('filter-year').addEventListener('change', handleFilterAndSearch);
        document.getElementById('filter-category').addEventListener('change', handleFilterAndSearch);
        conditionFilter.addEventListener('change', handleFilterAndSearch);

        cartButton.addEventListener('click', () => openModal(cartDrawer));
        closeCartButton.addEventListener('click', () => closeModal(cartDrawer));
        cartDrawer.addEventListener('click', (e) => {
            if (e.target === cartDrawer.querySelector('.drawer-overlay')) {
                closeModal(cartDrawer);
            }
        });

        productGrid.addEventListener('click', (e) => {
            const target = e.target;
            const card = target.closest('.product-card');
            if (!card) return;

            const productId = parseInt(card.dataset.productId);

            if (target.classList.contains('add-to-cart-btn')) {
                addToCart(productId);
            } else if (target.classList.contains('view-details-btn')) {
                showProductModal(productId);
            }
        });

        // Category filter click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-card')) {
                const category = e.target.closest('.category-card').dataset.category;
                document.getElementById('filter-category').value = category;
                handleFilterAndSearch();
                document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
            }
        });

        document.addEventListener('click', (e) => {
            // For modals opened after initial load
            if (e.target.classList.contains('add-to-cart-btn')) {
                const productId = parseInt(e.target.dataset.productId);
                if(productId) addToCart(productId);
            }
            
            const modal = e.target.closest('.modal');
            if (modal) {
                if (e.target.classList.contains('close-button') || e.target.classList.contains('modal-overlay')) {
                    closeModal(modal);
                }
            }
        });

        cartItemsContainer.addEventListener('click', (e) => {
            const itemEl = e.target.closest('.cart-item');
            if (!itemEl) return;
            const productId = parseInt(itemEl.dataset.productId);
            let quantity = cart.find(i => i.id === productId).quantity;

            if (e.target.classList.contains('increase-qty')) {
                updateCartQuantity(productId, quantity + 1);
            } else if (e.target.classList.contains('decrease-qty')) {
                updateCartQuantity(productId, quantity - 1);
            } else if (e.target.classList.contains('remove-item-btn')) {
                removeFromCart(productId);
            }
        });
        
        cartItemsContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const itemEl = e.target.closest('.cart-item');
                const productId = parseInt(itemEl.dataset.productId);
                const newQuantity = parseInt(e.target.value);
                if (!isNaN(newQuantity)) {
                    updateCartQuantity(productId, newQuantity);
                }
            }
        });

        checkoutButton.addEventListener('click', () => {
            closeModal(cartDrawer);
            openModal(checkoutModal);
        });
        
        checkoutForm.addEventListener('submit', handleCheckout);
        
        deliveryMethodRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                const isShipping = document.querySelector('input[name="deliveryMethod"]:checked').value === 'shipping';
                shippingAddressGroup.style.display = isShipping ? 'block' : 'none';
                document.getElementById('shipping-address').required = isShipping;
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!cartDrawer.hidden) closeModal(cartDrawer);
                if (!productModal.hidden) closeModal(productModal);
                if (!checkoutModal.hidden) closeModal(checkoutModal);
            }
        });
    };

    // --- START THE APP ---
    init();
});
