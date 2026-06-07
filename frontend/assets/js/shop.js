function loadProducts(containerId, products) {
    if (!Array.isArray(products)) {
        console.error("loadProducts received invalid data. Expected array but got:", products);
        return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`⚠️ Skipping loadProducts: Container '${containerId}' not found.`);
        return;
    }

    console.log(` Loading products into: ${containerId}`);
    container.innerHTML = "";

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    let row = document.createElement("div");
    row.classList.add("row", "g-4");
    container.appendChild(row);

    products.forEach((product, index) => {
        const isFavorite = favorites.some(fav => fav.id === product.id);
        const imgField = product.image_url || product.image || '';
        const imageUrl = imgField
            ? `http://localhost/SneakerShop/${imgField}`
            : `http://localhost/SneakerShop/images/no-image.png`;

        console.log(" Image URL for product:", product.name, imageUrl);

        const productCard = document.createElement("div");
        productCard.classList.add("col-lg-4", "col-md-6", "col-sm-12", "d-flex", "align-items-stretch");

        productCard.innerHTML = `
    <div class="card shadow-sm w-100 border-0 p-3" onclick="openProductDetails(${product.id})">
        <div class="position-relative">
            <img src="${imageUrl}" class="card-img-top rounded" alt="${product.name}">
            <button class="btn btn-light position-absolute top-0 end-0 m-2 border rounded-circle favorite-btn" 
    onclick="toggleFavorite(event, ${product.id}, '${product.name.replace(/'/g, "\\'")}', '${product.price}', '${imageUrl}', '${product.description.replace(/'/g, "\\'")}', this)">
    ${isFavorite ? '❤️' : '🤍'} 
</button>

        </div>
        <div class="card-body d-flex flex-column text-center">
            <h5 class="card-title fw-bold">${product.name}</h5>
            <p class="text-muted">$${product.price}</p>
            <p class="card-text">${product.description}</p>
            <button class="btn btn-warning mt-auto w-100"
                onclick="event.stopPropagation(); addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${parseFloat(product.price)}, '${imageUrl}')">
                🛒 Add to Cart
            </button>
        </div>
    </div>
`;



        row.appendChild(productCard);

        if ((index + 1) % 3 === 0 && index !== products.length - 1) {
            row = document.createElement("div");
            row.classList.add("row", "g-4");
            container.appendChild(row);
        }
    });
}

function getAllProducts(callback) {
    const token = localStorage.getItem("user_token");

    if (!token) {
        console.warn(" No token found in localStorage.");
        callback([]); // return empty 
        return;
    }

    $.ajax({
        url: "http://localhost/SneakerShop/backend/products",
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token,
            "Authentication": token
        },
        success: function (response) {
            console.log(" Raw response:", response);

            const products =
                Array.isArray(response) ? response :
                Array.isArray(response.data) ? response.data :
                Array.isArray(response.products) ? response.products :
                [];

            if (!Array.isArray(products)) {
                console.error(" Response doesn't contain valid product array. Response:", response);
                callback([]);
                return;
            }

            callback(products);
        },
        error: function (xhr) {
            console.error(" AJAX failed:", xhr.responseText);
            toastr.error("Failed to load products.");
            callback([]);
        }
    });
}

//  3. Section router
function showSection(sectionId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.style.display = 'none';
    });

    const section = document.getElementById(sectionId);
    if (!section) {
        console.error(` Section '${sectionId}' not found.`);
        return;
    }


    if (sectionId === "shop") {
        getAllProducts(products => loadProducts("shop-product-container", products));
    } else if (sectionId === "home") {
        getAllProducts(products => loadProducts("home-product-container", products));
    } else if (sectionId === "favorites") {
        loadFavorites(); 
    }

    localStorage.setItem('currentSection', sectionId);
}

function applyFilter(filter) {
    const token = localStorage.getItem("user_token");
    if (!token) {
        console.warn(" No token found.");
        toastr.warning("You need to log in to filter products.");
        return;
    }

    let url = "http://localhost/SneakerShop/backend/products";
    let query = "";

    switch (filter) {
        case "Nike":
        case "Adidas":
        case "Puma":
            query = `?brand=${filter}`;
            break;
        case "under-100":
            query = "?price=100&price_lt=true";
            break;
        case "100-150":
            query = "?price_min=100&price_max=150";
            break;
        case "above-150":
            query = "?price=150&price_gt=true";
            break;
        case "all":
        default:
            query = "";
            break;
    }

    $.ajax({
        url: url + query,
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token,
            "Authentication": token
        },
        success: function (response) {
            const products =
                Array.isArray(response) ? response :
                Array.isArray(response.data) ? response.data :
                Array.isArray(response.products) ? response.products :
                (response && typeof response === 'object') ? Object.values(response) :
                [];

            loadProducts("shop-product-container", products);

            document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
            const activeBtn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
            if (activeBtn) activeBtn.classList.add("active");
        },
        error: function (xhr) {
            console.error(" Filter fetch failed:", xhr.responseText);
            toastr.error("Could not apply filter.");
        }
    });
}



function filterProducts() {
    const token = localStorage.getItem("user_token");
    const keyword = document.getElementById("searchBar").value.trim();

    if (!token) {
        console.warn(" No token found.");
        return;
    }

    if (keyword.length === 0) {
        applyFilter('all');
        return;
    }

    $.ajax({
        url: `http://localhost/SneakerShop/backend/products?search=${encodeURIComponent(keyword)}`,
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token,
            "Authentication": token
        },
        success: function (response) {
            const products =
                Array.isArray(response) ? response :
                Array.isArray(response.data) ? response.data :
                Array.isArray(response.products) ? response.products :
                [];

            loadProducts("shop-product-container", products);
        },
        error: function (xhr) {
            console.error(" Search fetch failed:", xhr.responseText);
            toastr.error("Search failed.");
        }
    });
}

function addToCart(productId, name, price, imageUrl) {
    const token = localStorage.getItem("user_token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user || !user.id) {
        toastr.warning("Please log in to add products to your cart.");
        return;
    }

    $.ajax({
        url: "http://localhost/SneakerShop/backend/cart",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            user_id: user.id,
            product_id: productId,
            quantity: 1
        }),
        headers: {
            "Authorization": "Bearer " + token,
            "Authentication": token
        },
        success: function () {
            toastr.success(`${name} added to cart!`);
        },
        error: function (xhr) {
            console.error("Failed to add to cart:", xhr.responseText);
            toastr.error("Could not add item to cart.");
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const savedSection = localStorage.getItem("currentSection") || "home";
    showSection(savedSection);
});
