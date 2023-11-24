import express from "express";
import mysql from "mysql";
import cors from "cors";
import axios from "axios";
import jwt from "jsonwebtoken";
import session from "express-session";
import cookieParser from "cookie-parser";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password123",
  database: "social-site",
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

const user = {
  name: "John",
};

// Register Route
app.post("/register", (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  db.query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, password],
    (err, result) => {
      console.log(err);
    }
  );
});

// Login Route
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, result) => {
      if (err) {
        return res.status(404).json({ err: err });
      }

      if (result.length > 0) {
        req.session.user = "user";
        req.session.save();

        return res.json({
          error: false,
          user: result,
          message: "Logged in successfully!",
        });
      } else {
        return res.send({ error: true, message: "Wrong credentials" });
      }
    }
  );
});

app.get("/api/getSession", (req, res) => {
  const sessionUser = req.session.user;
  res.json({ sessionUser });
});

// Get Posts
app.get("/feed", async (req, res) => {
  try {
    const response = await axios
      .get("https://jsonplaceholder.typicode.com/posts")
      .then((response) => {
        // console.log(response.data);
        return res.status(200).json({ posts: response.data });
      })
      .catch((err) => {
        return res
          .status(500)
          .json({ message: `Could not load posts: ${err}` });
      });
  } catch (error) {}
});

app.get("/users", async (req, res) => {
  try {
    const response = await axios
      .get("https://jsonplaceholder.typicode.com/users")
      .then((response) => {
        // console.log(response.data);
        return res.status(200).json({ users: response.data });
      })
      .catch((err) => {
        return res
          .status(500)
          .json({ message: `Could not load posts: ${err}` });
      });
  } catch (error) {}
});

app.listen(8081, () => {
  console.log("Listening to port 8081");
});

// Export the Express API
module.exports = app;
