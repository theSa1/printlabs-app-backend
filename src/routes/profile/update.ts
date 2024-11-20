import { z } from "zod";
import { asyncHandler } from "../../lib/async-handler";
import { db } from "../../lib/db";

const bodySchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phoneNo: z.string().min(10).max(10).optional(),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
});

export const updateProfileHandler = asyncHandler(async (req, res) => {
  const { name, email, phoneNo, dob } = bodySchema.parse(req.body);

  const user = req.user;

  if (!user) {
    throw new Error("User not found");
  }

  const updatedUser = await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      name: name || undefined,
      email: email || undefined,
      phoneNo: phoneNo || undefined,
      dob: dob || undefined,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      gender: true,
      phoneNo: true,
      dob: true,
    },
  });

  res.send({
    error: false,
    data: updatedUser,
  });
});
