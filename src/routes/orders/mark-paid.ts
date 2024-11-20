import { z } from "zod";
import { db } from "../../lib/db";
import { asyncHandler } from "../../lib/async-handler";

const querySchema = z.object({
  id: z.string(),
});

export const markOrderPaid = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new Error("User not found");
  }

  const { id } = querySchema.parse(req.query);

  const order = await db.order.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  await db.order.update({
    where: {
      id,
    },
    data: {
      paid: true,
    },
  });

  res.send({
    error: false,
  });
});
