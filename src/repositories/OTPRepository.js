import prisma from "../libs/database.js";
import { Repository } from "./Repository.js";

export default class OTPRepository extends Repository {
    async create(phoneNumber, hashedOTP, expiresAt, method) {
        const otp = await prisma.oTPs.create({
            data: {
                phoneNumber: phoneNumber,
                hashedOTP: hashedOTP,
                expiresAt: expiresAt,
                method: method,
                updatedAt: new Date(),
                createdAt: new Date(),
            },
        });
        return otp;
    };

    async findByPhoneNumber(phoneNumber, method) {
        const otp = await prisma.oTPs.findFirst({
            where: {
                phoneNumber: phoneNumber,
                method: method,
            },
            orderBy: { createdAt: "desc" },
        });
        return otp;
    };

    async deleteByPhoneNumber(phoneNumber, method) {
        await prisma.oTPs.delete({
            where: {
                phoneNumber: phoneNumber,
                method: method,
            },
        });
    };

    async updateOTP(phoneNumber, method, data) {
        return await prisma.oTPs.update({
            where: { phoneNumber: phoneNumber, method: method },
            data,
        });
    };

    async updateAttempts(phoneNumber, method) {
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
    async getAttempts(phoneNumber, method) {
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

    async getLatest(phone, method) {
        return await prisma.oTPs.findUnique({
            where: { phoneNumber: phone, method: method },
            orderBy: { createdAt: "desc" }, 
        });
    }

    async markAsUsed(phoneNumber, method) {
        return await prisma.oTPs.update({
            where: { phoneNumber, method },
            data: { isUsed: true },
        });
    }
}
