import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../../lib/db";
import { JWTPayload } from "../../lib/types";
import { asyncHandler } from "../../lib/async-handler";

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
});

export const signUpHandler = asyncHandler(async (req, res) => {
  const { name, email, password } = bodySchema.parse(req.body);

  const user = await db.user.findFirst({
    where: {
      email,
    },
  });

  if (user) {
    throw new Error("User with that email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const token = jwt.sign(
    {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
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
