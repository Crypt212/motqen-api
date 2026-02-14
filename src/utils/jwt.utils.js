import jwt from "jsonwebtoken";
import environment from "../config/environment.js";

const {
  accessToken: { secret: accessSecret, expiresIn: accessDuration },
  refreshToken: { secret, expiresIn },
} = environment.jwt;


export const generateAccessToken = (payload) => {
  payload.type = "access";
  return jwt.sign(payload, accessSecret, {
    expiresIn: accessDuration,
  });
};
export const generateRefreshToken = (payload, expiredAt) => {
  payload.type = "refresh";
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn,
  });
};
