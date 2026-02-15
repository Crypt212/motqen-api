    import jwt from "jsonwebtoken";
import environment from "../configs/environment.js";
import AppError from "../errors/AppError.js";

export const generateToken = (type, payload) => {
    const tokenType = type ;
    const tokenConfig = environment.jwt[tokenType];
    if (!tokenConfig)
        throw new AppError("invalid token type", 500);

    return jwt.sign(payload, tokenConfig.secret, {
        expiresIn: tokenConfig.expiresIn,
    });
}

export const verifyAndDecodeToken = (type, token) => {
    const tokenType = type ;
    const tokenConfig = environment.jwt[tokenType];
    if (!tokenConfig)
        throw new AppError("invalid token type", 500);

    const decoded = jwt.verify(token, tokenConfig.secret);

    return decoded;
}
