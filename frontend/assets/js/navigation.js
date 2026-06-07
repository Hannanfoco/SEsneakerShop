/**
 * navigation.js
 * Handles dynamic navigation bar state based on authentication.
 * Shows/hides nav items depending on whether the user is logged in
 * and what role they have (admin or customer).
 */

function updateNavigation() {
    const token = localStorage.getItem("user_token");
    const userRaw = localStorage.getItem("user");
    const nav = $("#dynamic-nav");

    nav.empty();

    if (!token || !userRaw) {
        // Logged out state
        nav.append(`
            <li class="nav-item"><a class="nav-link" href="#home">Home</a></li>
            <li class="nav-item"><a class="nav-link" href="#shop">Shop</a></li>
            <li class="nav-item"><a class="nav-link" href="#login">Login</a></li>
            <li class="nav-item"><a class="nav-link" href="#signup">Sign Up</a></li>
        `);
        return;
    }

    let user = {};
    try {
        user = JSON.parse(userRaw);
    } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
    }

    const isAdmin = user.role === "admin" || user.role === Constants.ADMIN_ROLE;

    // Common links for all logged-in users
    nav.append(`<li class="nav-item"><a class="nav-link" href="#home">Home</a></li>`);
    nav.append(`<li class="nav-item"><a class="nav-link" href="#shop">Shop</a></li>`);
    nav.append(`<li class="nav-item"><a class="nav-link" href="#cart">Cart</a></li>`);
    nav.append(`<li class="nav-item"><a class="nav-link" href="#favorites">Favorites</a></li>`);
    nav.append(`<li class="nav-item"><a class="nav-link" href="#profile">Profile</a></li>`);

    // Admin-only link
    if (isAdmin) {
        nav.append(`
            <li class="nav-item">
                <a class="btn btn-warning text-dark fw-bold px-3 me-2" href="#admin">Dashboard</a>
            </li>
        `);
    }

    // Logout button
    nav.append(`
        <li class="nav-item">
            <a class="btn btn-outline-light px-3" href="#" id="logout-btn">Logout</a>
        </li>
    `);

    // Attach logout handler
    $("#logout-btn").off("click").on("click", function (e) {
        e.preventDefault();
        logout();
    });
}

function logout() {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    localStorage.removeItem("cartTotal");
    localStorage.removeItem("favorites");

    toastr.success("You have been logged out.");

    setTimeout(function () {
        window.location.hash = "#login";
        updateNavigation();
    }, 800);
}

// Update nav on page load
$(document).ready(function () {
    updateNavigation();

    // Re-run on every hash change so nav stays in sync
    $(window).on("hashchange", function () {
        updateNavigation();
    });
});
