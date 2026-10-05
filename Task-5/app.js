
import { getProducts } from "./api.js";


// APPLICATION STATE

const state = {

    products: [],

    filteredProducts: [],

    cart: JSON.parse(
        localStorage.getItem("cart")
    ) || [],

    searchText: "",

    category: "all",

    sort: "default"

};


// DOM ELEMENTS

const productList =
    document.getElementById("product-list");

const searchInput =
    document.getElementById("search");

const categorySelect =
    document.getElementById("category");

const sortSelect =
    document.getElementById("sort");

const loading =
    document.getElementById("loading");

const errorBanner =
    document.getElementById("error-banner");

const retryButton =
    document.getElementById("retry-button");

const resultCount =
    document.getElementById("result-count");

const cartItems =
    document.getElementById("cart-items");

const cartTotal =
    document.getElementById("cart-total");

const cartCount =
    document.getElementById("cart-count");

const clearCart =
    document.getElementById("clear-cart");


// LOAD PRODUCTS

async function loadProducts() {

    showLoading();

    hideError();

    try {

        const products =
            await getProducts();

        state.products = products;

        state.filteredProducts = products;

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


// CREATE CATEGORIES

function createCategories() {

    categorySelect.innerHTML =
        '<option value="all">All Categories</option>';


    const categories =
        [...new Set(
            state.products.map(
                product => product.category
            )
        )];


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent = category;

        categorySelect.appendChild(option);

    });

}


// APPLY FILTERS

function applyFilters() {

    let products =
        [...state.products];


    // SEARCH

    if (state.searchText) {

        products =
            products.filter(product =>
                product.title
                    .toLowerCase()
                    .includes(state.searchText)
            );

    }


    // CATEGORY

    if (state.category !== "all") {

        products =
            products.filter(product =>
                product.category === state.category
            );

    }


    // SORT

    if (state.sort === "low") {

        products.sort(
            (a, b) => a.price - b.price
        );

    }


    if (state.sort === "high") {

        products.sort(
            (a, b) => b.price - a.price
        );

    }


    if (state.sort === "name") {

        products.sort(
            (a, b) =>
                a.title.localeCompare(b.title)
        );

    }


    state.filteredProducts = products;

    renderProducts();

}


// RENDER PRODUCTS

function renderProducts() {

    productList.innerHTML = "";


    resultCount.textContent =
        `${state.filteredProducts.length} product(s) found`;


    if (state.filteredProducts.length === 0) {

        productList.innerHTML =
            "<p>No products found.</p>";

        return;

    }


    state.filteredProducts.forEach(product => {

        const card =
            document.createElement("article");

        card.className =
            "product-card";


        card.innerHTML = `

            <img
                src="${product.image}"
                alt="${product.title}"
                class="product-image"
            >

            <div class="product-content">

                <p class="category">
                    ${product.category}
                </p>

                <h3>
                    ${product.title}
                </h3>

                <p class="price">
                    ₹${product.price}
                </p>

                <button
                    class="add-button"
                    data-id="${product.id}">

                    Add to Cart

                </button>

            </div>
        `;


        productList.appendChild(card);

    });

}


// ADD TO CART

function addToCart(id) {

    const product =
        state.products.find(
            product => product.id === id
        );


    if (!product) {
        return;
    }


    state.cart.push(product);

    saveCart();

    updateCart();

}


// REMOVE FROM CART

function removeFromCart(id) {

    state.cart =
        state.cart.filter(
            product => product.id !== id
        );


    saveCart();

    updateCart();

}


// UPDATE CART

function updateCart() {

    cartItems.innerHTML = "";

    cartCount.textContent =
        state.cart.length;


    if (state.cart.length === 0) {

        cartItems.innerHTML =
            "<p>Your cart is empty.</p>";

        cartTotal.textContent =
            "0.00";

        return;

    }


    let total = 0;


    state.cart.forEach(product => {

        total += product.price;


        const item =
            document.createElement("div");

        item.className =
            "cart-item";


        item.innerHTML = `

            <span>
                ${product.title}
            </span>

            <strong>
                ₹${product.price}
            </strong>

            <button
                class="remove-button"
                data-id="${product.id}">

                Remove

            </button>

        `;


        cartItems.appendChild(item);

    });


    cartTotal.textContent =
        total.toFixed(2);

}


// SAVE CART

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(state.cart)
    );

}


// SEARCH EVENT

searchInput.addEventListener(
    "input",
    function () {

        state.searchText =
            searchInput.value
                .toLowerCase()
                .trim();

        applyFilters();

    }
);


// CATEGORY EVENT

categorySelect.addEventListener(
    "change",
    function () {

        state.category =
            categorySelect.value;

        applyFilters();

    }
);


// SORT EVENT

sortSelect.addEventListener(
    "change",
    function () {

        state.sort =
            sortSelect.value;

        applyFilters();

    }
);


// ADD TO CART EVENT

productList.addEventListener(
    "click",
    function (event) {

        if (
            event.target.classList
                .contains("add-button")
        ) {

            const id =
                Number(
                    event.target.dataset.id
                );

            addToCart(id);

        }

    }
);


// REMOVE CART EVENT

cartItems.addEventListener(
    "click",
    function (event) {

        if (
            event.target.classList
                .contains("remove-button")
        ) {

            const id =
                Number(
                    event.target.dataset.id
                );

            removeFromCart(id);

        }

    }
);


// CLEAR CART

clearCart.addEventListener(
    "click",
    function () {

        state.cart = [];

        saveCart();

        updateCart();

    }
);


// RETRY

retryButton.addEventListener(
    "click",
    loadProducts
);


// LOADING

function showLoading() {

    loading.hidden = false;

    productList.innerHTML = "";

    resultCount.textContent =
        "Loading products...";

}


function hideLoading() {

    loading.hidden = true;

}


// ERROR

function showError() {

    errorBanner.hidden = false;

}


function hideError() {

    errorBanner.hidden = true;

}


// START

loadProducts();