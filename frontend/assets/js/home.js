function loadHomeProducts() {
    const token = localStorage.getItem("user_token");
  
    if (!token) {
      console.warn("⚠️ No token found. Showing default products or redirecting to login.");
      return;
    }
  
    $.ajax({
      url: "http://localhost/SneakerShop/backend/products",
      type: "GET",
      headers: {
        "Authentication": token,
        "Authorization": "Bearer " + token
      },
      success: function (response) {
        console.log("🌟 Featured products fetched:", response);
        const products = Array.isArray(response) ? response : 
                 Array.isArray(response.data) ? response.data : [];
renderFeaturedProducts(products, "home-product-container");
    },
      error: function (xhr) {
        console.error(" Failed to fetch featured products:", xhr.responseText);
        toastr.error("Could not load featured sneakers.");
      }
    });
  }
  function renderFeaturedProducts(products, containerId) {
    const container = $("#" + containerId);
    container.empty();

    if (!products || products.length === 0) {
        container.html('<p class="text-center text-muted">No featured products available.</p>');
        return;
    }

    products.forEach(product => {
        const imgField = product.image_url || product.image || '';
        const imageUrl = imgField
            ? `http://localhost/SneakerShop/${imgField}`
            : `http://localhost/SneakerShop/images/no-image.png`;

        const card = `
          <div class="col-md-4 mb-4">
            <div class="card shadow-sm h-100">
              <img src="${imageUrl}" class="card-img-top" alt="${product.name}">
              <div class="card-body text-center">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text fw-bold">$${product.price}</p>
                <p class="card-text">${product.description || 'No description available.'}</p>
              </div>
            </div>
          </div>
        `;
        container.append(card);
    });



  }
  $(document).ready(function () {
    if (window.location.hash === "#home" || window.location.hash === "") {
      loadHomeProducts();
    }
  
    $(window).on("hashchange", function () {
      if (window.location.hash === "#home") {
        loadHomeProducts();
      }
    });
  });
  