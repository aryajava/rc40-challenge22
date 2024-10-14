class User {
  constructor(name, phone) {
    this.name = name;
    this.phone = phone;
  }

  // Validasi data User sebelum disimpan
  static validate(userData) {
    if (!userData.name || typeof userData.name !== "string") {
      throw new Error("Name is required and must be a string.");
    }
    if (!userData.phone || typeof userData.phone !== "string") {
      throw new Error("Phone is required and must be a string.");
    }
    return true;
  }

  // Method untuk menyimpan user ke database
  static async save(db, userData) {
    this.validate(userData);
    const usersCollection = db.collection("users");
    const result = await usersCollection.insertOne(userData);
    return result;
  }
}

module.exports = User;
