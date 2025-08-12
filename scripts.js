/**
 * Portfolio Website JavaScript
 * Author: Dylan Stauch
 * Description: Main functionality for portfolio website
 */

// Configuration
const CONFIG = {
    NASA_API_KEY: 'DEMO_KEY', // Using demo key - replace with environment variable in production
    NASA_API_URL: 'https://api.nasa.gov/planetary/apod'
};

/**
 * Skills Data Structure
 * To add/remove skills: Update this array without touching markup
 * Fields: label (required), category (required), iconKey (optional), level (0-100, optional), url (optional)
 */
const SKILLS_DATA = [
    // Languages
    { label: 'JavaScript', category: 'Languages', iconKey: 'javascript', level: 85 },
    { label: 'TypeScript', category: 'Languages', iconKey: 'typescript', level: 80 },
    { label: 'Python', category: 'Languages', iconKey: 'python', level: 75 },
    { label: 'HTML/CSS', category: 'Languages', iconKey: 'html5', level: 90 },
    
    // Frameworks & Tools
    { label: 'React', category: 'Frameworks & Tools', iconKey: 'react', level: 70 },
    { label: 'Node.js', category: 'Frameworks & Tools', iconKey: 'nodejs', level: 75 },
    { label: 'Git', category: 'Frameworks & Tools', iconKey: 'git', level: 80 },
    { label: 'Bootstrap', category: 'Frameworks & Tools', iconKey: 'bootstrap', level: 85 },
    
    // Databases & Cloud
    { label: 'SQL', category: 'Databases & Cloud', iconKey: 'postgresql', level: 70 },
    { label: 'MongoDB', category: 'Databases & Cloud', iconKey: 'mongodb', level: 65 },
    { label: 'AWS', category: 'Databases & Cloud', iconKey: 'amazonwebservices', level: 60 },
    
    // Soft Skills (no icons, no levels)
    { label: 'Problem Solving', category: 'Soft Skills' },
    { label: 'Collaboration', category: 'Soft Skills' },
    { label: 'Communication', category: 'Soft Skills' }
];

/**
 * Initialize the website when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

/**
 * Main initialization function
 */
function initializeWebsite() {
    setupContactForm();
    loadNASAImage();
    setupAccessibility();
    setupSmoothScrolling();
    setupMobileOptimizations();
    renderSkillsSection();
}

/**
 * Render the Skills section dynamically from SKILLS_DATA
 */
function renderSkillsSection() {
    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;

    // Group skills by category
    const skillsByCategory = SKILLS_DATA.reduce((acc, skill) => {
        if (!acc[skill.category]) {
            acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
    }, {});

    // Define the order of categories
    const categoryOrder = ['Languages', 'Frameworks & Tools', 'Databases & Cloud', 'Soft Skills'];
    
    // Generate HTML for each category in the specified order
    const categoriesHTML = categoryOrder
        .filter(category => skillsByCategory[category]) // Only include categories that have skills
        .map(category => {
            const skills = skillsByCategory[category];
            const skillsHTML = skills.map(skill => createSkillChip(skill)).join('');
            
            return `
                <div class="skills-category" data-category="${category}">
                    <h3 class="skills-category-title">${category}</h3>
                    <ul class="skills-grid" role="list">
                        ${skillsHTML}
                    </ul>
                </div>
            `;
        }).join('');

    // Insert the content
    skillsSection.innerHTML = `
        <div class="container">
            <h2>Skills</h2>
            <div class="skills-container">
                ${categoriesHTML}
            </div>
        </div>
    `;
}

/**
 * Create a skill chip HTML element
 */
function createSkillChip(skill) {
    const isHardSkill = skill.category !== 'Soft Skills';
    const hasIcon = isHardSkill && skill.iconKey;
    
    const iconHTML = hasIcon ? `
        <i class="devicon-${skill.iconKey}-plain skill-chip-icon" 
           aria-hidden="true" 
           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        </i>
        <span class="skill-chip-icon-fallback" aria-hidden="true">${skill.label.charAt(0).toUpperCase()}</span>
    ` : '';
    
    const ariaLabel = skill.label;
    const chipClass = hasIcon ? 'skill-chip' : 'skill-chip skill-chip-no-icon';
    
    const chipContent = `
        ${iconHTML}
        <span class="skill-chip-label">${skill.label}</span>
    `;
    
    if (skill.url) {
        return `
            <li>
                <a href="${skill.url}" 
                   class="${chipClass}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   aria-label="${ariaLabel} (opens in new tab)">
                    ${chipContent}
                </a>
            </li>
        `;
    } else {
        return `
            <li>
                <div class="${chipClass}" 
                     role="listitem"
                     aria-label="${ariaLabel}">
                    ${chipContent}
                </div>
            </li>
        `;
    }
}

/**
 * Setup contact form validation and submission
 */
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', handleContactFormSubmission);
    
    // Add real-time validation (skip honeypot field)
    const inputs = contactForm.querySelectorAll('input:not([name="website"]), textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearValidationError);
    });
}

/**
 * Handle contact form submission with Netlify AJAX pattern
 * This allows form submission without page reload while still using Netlify Forms
 */
async function handleContactFormSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    
    // Validate all fields
    if (!validateForm(form)) {
        return;
    }
    
    // Check honeypot field for spam protection
    if (form.website.value) {
        // This is likely spam, fail silently
        console.warn('Honeypot field filled, possible spam submission');
        return;
    }
    
    // Submit form using Netlify AJAX pattern
    await submitToNetlify(form);
}

/**
 * Validate individual form field
 */
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    switch(field.type) {
        case 'text':
            if (field.id === 'fullName') {
                isValid = value.length >= 2;
                errorMessage = 'Please enter a valid name (at least 2 characters)';
            }
            break;
        case 'email':
            isValid = isValidEmail(value);
            errorMessage = 'Please enter a valid email address';
            break;
        default:
            if (field.tagName === 'TEXTAREA') {
                isValid = value.length >= 10;
                errorMessage = 'Please enter a message (at least 10 characters)';
            }
    }
    
    displayFieldValidation(field, isValid, errorMessage);
    return isValid;
}

/**
 * Clear validation error when user starts typing
 */
function clearValidationError(event) {
    const field = event.target;
    field.classList.remove('is-invalid');
    const errorDiv = document.getElementById(field.id + 'Error');
    if (errorDiv) {
        errorDiv.textContent = '';
    }
}

/**
 * Display field validation result
 */
function displayFieldValidation(field, isValid, errorMessage) {
    const errorDiv = document.getElementById(field.id + 'Error');
    
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        if (errorDiv) errorDiv.textContent = '';
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        if (errorDiv) errorDiv.textContent = errorMessage;
    }
}

/**
 * Validate entire form
 */
function validateForm(form) {
    const fields = form.querySelectorAll('input[required], textarea[required]');
    let allValid = true;
    
    fields.forEach(field => {
        // Skip honeypot field validation
        if (field.name === 'website') return;
        
        const isValid = validateField({ target: field });
        if (!isValid) allValid = false;
    });
    
    return allValid;
}

/**
 * Check if email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Submit form to Netlify using AJAX pattern
 * This keeps the form in the HTML for Netlify to detect at build time,
 * but allows submission without page reload for better UX
 */
async function submitToNetlify(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    const contactModal = document.getElementById('contactModal');
    
    // Show loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    try {
        // Build URL-encoded form data including the form-name field required by Netlify
        const formData = new URLSearchParams();
        formData.append('form-name', 'contact'); // Required by Netlify to identify the form
        formData.append('fullName', form.fullName.value.trim());
        formData.append('email', form.email.value.trim());
        formData.append('message', form.message.value.trim());
        formData.append('website', form.website.value); // Honeypot field
        
        // Submit to Netlify
        const response = await fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
        });
        
        if (response.ok) {
            // Success - show notification and reset form
            showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
            
            // Reset form and close modal
            form.reset();
            clearAllValidation();
            
            const modal = bootstrap.Modal.getInstance(contactModal);
            if (modal) {
                modal.hide();
                // Return focus to the contact button after modal closes
                contactModal.addEventListener('hidden.bs.modal', function focusHandler() {
                    const contactButton = document.querySelector('.contact-button');
                    if (contactButton) {
                        contactButton.focus();
                    }
                    contactModal.removeEventListener('hidden.bs.modal', focusHandler);
                }, { once: true });
            }
        } else {
            // Netlify returned an error
            throw new Error(`Form submission failed with status: ${response.status}`);
        }
    } catch (error) {
        // Network or other error
        console.error('Netlify form submission error:', error);
        showNotification('Unable to send message. Please check your connection and try again.', 'danger');
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Clear all form validation states
 */
function clearAllValidation() {
    const form = document.getElementById('contactForm');
    const fields = form.querySelectorAll('input:not([name="website"]), textarea');
    fields.forEach(field => {
        field.classList.remove('is-valid', 'is-invalid');
    });
    
    const errorDivs = form.querySelectorAll('.invalid-feedback');
    errorDivs.forEach(div => {
        div.textContent = '';
    });
}

/**
 * Show notification to user
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

/**
 * Load NASA Astronomy Picture of the Day
 */
function loadNASAImage() {
    const heroLeft = document.querySelector('.hero-image-left');
    const heroRight = document.querySelector('.hero-image-right');
    
    if (!heroLeft || !heroRight) return;
    
    const url = `${CONFIG.NASA_API_URL}?api_key=${CONFIG.NASA_API_KEY}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.media_type === 'image') {
                heroLeft.style.backgroundImage = `url(${data.url})`;
                heroRight.style.backgroundImage = `url(${data.url})`;
                
                // Add alt text for accessibility
                heroLeft.setAttribute('aria-label', `NASA Astronomy Picture: ${data.title}`);
                heroRight.setAttribute('aria-label', `NASA Astronomy Picture: ${data.title}`);
            } else {
                // Fallback for non-image content
                setFallbackHeroImage();
            }
        })
        .catch(error => {
            console.warn('Error fetching NASA APOD image:', error);
            setFallbackHeroImage();
        });
}

/**
 * Set fallback hero images when NASA API fails
 */
function setFallbackHeroImage() {
    const heroLeft = document.querySelector('.hero-image-left');
    const heroRight = document.querySelector('.hero-image-right');
    
    if (heroLeft && heroRight) {
        const fallbackImage = './pictures/darkbg.png';
        heroLeft.style.backgroundImage = `url(${fallbackImage})`;
        heroRight.style.backgroundImage = `url(${fallbackImage})`;
        
        heroLeft.setAttribute('aria-label', 'Background image');
        heroRight.setAttribute('aria-label', 'Background image');
    }
}

/**
 * Setup accessibility features
 */
function setupAccessibility() {
    // Add skip link
    addSkipLink();
    
    // Improve focus management for modal
    setupModalFocusManagement();
    
    // Add keyboard navigation for project cards
    setupKeyboardNavigation();
}

/**
 * Add skip link for accessibility
 */
function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main landmark if it doesn't exist
    const main = document.querySelector('main');
    if (main && !main.id) {
        main.id = 'main';
    }
}

/**
 * Setup modal focus management
 */
function setupModalFocusManagement() {
    const modal = document.getElementById('contactModal');
    if (!modal) return;
    
    modal.addEventListener('shown.bs.modal', function() {
        const firstInput = modal.querySelector('input');
        if (firstInput) firstInput.focus();
    });
}

/**
 * Setup keyboard navigation for interactive elements
 */
function setupKeyboardNavigation() {
    // Add keyboard support for project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        const link = card.querySelector('a');
        if (link) {
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
        }
    });
}

/**
 * Setup smooth scrolling for anchor links
 */
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or modal trigger
            if (href === '#' || this.hasAttribute('data-bs-toggle')) {
                return;
            }
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without triggering scroll
                history.pushState(null, null, href);
                
                // Focus target for accessibility
                target.focus();
            }
        });
    });
}

/**
 * Utility function to debounce function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Setup mobile-specific optimizations
 */
function setupMobileOptimizations() {
    // Prevent iOS zoom on input focus
    preventIOSZoom();
    
    // Handle orientation changes
    handleOrientationChange();
    
    // Optimize navbar collapse behavior on mobile
    optimizeNavbarBehavior();
    
    // Add touch event optimizations
    setupTouchOptimizations();
    
    // Optimize skills section for mobile
    optimizeSkillsForMobile();
}

/**
 * Prevent iOS zoom when focusing on input elements
 */
function preventIOSZoom() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        // Add font-size: 16px to prevent zoom on iOS
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            if (window.getComputedStyle(input).fontSize < '16px') {
                input.style.fontSize = '16px';
            }
        }
    });
}

/**
 * Handle orientation changes for better mobile experience
 */
function handleOrientationChange() {
    const handleResize = debounce(() => {
        // Recalculate heights after orientation change
        const hero = document.getElementById('hero');
        if (hero && window.innerHeight < 500 && window.innerWidth > window.innerHeight) {
            // Landscape mode on mobile
            hero.style.height = '100vh';
        } else {
            // Portrait mode or desktop
            hero.style.height = '';
        }
    }, 250);

    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('resize', handleResize);
}

/**
 * Optimize navbar behavior for mobile devices
 */
function optimizeNavbarBehavior() {
    const navbar = document.querySelector('.navbar');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!navbar || !navbarCollapse) return;
    
    // Close navbar when clicking on nav links (mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                    toggle: false
                });
                bsCollapse.hide();
            }
        });
    });
    
    // Close navbar when clicking outside (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 992) {
            const isNavbarClick = navbar.contains(e.target);
            const isNavbarOpen = navbarCollapse.classList.contains('show');
            
            if (!isNavbarClick && isNavbarOpen) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                    toggle: false
                });
                bsCollapse.hide();
            }
        }
    });
}

/**
 * Setup touch event optimizations
 */
function setupTouchOptimizations() {
    // Add passive event listeners for better scroll performance
    const passiveEvents = ['touchstart', 'touchmove', 'touchend'];
    
    passiveEvents.forEach(eventType => {
        document.addEventListener(eventType, function(e) {
            // This is intentionally empty - we just want passive listeners
        }, { passive: true });
    });
    
    // Optimize button and card interactions for touch
    const interactiveElements = document.querySelectorAll('.project-card, .media-item, .contact-button, .nav-link');
    
    interactiveElements.forEach(element => {
        // Add touch feedback
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        }, { passive: true });
    });
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isValidEmail,
        validateField,
        showNotification
    };
}

/**
 * Optimize skills section for mobile devices
 */
function optimizeSkillsForMobile() {
    // Wait for DOM to be ready and skills to be rendered
    setTimeout(() => {
        const skillChips = document.querySelectorAll('.skill-chip');
        
        // Add touch feedback for mobile devices
        skillChips.forEach(chip => {
            chip.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            }, { passive: true });
            
            chip.addEventListener('touchend', function() {
                this.style.transform = '';
            }, { passive: true });
            
            // Prevent double-tap zoom on skill chips
            chip.addEventListener('touchend', function(e) {
                e.preventDefault();
            });
        });
        
        // Optimize for very small screens
        if (window.innerWidth <= 320) {
            const skillsGrid = document.querySelectorAll('.skills-grid');
            skillsGrid.forEach(grid => {
                grid.style.gridTemplateColumns = '1fr';
            });
        }
    }, 100);
}
