const { MongoClient } = require("mongodb");

let dbConnection;

const connectToDb = async () => {
  const client = new MongoClient("mongodb://localhost:27017");

  try {
    await client.connect();
    dbConnection = client.db("rc40_c22");
  } catch (err) {
    console.log(err);
  }
};

const getDb = () => {
  return dbConnection;
};

module.exports = {
  connectToDb,
  getDb,
};
