(function () {
    const SETTINGS = window.rqGlobalSettings || {
        buttonText: 'Add to Quote',
        buttonColor: '#008060',
        buttonTextColor: '#FFFFFF',
        hideAddToCart: true,
        hideBuyNow: false,
        placementLocation: 'above'
    };


    window.rqOpenModal = async function (blockId) {
        const modal = document.getElementById(`rqModal-${blockId}`);
        if (!modal) return;

        if (!modal.dataset.isBulk || modal.dataset.isBulk === 'undefined') {
            modal.dataset.isBulk = 'false';
        }

        if (modal.dataset.isBulk === 'false') {
            const handleMatch = window.location.pathname.match(/\/products\/([^\/\?]+)/);
            if (handleMatch) {
                const handle = handleMatch[1];
                try {
                    const product = await window.RqApi.fetchProduct(handle);
                    if (product && window.RqUi.populateHiddenFields) {
                        window._rqCurrentProduct = product;
                        window.RqUi.populateHiddenFields(modal, product);
                        window.RqUi.showProductSummary(modal, product, window._rqFormConfig?.settings);
                    }
                } catch (e) {
                    console.error("Failed to populate modal for product:", e);
                }
            }
        }

        if (modal.dataset.formLoaded !== 'true') {
            const dynamicContainer = document.getElementById(`rq-dynamic-form-${blockId}`);
            if (dynamicContainer) {
                dynamicContainer.innerHTML = '<div style="text-align:center; padding: 2rem;">Loading form...</div>';
            }

            try {
                const shop = window.Shopify ? window.Shopify.shop : window.location.hostname;
                const formConfig = await window.RqApi.fetchFormConfig(shop);
                if (formConfig && formConfig.steps) {
                    window._rqFormConfig = formConfig;
                    window.RqUi.buildDynamicForm(blockId, formConfig);
                    
                    // Refresh product summary with new settings
                    if (modal.dataset.isBulk === 'false' && window._rqCurrentProduct) {
                        window.RqUi.showProductSummary(modal, window._rqCurrentProduct, formConfig.settings);
                    }
                    
                    modal.dataset.formLoaded = 'true';
                } else {
                    if (dynamicContainer) {
                        dynamicContainer.innerHTML = '<div style="color:red; text-align:center; padding: 2rem;">Error loading form configuration.</div>';
                    }
                }
            } catch (err) {
                console.error("Failed to fetch and build form:", err);
                if (dynamicContainer) {
                    dynamicContainer.innerHTML = '<div style="color:red; text-align:center; padding: 2rem;">An error occurred while loading the form.</div>';
                }
            }
        }

        window.RqUi.openModal(blockId);
    };

    window.rqCloseModal = function (blockId) {
        window.RqUi.closeModal(blockId);
    };

    window.rqResetAndClose = function (blockId) {
        window.RqUi.closeModal(blockId);
        window.RqUi.resetForm(blockId);
    };

    window.rqAddToQuoteCart = async function (handle, blockId, event) {
        const btn = event ? event.currentTarget : null;
        if (!btn) return;
        
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Adding...';
        btn.disabled = true;

        try {
            const product = await window.RqApi.fetchProduct(handle);
            if (product) {
                const qtyInput = document.getElementById('rqPageQtyInput-' + blockId) || document.getElementById('rqPageQtyInput');
                const qty = parseInt(qtyInput?.value) || 1;

                const item = {
                    productId: product.id,
                    variantId: product.variants[0].id, 
                    title: product.title,
                    variantTitle: product.variants[0].title,
                    price: product.variants[0].price,
                    featured_image: product.featured_image,
                    quantity: qty,
                    handle: handle
                };

                window.RqCart.addItem(item);
                btn.innerHTML = '✓ Added';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
            alert('Could not add product to quote cart.');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };

    window.rqOpenQuoteFormFromCart = async function () {
        const cart = window.RqCart.getCart();
        if (cart.length === 0) {
            alert('Your quote cart is empty.');
            return;
        }

        const blockId = 'global';
        const modal = document.getElementById(`rqModal-${blockId}`);
        if (!modal) {
            alert('Quote modal not found.');
            return;
        }

        window.RqCart.closeCart();
        window.RqUi.showBulkSummary(modal, cart);
        modal.dataset.isBulk = 'true';
        await window.rqOpenModal(blockId);
        modal.dataset.isBulk = 'true';
    };

    function resizeImage(url, size) {
        if (!url || typeof url !== 'string') return url || '';
        if (url.includes('cdn.shopify.com')) {
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}width=${size}`;
        }
        return url;
    }

    window.rqValidateAndSubmit = async function (blockId) {
        const modal = document.getElementById(`rqModal-${blockId}`);
        const isBulk = modal?.dataset.isBulk === 'true';
        const cartItems = isBulk ? window.RqCart.getCart() : null;

        const btn = document.querySelector(`#rq-step-input-${blockId} button.rq-submit-final`);
        
        // Validate entire form first
        if (window.RqValidation && window.RqValidation.validateStep) {
            if (!window.RqValidation.validateStep(blockId, 'all')) {
                return;
            }
        }

        const originalText = btn ? btn.innerHTML : 'Submit Quote';
        if (btn) {
            btn.innerText = 'Requesting...';
            btn.disabled = true;
        }

        try {
            const result = await window.RqApi.submitQuote(blockId, cartItems);
            if (result.success) {
                window.RqUi.showSuccess(blockId, result.data);
                if (isBulk) {
                    window.RqCart.saveCart([]); 
                    modal.dataset.isBulk = 'false';
                }
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Submission UI error:', error);
            alert('An unexpected error occurred during submission.');
        } finally {
            if (btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    };

    window.rqUpdatePageQty = function (change) {
        const input = document.getElementById('rqPageQtyInput');
        if (!input) return;
        let newVal = (parseInt(input.value) || 1) + change;
        if (newVal < 1) newVal = 1;
        input.value = newVal;
    };

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('rq-modal')) {
            window.rqCloseModal('global');
        }
        if (e.target.closest('.rq-modal-close')) {
            window.rqCloseModal('global');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') window.rqCloseModal('global');
    });


    function createQuoteButton(handle) {
        const btn = document.createElement('button');
        btn.className = 'rq-btn-injected';
        btn.innerText = SETTINGS.buttonText;
        btn.style.setProperty('--rq-primary', SETTINGS.buttonColor);
        btn.style.setProperty('--rq-primary-hover', SETTINGS.buttonColor);
        btn.style.color = SETTINGS.buttonTextColor;

        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.rqAddToQuoteCart(handle, 'global', e);
        };
        return btn;
    }

    function scanAndInject() {
        if (!SETTINGS.appEnabled || SETTINGS.shouldShow === false) return;
        
        const productBlockExists = !!document.querySelector('.rq-product-page-form');
        const isProductPage = window.location.pathname.includes('/products/') || productBlockExists;

        const hasQuoteBtn = (container) => container.querySelector('.rq-btn') || container.querySelector('.rq-btn-injected');
        const hideElement = (el) => {
            if (el) {
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('visibility', 'hidden', 'important');
            }
        };

        const forms = document.querySelectorAll('form[action*="/cart/add"]');
        forms.forEach(form => {
            if (form.dataset.rqProcessed) return;
            if (productBlockExists) {
                const section = form.closest('.shopify-section, section');
                if (section && section.querySelector('.rq-btn')) return;
            }

            let handle = null;
            const card = form.closest('.product-card, .card, .card-wrapper, .grid-view-item, .product-item, .grid__item') || form.parentElement;
            if (card) {
                const link = card.querySelector('a[href*="/products/"]');
                if (link) handle = link.getAttribute('href').match(/\/products\/([^\/\?]+)/)?.[1];
            }
            if (!handle && window.location.pathname.includes('/products/')) {
                handle = window.location.pathname.match(/\/products\/([^\/\?]+)/)?.[1];
            }

            if (handle) {
                if (SETTINGS.hideAddToCart) {
                    const selectors = [
                        '[name="add"]', '.product-form__submit', '.add-to-cart', '.btn--add-to-cart', '[data-add-to-cart]',
                        '.quantity', '.product-form__input--quantity', '.product-form__item--quantity', '[name="quantity"]', '.qty-wrapper', '.product-form__quantity',
                        '.quantity-selector-wrapper', 'quantity-selector-component', '.quantity-selector', '.quantity__input'
                    ];
                    selectors.forEach(selector => {
                        form.querySelectorAll(selector).forEach(hideElement);
                    });
                }

                if (SETTINGS.hidePriceGlobal || SETTINGS.loginToSeePrice) {
                    const container = isProductPage
                        ? (form.closest('.shopify-section, section, .product-grid, main') || form.parentNode)
                        : (card || form.parentNode);

                    if (container) {
                        const priceSelectors = '.price, .money, .product-price, .product__price, .price__regular, .price__sale, .regular-price, .product-item__price, .product-single__price, .price-item';
                        container.querySelectorAll(priceSelectors).forEach(hideElement);
                    }
                }

                if (SETTINGS.hideBuyNow) {
                    const buyNowSelectors = ['.shopify-payment-button', '.shopify-payment-button__button--unbranded', '.payment-buttons', '.product-form__payment-container'];
                    buyNowSelectors.forEach(selector => {
                        document.querySelectorAll(selector).forEach(hideElement);
                    });
                }

                const isRecommendation = form.closest('.product-recommendations, .related-products, .recommendations, .up-sell, .cross-sell, .complementary-products, .suggested-products, [class*="recommendation"], [class*="related-"]');

                if (isProductPage && !isRecommendation) {
                    if (hasQuoteBtn(form.parentNode)) return;
                    if (card && hasQuoteBtn(card)) return;

                    const btn = createQuoteButton(handle);
                    if (SETTINGS.placementLocation === 'below') {
                        form.parentNode.insertBefore(btn, form.nextSibling);
                    } else {
                        form.parentNode.insertBefore(btn, form);
                    }
                }

                form.dataset.rqProcessed = 'true';
            }
        });
    }

    window.rqScanAndInject = scanAndInject;
    window.addEventListener('load', () => {
        scanAndInject();
        if (SETTINGS.appEnabled && SETTINGS.shouldShow !== false && SETTINGS.hideBuyNow) {
            let count = 0;
            const interval = setInterval(() => {
                scanAndInject();
                if (++count >= 10) clearInterval(interval);
            }, 300);
        }
    });

    const observer = new MutationObserver(() => scanAndInject());
    observer.observe(document.body, { childList: true, subtree: true });
    scanAndInject();
    window.rqInitialized = true;
})();
