import { verifyAndDecodeToken } from "../utils/tokens";

export const authenticate = async (req, res, next) => {
    const { Authorization: accessToken } = req.headers;
    if (!accessToken) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const decoded = verifyAndDecodeToken("access", accessToken);
    if (!decoded) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    req.tokenData = decoded;
    next();
}

export const authorizeAdmin = async (req, res, next) => {
    if (!req.accessToken.role != "admin") {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
}
