import prisma from "../libs/database.js";

const CreateUser = async (phoneNumber) => {
  const user = await prisma.user.create({
    data: {
      phoneNumber: phoneNumber,
      
    },
  });
  return user;
};

const GetUserByPhoneNumber = async (phoneNumber) => {
  const user = await prisma.user.findUnique({
    where: {
      phoneNumber: phoneNumber,
    },
  });
  return user;
};

const CreateOTP = async (phoneNumber, hashedOTP, expiresAt, method) => {
  const otp = await prisma.oTPs.create({
    data: {
      phoneNumber: phoneNumber,
      hashedOTP: hashedOTP,
      expiresAt: expiresAt,
      method: method,
      updatedAt : new Date(),
      createdAt : new Date(),
    },
  });
  return otp;
};

const GetOTPByPhoneNumber = async (phoneNumber, method) => {
  const otp = await prisma.oTPs.findFirst({
    where: {
      phoneNumber: phoneNumber,
      method: method,
    },
    orderBy: { createdAt: "desc" },
  });
  return otp;
};

const DeleteOTPByPhoneNumber = async (phoneNumber, method) => {
  await prisma.oTPs.delete({
    where: {
      phoneNumber: phoneNumber,
      method: method,
    },
  });
};

const UpdateOTPAttempts = async (phoneNumber, method) => {
  const otp = await prisma.oTPs.findUnique({
    where: {
      phoneNumber: phoneNumber,
      method: method,
    },
  });
  if (otp) {
    await prisma.oTPs.update({
      where: {
        phoneNumber: phoneNumber,
        method: method,
      },
      data: {
        attempts: {
          increment: 1,
        },
        updatedAt: new Date(),
      },
    });
  }
  return otp ? { attempts: otp.attempts + 1, updatedAt: new Date() } : null;
};
const GetOTPAttempts = async (phoneNumber, method) => {
  const otp = await prisma.oTPs.findUnique({
    where: {
      phoneNumber: phoneNumber,
      method: method,
    },
  });
  return otp
    ? { attempts: otp.attempts, lastAttemptAt: otp.lastAttemptAt }
    : null;
};

export async function getLatestOTP(phone, method) {
  return await prisma.oTPs.findUnique({
    where: { phoneNumber: phone, method: method },
  });
}

export async function markAsUsed(phone, method) {
  return await prisma.oTPs.update({
    where: { phoneNumber: phone, method: method },
    data: { isUsed: true },
  });
}

export async function createSession(userId, fingerprint, expiresAt, token) {
  const session = await prisma.session.create({
    data: {
      userId: userId,
      deviceFingerprint: fingerprint,
      expiresAt: expiresAt,
      createdAt: new Date(),
      isRevoked: false,
      token: token,
      lastUsedAt: new Date(),
    },
  });
  return session;
}

export {
  CreateUser,
  GetUserByPhoneNumber,
  CreateOTP,
  UpdateOTPAttempts,
  GetOTPByPhoneNumber,
  DeleteOTPByPhoneNumber,
  GetOTPAttempts,
};
