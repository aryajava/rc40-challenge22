const { ObjectId } = require("mongodb");

class Todo {
  constructor(title, complete, deadline, executor) {
    this.title = title;
    this.complete = complete || false;
    this.deadline = deadline || new Date();
    this.executor = ObjectId(executor);
  }

  // Validasi data Todo
  static validate(todoData) {
    if (!todoData.title || typeof todoData.title !== "string") {
      throw new Error("Title is required and must be a string.");
    }
    if (typeof todoData.complete !== "boolean") {
      throw new Error("Complete must be a boolean.");
    }
    if (!todoData.deadline || !(todoData.deadline instanceof Date)) {
      throw new Error("Deadline must be a valid Date.");
    }
    if (!todoData.executor || !ObjectId.isValid(todoData.executor)) {
      throw new Error("Executor must be a valid ObjectId.");
    }
    return true;
  }

  // Method untuk menyimpan todo ke database
  static async save(db, todoData) {
    this.validate(todoData);
    const todosCollection = db.collection("todos");
    const result = await todosCollection.insertOne(todoData);
    return result;
  }
}

module.exports = Todo;
