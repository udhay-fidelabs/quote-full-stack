(function () {
    window.RqUi = {
        openModal: function (blockId) {
            const modal = document.getElementById(`rqModal-${blockId}`);
            if (modal) {
                this.resetForm(blockId);
                document.body.style.overflow = 'hidden';
                modal.classList.add('open');
                modal.setAttribute('aria-hidden', 'false');
            }
        },

        closeModal: function (blockId) {
            const modals = document.querySelectorAll('.rq-modal');
            modals.forEach(modal => {
                modal.classList.remove('open');
                modal.setAttribute('aria-hidden', 'true');
            });
            document.body.style.overflow = '';
            this.resetForm(blockId);
        },

        showProductSummary: function (modal, product, settings) {
            let hero = modal.querySelector('.rq-product-hero');
            if (!hero) return;

            const priceText = window.RqCart ? window.RqCart.formatPrice((product.variants && product.variants[0]) ? product.variants[0].price : 0) : '';
            const vTitle = (product.variants && product.variants[0]) ? product.variants[0].title : '';

            let metaHtml = '';
            if (settings && settings.showVendor && product.vendor) {
                metaHtml += `<div style="font-size: 13px; color: #6d7175; margin-top: 4px;">Vendor: ${product.vendor}</div>`;
            }
            if (settings && settings.showSku && product.variants && product.variants[0] && product.variants[0].sku) {
                metaHtml += `<div style="font-size: 13px; color: #6d7175;">SKU: ${product.variants[0].sku}</div>`;
            }

            hero.innerHTML = `
                <div class="rq-single-item-card" style="background: #fff; border: 1px solid #e1e3e5; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                        <img src="${product.featured_image}" alt="${product.title}" style="width: 180px; height: 180px; border-radius: 12px; object-fit: cover; border: 1px solid #f0f0f0; margin-bottom: 20px;">
                        <div style="width: 100%;">
                            <h4 style="font-size: 20px; font-weight: 800; color: #1a1a1b; margin: 0 0 8px 0;">${product.title}</h4>
                            <div style="font-size: 15px; color: #6d7175; margin-bottom: 12px;">${vTitle && vTitle !== 'Default Title' ? vTitle : ''}</div>
                            
                            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <span style="color: #6d7175; font-size: 14px;">Unit Price</span>
                                    <span style="font-weight: 700; color: var(--rq-accent); font-size: 16px;">${priceText}</span>
                                </div>
                                ${metaHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Handle Product Note
            if (settings && settings.showProductNote) {
                const noteEl = document.createElement('div');
                noteEl.className = 'rq-product-note';
                noteEl.style.cssText = 'margin-top: 20px; padding: 16px; background: #fffde7; border-left: 4px solid #fbc02d; border-radius: 4px; font-size: 13px; color: #5d4037; line-height: 1.5;';
                noteEl.innerHTML = `<strong>Note:</strong> Pricing and availability may vary based on your specific requirements and shipping location.`;
                hero.appendChild(noteEl);
            }
        },

        populateHiddenFields: function (modal, product) {
            const form = modal.querySelector('form');
            if (form) {
                const setVal = (name, val) => {
                    const inp = form.querySelector(`input[name="${name}"]`);
                    if (inp) inp.value = val;
                };
                setVal('productId', product.id);
                setVal('handle', product.handle);
                setVal('variantId', product.variants[0]?.id || '');
                setVal('productTitle', product.title);
                setVal('productUrl', window.location.origin + product.url);
                setVal('variantTitle', product.variants[0]?.title || '');
                setVal('price', (product.variants[0]?.price || 0) / 100.0);
                setVal('productImage', product.featured_image || '');
            }
        },

        showBulkSummary: function (modal, cart) {
            let hero = modal.querySelector('.rq-product-hero');
            if (!hero) return;

            const totalText = window.RqCart ? window.RqCart.formatPrice(cart.reduce((acc, i) => acc + (i.price * i.quantity), 0)) : '';

            let html = `
                <div class="rq-bulk-items-list">
            `;

            cart.forEach(item => {
                html += `
                    <div class="rq-bulk-item" style="display: flex; align-items: center; padding: 16px; background: #fff; border: 1px solid #e1e3e5; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <img src="${item.featured_image}" alt="${item.title}" style="width: 64px; height: 64px; border-radius: 8px; object-fit: cover; border: 1px solid #f0f0f0;">
                        <div style="margin-left: 16px; flex: 1;">
                            <div style="font-weight: 700; color: #1a1a1b; font-size: 15px;">${item.title}</div>
                            <div style="font-size: 13px; color: #6d7175;">${item.variantTitle && item.variantTitle !== 'Default Title' ? item.variantTitle : ''}</div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                                <span style="font-size: 13px; font-weight: 600;">Qty: ${item.quantity}</span>
                                <span style="font-size: 14px; font-weight: 700; color: var(--rq-accent);">${window.RqCart.formatPrice(item.price * item.quantity)}</span>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            
            html += `
                <div class="rq-bulk-total" style="margin-top: 24px; padding: 20px; background: #f1f2f3; border-radius: 12px; border: 1px dashed #c9cccf;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 700; color: #1a1a1b;">Total Items:</span>
                        <span style="font-weight: 700;">${cart.reduce((acc, i) => acc + i.quantity, 0)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 18px;">
                        <span style="font-weight: 800; color: #1a1a1b;">Total Estimate:</span>
                        <span style="font-weight: 800; color: var(--rq-accent);">${totalText}</span>
                    </div>
                </div>
            `;

            hero.innerHTML = html;
        },

        buildDynamicForm: function (blockId, formConfig) {
            const container = document.getElementById(`rq-dynamic-form-${blockId}`);
            if (!container || !formConfig || !formConfig.steps) return;

            // Collect all fields from all steps into a single array
            const allFields = formConfig.steps.flatMap(step => step.fields);

            const emailIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            const phoneIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            const submitIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            const fileIcon = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`;

            let html = `<div class="rq-step active" id="rq-step-all-${blockId}">`;
            html += `<div class="rq-step-content">`;

            allFields.forEach(field => {
                const layoutClass = field.layoutWidth === 'half' ? ' rq-col-half' : '';
                html += `<div class="rq-input-group${layoutClass}" data-field-id="${field.id}">`;
                html += `<label>${field.label} ${field.required ? '<span class="rq-required">*</span>' : ''}</label>`;
                
                if (field.helpText) {
                    html += `<div class="rq-help-text">${field.helpText}</div>`;
                }

                const fieldName = field.id.replace('field-', '');
                const fieldId = `rq-${fieldName}-${blockId}`;
                const requiredAttr = field.required ? 'required' : '';

                let attrs = requiredAttr;
                if (field.minLength) attrs += ` minlength="${field.minLength}"`;
                if (field.maxLength) attrs += ` maxlength="${field.maxLength}"`;
                if (field.validationRegex) attrs += ` pattern="${field.validationRegex}"`;
                if (field.validationMessage) attrs += ` data-val-msg="${field.validationMessage}"`;

                if (field.type === 'email') {
                    html += `<div class="rq-input-icon">${emailIcon}<input type="email" name="${fieldName}" id="${fieldId}" ${attrs}></div>`;
                } else if (field.type === 'phone') {
                    const placeholderStr = field.maxLength ? `Max ${field.maxLength} digits` : '10 digits';
                    html += `<div class="rq-input-icon">${phoneIcon}<input type="tel" name="${fieldName}" id="${fieldId}" placeholder="${placeholderStr}" oninput="this.value = this.value.replace(/[^0-9]/g, '');" ${attrs}></div>`;
                } else if (field.type === 'number') {
                    html += `<input type="text" inputmode="numeric" name="${fieldName}" id="${fieldId}" oninput="this.value = this.value.replace(/[^0-9]/g, '');" ${attrs}>`;
                } else if (field.type === 'textarea') {
                    html += `<textarea name="${fieldName}" id="${fieldId}" rows="5" placeholder="Tell us more about your requirements..." ${attrs}></textarea>`;
                    if (field.maxLength) html += `<small class="rq-char-count">Max ${field.maxLength} characters</small>`;
                } else if (field.type === 'file') {
                    const isMultiple = field.allowMultiple || field.isMultiple || field.id.includes('multiple') || (field.label && field.label.toLowerCase().includes('multiple'));
                    const maxFiles = isMultiple ? 3 : 1;
                    const acceptAttr = field.allowedFileTypes ? `accept="${field.allowedFileTypes}"` : 'accept="image/*"';
                    const maxMbAttr = field.maxFileSizeMB ? `data-max-mb="${field.maxFileSizeMB}"` : 'data-max-mb="5"';

                    html += `
                        <div class="rq-image-upload-wrapper" id="rq-file-wrapper-${fieldId}">
                            <div class="rq-dropzone" onclick="document.getElementById('${fieldId}').click()" 
                                    ondragover="event.preventDefault(); this.classList.add('dragover')" 
                                    ondragleave="this.classList.remove('dragover')"
                                    ondrop="window.RqUi.handleFileDrop(event, '${fieldId}', ${maxFiles})">
                                <div class="rq-dropzone-icon">${fileIcon}</div>
                                <div class="rq-dropzone-text">Click to upload or drag and drop</div>
                                <div class="rq-dropzone-subtext">${field.allowedFileTypes || 'Images only'} (Max ${maxFiles} file${maxFiles > 1 ? 's' : ''}, ${field.maxFileSizeMB || '5'}MB each)</div>
                                <input type="file" name="${fieldName}" id="${fieldId}" ${acceptAttr} ${maxMbAttr} ${requiredAttr} ${isMultiple ? 'multiple' : ''} style="display:none;" onchange="window.RqUi.handleFileSelect(event, '${fieldId}', ${maxFiles})">
                            </div>
                            <div class="rq-file-previews" id="rq-previews-${fieldId}"></div>
                        </div>
                    `;
                } else if (field.type === 'price') {
                    html += `<div class="rq-input-currency"><span class="rq-currency-symbol">$</span><input type="number" name="${fieldName}" id="${fieldId}" step="0.01" min="0" placeholder="0.00" ${attrs}></div>`;
                } else {
                    if (fieldName === 'pincode' || field.validationRegex === '^[0-9]+$') {
                        html += `<input type="text" name="${fieldName}" id="${fieldId}" oninput="this.value = this.value.replace(/[^0-9]/g, '');" ${attrs}>`;
                    } else {
                        html += `<input type="text" name="${fieldName}" id="${fieldId}" ${attrs}>`;
                    }
                }

                html += `<span class="rq-error" id="rq-error-${fieldName}-${blockId}"></span>`;
                html += `</div>`;
            });

            html += `</div>`; // end rq-step-content

            // Submit Button always at the end
            html += `<div class="rq-btn-group" style="margin-top: 32px;">`;
            html += `<button type="button" onclick="rqValidateAndSubmit('${blockId}')" class="rq-submit-btn rq-submit-final" style="width: 100%;">${submitIcon}${formConfig.settings?.submitButtonText || 'Submit Quote Request'}</button>`;
            html += `</div>`;

            html += `</div>`; // end rq-step

            container.innerHTML = html;
        },

        resetForm: function (blockId) {
            const form = document.getElementById('rq-form-' + blockId);
            if (form) form.reset();

            const errorSpans = document.querySelectorAll(`#rq-form-${blockId} .rq-error`);
            errorSpans.forEach(el => el.innerText = '');

            const successSection = document.getElementById('rq-step-success-' + blockId);
            if (successSection) successSection.style.display = 'none';
            const inputSection = document.getElementById('rq-step-input-' + blockId);
            if (inputSection) inputSection.style.display = 'block';

            if (form) {
                const fileInputs = form.querySelectorAll('input[type="file"]');
                fileInputs.forEach(input => {
                    input._rq_files = [];
                    const previewContainer = document.getElementById(`rq-previews-${input.id}`);
                    if (previewContainer) previewContainer.innerHTML = '';
                });
            }

            const submitBtns = document.querySelectorAll(`#rq-form-${blockId} .rq-submit-btn`);
            submitBtns.forEach(b => {
                b.disabled = false;
            });
        },

        showSuccess: function (blockId) {
            document.getElementById(`rq-step-input-${blockId}`).style.display = 'none';
            const successEl = document.getElementById(`rq-step-success-${blockId}`);
            if (successEl) successEl.style.display = 'block';
        },

        handleFileDrop: function (event, fieldId, maxFiles) {
            event.preventDefault();
            const dropzone = event.currentTarget;
            dropzone.classList.remove('dragover');
            const files = event.dataTransfer.files;
            if (files.length) this.processFiles(files, fieldId, maxFiles);
        },

        handleFileSelect: function (event, fieldId, maxFiles) {
            const files = event.target.files;
            if (files.length) this.processFiles(files, fieldId, maxFiles);
        },

        processFiles: function (fileList, fieldId, maxFiles) {
            const input = document.getElementById(fieldId);
            const previewContainer = document.getElementById(`rq-previews-${fieldId}`);
            if (!input || !previewContainer) return;

            const maxMb = parseFloat(input.dataset.maxMb) || 5;
            let existingFiles = input._rq_files || [];

            for (const file of fileList) {
                if (!file.type.startsWith('image/')) {
                    alert(`File "${file.name}" is not an image.`);
                    continue;
                }
                if (file.size > maxMb * 1024 * 1024) {
                    alert(`File "${file.name}" exceeds the ${maxMb}MB limit.`);
                    continue;
                }
                if (maxFiles === 1) {
                    existingFiles = [file];
                } else {
                    if (existingFiles.length < 3) {
                        const isDup = existingFiles.some(f => f.name === file.name && f.size === file.size);
                        if (!isDup) existingFiles.push(file);
                    } else {
                        alert('Maximum 3 images allowed.');
                        break;
                    }
                }
            }

            input._rq_files = existingFiles;
            this.renderPreviews(fieldId, existingFiles);
            input.value = '';
        },

        renderPreviews: function (fieldId, files) {
            const previewContainer = document.getElementById(`rq-previews-${fieldId}`);
            if (!previewContainer) return;
            previewContainer.innerHTML = '';

            files.forEach((file, index) => {
                const reader = new FileReader();
                const previewItem = document.createElement('div');
                previewItem.className = 'rq-preview-item';

                const removeBtn = document.createElement('button');
                removeBtn.className = 'rq-preview-remove';
                removeBtn.type = 'button';
                removeBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                removeBtn.onclick = (e) => {
                    e.stopPropagation();
                    this.removeFile(fieldId, index);
                };

                const img = document.createElement('img');
                reader.onload = (e) => { img.src = e.target.result; };
                reader.readAsDataURL(file);

                const filename = document.createElement('div');
                filename.className = 'rq-preview-filename';
                filename.innerText = file.name;

                previewItem.appendChild(img);
                previewItem.appendChild(removeBtn);
                previewItem.appendChild(filename);
                previewContainer.appendChild(previewItem);
            });
        },

        removeFile: function (fieldId, index) {
            const input = document.getElementById(fieldId);
            if (!input || !input._rq_files) return;
            input._rq_files.splice(index, 1);
            input.value = '';
            this.renderPreviews(fieldId, input._rq_files);
        }
    };
})();
