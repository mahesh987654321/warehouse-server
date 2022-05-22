const express = require("express");
const app = express();
var cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://carFactory:PfQasgbhYlF3ViH1@cluster0.1m7lq.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("carFactory").collection("service");
    const orderCollection = client.db("carFactory").collection("order");

    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const service = await serviceCollection.findOne(query);
      res.send(service);
    });
    app.post("/order", async (req, res) => {
      const my = req.body;

      const result = await orderCollection.insertOne(my);

      res.send(result);
    });
    app.get("/order", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email };
      const cursor = orderCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });
    app.get("/order", async (req, res) => {
      const query = {};
      const cursor = orderCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
  } finally {
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
