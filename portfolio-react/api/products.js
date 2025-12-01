const BASE_URL = "https://dummyjson.com/products";

async function getAllProducts() {
  const response = await fetch(`${BASE_URL}`);
  const data = await response.json();
  return data;
}

async function getProductById(id) {
  const response = await fetch(`${BASE_URL}/${id}`);
  const data = await response.json();
  return data;
}

async function searchProducts(query) {
  const response = await fetch(`${BASE_URL}/search?q=${query}`);
  const data = await response.json();
  return data;
}

export default async function handler(req, res) {
  const { id, search } = req.query;

  try {
    let result;

    if (id) {
      result = await getProductById(id);
    } else if (search) {
      result = await searchProducts(search);
    } else {
      result = await getAllProducts();
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}
