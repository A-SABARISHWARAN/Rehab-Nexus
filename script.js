/**
 * RehabVerse VR - Product Demo Website
 * JavaScript File
 * Author: Senior Frontend Developer
 * Enhanced by Anti-Gravity (Performance & Micro-interactions)
 */

document.addEventListener('DOMContentLoaded', function () {
    // ===== MOBILE NAVIGATION =====
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            // Change icon based on menu state
            const icon = this.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link, .btn-nav');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = ''; // Restore scrolling
            }
        });
    });

    // ===== SMOOTH SCROLLING =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Calculate offset for navbar
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== ACTIVE NAV LINK ON SCROLL =====
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        let currentSectionId = '';
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = sectionId;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    // Initial call and scroll event listener
    updateActiveNavLink();
    window.addEventListener('scroll', updateActiveNavLink);

    // ===== PERFORMANCE: INTERSECTION OBSERVER ANIMATIONS =====
    // Replaces scroll event listeners for better performance

    // 1. General Fade Up Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, observerOptions);

    // Apply animation classes to elements
    const animatedElements = [
        ...document.querySelectorAll('.hero-content > *'),
        ...document.querySelectorAll('.section-title'),
        ...document.querySelectorAll('.section-subtitle'),
        ...document.querySelectorAll('.card'),
        ...document.querySelectorAll('.step'),
        ...document.querySelectorAll('.benefit-card')
    ];

    animatedElements.forEach((el, index) => {
        el.classList.add('fade-up-element');
        // Add stagger delays based on siblings
        if (el.classList.contains('card') || el.classList.contains('step')) {
            // Simple stagger based on index in NodeList would be global, 
            // better to rely on CSS delays or just rough JS delay
            el.style.animationDelay = `${(index % 4) * 0.1}s`;
        }
        fadeObserver.observe(el);
    });

    // 2. Metric Bars Animation (Refacted to Observer)
    const metricObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.getAttribute('data-width') || bar.style.width;
                bar.style.width = width;
                bar.classList.add('animated');
                metricObserver.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.metric-fill').forEach(bar => {
        // Store width in data attribute and reset
        bar.setAttribute('data-width', bar.style.width);
        bar.style.width = '0';
        bar.style.transition = 'width 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
        metricObserver.observe(bar);
    });

    // 3. Number Count-up Animation
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateValue(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number').forEach(stat => {
        statsObserver.observe(stat);
    });

    function animateValue(obj) {
        let text = obj.innerText;
        let value = parseInt(text.replace(/\D/g, ''));
        let prefix = text.includes('+') ? '+' : '';
        let suffix = text.includes('%') ? '%' : '';

        let startTimestamp = null;
        const duration = 2000;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out function
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            obj.innerHTML = prefix + Math.floor(easeProgress * value) + suffix;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = text; // Ensure exact final value
            }
        };
        window.requestAnimationFrame(step);
    }

    // 4. Progress Ring Animation (Idea Section)
    const ringObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'spin 2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
                ringObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const ringFill = document.querySelector('.ring-fill');
    if (ringFill) {
        ringFill.style.animation = 'none'; // Pause initially
        ringObserver.observe(ringFill);
    }

    // ===== DEMO FORM HANDLING =====
    const demoForm = document.getElementById('demoForm');
    if (demoForm) {
        demoForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(this);
            const formValues = Object.fromEntries(formData.entries());

            // Simple validation
            let isValid = true;
            const inputs = this.querySelectorAll('input[required]');

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#ef4444';
                } else {
                    input.style.borderColor = '';
                }
            });

            if (isValid) {
                // Show success message
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;

                submitBtn.innerHTML = '<i class="fas fa-check"></i> Preparing Email...';
                submitBtn.disabled = true;
                submitBtn.style.background = '#10b981';

                // Construct Mailto Link
                const recipient = 'sabarishsrinivas15@gmail.com';
                const subject = `RehabVerse VR Demo Request: ${formValues.clinicName || 'New Inquiry'}`;
                const body = `Name: ${formValues.fullName}\nEmail: ${formValues.email}\nClinic: ${formValues.clinicName}\n\nI would like to request a demo of RehabVerse VR.`;

                const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

                console.log('Redirecting to mail client:', mailtoLink);

                // Reset form after short delay and redirect
                setTimeout(() => {
                    window.location.href = mailtoLink;

                    this.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';

                    showNotification('Opening your email client to send the request...');
                }, 1000);
            } else {
                showNotification('Please fill in all required fields.', 'error');
            }
        });
    }

    // ===== NOTIFICATION SYSTEM =====
    function showNotification(message, type = 'success') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Add styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 1rem 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    z-index: 9999;
                    animation: slideIn 0.3s ease-out;
                    border-left: 4px solid;
                }
                .notification-success {
                    border-left-color: #10b981;
                }
                .notification-error {
                    border-left-color: #ef4444;
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .notification-content i {
                    font-size: 1.25rem;
                }
                .notification-success .notification-content i {
                    color: #10b981;
                }
                .notification-error .notification-content i {
                    color: #ef4444;
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';

            // Add slideOut animation
            if (!document.querySelector('#notification-slideout')) {
                const slideOutStyle = document.createElement('style');
                slideOutStyle.id = 'notification-slideout';
                slideOutStyle.textContent = `
                    @keyframes slideOut {
                        from {
                            transform: translateX(0);
                            opacity: 1;
                        }
                        to {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(slideOutStyle);
            }

            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    // ===== DEMO BUTTON INTERACTIONS =====
    const demoButtons = document.querySelectorAll('.btn-demo');
    demoButtons.forEach(button => {
        button.addEventListener('click', function () {
            const card = this.closest('.demo-card');
            const title = card.querySelector('.demo-title').textContent;

            // Show loading state
            const originalText = this.textContent;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            this.disabled = true;

            // Simulate loading delay
            setTimeout(() => {
                showNotification(`Launching "${title}" demo experience...`);
                this.innerHTML = originalText;
                this.disabled = false;
            }, 1500);
        });
    });

    // ===== TAB INTERACTIONS =====
    const tabs = document.querySelectorAll('.ui-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
        });
    });

    // ===== CHART ANIMATIONS =====
    function animateCharts() {
        const chartLines = document.querySelectorAll('.chart-line');
        if (chartLines.length > 0) {
            chartLines.forEach((line, index) => {
                // Set width based on CSS
                const width = line.style.width;
                line.style.width = '0';

                // Animate after delay
                setTimeout(() => {
                    line.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    line.style.width = width;
                }, 300 + (index * 300));
            });
        }
    }

    // ===== CHART ANIMATIONS OBSERVER =====
    const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                animateCharts();
                chartObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const chartsSection = document.querySelector('.therapist-section');
    if (chartsSection) {
        chartObserver.observe(chartsSection);
    }

    function animateCharts() {
        const chartLines = document.querySelectorAll('.chart-line');
        // ... (rest of animation logic is fine)
        if (chartLines.length > 0) {
            chartLines.forEach((line, index) => {
                const width = line.style.width;
                line.style.width = '0';
                setTimeout(() => {
                    line.style.transition = 'width 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
                    line.style.width = width;
                }, 100 + (index * 200));
            });
        }
    }

    // ===== FLOATING ELEMENTS PARALLAX =====
    const floatingElements = document.querySelectorAll('.element');

    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth - e.pageX) / 50;
        const y = (window.innerHeight - e.pageY) / 50;

        floatingElements.forEach((el, index) => {
            const speed = (index + 1) * 2;
            el.style.transform = `translateX(${x * speed}px) translateY(${y * speed}px) rotate(${index * 5}deg)`;
        });
    });

    floatingElements.forEach(element => {
        // Keep initial animation as base but override with mousemove
        // Note: CSS float animation might conflict, best to wrap or just let CSS handle idle state
        // For this task, we'll keep the CSS animation as primary and maybe add slight offset
    });

    // ===== MAGNETIC BUTTONS =====
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', function (e) {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Ripple positioning logic can go here if we wanted JS ripple
            // Magnetic effect:
            const strength = 10;
            const deltaX = (x - rect.width / 2) / strength;
            const deltaY = (y - rect.height / 2) / strength;

            btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });

        btn.addEventListener('mouseleave', function () {
            btn.style.transform = 'translate(0, 0)';
        });

        // Click Ripple
        btn.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            const rect = btn.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // ===== WINDOW RESIZE HANDLER =====
    let resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            // Close mobile menu on resize to desktop
            if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const icon = navToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = '';
            }
        }, 250);
    });

    // ===== INITIALIZATION MESSAGE =====
    console.log('RehabVerse VR demo website loaded successfully.');
    console.log('Experience the future of rehabilitation technology.');
});