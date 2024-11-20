import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../lib/db";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../../lib/async-handler";

const bodySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(4),
  newPassword: z.string().min(1),
});

export const updatePasswordHandler = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = bodySchema.parse(req.body);

  // Check if OTP is correct
  const user = await db.user.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("No user found with that email");
  }

  if (user.forgotPasswordOTP !== otp) {
    throw new Error("Incorrect OTP");
  }

  // Update password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
      forgotPasswordOTP: null,
    },
  });

  res.send({
    error: false,
    message: "Password updated",
  });
});
