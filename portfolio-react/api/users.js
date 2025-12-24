const BASE_URL = "https://dummyjson.com/users";

/* ------------------- BASIC OPERATIONS ------------------- */

async function getAllUsers() {
  const response = await fetch(`${BASE_URL}?limit=0`);
  const data = await response.json();
  return data;
}

async function getUserById(id) {
  const response = await fetch(`${BASE_URL}/${id}`);
  const data = await response.json();
  return data;
}

// async function searchUsers(query) {
//   const response = await fetch(`${BASE_URL}/search?q=${query}`);
//   const data = await response.json();
//   return data;
// }

/* ------------------- MODIFY OPERATIONS ------------------- */

// async function addUser(userData) {
//   const response = await fetch(`${BASE_URL}/add`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(userData),
//   });

//   const data = await response.json();
//   return data;
// }

async function updateUser(id, userData) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  return data;
}

// async function deleteUser(id) {
//   const response = await fetch(`${BASE_URL}/${id}`, {
//     method: "DELETE",
//   });

//   const data = await response.json();
//   return data;
// }

/* ------------------- API HANDLER ------------------- */

export default async function handler(req, res) {
  const { id } = req.query;
  // const { id, search } = req.query;
  const method = req.method;

  try {
    let result;

    /* ---------- GET Requests ---------- */
    if (method === "GET") {
      if (id) {
        result = await getUserById(id);
        // }
        // else if (search) {
        //   result = await searchUsers(search);
      } else {
        result = await getAllUsers();
      }

      return res.status(200).json(result);
    }

    /* ---------- POST: Add User ---------- */
    // if (method === "POST") {
    //   result = await addUser(req.body);
    //   return res.status(201).json(result);
    // }

    /* ---------- PUT: Update User ---------- */
    if (method === "PUT") {
      if (!id) {
        return res
          .status(400)
          .json({ error: "User ID is required for update." });
      }
      result = await updateUser(id, req.body);
      return res.status(200).json(result);
    }

    /* ---------- DELETE: Delete User ---------- */
    // if (method === "DELETE") {
    //   if (!id) {
    //     return res
    //       .status(400)
    //       .json({ error: "User ID is required for delete." });
    //   }
    //   result = await deleteUser(id);
    //   return res.status(200).json(result);
    // }

    /* ---------- Unsupported Method ---------- */
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err) {
    console.error("User API error:", err);
    res.status(500).json({ error: "Failed to process request" });
  }
}
