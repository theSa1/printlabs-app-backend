import { asyncHandler } from "../../../lib/async-handler";
import { db } from "../../../lib/db";

export const listPaidOrdersHandler = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user || user.role !== "ADMIN") {
    throw new Error("User not found");
  }

  const orders = await db.order.findMany({
    where: {
      paid: true,
      completed: false,
    },
  });

  res.send({
    error: false,
    data: {
      orders: orders.map((order) => ({
        id: order.id,
        createdAt: order.createdAt,
        cost: order.totalCost / 100,
        paid: order.paid,
        canceled: order.canceled,
        completed: order.completed,
        otp: order.otp,
        pages: order.bwPageCount + order.colorPageCount,
      })),
    },
  });
});
