const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

let dbConnection;

module.exports = {
  connectToServer: (callback) => {
    client.connect((err, db) => {
      if (err) {
        return callback(err);
      }
      dbConnection = db.db("rc40_c22");
      return callback();
    });
  },
  getDb: () => {
    return dbConnection;
  },
};

