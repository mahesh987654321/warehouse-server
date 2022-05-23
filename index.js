const express = require("express");
const app = express();
var cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
var jwt = require("jsonwebtoken");
app.use(express.json());
app.use(cors());
// ebbf344436ca8d57de8edf18e8dfb464095337c9e60b0415ab17cfe2cd78715e50daf4e30835f6539f6b6c3bccbaa4c80016b9922fb411a57ea185f3b2e88500
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  // `mongodb+srv://carFactory:PfQasgbhYlF3ViH1@cluster0.1m7lq.mongodb.net/?retryWrites=true&w=majority`;
  `mongodb+srv://${process.env.ADD_USER}:${process.env.ADD_PASSWORD}@cluster0.1m7lq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  if (!authHeader) {
    return res.status(401).send({ message: "unAuthorized Access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ADD_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("carFactory").collection("service");
    const orderCollection = client.db("carFactory").collection("order");
    const reviewCollection = client.db("carFactory").collection("review");
    const usersCollection = client.db("carFactory").collection("users");
    const productsCollection = client.db("carFactory").collection("users");
    const verifyAdmin = async (req, res, next) => {
      const requestUser = req.decoded.email;

      const requestEmail = await usersCollection.findOne({
        email: requestUser,
      });
      if (requestEmail.role === "admin") {
        next();
      } else {
        res.status(403).send({ message: "Forbidden" });
      }
    };
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
      // const authorization = req.headers.authorization;
      // console.log("auth header", authorization);
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
    // ?******* Review
    app.get("/review", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    // Post review
    app.post("/review", async (req, res) => {
      const my = req.body;

      const result = await reviewCollection.insertOne(my);

      res.send(result);
    });
    // Users Part
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign({ email: email }, process.env.ADD_TOKEN, {
        expiresIn: "30d",
      });
      res.send({ result, token });
    });
    // Admin
    app.put("/users/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAccount = await usersCollection.findOne({
        email: requester,
      });
      if (requesterAccount.role === "admin") {
        console.log(email);
        const filter = { email: email };
        const updateDoc = {
          $set: { role: "admin" },
        };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.send(result);
      } else {
        res.status(403).send({ message: "forbidden" });
      }
    });
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email });

      const isAdmin = user.role === "admin";
      console.log(isAdmin);

      res.send({ admin: isAdmin });
    });
    // Products
    app.post("/service", async (req, res) => {
      const my = req.body;
      const result = await serviceCollection.insertOne(my);
      res.send(result);
    });
    app.delete("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
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
