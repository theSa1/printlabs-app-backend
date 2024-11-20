import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../lib/db";
import { asyncHandler } from "../../lib/async-handler";

const querySchema = z.object({
  id: z.string(),
});

export const getOrderHandler = asyncHandler(async (req, res) => {
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

  res.send({
    error: false,
    data: {
      ...order,
      colorCost: order.colorCost / 100,
      bwCost: order.bwCost / 100,
      totalCost: order.totalCost / 100,
    },
  });
});
