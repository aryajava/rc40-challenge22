// [User.js](http://_vscodecontentref_/#%7B%22uri%22%3A%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22%2Fhome%2Faryajv%2FProjects%2Frubicamp-b40%2Frc40-challenge22%2Fmodels%2FUser.js%22%2C%22external%22%3A%22file%3A%2F%2F%2Fhome%2Faryajv%2FProjects%2Frubicamp-b40%2Frc40-challenge22%2Fmodels%2FUser.js%22%2C%22path%22%3A%22%2Fhome%2Faryajv%2FProjects%2Frubicamp-b40%2Frc40-challenge22%2Fmodels%2FUser.js%22%2C%22scheme%22%3A%22file%22%7D%7D)
const { ObjectId } = require("mongodb");
require("dotenv").config();

class User {
  constructor(name, phone) {
    this.name = name;
    this.phone = phone;
  }

  static validate(userData) {
    if (!userData.name || typeof userData.name !== "string") {
      throw new Error("Name is required and must be a string.");
    }
    if (!userData.phone || typeof userData.phone !== "string") {
      throw new Error("Phone is required and must be a string.");
    }
    return true;
  }

  static async getAll(db, query = {}, sort = {}, offset = 0, limit = 0) {
    const usersCollection = db.collection(process.env.USERS_COLLECTION);
    if (limit === 0) {
      return await usersCollection.find(query).sort(sort).toArray();
    } else {
      return await usersCollection.find(query).sort(sort).skip(offset).limit(limit).toArray();
    }
  }

  static async getById(db, userId) {
    const usersCollection = db.collection(process.env.USERS_COLLECTION);
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    return user;
  }

  static async getCount(db, query = {}) {
    const usersCollection = db.collection(process.env.USERS_COLLECTION);
    return await usersCollection.countDocuments(query);
  }

  static async save(db, userData) {
    this.validate(userData);
    const usersCollection = db.collection(process.env.USERS_COLLECTION);
    const result = await usersCollection.insertOne(userData);
    return result;
  }

  static async update(db, userId, userData) {
    this.validate(userData);
    const usersCollection = db.collection(process.env.USERS_COLLECTION);
    const result = await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: userData });
    return result;
  }

  static async delete(db, userId) {
    const usersCollection = db.collection(process.env.USERS_COLLECTION);
    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) });
    return result;
  }
}

module.exports = User;
