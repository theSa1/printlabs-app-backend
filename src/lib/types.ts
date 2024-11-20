export type JWTPayload = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
