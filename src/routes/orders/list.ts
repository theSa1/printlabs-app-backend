import { db } from "../../lib/db";
import { asyncHandler } from "../../lib/async-handler";

export const listOrderHandler = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new Error("User not found");
  }

  const orders = await db.order.findMany({
    where: {
      userId: user.id,
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
      })),
    },
  });
});
