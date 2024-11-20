import { z } from "zod";
import { db } from "../../../lib/db";
import { getDownloadUrl } from "../../../lib/s3/getUrl";
import { asyncHandler } from "../../../lib/async-handler";

const querySchema = z.object({
  otp: z.string().optional(),
  id: z.string().optional(),
});

export const adminGetOrderHandler = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user || user.role !== "ADMIN") {
    throw new Error("User not found");
  }

  const { otp, id } = querySchema.parse(req.query);

  const order = await db.order.findFirst({
    where: {
      OR: [{ id }, { otp }],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const bwFile =
    order.bwPageCount > 0
      ? await getDownloadUrl(`files/${order.id}-bw.pdf`)
      : null;
  const colorFile =
    order.colorPageCount > 0
      ? await getDownloadUrl(`files/${order.id}-color.pdf`)
      : null;

  res.send({
    error: false,
    data: {
      ...order,
      colorCost: order.colorCost / 100,
      bwCost: order.bwCost / 100,
      totalCost: order.totalCost / 100,
      bwFile,
      colorFile,
    },
  });
});
