const { TaskType } = require("@google/generative-ai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { QdrantClient } = require("@qdrant/js-client-rest");
const movies = require("./data.json");
const fs = require("fs");
const client = new QdrantClient({ url: "http://127.0.0.1:6333" });
const genAI = new GoogleGenerativeAI("AIzaSyCXJG8qgRw7HhQKQJPaD0aUuc5OADj1Yv0");
// const generateEmbeddings = async () => {
//   try {
//     const start = performance.now() / 1000;
//     const textsToEmbed = movies.map(
//       (movie) =>
//         `Title:${movie.name}\n\nyear: ${
//           movie.year
//         }\n\nactors: ${movie.actors.join(", ")}\n\nstoryline: ${
//           movie.storyline
//         }\n\n`
//     );

//     const model = genAI.getGenerativeModel(
//       { model: "embedding-001" },
//       {
//         taskType: TaskType.RETRIEVAL_DOCUMENT,
//         title: "Document title",
//       }
//     );

//     const points = await Promise.all(
//       textsToEmbed.map(async (text, index) => {
//         const res = await model.embedContent(text);
//         return {
//           id: movies[index].id,
//           vector: res.embedding.values,
//           payload: { ...movies[index] },
//         };
//       })
//     );

//     try {
//       await client.upsert("movies5", {
//         points,
//       });
//       console.log(`Documents uploaded successfully to collection `);
//     } catch (error) {
//       console.error(`Error uploading documents to collection :`, error);
//     }
//     const end = performance.now() / 1000;

//     console.log(`Took ${(end - start).toFixed(2)}s`);
//   } catch (e) {
//     console.error(e);
//   }
// };

// generateEmbeddings();
//
// const createCollection = async () => {
//   await client.createCollection("movies5", {
//     vectors: {
//       size: 768,
//       distance: "Cosine",
//     },
//   });
// };

// createCollection();

const searchQueryQdrant = async () => {
  const query = "human run very quickly";
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await model.embedContent(query);
  const queryEmbedding = result.embedding.values;
  fs.writeFileSync(
    "queryEmbedding.json",
    JSON.stringify(queryEmbedding, null, 2)
  );
  const searchResult = await client.search("movies5", {
    params: {
      hnsw_ef: 128,
      exact: false,
    },
    vector: queryEmbedding,
    limit: 3,
  });

  console.log(searchResult);
};

searchQueryQdrant();
