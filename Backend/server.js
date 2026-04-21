import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/Config/db.js";
import { PORT } from "./src/Config/env.js";

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
