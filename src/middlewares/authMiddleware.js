import AppError from "../errors/AppError.js";
import { asyncAuthenticatedHandler } from "../types/asyncHandler.js";
import { verifyAndDecodeToken } from "../utils/tokens.js";


export const authenticate = asyncAuthenticatedHandler(async (req, _, next) => {

  const authHeader = req.headers.authorization;
  if (!authHeader) throw new AppError("Unauthorized", 401);

  const accessToken = authHeader.split(" ")[1];
  if (!accessToken) throw new AppError("Unauthorized", 401);

  const decoded = verifyAndDecodeToken(accessToken, "access");
  if (!decoded) throw new AppError("Unauthorized", 401,);

  /** @type {import("../types/express.js").AuthenticatedRequest} */
  req.user = {
      id: decoded.userId,
      role: decoded.role,
    };

  next();
});

export const authorizeAdmin = asyncAuthenticatedHandler( async (req, _, next) => {
  if (req.user.role !== "ADMIN") throw new AppError("Unauthorized", 401);
  next();
});
