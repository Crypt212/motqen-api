import { Repository } from "./Repository.js";

export default class UserRepository extends Repository {
    async create({ phoneNumber, role, firstName, lastName, government, city, bio }) {
        const user = await prisma.user.create({
            data: { phoneNumber, role, firstName, lastName, government, city, bio: bio || undefined },
            });
        return user;
    };

    async update(phoneNumber, { role, firstName, lastName, government, city, bio }) {
        const user = await prisma.user.update({
            where: { phoneNumber },
            data: { role, firstName, lastName, government, city, bio: bio || undefined },
        });
        return user;
    };

    async getByPhoneNumber(phoneNumber) {
        const user = await prisma.user.findUnique({
            where: {
                phoneNumber: phoneNumber,
            },
        });
        return user;
    };
};
