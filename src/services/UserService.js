import { CreateUser, GetUserByPhoneNumber } from "../repositories/AuthRepo.js";

const GetOrCreateUserService = async (phoneNumber) => {
  const existingUser = await GetUserByPhoneNumber(phoneNumber);
  if (!existingUser) {
    return await CreateUser(phoneNumber);
  }

  return existingUser;
};

export { GetOrCreateUserService };
