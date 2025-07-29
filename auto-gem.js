(function () {
    const requiredToken = "mySecretToken123"; // only shared in loader
    if (window._privateToken !== requiredToken) {
        console.warn("Unauthorized access: Invalid token");
        return;
    }

    // Paste your original script BELOW this line 👇
    
    let speedMultiplier = parseFloat(localStorage.getItem('gem_speed_multiplier')) || 1.5;
    const speedBtn = document.createElement('button');
    speedBtn.innerText = `Speed: ${speedMultiplier}x`;
    speedBtn.style.position = 'fixed';
    speedBtn.style.top = '10px';
    speedBtn.style.right = '10px';
    speedBtn.style.zIndex = 9999;
    speedBtn.style.padding = '6px 12px';
    speedBtn.style.backgroundColor = '#007bff';
    speedBtn.style.color = 'white';
    speedBtn.style.border = 'none';
    speedBtn.style.borderRadius = '5px';
    speedBtn.style.cursor = 'pointer';

    speedBtn.onclick = () => {
        const newSpeed = prompt("Enter speed multiplier (e.g., 1.0 = normal, 2.0 = slower)", speedMultiplier);
        if (newSpeed !== null && !isNaN(parseFloat(newSpeed))) {
            speedMultiplier = parseFloat(newSpeed);
            localStorage.setItem('gem_speed_multiplier', speedMultiplier);
            speedBtn.innerText = `Speed: ${speedMultiplier}x`;
        }
    };

    document.body.appendChild(speedBtn);

    const wspTyped = { started: false };
    const excludedRegions = [
        "East", "West", "North", "South", "North-East",
        "Jammu Kashmir", "Lakshadweep", "Andaman Nicobar"
    ];

    const popupObserver = new MutationObserver(() => {
        const okButton = document.querySelector('button[ng-click="populateCatalogDetails(catalogform)"]');
        if (okButton && okButton.innerText.trim() === "Ok") {
            okButton.click();
            console.log("Popup 'Ok' clicked");
        }
    });
    popupObserver.observe(document.body, { childList: true, subtree: true });

    function wait(ms, useSpeed = true) {
        const effective = useSpeed ? ms * speedMultiplier : ms;
        return new Promise(resolve => setTimeout(resolve, effective));
    }

    function waitForSelector(selector, timeout = 6000) {
        return new Promise((resolve, reject) => {
            const interval = 150;
            let elapsed = 0;
            const timer = setInterval(() => {
                const el = document.querySelector(selector);
                if (el) {
                    clearInterval(timer);
                    resolve(el);
                } else if (elapsed >= timeout) {
                    clearInterval(timer);
                    reject(`Timeout: ${selector}`);
                }
                elapsed += interval;
            }, interval);
        });
    }

    async function selectIndiaAndYes() {
        try {
            const input = await waitForSelector('input[placeholder="Select or search countries"]');
            input.click();
            await wait(400);
            const options = document.querySelectorAll('.ui-select-choices-row-inner');
            for (let opt of options) {
                if (opt.textContent.trim() === 'India') {
                    opt.click();
                    console.log('India selected');
                    break;
                }
            }

            await wait(300);
            const radioYes = document.querySelector('input[type="radio"][name="mii_applicable"][value="true"]');
            if (radioYes) {
                radioYes.click();
                console.log('"Yes" radio selected');
            }
        } catch (err) {
            console.warn("Country + Yes selection skipped or failed:", err);
        }
    }

    async function openAndSelectDate(buttonSelector, jumpAhead = 0, useSpeed = true) {
        try {
            const btn = document.querySelector(buttonSelector);
            if (btn && !btn.disabled) {
                btn.click();
                await wait(360, useSpeed);
                for (let i = 0; i < jumpAhead; i++) {
                    const nextBtn = document.querySelector('button[ng-click="move(1)"]');
                    if (nextBtn) {
                        nextBtn.click();
                        await wait(180, useSpeed);
                    }
                }
                const dates = document.querySelectorAll('span.ng-binding');
                for (let d of dates) {
                    if (d.textContent.trim() === '01') {
                        d.click();
                        break;
                    }
                }
            } else {
                throw new Error("Date button missing/disabled");
            }
        } catch (err) {
            console.warn("Date picker failed or skipped:", err);
        }
    }

    function tickStatesExceptRegions() {
        const observer = new MutationObserver(() => {
            const spans = document.querySelectorAll('span');
            spans.forEach(span => {
                const text = span.innerText.trim();
                const checkbox = span.querySelector('input[type="checkbox"]');
                if (checkbox && !checkbox.checked && !excludedRegions.includes(text)) {
                    checkbox.click();
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function handleModalCheckbox() {
        const checkbox = document.querySelector('input[type="checkbox"][ng-model="catSvc.data.stock.chain_document_declaration.value"]');
        if (checkbox && !checkbox.checked && !checkbox.disabled) {
            checkbox.click();
            console.log("Modal checkbox clicked");

            const interval = setInterval(() => {
                const closeBtn = document.querySelector('span[ng-click="cancel()"], button[ng-click="cancel()"]');
                if (closeBtn && closeBtn.offsetParent !== null) {
                    closeBtn.click();
                    console.log("Modal closed");
                    clearInterval(interval);
                }
            }, 360);
            setTimeout(() => clearInterval(interval), 3600);
        }
    }

    function setAngularValue(input, value) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function autofillFields() {
        const fields = [
            { name: "authorization_no", value: "Na" },
            { name: "authorization_agency", value: "Na" },
            { name: "quantity", value: "98837" },
            { name: "lead_time", value: "1" }
        ];

        fields.forEach(field => {
            const input = document.querySelector(`input[name="${field.name}"]`);
            if (input && !input.disabled) {
                setAngularValue(input, field.value);
                console.log(`Filled ${field.name}`);
            }
        });

        const wsp = document.querySelector('input[name="wsp"]');
        if (wsp && !wsp.disabled) {
            wsp.scrollIntoView({ behavior: 'smooth', block: 'center' });
            wsp.focus();
            wsp.click();

            if (!wspTyped.started) {
                wsp.value = "";
                wsp.dispatchEvent(new Event('input', { bubbles: true }));
                wsp.dispatchEvent(new Event('change', { bubbles: true }));
                setTimeout(() => wsp.focus(), 120);
                wspTyped.started = true;
                console.log("Focused and ready for WSP typing");
            }
        }
    }

    async function runSequence() {
        await wait(1200);
        await selectIndiaAndYes();
        await wait(600);

        const authDateBtn = document.querySelector('button[ng-click*="authorization_date_opened"]');
        if (authDateBtn && !authDateBtn.disabled) {
            await openAndSelectDate('button[ng-click*="authorization_date_opened"]');
            await wait(600);
            await openAndSelectDate('button[ng-click*="authorization_valid_from_opened"]');
            await wait(600);
            await openAndSelectDate('button[ng-click*="authorization_valid_to_opened"]', 24, false); // no speed
        } else {
            console.log("Authorization date not available — skipping all three date pickers.");
        }

        tickStatesExceptRegions();
        setTimeout(() => handleModalCheckbox(), 3000);
        setTimeout(() => autofillFields(), 4800);
    }

    window.addEventListener('load', runSequence);
})();(function () {
    const requiredToken = "mySecretToken123"; // only shared in loader
    if (window._privateToken !== requiredToken) {
        console.warn("Unauthorized access: Invalid token");
        return;
    }

    // Paste your original script BELOW this line 👇
    
    let speedMultiplier = parseFloat(localStorage.getItem('gem_speed_multiplier')) || 1.5;
    const speedBtn = document.createElement('button');
    speedBtn.innerText = `Speed: ${speedMultiplier}x`;
    speedBtn.style.position = 'fixed';
    speedBtn.style.top = '10px';
    speedBtn.style.right = '10px';
    speedBtn.style.zIndex = 9999;
    speedBtn.style.padding = '6px 12px';
    speedBtn.style.backgroundColor = '#007bff';
    speedBtn.style.color = 'white';
    speedBtn.style.border = 'none';
    speedBtn.style.borderRadius = '5px';
    speedBtn.style.cursor = 'pointer';

    speedBtn.onclick = () => {
        const newSpeed = prompt("Enter speed multiplier (e.g., 1.0 = normal, 2.0 = slower)", speedMultiplier);
        if (newSpeed !== null && !isNaN(parseFloat(newSpeed))) {
            speedMultiplier = parseFloat(newSpeed);
            localStorage.setItem('gem_speed_multiplier', speedMultiplier);
            speedBtn.innerText = `Speed: ${speedMultiplier}x`;
        }
    };

    document.body.appendChild(speedBtn);

    const wspTyped = { started: false };
    const excludedRegions = [
        "East", "West", "North", "South", "North-East",
        "Jammu Kashmir", "Lakshadweep", "Andaman Nicobar"
    ];

    const popupObserver = new MutationObserver(() => {
        const okButton = document.querySelector('button[ng-click="populateCatalogDetails(catalogform)"]');
        if (okButton && okButton.innerText.trim() === "Ok") {
            okButton.click();
            console.log("Popup 'Ok' clicked");
        }
    });
    popupObserver.observe(document.body, { childList: true, subtree: true });

    function wait(ms, useSpeed = true) {
        const effective = useSpeed ? ms * speedMultiplier : ms;
        return new Promise(resolve => setTimeout(resolve, effective));
    }

    function waitForSelector(selector, timeout = 6000) {
        return new Promise((resolve, reject) => {
            const interval = 150;
            let elapsed = 0;
            const timer = setInterval(() => {
                const el = document.querySelector(selector);
                if (el) {
                    clearInterval(timer);
                    resolve(el);
                } else if (elapsed >= timeout) {
                    clearInterval(timer);
                    reject(`Timeout: ${selector}`);
                }
                elapsed += interval;
            }, interval);
        });
    }

    async function selectIndiaAndYes() {
        try {
            const input = await waitForSelector('input[placeholder="Select or search countries"]');
            input.click();
            await wait(400);
            const options = document.querySelectorAll('.ui-select-choices-row-inner');
            for (let opt of options) {
                if (opt.textContent.trim() === 'India') {
                    opt.click();
                    console.log('India selected');
                    break;
                }
            }

            await wait(300);
            const radioYes = document.querySelector('input[type="radio"][name="mii_applicable"][value="true"]');
            if (radioYes) {
                radioYes.click();
                console.log('"Yes" radio selected');
            }
        } catch (err) {
            console.warn("Country + Yes selection skipped or failed:", err);
        }
    }

    async function openAndSelectDate(buttonSelector, jumpAhead = 0, useSpeed = true) {
        try {
            const btn = document.querySelector(buttonSelector);
            if (btn && !btn.disabled) {
                btn.click();
                await wait(360, useSpeed);
                for (let i = 0; i < jumpAhead; i++) {
                    const nextBtn = document.querySelector('button[ng-click="move(1)"]');
                    if (nextBtn) {
                        nextBtn.click();
                        await wait(180, useSpeed);
                    }
                }
                const dates = document.querySelectorAll('span.ng-binding');
                for (let d of dates) {
                    if (d.textContent.trim() === '01') {
                        d.click();
                        break;
                    }
                }
            } else {
                throw new Error("Date button missing/disabled");
            }
        } catch (err) {
            console.warn("Date picker failed or skipped:", err);
        }
    }

    function tickStatesExceptRegions() {
        const observer = new MutationObserver(() => {
            const spans = document.querySelectorAll('span');
            spans.forEach(span => {
                const text = span.innerText.trim();
                const checkbox = span.querySelector('input[type="checkbox"]');
                if (checkbox && !checkbox.checked && !excludedRegions.includes(text)) {
                    checkbox.click();
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function handleModalCheckbox() {
        const checkbox = document.querySelector('input[type="checkbox"][ng-model="catSvc.data.stock.chain_document_declaration.value"]');
        if (checkbox && !checkbox.checked && !checkbox.disabled) {
            checkbox.click();
            console.log("Modal checkbox clicked");

            const interval = setInterval(() => {
                const closeBtn = document.querySelector('span[ng-click="cancel()"], button[ng-click="cancel()"]');
                if (closeBtn && closeBtn.offsetParent !== null) {
                    closeBtn.click();
                    console.log("Modal closed");
                    clearInterval(interval);
                }
            }, 360);
            setTimeout(() => clearInterval(interval), 3600);
        }
    }

    function setAngularValue(input, value) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function autofillFields() {
        const fields = [
            { name: "authorization_no", value: "Na" },
            { name: "authorization_agency", value: "Na" },
            { name: "quantity", value: "98837" },
            { name: "lead_time", value: "1" }
        ];

        fields.forEach(field => {
            const input = document.querySelector(`input[name="${field.name}"]`);
            if (input && !input.disabled) {
                setAngularValue(input, field.value);
                console.log(`Filled ${field.name}`);
            }
        });

        const wsp = document.querySelector('input[name="wsp"]');
        if (wsp && !wsp.disabled) {
            wsp.scrollIntoView({ behavior: 'smooth', block: 'center' });
            wsp.focus();
            wsp.click();

            if (!wspTyped.started) {
                wsp.value = "";
                wsp.dispatchEvent(new Event('input', { bubbles: true }));
                wsp.dispatchEvent(new Event('change', { bubbles: true }));
                setTimeout(() => wsp.focus(), 120);
                wspTyped.started = true;
                console.log("Focused and ready for WSP typing");
            }
        }
    }

    async function runSequence() {
        await wait(1200);
        await selectIndiaAndYes();
        await wait(600);

        const authDateBtn = document.querySelector('button[ng-click*="authorization_date_opened"]');
        if (authDateBtn && !authDateBtn.disabled) {
            await openAndSelectDate('button[ng-click*="authorization_date_opened"]');
            await wait(600);
            await openAndSelectDate('button[ng-click*="authorization_valid_from_opened"]');
            await wait(600);
            await openAndSelectDate('button[ng-click*="authorization_valid_to_opened"]', 24, false); // no speed
        } else {
            console.log("Authorization date not available — skipping all three date pickers.");
        }

        tickStatesExceptRegions();
        setTimeout(() => handleModalCheckbox(), 3000);
        setTimeout(() => autofillFields(), 4800);
    }

    window.addEventListener('load', runSequence);
})();