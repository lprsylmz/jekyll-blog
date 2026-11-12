// Keeps aria-invalid and aria-describedby in sync with the habit form's :user-invalid state,
// and announces an error once when a field is left invalid. Scoped to #habit-form.
(() => {
    const form = document.getElementById('habit-form');
    if (!form) return;

    const fields = 'input, select, textarea';

    // List the field's error message (the id in data-error) in aria-describedby only while
    // it's shown: text that aria-describedby references is announced even when it's hidden.
    const linkError = (el, shown) => {
        const errorId = el.dataset.error;
        if (!errorId) return;
        const ids = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter((id) => id && id !== errorId);
        if (shown) ids.push(errorId);
        if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
        else el.removeAttribute('aria-describedby');
    };

    // One polite live region announces an error that appears when the user leaves a field.
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.classList.add('visually-hidden');
    document.body.append(announcer);
    let announceTimer;
    let announcedField;

    // Text as a screen reader reads it: icons' text alternatives in, aria-hidden text out.
    const spokenText = (node) => {
        const copy = node.cloneNode(true);
        copy.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
        return copy.textContent.replace(/\s+/g, ' ').trim();
    };
    const announceError = (el) => {
        const error = document.getElementById(el.dataset.error);
        if (!error) return;
        const label = el.labels?.[0] ? `${spokenText(el.labels[0])}: ` : '';
        clearTimeout(announceTimer);
        announcer.textContent = '';
        announcedField = el;
        // Wait until the screen reader has announced the field that receives focus next.
        announceTimer = setTimeout(() => { announcer.textContent = label + spokenText(error); }, 500);
    };

    const flagged = new WeakSet();
    const announced = new WeakSet();
    const syncAria = (el, announce = false) => {
        if (!el.matches?.(fields)) return;
        const invalid = el.matches(':user-invalid');
        if (invalid) {
            if (announce && !announced.has(el)) {
                announceError(el);
                announced.add(el);
            }
            el.setAttribute('aria-invalid', 'true');
            linkError(el, true);
            flagged.add(el);
        } else if (flagged.has(el) || el.getAttribute('aria-invalid') !== 'true') {
            el.setAttribute('aria-invalid', 'false');
            linkError(el, false);
            flagged.delete(el);
            announced.delete(el);
            if (announcedField === el) {
                clearTimeout(announceTimer);
                announcer.textContent = '';
            }
        }
    };

    const syncAll = () => form.querySelectorAll(fields).forEach((el) => syncAria(el));
    syncAll();

    // Update on blur (to show and announce an error) and input (to clear it).
    form.addEventListener('blur', (e) => syncAria(e.target, true), true);
    form.addEventListener('input', (e) => syncAria(e.target), true);
    form.addEventListener('change', (e) => syncAria(e.target, true), true);

    // A failed submit fires 'invalid' on each failing field, including required fields the
    // user never touched. 'invalid' doesn't bubble, so listen in the capture phase.
    form.addEventListener('invalid', (e) => {
        announced.add(e.target);
        syncAria(e.target);
    }, true);

    // Reset clears :user-invalid after the 'reset' event, so update each field afterwards.
    form.addEventListener('reset', () => setTimeout(syncAll), true);
})();
