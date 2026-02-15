import twilio from "twilio";
import AppError from "../errors/AppError.js";
import environment from "../configs/environment.js";

const { accountSid, authToken, virtualNumber } = environment.twilio;

export default async function (method, OTP, phoneNumber) {
  if (method === "SMS") {
    await sendViaSMS(`Your OTP is ${OTP}`, phoneNumber);
  } else if (method === "WhatsApp") {
    if (environment.nodeEnv === "development") {
      await sendViaWhatApp(`Your OTP is ${OTP}`, phoneNumber);
    } else {
      throw new AppError("this feature is not working yet", 500);
    }
  }
}

const client = twilio(accountSid, authToken);

async function sendViaSMS(message, to) {
  try {
    const messageResponse = await client.messages.create({
      body: message,
      From: virtualNumber,
      to: to,
    });

    console.log(
      `Sending message: ${messageResponse} to: ${to} from: ${virtualNumber}`,
    );
    return { success: true, messageId: messageResponse.sid };
  } catch (error) {
    console.error("❌ error in sending message ", error.message);
    throw new AppError(error.message, 500);
  }
}

async function sendViaWhatApp(message, to) {
  // for send message using whatsapp api
  console.log(`Sending message: ${message} to: ${to} from: ${virtualNumber}`);
}
