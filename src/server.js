const app = require(".");
const { connectDb } = require("./config/db");
const PORT = 8080;
 
app.listen (PORT, async() => {
    await connectDb()
  console.log("App listening on port: ", PORT);
});
