import { asyncHandler } from "../../lib/async-handler";
import { db } from "../../lib/db";

export const getProfileHandler = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new Error("User not found");
  }

  const profile = await db.user.findFirst({
    where: {
      id: user.id,
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
    data: profile,
  });
});
