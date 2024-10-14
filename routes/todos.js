const express = require("express");
const router = express.Router();
const db = require("../db");
const Todo = require("../models/Todo");

// Route untuk menambah todo
router.post("/", async (req, res, next) => {
  const { title, complete, deadline, executor } = req.body;
  const dbConnection = db.getDb();

  try {
    const result = await Todo.save(dbConnection, { title, complete, deadline: new Date(deadline), executor });
    res.json({ message: "Todo added successfully", result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
