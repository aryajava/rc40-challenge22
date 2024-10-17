const express = require("express");
const router = express.Router();
const db = require("../db");
const Todo = require("../models/Todo");
const { ObjectId } = require("mongodb");

router.get("/users/:userId/todos", async (req, res, next) => {
  const { userId } = req.params;
  const { page = 1, limit = 10, title = "", complete = "", startdateDeadline = "", enddateDeadline = "", sortBy = "_id", sortMode = "desc" } = req.query;
  const dbConnection = db.getDb();

  try {
    const offset = (page - 1) * limit;
    const sort = { [sortBy]: sortMode === "desc" ? -1 : 1 };

    const query = {
      title: new RegExp(title, "i"),
      ...(complete !== "" && { complete: complete === "true" }),
      ...(startdateDeadline || enddateDeadline
        ? {
            deadline: {
              ...(startdateDeadline && { $gte: new Date(startdateDeadline) }),
              ...(enddateDeadline && { $lte: new Date(enddateDeadline) }),
            },
          }
        : {}),
      executor: new ObjectId(userId),
    };

    console.log(query, sort, offset, parseInt(limit));

    const todos = await Todo.getAll(dbConnection, query, sort, offset, parseInt(limit));

    if (req.xhr) {
      return res.json(todos);
    }

    const total = await Todo.getCount(dbConnection, query);
    const pages = Math.ceil(total / limit);

    res.render("todos", {
      todos,
      total,
      pages,
      page: parseInt(page),
      limit: parseInt(limit),
      userId,
      title,
      complete,
      startdateDeadline,
      enddateDeadline,
      sortBy,
      sortMode,
      searchPage: req.url,
    });
  } catch (err) {
    next(err);
  }
});

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

router.post("/users/:userId/todos", async (req, res, next) => {
  const { userId } = req.params;
  const { title } = req.body;
  const dbConnection = db.getDb();

  try {
    const todoData = {
      title,
      complete: false,
      deadline: new Date(),
      executor: new ObjectId(userId),
    };
    const result = await Todo.save(dbConnection, todoData);
    res.status(201).json({ _id: result.insertedId, ...todoData });
  } catch (err) {
    next(err);
  }
});

router.put("/users/:userId/todos/:id", async (req, res, next) => {
  const { userId, id } = req.params;
  const { title, deadline, complete } = req.body;
  const dbConnection = db.getDb();

  try {
    console.log("PUT Request Data:", { userId, id, title, deadline, complete });
    const todoData = {
      title,
      deadline: new Date(deadline),
      complete: complete === "on",
      executor: new ObjectId(userId),
    };
    console.log("PUT Todo Data:", todoData);
    const result = await Todo.update(dbConnection, new ObjectId(userId), new ObjectId(id), todoData);
    console.log("PUT Result:", result);
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.json({ _id: id, ...todoData });
  } catch (err) {
    console.error("PUT Error:", err);
    next(err);
  }
});

router.delete("/users/:userId/todos/:id", async (req, res, next) => {
  let { userId, id } = req.params;
  const dbConnection = db.getDb();

  try {
    id = new ObjectId(id);
    console.log("DELETE Request Data:", { userId, id });
    const result = await Todo.delete(dbConnection, userId, id);
    console.log("DELETE Result:", result);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.json({ _id: id });
  } catch (err) {
    console.error("DELETE Error:", err);
    next(err);
  }
});

module.exports = router;

