import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { startMonthlyPaymentJob } from "./jobs/monthlyPaymentJob.js";


dotenv.config();

const PORT = process.env.PORT || 5001;

async function startServer() {
  await connectDB();

  startMonthlyPaymentJob();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();