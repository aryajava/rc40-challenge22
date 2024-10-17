const express = require("express");
const router = express.Router();
const db = require("../db");
const Todo = require("../models/Todo");
const User = require("../models/User");
const { ObjectId } = require("mongodb");

const validateUserId = async (req, res, next) => {
  const { userId } = req.params;
  const dbConnection = db.getDb();

  try {
    if (!ObjectId.isValid(userId)) {
      const error = new Error("Invalid user ID");
      error.status = 400;
      throw error;
    }

    const user = await User.getById(dbConnection, userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    next();
  } catch (err) {
    next(err);
  }
};

router.get("/users/:userId/todos", validateUserId, async (req, res, next) => {
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

router.get("/users/:userId/todos/:id", validateUserId, async (req, res, next) => {
  const { userId, id } = req.params;
  const dbConnection = db.getDb();

  try {
    if (!ObjectId.isValid(id)) {
      const error = new Error("Invalid todo ID");
      error.status = 400;
      throw error;
    }

    const todo = await Todo.getById(dbConnection, userId, id);
    if (!todo) {
      const error = new Error("Todo not found");
      error.status = 404;
      throw error;
    }
    res.json(todo);
  } catch (err) {
    next(err);
  }
});

router.post("/users/:userId/todos", validateUserId, async (req, res, next) => {
  const { userId } = req.params;
  const { title } = req.body;
  const dbConnection = db.getDb();

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  try {
    const todoData = {
      title,
      complete: false,
      deadline: addDays(new Date(), 1),
      executor: new ObjectId(userId),
    };
    const result = await Todo.save(dbConnection, todoData);
    res.status(201).json({ _id: result.insertedId, ...todoData });
  } catch (err) {
    next(err);
  }
});

router.put("/users/:userId/todos/:id", validateUserId, async (req, res, next) => {
  const { userId, id } = req.params;
  const { title, deadline, complete } = req.body;
  const dbConnection = db.getDb();

  try {
    if (!ObjectId.isValid(id)) {
      const error = new Error("Invalid todo ID");
      error.status = 400;
      throw error;
    }

    const todoData = {
      title,
      deadline: new Date(deadline),
      complete: complete === "on",
      executor: new ObjectId(userId),
    };

    const result = await Todo.update(dbConnection, new ObjectId(userId), new ObjectId(id), todoData);

    if (result.matchedCount === 0) {
      const error = new Error("Todo not found");
      error.status = 404;
      throw error;
    }
    res.json({ _id: id, ...todoData });
  } catch (err) {
    console.error("PUT Error:", err);
    next(err);
  }
});

router.delete("/users/:userId/todos/:id", validateUserId, async (req, res, next) => {
  let { userId, id } = req.params;
  const dbConnection = db.getDb();

  try {
    if (!ObjectId.isValid(id)) {
      const error = new Error("Invalid todo ID");
      error.status = 400;
      throw error;
    }

    id = new ObjectId(id);

    const result = await Todo.delete(dbConnection, userId, id);

    if (result.deletedCount === 0) {
      const error = new Error("Todo not found");
      error.status = 404;
      throw error;
    }
    res.json({ _id: id });
  } catch (err) {
    console.error("DELETE Error:", err);
    next(err);
  }
});

module.exports = router;

