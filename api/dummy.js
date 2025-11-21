// api/products.js
import fetch from "node-fetch";

// Base URL for DummyJSON
const BASE_URL = "https://dummyjson.com/products";

// Function: fetch all products
async function getAllProducts() {
  const response = await fetch(`${BASE_URL}`);
  const data = await response.json();
  return data;
}

// Function: fetch single product by ID
async function getProductById(id) {
  const response = await fetch(`${BASE_URL}/${id}`);
  const data = await response.json();
  return data;
}

// Function: search products
async function searchProducts(query) {
  const response = await fetch(`${BASE_URL}/search?q=${query}`);
  const data = await response.json();
  return data;
}

// Vercel API handler
export default async function handler(req, res) {
  const { id, search } = req.query; // read parameters

  try {
    let result;

    if (id) {
      // /api/products?id=15
      result = await getProductById(id);
    } else if (search) {
      // /api/products?search=laptop
      result = await searchProducts(search);
    } else {
      // /api/products
      result = await getAllProducts();
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}
