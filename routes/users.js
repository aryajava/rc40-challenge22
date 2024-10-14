const express = require("express");
const router = express.Router();
const db = require("../db");
const User = require("../models/User");

router.get("/", async (req, res, next) => {
  const dbConnection = db.getDb();

  try {
    const users = await User.findAll(dbConnection);
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  const { name, email, password } = req.body;
  const dbConnection = db.getDb();

  try {
    const result = await User.save(dbConnection, { name, email, password });
    res.json({ message: "User added successfully", result });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  const { name, email, password } = req.body;
  const dbConnection = db.getDb();

  try {
    const result = await User.update(dbConnection, req.params.id, { name, email, password });
    res.json({ message: "User updated successfully", result });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  const dbConnection = db.getDb();

  try {
    const result = await User.remove(dbConnection, req.params.id);
    res.json({ message: "User deleted successfully", result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
