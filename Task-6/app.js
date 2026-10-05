import { getProducts } from "./api.js";


// ==========================================
// APPLICATION STATE
// ==========================================

const state = {

    products: [],

    filteredProducts: [],

    cart: JSON.parse(
        localStorage.getItem("shopEasyCart")
    ) || [],

    searchText: "",

    category: "all",

    sort: "default",

    user: JSON.parse(
        localStorage.getItem("shopEasyUser")
    ) || null

};


// ==========================================
// DOM ELEMENTS
// ==========================================

const productList =
    document.getElementById("product-list");

const searchInput =
    document.getElementById("search");

const categorySelect =
    document.getElementById("category");

const sortSelect =
    document.getElementById("sort");

const resultCount =
    document.getElementById("result-count");

const loading =
    document.getElementById("loading");

const errorBanner =
    document.getElementById("error-banner");

const retryButton =
    document.getElementById("retry-button");

const cartItems =
    document.getElementById("cart-items");

const cartCount =
    document.getElementById("cart-count");

const cartTotal =
    document.getElementById("cart-total");

const clearCartButton =
    document.getElementById("clear-cart");

const checkoutButton =
    document.getElementById("checkout-button");

const loginButton =
    document.getElementById("login-button");

const loginModal =
    document.getElementById("login-modal");

const closeModal =
    document.getElementById("close-modal");

const loginForm =
    document.getElementById("login-form");

const loginMessage =
    document.getElementById("login-message");


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    showLoading();

    hideError();


    try {

        const products =
            await getProducts();


        state.products =
            products;


        state.filteredProducts =
            products;


        createCategories();

        applyFilters();

        updateCart();

    }

    catch (error) {

        console.error(error);

        showError();

    }

    finally {

        hideLoading();

    }

}


// ==========================================
// CREATE CATEGORY OPTIONS
// ==========================================

function createCategories() {

    categorySelect.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;


    const categories =
        [
            ...new Set(
                state.products.map(
                    product => product.category
                )
            )
        ];


    categories.forEach(category => {

        const option =
            document.createElement("option");


        option.value =
            category;


        option.textContent =
            category;


        categorySelect.appendChild(
            option
        );

    });

}


// ==========================================
// FILTER + SORT
// ==========================================

function applyFilters() {

    let products =
        [...state.products];


    // SEARCH

    if (state.searchText) {

        products =
            products.filter(product =>
                product.title
                    .toLowerCase()
                    .includes(
                        state.searchText
                    )
            );

    }


    // CATEGORY

    if (state.category !== "all") {

        products =
            products.filter(product =>
                product.category ===
                state.category
            );

    }


    // SORT LOW TO HIGH

    if (state.sort === "low") {

        products.sort(
            (a, b) =>
                a.price - b.price
        );

    }


    // SORT HIGH TO LOW

    if (state.sort === "high") {

        products.sort(
            (a, b) =>
                b.price - a.price
        );

    }


    // SORT NAME

    if (state.sort === "name") {

        products.sort(
            (a, b) =>
                a.title.localeCompare(
                    b.title
                )
        );

    }


    state.filteredProducts =
        products;


    renderProducts();

}


// ==========================================
// RENDER PRODUCTS
// ==========================================

function renderProducts() {

    productList.innerHTML = "";


    resultCount.textContent =
        `${state.filteredProducts.length} products found`;


    if (
        state.filteredProducts.length === 0
    ) {

        productList.innerHTML = `
            <div class="no-products">
                <h3>No Products Found</h3>
                <p>
                    Try another search or category.
                </p>
            </div>
        `;

        return;

    }


    state.filteredProducts.forEach(
        product => {

            const card =
                document.createElement("article");


            card.className =
                "product-card";


            card.innerHTML = `

                <div class="image-container">

                    <img
                        src="${product.image}"
                        alt="${product.title}"
                        class="product-image"
                    >

                </div>


                <div class="product-content">

                    <p class="product-category">
                        ${product.category}
                    </p>


                    <h3>
                        ${product.title}
                    </h3>


                    <div class="product-bottom">

                        <strong>
                            ₹${product.price.toFixed(2)}
                        </strong>


                        <button
                            class="add-button"
                            data-id="${product.id}"
                        >
                            Add to Cart
                        </button>

                    </div>

                </div>
            `;


            productList.appendChild(card);

        }
    );

}


// ==========================================
// ADD TO CART
// ==========================================

function addToCart(id) {

    const product =
        state.products.find(
            product =>
                product.id === id
        );


    if (!product) {

        return;

    }


    const existingProduct =
        state.cart.find(
            item =>
                item.id === id
        );


    if (existingProduct) {

        existingProduct.quantity++;

    }

    else {

        state.cart.push({

            ...product,

            quantity: 1

        });

    }


    saveCart();

    updateCart();

}


// ==========================================
// REMOVE ONE ITEM
// ==========================================

function decreaseQuantity(id) {

    const product =
        state.cart.find(
            item =>
                item.id === id
        );


    if (!product) {

        return;

    }


    product.quantity--;


    if (product.quantity <= 0) {

        state.cart =
            state.cart.filter(
                item =>
                    item.id !== id
            );

    }


    saveCart();

    updateCart();

}


// ==========================================
// REMOVE PRODUCT
// ==========================================

function removeFromCart(id) {

    state.cart =
        state.cart.filter(
            item =>
                item.id !== id
        );


    saveCart();

    updateCart();

}


// ==========================================
// UPDATE CART
// ==========================================

function updateCart() {

    cartItems.innerHTML = "";


    let totalItems = 0;

    let totalPrice = 0;


    state.cart.forEach(product => {

        totalItems +=
            product.quantity;


        totalPrice +=
            product.price *
            product.quantity;


        const item =
            document.createElement("div");


        item.className =
            "cart-item";


        item.innerHTML = `

            <div class="cart-product">

                <img
                    src="${product.image}"
                    alt="${product.title}"
                >

                <div>

                    <h3>
                        ${product.title}
                    </h3>

                    <p>
                        ₹${product.price.toFixed(2)}
                    </p>

                </div>

            </div>


            <div class="quantity-controls">

                <button
                    class="quantity-button"
                    data-action="decrease"
                    data-id="${product.id}"
                >
                    −
                </button>


                <strong>
                    ${product.quantity}
                </strong>


                <button
                    class="quantity-button"
                    data-action="increase"
                    data-id="${product.id}"
                >
                    +
                </button>

            </div>


            <strong>
                ₹${(
                    product.price *
                    product.quantity
                ).toFixed(2)}
            </strong>


            <button
                class="remove-cart-button"
                data-id="${product.id}"
            >
                Remove
            </button>

        `;


        cartItems.appendChild(item);

    });


    cartCount.textContent =
        totalItems;


    cartTotal.textContent =
        totalPrice.toFixed(2);


    if (state.cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty.</h3>
                <p>
                    Add some products to continue.
                </p>
            </div>
        `;

    }

}


// ==========================================
// LOCAL STORAGE
// ==========================================

function saveCart() {

    localStorage.setItem(
        "shopEasyCart",
        JSON.stringify(state.cart)
    );

}


// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener(
    "input",
    () => {

        state.searchText =
            searchInput.value
                .toLowerCase()
                .trim();


        applyFilters();

    }
);


// ==========================================
// CATEGORY
// ==========================================

categorySelect.addEventListener(
    "change",
    () => {

        state.category =
            categorySelect.value;


        applyFilters();

    }
);


// ==========================================
// SORT
// ==========================================

sortSelect.addEventListener(
    "change",
    () => {

        state.sort =
            sortSelect.value;


        applyFilters();

    }
);


// ==========================================
// PRODUCT CLICK
// ==========================================

productList.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".add-button"
            );


        if (!button) {

            return;

        }


        const id =
            Number(
                button.dataset.id
            );


        addToCart(id);

    }
);


// ==========================================
// CART CLICK
// ==========================================

cartItems.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) {

            return;

        }


        const id =
            Number(
                button.dataset.id
            );


        const action =
            button.dataset.action;


        if (action === "increase") {

            addToCart(id);

        }


        else if (
            action === "decrease"
        ) {

            decreaseQuantity(id);

        }


        else if (
            button.classList.contains(
                "remove-cart-button"
            )
        ) {

            removeFromCart(id);

        }

    }
);


// ==========================================
// CLEAR CART
// ==========================================

clearCartButton.addEventListener(
    "click",
    () => {

        if (state.cart.length === 0) {

            return;

        }


        state.cart = [];

        saveCart();

        updateCart();

    }
);


// ==========================================
// CHECKOUT
// ==========================================

checkoutButton.addEventListener(
    "click",
    () => {

        if (state.cart.length === 0) {

            alert(
                "Your cart is empty."
            );

            return;

        }


        if (!state.user) {

            alert(
                "Please login before checkout."
            );

            openLoginModal();

            return;

        }


        alert(
            `Order placed successfully! Thank you ${state.user.name}.`
        );


        state.cart = [];

        saveCart();

        updateCart();

    }
);


// ==========================================
// LOGIN MODAL
// ==========================================

function openLoginModal() {

    loginModal.hidden = false;

}


function closeLoginModal() {

    loginModal.hidden = true;

}


loginButton.addEventListener(
    "click",
    openLoginModal
);


closeModal.addEventListener(
    "click",
    closeLoginModal
);


loginModal.addEventListener(
    "click",
    event => {

        if (
            event.target === loginModal
        ) {

            closeLoginModal();

        }

    }
);


// ==========================================
// LOGIN FORM
// ==========================================

loginForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const email =
            document.getElementById(
                "email"
            ).value;


        const name =
            email.split("@")[0];


        state.user = {

            name: name,

            email: email

        };


        localStorage.setItem(
            "shopEasyUser",
            JSON.stringify(
                state.user
            )
        );


        loginMessage.textContent =
            `Welcome, ${name}! Login successful.`;


        loginMessage.className =
            "success-message";


        loginButton.textContent =
            `Hi, ${name}`;


        setTimeout(
            closeLoginModal,
            1200
        );

    }
);


// ==========================================
// ERROR
// ==========================================

function showError() {

    errorBanner.hidden = false;

}


function hideError() {

    errorBanner.hidden = true;

}


// ==========================================
// LOADING
// ==========================================

function showLoading() {

    loading.hidden = false;

    productList.innerHTML = "";

    resultCount.textContent =
        "Loading products...";

}


function hideLoading() {

    loading.hidden = true;

}


// ==========================================
// RETRY
// ==========================================

retryButton.addEventListener(
    "click",
    loadProducts
);


// ==========================================
// INITIAL LOGIN UI
// ==========================================

if (state.user) {

    loginButton.textContent =
        `Hi, ${state.user.name}`;

}


// ==========================================
// START APPLICATION
// ==========================================

loadProducts();

updateCart();
