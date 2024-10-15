const express = require("express");
const router = express.Router();
const db = require("../db");
const User = require("../models/User");
const { ObjectId } = require("mongodb");

router.get("/", async (req, res, next) => {
  const { page = 1, limit = 5, query = "", sortBy = "_id", sortMode = "desc" } = req.query;
  const dbConnection = db.getDb();

  try {
    const usersCollection = dbConnection.collection("users");
    const offset = (page - 1) * limit;
    const sort = { [sortBy]: sortMode === "desc" ? -1 : 1 };

    const users = await usersCollection
      .find({ name: new RegExp(query, "i") })
      .sort(sort)
      .skip(offset)
      .limit(parseInt(limit))
      .toArray();

    const total = await usersCollection.countDocuments({ name: new RegExp(query, "i") });
    const pages = Math.ceil(total / limit);

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
      query,
      sortBy,
      sortMode,
      searchPage,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  const dbConnection = db.getDb();

  try {
    const user = await dbConnection.collection("users").findOne({ _id: new ObjectId(req.params.id) });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

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

router.put("/:id", async (req, res, next) => {
  const { name, phone } = req.body;
  const dbConnection = db.getDb();

  try {
    const result = await dbConnection.collection("users").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { name, phone } });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ _id: req.params.id, name, phone });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  const dbConnection = db.getDb();

  try {
    const result = await dbConnection.collection("users").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ _id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

