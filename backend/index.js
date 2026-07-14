const createServer = require("./src/server");
const app = createServer();
const port = process.env.port || 8000;

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
