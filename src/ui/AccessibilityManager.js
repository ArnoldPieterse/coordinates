/**
 * Accessibility Manager
 * Provides comprehensive accessibility features for inclusive gaming
 * Implements WCAG 2.1 guidelines and gaming accessibility standards
 */
export class AccessibilityManager {
    constructor() {
        this.settings = {
            highContrast: false,
            largeText: false,
            screenReader: false,
            colorBlindMode: false,
            motionReduction: false,
            audioDescriptions: false,
            subtitles: true,
            keyboardNavigation: true,
            voiceControl: false,
            hapticFeedback: false
        };
        
        this.accessibilityFeatures = new Map();
        this.eventListeners = [];
        this.screenReaderQueue = [];
        
        this.setupAccessibilityFeatures();
        this.setupEventListeners();
        this.loadUserPreferences();
    }
    
    /**
     * Setup available accessibility features
     */
    setupAccessibilityFeatures() {
        this.accessibilityFeatures.set('highContrast', this.enableHighContrast.bind(this));
        this.accessibilityFeatures.set('largeText', this.enableLargeText.bind(this));
        this.accessibilityFeatures.set('colorBlindMode', this.enableColorBlindMode.bind(this));
        this.accessibilityFeatures.set('motionReduction', this.enableMotionReduction.bind(this));
        this.accessibilityFeatures.set('audioDescriptions', this.enableAudioDescriptions.bind(this));
        this.accessibilityFeatures.set('subtitles', this.enableSubtitles.bind(this));
        this.accessibilityFeatures.set('keyboardNavigation', this.enableKeyboardNavigation.bind(this));
        this.accessibilityFeatures.set('voiceControl', this.enableVoiceControl.bind(this));
        this.accessibilityFeatures.set('hapticFeedback', this.enableHapticFeedback.bind(this));
    }
    
    /**
     * Setup event listeners for accessibility
     */
    setupEventListeners() {
        // Keyboard shortcuts for accessibility
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });
        
        // Screen reader announcements
        document.addEventListener('accessibilityAnnounce', (event) => {
            this.announceToScreenReader(event.detail.message, event.detail.priority);
        });
        
        // Focus management
        document.addEventListener('focusin', (event) => {
            this.handleFocusChange(event);
        });
        
        // Motion detection for motion reduction
        if (window.matchMedia) {
            const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            motionQuery.addListener(() => {
                this.settings.motionReduction = motionQuery.matches;
                this.applyAccessibilitySettings();
            });
        }
    }
    
    /**
     * Load user preferences from localStorage
     */
    loadUserPreferences() {
        try {
            const savedSettings = localStorage.getItem('accessibilitySettings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                this.settings = { ...this.settings, ...parsedSettings };
            }
        } catch (error) {
            console.warn('Failed to load accessibility settings:', error);
        }
        
        this.applyAccessibilitySettings();
    }
    
    /**
     * Save user preferences to localStorage
     */
    saveUserPreferences() {
        try {
            localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save accessibility settings:', error);
        }
    }
    
    /**
     * Apply all accessibility settings
     */
    applyAccessibilitySettings() {
        if (this.settings.highContrast) {
            this.enableHighContrast();
        } else {
            this.disableHighContrast();
        }
        
        if (this.settings.largeText) {
            this.enableLargeText();
        } else {
            this.disableLargeText();
        }
        
        if (this.settings.colorBlindMode) {
            this.enableColorBlindMode();
        } else {
            this.disableColorBlindMode();
        }
        
        if (this.settings.motionReduction) {
            this.enableMotionReduction();
        } else {
            this.disableMotionReduction();
        }
        
        if (this.settings.subtitles) {
            this.enableSubtitles();
        } else {
            this.disableSubtitles();
        }
        
        if (this.settings.keyboardNavigation) {
            this.enableKeyboardNavigation();
        } else {
            this.disableKeyboardNavigation();
        }
        
        this.saveUserPreferences();
    }
    
    /**
     * Enable high contrast mode
     */
    enableHighContrast() {
        document.body.classList.add('high-contrast');
        document.body.style.setProperty('--text-color', '#ffffff');
        document.body.style.setProperty('--background-color', '#000000');
        document.body.style.setProperty('--accent-color', '#ffff00');
        document.body.style.setProperty('--border-color', '#ffffff');
    }
    
    /**
     * Disable high contrast mode
     */
    disableHighContrast() {
        document.body.classList.remove('high-contrast');
        document.body.style.removeProperty('--text-color');
        document.body.style.removeProperty('--background-color');
        document.body.style.removeProperty('--accent-color');
        document.body.style.removeProperty('--border-color');
    }
    
    /**
     * Enable large text mode
     */
    enableLargeText() {
        document.body.classList.add('large-text');
        document.body.style.setProperty('--font-size-base', '18px');
        document.body.style.setProperty('--font-size-large', '24px');
        document.body.style.setProperty('--font-size-xlarge', '32px');
        document.body.style.setProperty('--line-height', '1.5');
    }
    
    /**
     * Disable large text mode
     */
    disableLargeText() {
        document.body.classList.remove('large-text');
        document.body.style.removeProperty('--font-size-base');
        document.body.style.removeProperty('--font-size-large');
        document.body.style.removeProperty('--font-size-xlarge');
        document.body.style.removeProperty('--line-height');
    }
    
    /**
     * Enable color blind mode
     */
    enableColorBlindMode() {
        document.body.classList.add('colorblind-mode');
        
        // Apply color blind friendly color scheme
        const colorBlindColors = {
            '--primary-color': '#0077bb',    // Blue
            '--secondary-color': '#ee7733',  // Orange
            '--success-color': '#009988',    // Teal
            '--warning-color': '#cc3311',    // Red
            '--danger-color': '#ee3377'      // Magenta
        };
        
        Object.entries(colorBlindColors).forEach(([property, value]) => {
            document.body.style.setProperty(property, value);
        });
    }
    
    /**
     * Disable color blind mode
     */
    disableColorBlindMode() {
        document.body.classList.remove('colorblind-mode');
        
        // Remove color blind specific properties
        const colorBlindProperties = [
            '--primary-color',
            '--secondary-color',
            '--success-color',
            '--warning-color',
            '--danger-color'
        ];
        
        colorBlindProperties.forEach(property => {
            document.body.style.removeProperty(property);
        });
    }
    
    /**
     * Enable motion reduction
     */
    enableMotionReduction() {
        document.body.classList.add('motion-reduced');
        document.body.style.setProperty('--animation-duration', '0.1s');
        document.body.style.setProperty('--transition-duration', '0.1s');
        
        // Disable CSS animations and transitions
        const style = document.createElement('style');
        style.id = 'motion-reduction-styles';
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.1s !important;
                animation-delay: 0s !important;
                transition-duration: 0.1s !important;
                transition-delay: 0s !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Disable motion reduction
     */
    disableMotionReduction() {
        document.body.classList.remove('motion-reduced');
        document.body.style.removeProperty('--animation-duration');
        document.body.style.removeProperty('--transition-duration');
        
        // Remove motion reduction styles
        const style = document.getElementById('motion-reduction-styles');
        if (style) {
            style.remove();
        }
    }
    
    /**
     * Enable audio descriptions
     */
    enableAudioDescriptions() {
        this.settings.audioDescriptions = true;
        this.createAudioDescriptionPlayer();
    }
    
    /**
     * Disable audio descriptions
     */
    disableAudioDescriptions() {
        this.settings.audioDescriptions = false;
        const player = document.getElementById('audio-description-player');
        if (player) {
            player.remove();
        }
    }
    
    /**
     * Enable subtitles
     */
    enableSubtitles() {
        this.settings.subtitles = true;
        this.createSubtitleDisplay();
    }
    
    /**
     * Disable subtitles
     */
    disableSubtitles() {
        this.settings.subtitles = false;
        const subtitleDisplay = document.getElementById('subtitle-display');
        if (subtitleDisplay) {
            subtitleDisplay.remove();
        }
    }
    
    /**
     * Enable keyboard navigation
     */
    enableKeyboardNavigation() {
        this.settings.keyboardNavigation = true;
        
        // Add keyboard navigation to interactive elements
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
        interactiveElements.forEach(element => {
            element.setAttribute('tabindex', '0');
        });
        
        // Add focus indicators
        const style = document.createElement('style');
        style.id = 'keyboard-navigation-styles';
        style.textContent = `
            *:focus {
                outline: 3px solid #0077bb !important;
                outline-offset: 2px !important;
            }
            
            .keyboard-navigation *:focus {
                box-shadow: 0 0 0 3px #0077bb !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Disable keyboard navigation
     */
    disableKeyboardNavigation() {
        this.settings.keyboardNavigation = false;
        
        // Remove focus indicators
        const style = document.getElementById('keyboard-navigation-styles');
        if (style) {
            style.remove();
        }
    }
    
    /**
     * Enable voice control
     */
    enableVoiceControl() {
        this.settings.voiceControl = true;
        this.initializeVoiceControl();
    }
    
    /**
     * Disable voice control
     */
    disableVoiceControl() {
        this.settings.voiceControl = false;
        this.cleanupVoiceControl();
    }
    
    /**
     * Enable haptic feedback
     */
    enableHapticFeedback() {
        this.settings.hapticFeedback = true;
        this.initializeHapticFeedback();
    }
    
    /**
     * Disable haptic feedback
     */
    disableHapticFeedback() {
        this.settings.hapticFeedback = false;
        this.cleanupHapticFeedback();
    }
    
    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyboardShortcuts(event) {
        // Alt + A: Toggle accessibility menu
        if (event.altKey && event.key === 'a') {
            event.preventDefault();
            this.toggleAccessibilityMenu();
        }
        
        // Alt + H: Toggle high contrast
        if (event.altKey && event.key === 'h') {
            event.preventDefault();
            this.toggleHighContrast();
        }
        
        // Alt + L: Toggle large text
        if (event.altKey && event.key === 'l') {
            event.preventDefault();
            this.toggleLargeText();
        }
        
        // Alt + C: Toggle color blind mode
        if (event.altKey && event.key === 'c') {
            event.preventDefault();
            this.toggleColorBlindMode();
        }
        
        // Alt + M: Toggle motion reduction
        if (event.altKey && event.key === 'm') {
            event.preventDefault();
            this.toggleMotionReduction();
        }
    }
    
    /**
     * Announce message to screen reader
     * @param {string} message - Message to announce
     * @param {string} priority - Priority level (polite, assertive)
     */
    announceToScreenReader(message, priority = 'polite') {
        if (!this.settings.screenReader) return;
        
        // Create or get existing announcement element
        let announcement = document.getElementById('screen-reader-announcement');
        if (!announcement) {
            announcement = document.createElement('div');
            announcement.id = 'screen-reader-announcement';
            announcement.setAttribute('aria-live', priority);
            announcement.setAttribute('aria-atomic', 'true');
            announcement.style.cssText = `
                position: absolute;
                left: -10000px;
                width: 1px;
                height: 1px;
                overflow: hidden;
            `;
            document.body.appendChild(announcement);
        }
        
        // Queue announcement
        this.screenReaderQueue.push({ message, priority });
        this.processScreenReaderQueue();
    }
    
    /**
     * Process screen reader announcement queue
     */
    processScreenReaderQueue() {
        if (this.screenReaderQueue.length === 0) return;
        
        const announcement = document.getElementById('screen-reader-announcement');
        if (!announcement) return;
        
        const { message, priority } = this.screenReaderQueue.shift();
        announcement.setAttribute('aria-live', priority);
        announcement.textContent = message;
        
        // Clear after a short delay
        setTimeout(() => {
            announcement.textContent = '';
        }, 100);
    }
    
    /**
     * Handle focus changes
     * @param {FocusEvent} event - Focus event
     */
    handleFocusChange(event) {
        // Announce focused element to screen reader
        if (this.settings.screenReader && event.target) {
            const label = event.target.getAttribute('aria-label') || 
                         event.target.getAttribute('title') || 
                         event.target.textContent;
            
            if (label) {
                this.announceToScreenReader(label, 'polite');
            }
        }
        
        // Add focus indicator for keyboard navigation
        if (this.settings.keyboardNavigation) {
            event.target.classList.add('keyboard-focused');
        }
    }
    
    /**
     * Toggle accessibility menu
     */
    toggleAccessibilityMenu() {
        const menu = document.getElementById('accessibility-menu');
        if (menu) {
            menu.remove();
        } else {
            this.createAccessibilityMenu();
        }
    }
    
    /**
     * Create accessibility menu
     */
    createAccessibilityMenu() {
        const menu = document.createElement('div');
        menu.id = 'accessibility-menu';
        menu.className = 'accessibility-menu';
        menu.setAttribute('role', 'dialog');
        menu.setAttribute('aria-labelledby', 'accessibility-menu-title');
        
        menu.innerHTML = `
            <div class="accessibility-menu-header">
                <h2 id="accessibility-menu-title">Accessibility Settings</h2>
                <button class="close-button" aria-label="Close accessibility menu">×</button>
            </div>
            <div class="accessibility-menu-content">
                <div class="accessibility-option">
                    <label>
                        <input type="checkbox" id="high-contrast-toggle" ${this.settings.highContrast ? 'checked' : ''}>
                        High Contrast Mode
                    </label>
                </div>
                <div class="accessibility-option">
                    <label>
                        <input type="checkbox" id="large-text-toggle" ${this.settings.largeText ? 'checked' : ''}>
                        Large Text
                    </label>
                </div>
                <div class="accessibility-option">
                    <label>
                        <input type="checkbox" id="colorblind-toggle" ${this.settings.colorBlindMode ? 'checked' : ''}>
                        Color Blind Mode
                    </label>
                </div>
                <div class="accessibility-option">
                    <label>
                        <input type="checkbox" id="motion-reduction-toggle" ${this.settings.motionReduction ? 'checked' : ''}>
                        Reduce Motion
                    </label>
                </div>
                <div class="accessibility-option">
                    <label>
                        <input type="checkbox" id="subtitles-toggle" ${this.settings.subtitles ? 'checked' : ''}>
                        Subtitles
                    </label>
                </div>
                <div class="accessibility-option">
                    <label>
                        <input type="checkbox" id="keyboard-nav-toggle" ${this.settings.keyboardNavigation ? 'checked' : ''}>
                        Keyboard Navigation
                    </label>
                </div>
            </div>
        `;
        
        // Style the menu
        menu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 2px solid #0077bb;
            border-radius: 8px;
            padding: 20px;
            z-index: 10000;
            min-width: 300px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(menu);
        
        // Add event listeners
        this.addMenuEventListeners(menu);
    }
    
    /**
     * Add event listeners to accessibility menu
     * @param {HTMLElement} menu - Menu element
     */
    addMenuEventListeners(menu) {
        // Close button
        const closeButton = menu.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            menu.remove();
        });
        
        // Toggle switches
        const toggles = {
            'high-contrast-toggle': 'highContrast',
            'large-text-toggle': 'largeText',
            'colorblind-toggle': 'colorBlindMode',
            'motion-reduction-toggle': 'motionReduction',
            'subtitles-toggle': 'subtitles',
            'keyboard-nav-toggle': 'keyboardNavigation'
        };
        
        Object.entries(toggles).forEach(([id, setting]) => {
            const toggle = menu.querySelector(`#${id}`);
            toggle.addEventListener('change', () => {
                this.settings[setting] = toggle.checked;
                this.applyAccessibilitySettings();
            });
        });
        
        // Focus management
        menu.focus();
        
        // Close on escape
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                menu.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
    
    /**
     * Toggle high contrast mode
     */
    toggleHighContrast() {
        this.settings.highContrast = !this.settings.highContrast;
        this.applyAccessibilitySettings();
        this.announceToScreenReader(
            `High contrast mode ${this.settings.highContrast ? 'enabled' : 'disabled'}`,
            'polite'
        );
    }
    
    /**
     * Toggle large text mode
     */
    toggleLargeText() {
        this.settings.largeText = !this.settings.largeText;
        this.applyAccessibilitySettings();
        this.announceToScreenReader(
            `Large text mode ${this.settings.largeText ? 'enabled' : 'disabled'}`,
            'polite'
        );
    }
    
    /**
     * Toggle color blind mode
     */
    toggleColorBlindMode() {
        this.settings.colorBlindMode = !this.settings.colorBlindMode;
        this.applyAccessibilitySettings();
        this.announceToScreenReader(
            `Color blind mode ${this.settings.colorBlindMode ? 'enabled' : 'disabled'}`,
            'polite'
        );
    }
    
    /**
     * Toggle motion reduction
     */
    toggleMotionReduction() {
        this.settings.motionReduction = !this.settings.motionReduction;
        this.applyAccessibilitySettings();
        this.announceToScreenReader(
            `Motion reduction ${this.settings.motionReduction ? 'enabled' : 'disabled'}`,
            'polite'
        );
    }
    
    /**
     * Initialize voice control
     */
    initializeVoiceControl() {
        // Voice control implementation would go here
        console.log('Voice control initialized');
    }
    
    /**
     * Cleanup voice control
     */
    cleanupVoiceControl() {
        // Voice control cleanup would go here
        console.log('Voice control cleaned up');
    }
    
    /**
     * Initialize haptic feedback
     */
    initializeHapticFeedback() {
        // Haptic feedback implementation would go here
        console.log('Haptic feedback initialized');
    }
    
    /**
     * Cleanup haptic feedback
     */
    cleanupHapticFeedback() {
        // Haptic feedback cleanup would go here
        console.log('Haptic feedback cleaned up');
    }
    
    /**
     * Create audio description player
     */
    createAudioDescriptionPlayer() {
        // Audio description player implementation would go here
        console.log('Audio description player created');
    }
    
    /**
     * Create subtitle display
     */
    createSubtitleDisplay() {
        const subtitleDisplay = document.createElement('div');
        subtitleDisplay.id = 'subtitle-display';
        subtitleDisplay.className = 'subtitle-display';
        subtitleDisplay.setAttribute('role', 'status');
        subtitleDisplay.setAttribute('aria-live', 'polite');
        
        subtitleDisplay.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            z-index: 1000;
            max-width: 80%;
            text-align: center;
        `;
        
        document.body.appendChild(subtitleDisplay);
    }
    
    /**
     * Get current accessibility settings
     * @returns {Object} Current settings
     */
    getSettings() {
        return { ...this.settings };
    }
    
    /**
     * Update accessibility setting
     * @param {string} setting - Setting name
     * @param {boolean} value - Setting value
     */
    updateSetting(setting, value) {
        if (this.settings.hasOwnProperty(setting)) {
            this.settings[setting] = value;
            this.applyAccessibilitySettings();
        }
    }
    
    /**
     * Cleanup resources
     */
    dispose() {
        // Remove all event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        
        // Remove accessibility menu
        const menu = document.getElementById('accessibility-menu');
        if (menu) {
            menu.remove();
        }
        
        // Remove subtitle display
        const subtitleDisplay = document.getElementById('subtitle-display');
        if (subtitleDisplay) {
            subtitleDisplay.remove();
        }
        
        // Remove screen reader announcement
        const announcement = document.getElementById('screen-reader-announcement');
        if (announcement) {
            announcement.remove();
        }
        
        // Clear queues
        this.screenReaderQueue = [];
        this.eventListeners = [];
        this.accessibilityFeatures.clear();
    }
} 