# Accessibility Checklist

## General
- [x] All interactive elements are keyboard accessible
- [x] Sufficient color contrast (WCAG AA+)
- [x] Text alternatives for all non-text content
- [x] No reliance on color alone for information

## ARIA & Roles
- [x] Use appropriate ARIA roles for all widgets and custom components
- [x] All live regions use `aria-live` attributes as needed
- [x] Landmarks (nav, main, aside, footer) are present and labeled
- [x] All modal dialogs use `role="dialog"` and trap focus

## Keyboard Navigation
- [x] All focusable elements have visible focus indicators
- [x] Tab order is logical and intuitive
- [x] Skip links are provided for main content
- [x] No keyboard traps or dead ends

## Forms
- [x] All form fields have associated labels
- [x] Error messages are accessible and descriptive
- [x] Required fields are clearly indicated

## Testing
- [x] Automated tests run with axe-core or similar
- [x] Manual testing with screen readers (NVDA, VoiceOver, JAWS)
- [x] Manual keyboard-only navigation test

## References
- [W3C Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility) 