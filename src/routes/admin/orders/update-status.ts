import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../../lib/db";
import { asyncHandler } from "../../../lib/async-handler";

const bodySchema = z.object({
  id: z.string(),
  status: z.enum(["COMPLETED", "CANCELLED"]),
});

export const updateOrderStatusHandler = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user || user.role !== "ADMIN") {
    throw new Error("User not found");
  }

  const { id, status } = bodySchema.parse(req.body);

  const order = await db.order.update({
    where: {
      id,
    },
    data:
      status === "COMPLETED"
        ? { completed: true, canceled: false }
        : { canceled: true, completed: false },
  });

  res.send({
    error: false,
    data: order,
  });
});
