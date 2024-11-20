import { z } from "zod";
import { db } from "../../lib/db";
import { sendEmail } from "../../lib/send-email";
import { asyncHandler } from "../../lib/async-handler";

const bodySchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordHandler = asyncHandler(async (req, res) => {
  const { email } = bodySchema.parse(req.body);

  const user = await db.user.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("No user found with that email");
  }

  const otp = Math.round(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      forgotPasswordOTP: otp,
    },
  });

  // Send email with reset link
  await sendEmail(
    user.email,
    "PrintLabs Password Reset",
    `Your password reset OTP is: ${otp}`
  );

  res.send({
    error: false,
    message: "Password reset email sent",
  });
});
