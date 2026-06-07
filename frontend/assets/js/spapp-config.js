$(function () {
    window.app = $.spapp({ defaultView: "#home", templateDir: "pages/" });
  
    app.route({
      view: "home",
      load: "home.html",
      onCreate: function () {
        console.log(" Home page loaded.");
        setTimeout(() => {
          loadProducts("home-product-container");
        }, 500);
      }
    });
  
    app.route({
      view: "shop",
      load: "shop.html",
      onCreate: function () {
        console.log(" Shop page loaded.");
        setTimeout(() => {
            getAllProducts(products => loadProducts("shop-product-container", products));

        }, 500);
      }
    });
  
    app.route({
      view: "cart",
      load: "cart.html"
    });
  
    app.route({
    view: "favorites",
    load: "favorites.html",
    onReady: function() {
        setTimeout(loadFavorites, 300);
    }
});
  
    app.route({
      view: "profile",
      load: "profile.html",
      onReady: function () {
        console.log(" SPApp loaded #profile — calling profile logic manually");
        runProfilePageLogic();
      }
    });
  
    app.route({
  view: "login",
  load: "login.html",
  onReady: function() {
    console.log("Login page ready");
    UserService.init();
  }
});
  
    app.route({
      view: "signup",
      load: "signup.html",
      onCreate: function () {
        console.log("signup onCreate triggered");
    
        setTimeout(() => {
          const $form = $("#register-form");
    
          if (!$form.length) {
            console.warn("No #register-form found.");
            return;
          }
    
          console.log("Found #register-form, attaching validation");
    
          $form.validate({
            rules: {
              username: {
                required: true,
                minlength: 3
              },
              email: {
                required: true,
                email: true
              },
              password: {
                required: true,
                minlength: 3
              },
              confirmPassword: {
                required: true,
                equalTo: "#signup-password"
              }
            },
            messages: {
              username: {
                required: "Username is required.",
                minlength: "Username must be at least 3 characters."
              },
              email: {
                required: "Email is required.",
                email: "Please enter a valid email address."
              },
              password: {
                required: "Password is required.",
                minlength: "Password must be at least 3 characters long."
              },
              confirmPassword: {
                required: "Please confirm your password.",
                equalTo: "Passwords do not match."
              }
            },
            submitHandler: function (form) {
              console.log("Form is valid, submitting...");
    
              const formData = new FormData(form);
              formData.delete("confirmPassword");
    
              const entity = Object.fromEntries(formData.entries());
              console.log("Register payload:", entity);
    
              $.ajax({
                url: "http://localhost/SneakerShop/backend/auth/register",
                type: "POST",
                data: JSON.stringify(entity),
                contentType: "application/json",
                dataType: "json",
                success: function (result) {
                  console.log("Register successful:", result);
    
                  if (typeof toastr !== "undefined") {
                    toastr.success("Registration successful! Please log in.");
                  } else {
                    alert("Registration successful! Please log in.");
                  }
    
                  setTimeout(() => {
                    window.location.hash = "#login";
                  }, 1500);
                },
                error: function (err) {
                  console.error("Register failed:", err.responseText || err);
                  alert("Register failed.");
                }
              });
            }
          });
        }, 300);
      }
    });

    app.route({
      view: "#product-details",
      load: "product-details.html",
      onCreate: function () {
        console.log("🚀 Product Details page loaded via SPAPP!");
        $.getScript("assets/js/product-details.js")
          .done(() => console.log(" product-details.js loaded!"))
          .fail(() => console.error("Failed to load product-details.js"));
      }
    });
  
    app.route({
      view: "payment",
      load: "payment.html",
      onReady: function () {
        console.log("📦 SPApp payment view ready");
    
        function waitForElement(selector, callback, timeout = 3000) {
          const start = Date.now();
          const check = () => {
            const $el = $(selector);
            if ($el.length > 0) {
              callback($el);
            } else if (Date.now() - start < timeout) {
              requestAnimationFrame(check);
            } else {
              console.warn(` Timeout waiting for ${selector}`);
            }
          };
          check();
        }
    
        waitForElement("#payment-form", ($form) => {
          console.log(" Form found. Initializing validation...");
    
          const total = localStorage.getItem("cartTotal") || "0.00";
          $("#payment-total").text(`$${total}`);
    
          $.validator.addMethod("minCardDigits", value => /^\d{8,}$/.test(value), "Card number must be at least 8 digits.");
          $.validator.addMethod("expiryFormat", value => /^(0[1-9]|1[0-2])\/\d{2}$/.test(value), "Use MM/YY format.");
    
          // Attach validation to form
          $form.validate({
            rules: {
              fullName: { required: true, minlength: 3 },
              email: { required: true, email: true },
              address: { required: true },
              cardNumber: { required: true, minCardDigits: true },
              expiry: { required: true, expiryFormat: true },
              cvv: { required: true, digits: true, minlength: 3, maxlength: 4 }
            },
            messages: {
              fullName: { required: "Full name is required.", minlength: "Minimum 3 characters." },
              email: { required: "Email is required.", email: "Enter a valid email." },
              address: { required: "Billing address is required." },
              cardNumber: { required: "Card number is required.", minCardDigits: "Must be at least 8 digits." },
              expiry: { required: "Expiry required.", expiryFormat: "Use MM/YY format." },
              cvv: { required: "CVV required.", digits: "Only digits.", minlength: "Min 3", maxlength: "Max 4" }
            },
            errorClass: "text-danger",
            errorElement: "div",
            highlight: el => $(el).addClass("is-invalid"),
            unhighlight: el => $(el).removeClass("is-invalid"),
    
            submitHandler: async function (form) {
              console.log("💳 Validation passed. Processing payment...");
    
              const token = localStorage.getItem("user_token");
              const userRaw = localStorage.getItem("user");
    
              if (!token || !userRaw) {
                toastr.warning("⚠️ Login required to proceed.");
                return;
              }
    
              const user = JSON.parse(userRaw);
              const paymentPayload = {
                user_id: user.id,
                amount: parseFloat(localStorage.getItem("cartTotal") || "0.00"),
                payment_status: "completed"
              };
    
              try {
                const response = await $.ajax({
                  url: "http://localhost/SneakerShop/backend/payment",
                  method: "POST",
                  contentType: "application/json",
                  data: JSON.stringify(paymentPayload),
                  headers: {
                    Authorization: "Bearer " + token,
                    Authentication: token
                  }
                });
    
                toastr.success(" Payment successful!");
                console.log(" Payment sent:", response);
    
                // 🧹 Clear cart from backend
                const cartItems = await $.ajax({
                  url: `http://localhost/SneakerShop/backend/cart?user_id=${user.id}`,
                  method: "GET",
                  headers: {
                    Authorization: "Bearer " + token,
                    Authentication: token
                  }
                });
    
                for (const item of cartItems.data || []) {
                  await $.ajax({
                    url: `http://localhost/SneakerShop/backend/cart?id=${item.id}`,
                    method: "DELETE",
                    headers: {
                      Authorization: "Bearer " + token,
                      Authentication: token
                    }
                  });
                }
    
                localStorage.removeItem("cart");
                localStorage.removeItem("cartTotal");
    
                setTimeout(() => {
                  window.location.hash = "#home";
                }, 1000);
              } catch (err) {
                console.error(" Payment error:", err.responseText || err);
                toastr.error("Failed to complete payment.");
              }
            }
          });
        });
    
        $(document).off("submit", "#payment-form").on("submit", "#payment-form", function (e) {
          if (!$(this).valid()) {
            console.warn("⛔ Prevented invalid submission!");
            e.preventDefault();
          }
        });
      }
    });
    
  
    app.run(); 
  });
  
  