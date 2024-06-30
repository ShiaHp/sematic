const cors = require("cors");
const express = require("express");
const app = express();
const initRoutes = require("./routes");
const bodyParser = require("body-parser");

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
initRoutes(app);

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

let port = 8080;
app.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});
