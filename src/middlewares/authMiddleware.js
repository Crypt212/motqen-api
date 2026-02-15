import AppError from "../errors/AppError.js";
import { verifyAndDecodeToken } from "../utils/tokens.js";

export const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new AppError("Unauthorized", 401);
    }
    const accessToken = authHeader.split(" ")[1];
    if (!accessToken) {
        throw new AppError("Unauthorized", 401);
    }
    const decoded = verifyAndDecodeToken("access", accessToken);
    if (!decoded) {
        throw new AppError("Unauthorized" ,401 ,)
    }
    req.tokenData = decoded;
    next();
}

export const authorizeAdmin =  (req, res, next) => {
    if (req.tokenData.role !== "admin") {
        throw new AppError("Unauthorized", 401);
    }
    next()
}


