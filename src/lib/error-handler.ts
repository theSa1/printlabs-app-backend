import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    res.status(400).send({
      error: true,
      message: err.errors[0].message,
    });
  } else if (err instanceof Error) {
    res.status(400).send({
      error: true,
      message: err.message,
    });
  } else {
    res.status(500).send({
      error: true,
      message: "An error occurred",
    });
  }

  next();
};
