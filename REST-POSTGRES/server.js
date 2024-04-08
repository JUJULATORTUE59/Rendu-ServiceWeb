const express = require("express");
const postgres = require("postgres");
const z = require("zod");
const fetch = require('node-fetch');

const app = express();
	
app.use(express.json());

const port = 8000;
const sql = postgres({ db: "mydb", user: "user", password: "password" });

// Schemas
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  about: z.string(),
  price: z.number().positive(),
});
const CreateProductSchema = ProductSchema.omit({ id: true });

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  password: z.string(),
  email: z.string(),
});
const CreateUserSchema = UserSchema.omit({ id: true });
 
app.post("/products", async (req, res) => {
  const result = await CreateProductSchema.safeParse(req.body);
 
  // If Zod parsed successfully the request body
  if (result.success) {
    const { name, about, price } = result.data;
 
    const product = await sql`
    INSERT INTO products (name, about, price)
    VALUES (${name}, ${about}, ${price})
    RETURNING *
    `;
 
    res.send(product[0]);
  } else {
    res.status(400).send(result);
  }
});

app.get("/products", async (req, res) => {
  const products = await sql`
    SELECT * FROM products
    `;

  res.send(products);
});

app.get("/products/:id", async (req, res) => {
  const product = await sql`
    SELECT * FROM products WHERE id=${req.params.id}
    `;

  if (product.length > 0) {
    res.send(product[0]);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});

app.delete("/products/:id", async (req, res) => {
  const product = await sql`
    DELETE FROM products
    WHERE id=${req.params.id}
    RETURNING *
    `;

  if (product.length > 0) {
    res.send(product[0]);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});

app.post("/users", async (req, res) => {
  const result = await CreateUserSchema.safeParse(req.body);
 
  // If Zod parsed successfully the request body
  if (result.success) {
    const { name, password, email } = result.data;
 
    const user = await sql`
    INSERT INTO users (name, password, email)
    VALUES (${name}, ${password}, ${email})
    RETURNING *
    `;
 
    res.send(user[0]);
  } else {
    res.status(400).send(result);
  }
});

app.get("/users", async (req, res) => {
  const user = await sql`
    SELECT name, email FROM users
    `;

  res.send(user);
});

app.get("/users/:id", async (req, res) => {
  const user = await sql`
    SELECT name, email FROM users WHERE id=${req.params.id}
    `;

  if (user.length > 0) {
    res.send(user[0]);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});

app.delete("/user/:id", async (req, res) => {
  const user = await sql`
    DELETE FROM users
    WHERE id=${req.params.id}
    RETURNING *
    `;

  if (user.length > 0) {
    res.send(user[0]);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});

app.get("/f2p-games", async (req, res) => {
  const response = await fetch('https://www.freetogame.com/api/games');
  const data = await response.json();

  if (data) {
    res.send(data);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});


app.get("/f2p-games/:id", async (req, res) => {
  const response = await fetch(`https://www.freetogame.com/api/game?id=${req.params.id}`);
  const data = await response.json();

  if (data) {
    res.send(data);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});