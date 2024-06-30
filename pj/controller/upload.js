const upload = require("../middleware/upload");
const dbConfig = require("../config/db");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("");

const MongoClient = require("mongodb").MongoClient;
const GridFSBucket = require("mongodb").GridFSBucket;
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectID;

const fileSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  status: { type: String, enum: ["public", "private"], required: true },
  type: { type: String, required: true },
  subtype: { type: String },
  length: { type: Number, required: true },
  storedUrl: { type: String, required: true },
  vector: { type: [Number], default: [] },
  // userId: { type: mongoose.Schema.Types.ObjectId, required: true }
});

const File = mongoose.model("File", fileSchema);
const url = dbConfig.url;

const baseUrl = "http://localhost:8080/files/";

const mongoClient = new MongoClient(url);

const retrieveOriginalName = (filename) => {
  const split = filename.split(".");
  split.shift();
  return split.join("-");
};

const uploadFiles = async (req, res) => {
  try {
    // await upload(req, res);
    // console.log(req.file);

    console.log("req.body", req.file);
    const content = req.file.originalName + "-" + req.body.description;

    const model = genAI.getGenerativeModel({
      model: "textembedding-gecko-multilingual@001",
    });
    const result = await model.embedContent(content);

    const newFile = {
      title: req.file.originalname,
      desc: req.body.description,
      status: "public",
      type: "image",
      length: req.file.size,
      storedUrl: "http://localhost:8080/files/" + req.file.filename,
      embedding: result.embedding.values,
    };

    try {
      await mongoClient.connect();

      const database = mongoClient.db(dbConfig.database);
      const files = database.collection("fileUpload");
      const result = await files.insertOne(newFile);
      console.log("File inserted:", result.insertedId);
    } catch (error) {
      console.error("Error inserting file:", error);
    } finally {
      await mongoClient.close();
    }

    if (req.file == undefined) {
      return res.send({
        message: "You must select a file.",
      });
    }

    return res.status(200).json({
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
    // return res.send({
    //   message: "File has been uploaded.",
    // });
  } catch (error) {
    console.log(error);

    return res.send({
      message: "Error when trying upload image: ${error}",
    });
  }
};

const getListFiles = async (req, res) => {
  try {
    await mongoClient.connect();

    const database = mongoClient.db(dbConfig.database);
    const images = database.collection(dbConfig.imgBucket + ".files");

    const cursor = images.find({});

    if ((await cursor.count()) === 0) {
      return res.status(500).send({
        message: "No files found!",
      });
    }

    let fileInfos = [];
    await cursor.forEach((doc) => {
      fileInfos.push({
        name: doc.filename,
        url: baseUrl + doc.filename,
      });
    });

    return res.status(200).send(fileInfos);
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const download = async (req, res) => {
  try {
    await mongoClient.connect();

    const database = mongoClient.db(dbConfig.database);
    const bucket = new GridFSBucket(database, {
      bucketName: dbConfig.imgBucket,
    });

    let downloadStream = bucket.openDownloadStreamByName(req.params.name);

    downloadStream.on("data", function (data) {
      return res.status(200).write(data);
    });

    downloadStream.on("error", function (err) {
      return res.status(404).send({ message: "Cannot download the Image!" });
    });

    downloadStream.on("end", () => {
      return res.end();
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

// const searchProduct = async (req, res) => {
//   const query = req.query.query;
//   try {
//     await mongoClient.connect();

//     const database = mongoClient.db(dbConfig.database);
//     const files = database.collection("filesUpload");

//     const model = genAI.getGenerativeModel({ model: "embedding-001" });
//     const result = await model.embedContent(query);

//     const queryEmbedding = result.embedding.values;

//     let closestProduct = null;
//     let closestDistance = Infinity;

//     const cursor = files.find({});
//     await cursor.forEach((doc) => {
//       const distance = cosineDistance(queryEmbedding, doc.vector);
//       if (distance < closestDistance) {
//         closestDistance = distance;
//         closestProduct = doc;
//       }
//     });

//     return res.status(200).send(closestProduct);
//   } catch (error) {
//     return res.status(500).send({
//       message: error.message,
//     });
//   }
// };

const dotProduct = (vec1, vec2) => {
  return vec1.reduce((sum, value, index) => sum + value * vec2[index], 0);
};

function removeAccents(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}
const searchProduct = async (req, res) => {
  const query = req.query.query;
  try {
    await mongoClient.connect();

    const database = mongoClient.db(dbConfig.database);
    const files = database.collection("fileUpload");

    const model = genAI.getGenerativeModel({
      model: "textembedding-gecko-multilingual@001",
    });
    const content = {
      parts: [{ text: removeAccents(query) }],
    };

    const result = await model.embedContent({
      content: content,
      taskType: "SEMANTIC_SIMILARITY",
    });

    const queryEmbedding = result.embedding.values;
    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index",
          queryVector: queryEmbedding,
          path: "embedding",
          // numCandidates: 1000,
          exact: true,
          // 'limit': 10
          limit: 5,
        },
      },
      {
        $project: {
          _id: 0,
          text: 1,
          desc: 1,
          title: 1,

          score: {
            $meta: "vectorSearchScore",
          },
        },
      },
    ];

    const closestProduct = await files.aggregate(pipeline).toArray();

    return res.status(200).send(closestProduct);
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

function cosineDistance(vec1, vec2) {
  const dotProduct = vec1.reduce(
    (sum, value, index) => sum + value * vec2[index],
    0
  );
  const magnitude1 = Math.sqrt(
    vec1.reduce((sum, value) => sum + value * value, 0)
  );
  const magnitude2 = Math.sqrt(
    vec2.reduce((sum, value) => sum + value * value, 0)
  );
  return 1 - dotProduct / (magnitude1 * magnitude2);
}

module.exports = {
  uploadFiles,
  getListFiles,
  download,
  searchProduct,
};
