import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../../../lib/db";
import { JWTPayload } from "../../../lib/types";
import { asyncHandler } from "../../../lib/async-handler";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const adminLoginHandler = asyncHandler(async (req, res) => {
  const { email, password } = bodySchema.parse(req.body);

  const admin = await db.admin.findFirst({
    where: {
      email,
    },
  });

  if (!admin) {
    throw new Error("No admin found with that email");
  }

  const passwordMatch = await bcrypt.compare(password, admin.password);

  if (!passwordMatch) {
    throw new Error("Incorrect password");
  }

  const token = jwt.sign(
    {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: "ADMIN",
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
