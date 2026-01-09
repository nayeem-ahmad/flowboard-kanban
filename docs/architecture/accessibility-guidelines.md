# Accessibility Guidelines

## WCAG 2.1 AA Compliance

This application targets WCAG 2.1 Level AA compliance.

## Semantic HTML Requirements

| Element | Requirement |
|---------|-------------|
| Modals | Use `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Buttons | Use `<button>` not `<div>`, include `aria-label` for icon-only |
| Forms | Associate `<label>` with inputs via `for` attribute |
| Lists | Use `<ul>`/`<li>` for board lists, cards |
| Headings | Maintain proper hierarchy (h1 > h2 > h3) |

## Keyboard Navigation

| Action | Keyboard Shortcut |
|--------|-------------------|
| Open search | `Cmd/Ctrl + K` |
| Close modal | `Escape` |
| Navigate dropdowns | `Arrow Up/Down` |
| Select option | `Enter` |
| Tab through elements | `Tab` / `Shift+Tab` |

## Focus Management

```javascript
// Modal focus trap pattern
const openModal = (modalEl) => {
    modalEl.classList.add('active');
    const focusableEls = modalEl.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];
    
    firstEl.focus();
    
    modalEl.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            } else if (!e.shiftKey && document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
        }
        if (e.key === 'Escape') closeModal(modalEl);
    });
};
```

## ARIA Attributes Reference

| Component | Required ARIA |
|-----------|---------------|
| Card Modal | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="cardTitle"` |
| Search Modal | `role="dialog"`, `aria-label="Search cards"` |
| Board Selector | `aria-haspopup="listbox"`, `aria-expanded` |
| Toast Notifications | `role="alert"`, `aria-live="polite"` |
| Theme Toggle | `aria-label="Toggle dark mode"`, `aria-pressed` |
| Checklist Items | `role="checkbox"`, `aria-checked` |

## Color Contrast

- Text on backgrounds: minimum 4.5:1 ratio
- Large text (18px+): minimum 3:1 ratio
- UI components: minimum 3:1 ratio against adjacent colors
- Use CSS custom properties for consistent theming

---
