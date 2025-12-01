// users.js
// Simple API wrapper for https://dummyjson.com/users

const BASE_URL = "https://dummyjson.com/users";

/**
 * Fetch all users
 * @returns {Promise<Array>} list of users
 */
export async function getUsers() {
  const res = await fetch(BASE_URL);
  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await res.json();
  return data.users; // API returns { users: [...] }
}

/**
 * Fetch user by ID
 * @param {number} id
 * @returns {Promise<Object>} user object
 */
export async function getUserById(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) {
    throw new Error("User not found");
  }

  return await res.json();
}

/**
 * Search users by keyword (server-side)
 * @param {string} query
 * @returns {Promise<Array>} matched users
 */
export async function searchUsers(query) {
  const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error("Search failed");
  }

  const data = await res.json();
  return data.users;
}

/**
 * Add a user (fake API will return the created object)
 * @param {Object} user
 * @returns {Promise<Object>}
 */
export async function addUser(user) {
  const res = await fetch(BASE_URL + "/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    throw new Error("Failed to add user");
  }

  return await res.json();
}

/**
 * Update a user
 * @param {number} id
 * @param {Object} user
 * @returns {Promise<Object>}
 */
export async function updateUser(id, user) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!res.ok) {
    throw new Error("Failed to update user");
  }

  return await res.json();
}

/**
 * Delete a user
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function deleteUser(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete user");
  }

  return await res.json();
}
