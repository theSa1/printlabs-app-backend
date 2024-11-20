import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../../lib/db";
import { JWTPayload } from "../../lib/types";
import { asyncHandler } from "../../lib/async-handler";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const loginHandler = asyncHandler(async (req, res) => {
  const { email, password } = bodySchema.parse(req.body);

  const user = await db.user.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("No user found with that email");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error("Incorrect password");
  }

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: "USER",
    } as JWTPayload,
    process.env.JWT_SECRET!
  );

  res.send({
    error: false,
    data: {
      token,
    },
  });
});
