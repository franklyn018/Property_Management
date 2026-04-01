import cron from "node-cron";
import Property from "../models/propertyModel.js";
import Payment from "../models/paymentModel.js";

function getDueDateForProperty(rentDueDay) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const safeDueDay = Math.min(rentDueDay, lastDayOfMonth);

  return new Date(year, month, safeDueDay);
}

export function startMonthlyPaymentJob() {
  cron.schedule("0 0 1 * *", async () => { // REAL LINE
  //cron.schedule("* * * * *", async () => { // TESTING
    try {
      console.log("Running monthly payment job...");

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      console.log(`Creating payments for ${currentMonth}/${currentYear}...`);

      const properties = await Property.find();

      if (!properties.length) {
        console.log("No properties found.");
        return;
      }

      const createdPayments = [];

      for (const property of properties) {
        const dueDate = getDueDateForProperty(property.rent_due_day);

        const payment = await Payment.create({
          property_id: property._id,
          submitted_by_user_id: null,
          amount: property.rent_amount,
          due_date: dueDate,
          paid_date: null,
          status: "unpaid",
        });

        createdPayments.push(payment);

        console.log(
          `Created payment for ${property.property_name} | Amount: $${property.rent_amount} | Due: ${dueDate.toLocaleDateString()}`
        );
      }

      console.log(`Finished creating ${createdPayments.length} payment(s).`);
    } catch (error) {
      console.error("Monthly payment job error:", error);
    }
  });

  console.log("Monthly payment job scheduled.");
}