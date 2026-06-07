function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error("Failed to parse JWT:", e);
        return null;
    }
}

async function loadFavorites() {
    console.log("🔄 loadFavorites() called");

    const container = document.getElementById("favorites-container");
    if (!container) {
        console.error("favorites-container not found");
        return;
    }

    container.innerHTML = "";

    const token = localStorage.getItem("user_token");
    if (!token) return;

    const decoded = parseJwt(token);
    const userId = decoded?.id;
    if (!userId) {
        console.error("Cannot extract user_id from token");
        return;
    }

    try {
        const response = await $.ajax({
            url: `${Constants.PROJECT_BASE_URL}favourites?user_id=${userId}`,
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token,
                "Authentication": token
            }
        });

        const favorites = Array.isArray(response.favourites) ? response.favourites : [];
        if (favorites.length === 0) {
            container.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No favorites yet.</td></tr>`;
            return;
        }

        favorites.forEach((product) => {
            const imageSrc = product.image_url
    ? `http://localhost/SneakerShop/frontend/${product.image_url}`
    : `http://localhost/SneakerShop/frontend/images/no-image.png`;

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td><img src="${imageSrc}" class="img-fluid rounded" style="width: 80px; height: 80px;"></td>
                    <td class="align-middle fw-bold">${product.name}</td>
                    <td class="align-middle text-muted">$${product.price}</td>
                    <td class="align-middle">${product.description || ""}</td>
                    <td class="align-middle">
                        <button class="btn btn-light border-0 text-danger fs-9" onclick="removeFromFavorites(${product.favourite_id})">❌</button>
                    </td>
                `;
                container.appendChild(row);
        });

    } catch (err) {
        console.error("Failed to load favorites:", err.responseText || err);
        toastr.error("Could not load favorites.");
    }
}

async function toggleFavorite(e, productId, name, price, imageUrl, description, buttonEl) {
    e.stopPropagation();

    const token = localStorage.getItem("user_token");
    if (!token) {
        toastr.warning("Please log in to manage favorites.");
        return;
    }

    const decoded = parseJwt(token);
    const userId = decoded?.id;
    if (!userId) {
        console.error("Cannot extract user_id from token");
        return;
    }

    const isLiked = buttonEl.textContent.includes("❤️");

    try {
        if (isLiked) {
            // Get favorites and find the one to delete
            const favs = await $.ajax({
                url: `${Constants.PROJECT_BASE_URL}favourites?user_id=${userId}`,
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Authentication": token
                }
            });

            const target = favs.data?.find(f => f.product_id === productId);
            if (!target) throw new Error("Favorite not found");

            await $.ajax({
                url: `${Constants.PROJECT_BASE_URL}favourites?id=${target.favourite_id}`,
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Authentication": token
                }
            });

            buttonEl.innerHTML = '🤍';
            toastr.info(`${name} removed from favorites`);

        } else {
            await $.ajax({
                url: Constants.PROJECT_BASE_URL + "favourites",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    user_id: userId,
                    product_id: productId
                }),
                headers: {
                    "Authorization": "Bearer " + token,
                    "Authentication": token
                }
            });

            buttonEl.innerHTML = '❤️';
            toastr.success(`${name} added to favorites`);
        }

    } catch (err) {
        console.error("toggleFavorite error:", err.responseText || err);
        toastr.error("Failed to update favorites.");
    }
}

async function removeFromFavorites(favouriteId) {
    const token = localStorage.getItem("user_token");
    if (!token) return;

    try {
        await $.ajax({
            url: `${Constants.PROJECT_BASE_URL}favourites?id=${favouriteId}`,
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token,
                "Authentication": token
            }
        });
        toastr.success("Favorite removed.");
        loadFavorites();
    } catch (err) {
        console.error("removeFromFavorites error:", err.responseText || err);
        toastr.error("Could not remove favorite.");
    }
}


