const express = require("express");
const router = express.Router();
const db = require("../db");
const Todo = require("../models/Todo");
const { ObjectId } = require("mongodb");

// GET TODOS
router.get("/users/:userId/todos", async (req, res, next) => {
  const { userId } = req.params;
  const { page = 1, limit = 10, title = "", complete, startdateDeadline, enddateDeadline, sortBy = "_id", sortMode = "desc" } = req.query;
  const dbConnection = db.getDb();

  try {
    const offset = (page - 1) * limit;
    const sort = { [sortBy]: sortMode === "desc" ? -1 : 1 };

    const query = {
      title: new RegExp(title, "i"),
      ...(complete !== undefined && { complete: complete === "true" }),
      ...(startdateDeadline && { deadline: { $gte: new Date(startdateDeadline) } }),
      ...(enddateDeadline && { deadline: { $lte: new Date(enddateDeadline) } }),
      executor: new ObjectId(userId),
    };

    const todos = await Todo.getAll(dbConnection, query, sort, offset, parseInt(limit));
    const total = await dbConnection.collection("todos").countDocuments(query);
    const pages = Math.ceil(total / limit);

    res.render("todos", { todos, total, pages, page: parseInt(page), limit: parseInt(limit), userId });
  } catch (err) {
    next(err);
  }
});

// GET TODO
router.get("/users/:userId/todos/:id", async (req, res, next) => {
  const { userId, id } = req.params;
  const dbConnection = db.getDb();

  try {
    const todo = await Todo.getById(dbConnection, userId, id);
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.json(todo);
  } catch (err) {
    next(err);
  }
});

// CREATE TODO
router.post("/users/:userId/todos", async (req, res, next) => {
  const { userId } = req.params;
  const { title } = req.body;
  const dbConnection = db.getDb();

  try {
    const todoData = {
      title,
      complete: false,
      deadline: new Date(),
      executor: userId,
    };
    const result = await Todo.save(dbConnection, todoData);
    res.status(201).json({ _id: result.insertedId, ...todoData });
  } catch (err) {
    next(err);
  }
});

// UPDATE TODO
router.put("/users/:userId/todos/:id", async (req, res, next) => {
  const { userId, id } = req.params;
  const { title, deadline, complete } = req.body;
  const dbConnection = db.getDb();

  try {
    const todoData = { title, deadline: new Date(deadline), complete };
    const result = await Todo.update(dbConnection, userId, id, todoData);
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.json({ _id: id, ...todoData });
  } catch (err) {
    next(err);
  }
});

// DELETE TODO
router.delete("/users/:userId/todos/:id", async (req, res, next) => {
  const { userId, id } = req.params;
  const dbConnection = db.getDb();

  try {
    const result = await Todo.delete(dbConnection, userId, id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.json({ _id: id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
