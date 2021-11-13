const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

//middleware
app.use(cors());
app.use(express.json());

//
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4ovqx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db("golden-watch");
    const productsCollection = database.collection("products");
    const placeOrdersCollection = database.collection("placeOrders");
    const usersCollection = database.collection("users");
    const reviewCollection = database.collection("review");
    const accessoriesCollection = database.collection("accessories");

    //get products
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });
    app.get("/review", async (req, res) => {
      const cursor = reviewCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });
    app.get("/accessories", async (req, res) => {
      const cursor = accessoriesCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });
    app.post("/review", async (req, res) => {
      const data = req.body;
      const result = await reviewCollection.insertOne(data)
      res.json(result);
    });
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(`${id}`) };
      const result = await productsCollection.findOne(filter);
      res.json(result);
    });
    app.post("/placeOrders", async (req, res) => {
      const data = req.body;
      const result = await placeOrdersCollection.insertOne(data);
      res.json(result);
    });
    app.post("/products", async (req, res) => {
      const data = req.body;
      const result = await productsCollection.insertOne(data);
      res.json(result);
    });
    app.get("/placeOrders", async (req, res) => {
      const email = req.query.email;
     if(email){
      const cursor = placeOrdersCollection.find({ email: email });
      const result = await cursor.toArray();
      
      res.json(result);
     }
     else{
      const cursor = placeOrdersCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
     }
    });
    // app.get("/placeOrders", async (req, res) => {
     
    // });
    app.delete("/placeOrders/:Id", async (req, res) => {
      const id = req.params.Id;
      const query = { _id: ObjectId(`${id}`) };
      const result = await placeOrdersCollection.deleteOne(query);
      res.json(result);
    });
    app.put("/placeOrders/:Id", async (req, res) => {
      const id = req.params.Id;
      const query = { _id: ObjectId(`${id}`) };
      const option={upsert:true}
      const updateDoc={
        $set:{
          isApproved:true
        }
      }
      const result = await placeOrdersCollection.updateOne(query,updateDoc, option);
      res.json(result);
    });
    app.delete("/products/:Id", async (req, res) => {
      const id = req.params.Id;
      const query = { _id: ObjectId(`${id}`) };
      const result = await productsCollection.deleteOne(query);
      res.json(result);
    });
    app.post("/users", async (req, res) => {
      const data = req.body;
      const result = await usersCollection.insertOne(data);
      res.json(result);
    });
    app.put("/users", async (req, res) => {
      const data = req.body;
      const filter = { email: data.email };
      const cursor = usersCollection.find(filter);
      const result = await cursor.toArray();
      // console.log(result[0].email===`${data.email}`)
      let isAddAdmin=false;
      if (result[0]?.email && result[0]?.email!==undefined) {
        let isAddAdmin=true
        const option = { upsert: true };
        const updateDoc = {
          $set: {
            role: "admin",
          },
        };
         await usersCollection.updateOne(
          filter,
          updateDoc,
          option
        );
        res.json({value:isAddAdmin})
      }else{

        res.json({value:isAddAdmin})
      }
    });
   app.get('/users',async(req, res)=>{
        
        const cursor= usersCollection.find({email:req.query.email});
        const result = await cursor.toArray();
        let isAdmin=false;
        if(result[0].role){
          isAdmin=true;
          res.json({admin:isAdmin})
        }else{

          res.json({admin:isAdmin})
        }
   })
    console.log("connect successfull");
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server listening at Port ${port}`);
});
