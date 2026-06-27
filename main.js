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

    const paymentModal = document.getElementById('paymentModal');
    const closePaymentBtn = document.getElementById('closePaymentModal');
    const manualConfirmBtn = document.getElementById('manualConfirmBtn');

    let pollingInterval;
    let countdownInterval;

    const openModal = (e) => {
        e.preventDefault();
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeModalFunc = () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    const closePaymentModalFunc = () => {
        paymentModal.classList.remove('active');
        document.body.style.overflow = '';
        clearInterval(pollingInterval);
        clearInterval(countdownInterval);
    };

    openBtns.forEach(btn => btn.addEventListener('click', openModal));
    
    closeBtn.addEventListener('click', closeModalFunc);
    closePaymentBtn.addEventListener('click', closePaymentModalFunc);
    
    // Close modal when clicking outside
    modalOverlay.addEventListener('click', (e) => {
        if(e.target === modalOverlay) {
            closeModalFunc();
        }
    });

    paymentModal.addEventListener('click', (e) => {
        if(e.target === paymentModal) {
            closePaymentModalFunc();
        }
    });

    // Handle Manual Confirm Click
    if (manualConfirmBtn) {
        manualConfirmBtn.addEventListener('click', () => {
            clearInterval(pollingInterval);
            clearInterval(countdownInterval);
            
            document.getElementById('paymentStatusWrapper').style.display = 'none';
            document.getElementById('manualConfirmWrapper').style.display = 'none';
            document.getElementById('zaloGroupWrapper').style.display = 'block';
            
            window.open("https://zalo.me/g/sdczb5ehiqm9tyimg1th", "_blank");
        });
    }

    // Handle Form Submit
    const form = document.querySelector('.booking-form');
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Trích xuất dữ liệu từ form
            const formData = new FormData(form);
            const data = {
                name: formData.get('fullname') || "",
                phone: formData.get('phone') || "",
                channel: formData.get('service') || "",
                interest: formData.get('service') || ""
            };

            // Placeholder này sẽ được tiêm URL thực tế bởi build.js khi build
            const webhookUrl = "__GOOGLE_SHEET_WEBHOOK_URL__".trim();

            if (!webhookUrl || webhookUrl.startsWith("__")) {
                console.warn("Chưa cấu hình URL webhook Google Sheets. Chạy chế độ demo offline.");
                alert('Cảm ơn bạn. Yêu cầu đặt lịch đã được gửi (Demo).');
                closeModalFunc();
                form.reset();
                return;
            }

            try {
                // Hiển thị trạng thái đang xử lý trên nút submit
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = "Đang gửi...";

                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;

                if (result.status === "success") {
                    const orderId = result.orderId;
                    
                    // Reset form và đóng modal đăng ký
                    form.reset();
                    closeModalFunc();
                    
                    // Lấy thông tin tài khoản được tiêm bởi build.js và loại bỏ khoảng trắng thừa
                    const bankId = "__BANK_ID__".trim();
                    const bankAccount = "__BANK_ACCOUNT__".trim();
                    const bankAccountName = "__BANK_ACCOUNT_NAME__".trim();
                    
                    // Hiển thị thông tin chuyển khoản lên UI
                    document.getElementById('paymentBank').textContent = bankId;
                    document.getElementById('paymentAccount').textContent = bankAccount;
                    document.getElementById('paymentAccountName').textContent = bankAccountName;
                    document.getElementById('paymentDescription').textContent = orderId;
                    
                    // Tạo QR thanh toán VietQR động
                    let bankCodeForQr = bankId;
                    if (bankId.toLowerCase() === "tpbank") {
                        bankCodeForQr = "tpb";
                    }
                    const qrUrl = `https://img.vietqr.io/image/${bankCodeForQr}-${bankAccount}-print.png?amount=19000&addInfo=${orderId}&accountName=${encodeURIComponent(bankAccountName)}`;
                    document.getElementById('paymentQr').src = qrUrl;
                    
                    // Reset trạng thái hiển thị của Modal thanh toán
                    document.getElementById('paymentStatusWrapper').style.display = 'block';
                    document.getElementById('zaloGroupWrapper').style.display = 'none';
                    document.getElementById('manualConfirmWrapper').style.display = 'none';
                    document.getElementById('paymentStatusText').innerHTML = `Đang chờ chuyển khoản... (<span id="countdown">30</span>s)`;
                    
                    // Mở Modal thanh toán
                    paymentModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    
                    // Bắt đầu đếm ngược 30 giây
                    let secondsLeft = 30;
                    clearInterval(countdownInterval);
                    countdownInterval = setInterval(() => {
                        secondsLeft--;
                        const countdownEl = document.getElementById('countdown');
                        if (countdownEl) {
                            countdownEl.textContent = secondsLeft;
                        }
                        
                        if (secondsLeft <= 0) {
                            clearInterval(countdownInterval);
                            // Hiển thị nút xác thực thủ công dự phòng
                            document.getElementById('manualConfirmWrapper').style.display = 'block';
                            document.getElementById('paymentStatusText').textContent = "Hết thời gian đếm ngược. Vui lòng xác thực thủ công bên dưới.";
                        }
                    }, 1000);
                    
                    // Bắt đầu polling truy vấn trạng thái thanh toán từ Google Sheets cứ mỗi 3 giây
                    clearInterval(pollingInterval);
                    pollingInterval = setInterval(async () => {
                        try {
                            const checkUrl = `${webhookUrl}?orderId=${orderId}`;
                            const checkResponse = await fetch(checkUrl, { method: 'GET' });
                            const checkResult = await checkResponse.json();
                            
                            if (checkResult.status === "success" && checkResult.paymentStatus === "Đã thanh toán") {
                                // Xác thực thanh toán thành công tự động
                                clearInterval(pollingInterval);
                                clearInterval(countdownInterval);
                                
                                document.getElementById('paymentStatusWrapper').style.display = 'none';
                                document.getElementById('manualConfirmWrapper').style.display = 'none';
                                document.getElementById('zaloGroupWrapper').style.display = 'block';
                            }
                        } catch (err) {
                            console.error("Lỗi khi polling trạng thái thanh toán:", err);
                        }
                    }, 3000);
                    
                } else {
                    console.error("Lỗi phản hồi từ Google Apps Script:", result.message);
                    alert('Không thể ghi nhận lịch hẹn trên Google Sheet. Vui lòng thử lại sau.');
                }
            } catch (error) {
                console.error("Lỗi khi gửi dữ liệu lên Google Sheet:", error);
                alert('Có lỗi hệ thống xảy ra. Vui lòng thử lại sau.');
            }
        });
    }
});
