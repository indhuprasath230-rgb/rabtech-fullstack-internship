
export async function getProducts() {

    const response =
        await fetch(API_URL);


    // Check HTTP error

    if (!response.ok) {

        throw new Error(
            "Failed to fetch products"
        );

    }


    const data =
        await response.json();


    return data;
}