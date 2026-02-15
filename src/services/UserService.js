import UserRepository from "../repositories/UserRepository.js";
import Service from "./Service.js";

const userRepository = new UserRepository();

export default class UserService extends Service {
    async getUser(phoneNumber) {
        const existingUser = await userRepository.getByPhoneNumber(phoneNumber);
        if (existingUser) return existingUser;
        else return null;
    };

    async createUser({ phoneNumber, role, firstName, lastName, government, city, bio }) {
        const existingUser = await userRepository.getByPhoneNumber(phoneNumber);

        return await userRepository.create({ phoneNumber, role, firstName, lastName, government, city, bio });
    };

    async updateBasicInfo(phoneNumber, { role, firstName, lastName, government, city, bio }) {
        userRepository.update(phoneNumber, { role, firstName, lastName, government, city, bio });
    }

    async updateWorkerInfo(phoneNumber, { role, firstName, lastName, government, city, bio }) {
        userRepository.update(phoneNumber, { role, firstName, lastName, government, city, bio });
    }
}
