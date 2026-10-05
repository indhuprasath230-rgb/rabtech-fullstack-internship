const API_URL = "https://fakestoreapi.com/products";


// GET ALL PRODUCTS

export async function getProducts() {

    const response = await fetch(API_URL);


    if (!response.ok) {

        throw new Error(
            "Unable to fetch products"
        );

    }


    const data = await response.json();


    return data;
}


// GET SINGLE PRODUCT

export async function getProduct(id) {

    const response =
        await fetch(`${API_URL}/${id}`);


    if (!response.ok) {

        throw new Error(
            "Unable to fetch product"
        );

    }


    const data =
        await response.json();


    return data;
}