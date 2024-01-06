const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://rig-task:JTEph2PE6nQ4A6bb@cluster0.wa4fr1c.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    // collections
    const assetCollection = client.db("rigDB").collection("assets");
    const earningCollection = client.db("rigDB").collection("earnings");

    // available assets
    app.get("/assets", async (req, res) => {
      const result = await assetCollection.find().toArray();
      res.send(result);
    });

    // added earning
    app.post("/addEarning", async (req, res) => {
      const earnings = req.body;
      const result = await earningCollection.insertOne(earnings);
      res.send(result);
    });

    // Set up multer for file uploads
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "uploads/");
      },
      filename: function (req, file, cb) {
        cb(
          null,
          file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
      },
    });
    const upload = multer({ storage: storage });

    // Handle file uploads
    app.post("/payment/upload", upload.single("file"), async (req, res) => {
      try {
        const file = req.file;
        if (!file) {
          return res.status(400).json({ message: "No file uploaded" });
        }
        return res.status(200).json({
          fileName: file.filename,
          filePath: file.path,
        });
      } catch (error) {
        console.error("Error handling file upload:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Commenting out the client close here to keep the connection open for the server
    // await client.close();
  }
}

// Start the server after connecting to MongoDB
(async () => {
  await run();
  app.get("/", (req, res) => {
    res.send("toys is running");
  });

  app.listen(port, () => {
    console.log(`myToys is running on port ${port}`);
  });
})();
