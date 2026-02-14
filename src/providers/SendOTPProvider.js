export default async function (method, OTP, phoneNumber) {
  if (method === "SMS") {
     await sendViaSMS(`Your OTP is ${OTP}`, phoneNumber, "MOTQEN");
  } else if (method === "WhatsApp") {
    await  sendViaWhatApp(`Your OTP is ${OTP}`, phoneNumber, "MOTQEN");
  }
  
}

async function sendViaSMS(message, to, from) {
  console.log(`Sending message: ${message} to: ${to} from: ${from}`);
}

async function sendViaWhatApp(message, to, from) {
  console.log(`Sending message: ${message} to: ${to} from: ${from}`);
}
