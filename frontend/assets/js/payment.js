/**
 * payment.js
 * Handles the payment page logic:
 * - Loads cart total from localStorage
 * - Validates payment form fields
 * - Submits payment to the backend
 * - Clears cart after successful payment
 */

console.log("payment.js loaded");

function initPaymentPage() {
    const token = localStorage.getItem("user_token");
    const userRaw = localStorage.getItem("user");

    if (!token || !userRaw) {
        toastr.warning("Please log in to proceed with payment.");
        setTimeout(() => { window.location.hash = "#login"; }, 1000);
        return;
    }

    // Show cart total
    const total = localStorage.getItem("cartTotal") || "0.00";
    const totalEl = document.getElementById("payment-total");
    if (totalEl) {
        totalEl.textContent = `$${parseFloat(total).toFixed(2)}`;
    }
}

async function submitPayment(e) {
    if (e) e.preventDefault();

    const token = localStorage.getItem("user_token");
    const userRaw = localStorage.getItem("user");

    if (!token || !userRaw) {
        toastr.warning("Please log in to complete your purchase.");
        return;
    }

    const user = JSON.parse(userRaw);

    // Collect form values
    const fullName   = document.getElementById("full-name")?.value.trim();
    const email      = document.getElementById("email")?.value.trim();
    const address    = document.getElementById("address")?.value.trim();
    const cardNumber = document.getElementById("card-number")?.value.trim();
    const expiry     = document.getElementById("expiry")?.value.trim();
    const cvv        = document.getElementById("cvv")?.value.trim();

    // Basic validation
    if (!fullName || !email || !address || !cardNumber || !expiry || !cvv) {
        toastr.error("Please fill in all required fields.");
        return;
    }

    if (cardNumber.replace(/\s/g, "").length < 8) {
        toastr.error("Card number must be at least 8 digits.");
        return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        toastr.error("Expiry date must be in MM/YY format.");
        return;
    }

    if (cvv.length < 3 || cvv.length > 4) {
        toastr.error("CVV must be 3 or 4 digits.");
        return;
    }

    const amount = parseFloat(localStorage.getItem("cartTotal") || "0");

    if (amount <= 0) {
        toastr.error("Your cart is empty. Please add items before checking out.");
        return;
    }

    const paymentPayload = {
        user_id: user.id,
        amount: amount,
        payment_status: "completed"
    };

    try {
        // Submit payment
        await $.ajax({
            url: "http://localhost/SneakerShop/backend/payment",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(paymentPayload),
            headers: {
                "Authorization": "Bearer " + token,
                "Authentication": token
            }
        });

        toastr.success("Payment successful! Thank you for your order.");

        // Clear cart from backend
        try {
            const cartResponse = await $.ajax({
                url: `http://localhost/SneakerShop/backend/cart?user_id=${user.id}`,
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Authentication": token
                }
            });

            const cartItems = Array.isArray(cartResponse.data) ? cartResponse.data : [];
            for (const item of cartItems) {
                await $.ajax({
                    url: `http://localhost/SneakerShop/backend/cart?id=${item.id}`,
                    method: "DELETE",
                    headers: {
                        "Authorization": "Bearer " + token,
                        "Authentication": token
                    }
                });
            }
        } catch (cartErr) {
            console.warn("Could not clear cart from backend:", cartErr);
        }

        // Clear local storage
        localStorage.removeItem("cart");
        localStorage.removeItem("cartTotal");

        setTimeout(() => {
            window.location.hash = "#home";
        }, 1500);

    } catch (err) {
        console.error("Payment error:", err.responseText || err);
        toastr.error("Payment failed. Please check your details and try again.");
    }
}

// Attach event listeners when the payment page loads
$(document).ready(function () {
    // Trigger on hash change to #payment
    $(window).on("hashchange", function () {
        if (window.location.hash === "#payment") {
            setTimeout(initPaymentPage, 300);
        }
    });

    // Also run if already on payment page
    if (window.location.hash === "#payment") {
        setTimeout(initPaymentPage, 300);
    }

    // Attach form submit handler
    $(document).on("submit", "#payment-form", function (e) {
        e.preventDefault();
        submitPayment(e);
    });
});
