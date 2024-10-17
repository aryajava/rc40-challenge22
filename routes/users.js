const express = require("express");
const router = express.Router();
const db = require("../db");
const User = require("../models/User");
const { ObjectId } = require("mongodb");

// GET USERS
router.get("/", async (req, res, next) => {
  const { page = 1, limit = 5, search = "", sortBy = "_id", sortMode = "desc" } = req.query;
  const dbConnection = db.getDb();

  try {
    const offset = (page - 1) * limit;
    const sort = { [sortBy]: sortMode === "desc" ? -1 : 1 };

    const query = {
      $or: [{ name: new RegExp(search, "i") }, { phone: new RegExp(search, "i") }],
    };

    let users;
    if (parseInt(limit) === 0) {
      users = await User.getAll(dbConnection, query, sort);
    } else {
      users = await User.getAll(dbConnection, query, sort, offset, parseInt(limit));
    }

    const total = await User.getCount(dbConnection, query);
    const pages = parseInt(limit) === 0 ? 1 : Math.ceil(total / limit);

    const searchPage = Object.keys(req.query)
      .filter((key) => key !== "page")
      .map((key) => `${key}=${req.query[key]}`)
      .join("&");

    res.render("users", {
      data: users,
      total,
      pages,
      page: parseInt(page),
      limit: parseInt(limit),
      offset,
      search,
      sortBy,
      sortMode,
      searchPage,
    });
  } catch (err) {
    next(err);
  }
});

// GET USER
router.get("/:id", async (req, res, next) => {
  const dbConnection = db.getDb();

  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.getById(dbConnection, req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// CREATE USER
router.post("/", async (req, res, next) => {
  const { name, phone } = req.body;
  const dbConnection = db.getDb();

  try {
    const result = await User.save(dbConnection, { name, phone });
    res.status(201).json({ _id: result.insertedId, name, phone });
  } catch (err) {
    next(err);
  }
});

// UPDATE USER
router.put("/:id", async (req, res, next) => {
  const { name, phone } = req.body;
  const dbConnection = db.getDb();

  try {
    const result = await User.update(dbConnection, req.params.id, { name, phone });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ _id: req.params.id, name, phone });
  } catch (err) {
    next(err);
  }
});

// DELETE USER
router.delete("/:id", async (req, res, next) => {
  const dbConnection = db.getDb();

  try {
    const result = await User.delete(dbConnection, req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ _id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

