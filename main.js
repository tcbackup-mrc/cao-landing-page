document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Header Scroll Logic
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Intersection Observer for Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 3. Parallax Image Logic
    const parallaxItems = document.querySelectorAll('.parallax-item img');
    
    window.addEventListener('scroll', () => {
        let scrollY = window.scrollY;
        parallaxItems.forEach(img => {
            // Very subtle parallax
            let speed = 0.05;
            let offset = (scrollY - img.parentElement.offsetTop) * speed;
            if(offset > -50 && offset < 50) {
                img.style.transform = `translateY(${offset}px) scale(1.1)`;
            }
        });
    });

    // 4. Modal Logic
    const modalOverlay = document.getElementById('bookingModal');
    const openBtns = document.querySelectorAll('.open-modal-btn');
    const closeBtn = document.getElementById('closeModal');

    const openModal = (e) => {
        e.preventDefault();
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeModalFunc = () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    openBtns.forEach(btn => btn.addEventListener('click', openModal));
    
    closeBtn.addEventListener('click', closeModalFunc);
    
    // Close modal when clicking outside
    modalOverlay.addEventListener('click', (e) => {
        if(e.target === modalOverlay) {
            closeModalFunc();
        }
    });

    // Handle Form Submit
    const form = document.querySelector('.booking-form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Cảm ơn bạn. Yêu cầu đặt lịch đã được gửi. Chuyên viên sẽ liên hệ với bạn trong thời gian sớm nhất.');
            closeModalFunc();
            form.reset();
        });
    }
});
