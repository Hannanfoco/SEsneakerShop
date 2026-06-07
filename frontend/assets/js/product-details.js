/**
 * product-details.js
 * Handles opening and rendering a single product detail view.
 * Called when a user clicks on a product card in the shop or home page.
 * Fetches the product by ID from the backend and renders it inline.
 */

function openProductDetails(productId) {
    const token = localStorage.getItem("user_token");

    if (!token) {
        toastr.warning("Please log in to view product details.");
        window.location.hash = "#login";
        return;
    }

    $.ajax({
        url: `http://localhost/SneakerShop/backend/products?id=${productId}`,
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token,
            "Authentication": token
        },
        success: function (response) {
            const product = response.data
                ? (Array.isArray(response.data) ? response.data[0] : response.data)
                : (Array.isArray(response) ? response[0] : response);

            if (!product) {
                toastr.error("Product not found.");
                return;
            }

            renderProductDetails(product);
            window.location.hash = "#product-details";
        },
        error: function (xhr) {
            console.error("Failed to load product details:", xhr.responseText);
            toastr.error("Could not load product details.");
        }
    });
}

function renderProductDetails(product) {
    const imgField = product.image_url || product.image || "";
    const imageUrl = imgField
        ? `http://localhost/SneakerShop/${imgField}`
        : `http://localhost/SneakerShop/images/no-image.png`;

    const stockLabel = product.stock > 0
        ? `<span class="badge bg-success">In Stock (${product.stock})</span>`
        : `<span class="badge bg-danger">Out of Stock</span>`;

    const html = `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-10">
                    <button class="btn btn-outline-secondary mb-4" onclick="history.back()">
                        ← Back
                    </button>
                    <div class="card shadow-lg border-0">
                        <div class="row g-0">
                            <div class="col-md-5 text-center p-4">
                                <img src="${imageUrl}"
                                     class="img-fluid rounded"
                                     alt="${product.name}"
                                     style="max-height: 380px; object-fit: cover;">
                            </div>
                            <div class="col-md-7">
                                <div class="card-body p-4">
                                    <h2 class="card-title fw-bold">${product.name}</h2>
                                    <h4 class="text-warning fw-bold mb-3">$${parseFloat(product.price).toFixed(2)}</h4>
                                    <p class="card-text text-muted mb-3">${product.description || "No description available."}</p>
                                    <div class="mb-3">${stockLabel}</div>
                                    <div class="d-flex gap-3 mt-4">
                                        <button class="btn btn-warning fw-bold px-4"
                                            onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${parseFloat(product.price)}, '${imageUrl}')">
                                            🛒 Add to Cart
                                        </button>
                                        <button class="btn btn-outline-danger px-4"
                                            onclick="toggleFavorite(event, ${product.id}, '${product.name.replace(/'/g, "\\'")}', '${product.price}', '${imageUrl}', '${(product.description || '').replace(/'/g, "\\'")}', this)">
                                            🤍 Add to Favorites
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Inject into the product-details section
    const section = document.getElementById("product-details");
    if (section) {
        section.innerHTML = html;
    } else {
        // Fallback: create a modal overlay
        let modal = document.getElementById("product-detail-modal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "product-detail-modal";
            modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;overflow-y:auto;padding:40px 0;";
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <div style="max-width:900px;margin:auto;background:#fff;border-radius:12px;padding:20px;">
                <button class="btn btn-sm btn-secondary mb-3" onclick="document.getElementById('product-detail-modal').remove()">✕ Close</button>
                ${html}
            </div>`;
        modal.style.display = "block";
    }
}

console.log("product-details.js loaded");
