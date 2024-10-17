const { MongoClient } = require("mongodb");
require("dotenv").config();

let dbConnection;

const connectToDb = async () => {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    dbConnection = client.db(process.env.DB_NAME);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const getDb = () => {
  return dbConnection;
};

module.exports = {
  connectToDb,
  getDb,
};
