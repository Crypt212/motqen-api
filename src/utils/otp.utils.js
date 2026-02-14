import crypto from "crypto"

export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};