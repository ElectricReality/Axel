const MongoClient = require('mongodb').MongoClient;
const dbName = "axel";
const dbUser = "axel";
const dbPassword = encodeURIComponent(process.env.mongo_password);
const dbUrl = "axel-system-database";

const url = `mongodb://${dbUser}:${dbPassword}@${dbUrl}/${dbName}?authSource=admin`;

module.exports = {
  post: async (coll, query) => {
    if (!coll) {
      return console.log("Collection is not defined!")
    }
    if (!query) {
      return console.log("Query is not defined!")
    }
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).catch(err => {
      console.log(err);
    });
    if (!client) {
      return;
    }
    try {
      const db = client.db(dbName);
      let collection = db.collection(coll);
      let res = await collection.insertOne(query);
      return res
    } catch (err) {
      console.log(err);
    } finally {
      client.close();
    }
  },

  get: async (coll, query) => {
    if (!coll) {
      return console.log("Collection is not defined!")
    }
    if (!query) {
      return console.log("Query is not defined!")
    }
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).catch(err => {
      console.log(err);
    });
    if (!client) {
      return;
    }
    try {
      const db = client.db(dbName);
      let collection = db.collection(coll);
      let res = await collection.findOne(query);
      return res
    } catch (err) {
      console.log(err);
    } finally {
      client.close();
    }
  },

  getall: async (coll) => {
    if (!coll) {
      return console.log("Collection is not defined!")
    }
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).catch(err => {
      console.log(err);
    });
    if (!client) {
      return;
    }
    try {
      const db = client.db(dbName);
      let collection = db.collection(coll);
      let data = await collection.find({}).toArray()
      return data
    } catch (err) {
      console.log(err);
    } finally {
      client.close();
    }
  },

  update: async (coll, query, newquery) => {
    if (!coll) {
      return console.log("Collection is not defined!")
    }
    if (!query) {
      return console.log("query is not defined!")
    }
    if (!newquery) {
      return console.log("newquery is not defined!")
    }
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).catch(err => {
      console.log(err);
    });
    if (!client) {
      return;
    }
    try {
      const db = client.db(dbName);
      let collection = db.collection(coll);
      let res = await collection.updateOne(query, newquery);
      return res
    } catch (err) {
      console.log(err);
    } finally {
      client.close();
    }
  },

  remove: async (coll, query) => {
    if (!coll) {
      return console.log("Collection is not defined!")
    }
    if (!query) {
      return console.log("Query is not defined!")
    }
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).catch(err => {
      console.log(err);
    });
    if (!client) {
      return;
    }
    try {
      const db = client.db(dbName);
      let collection = db.collection(coll);
      let res = await collection.deleteOne(query);
      return res
    } catch (err) {
      console.log(err);
    } finally {
      client.close();
    }
  }
}
