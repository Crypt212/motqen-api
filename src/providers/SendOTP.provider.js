export default async function (method, OTP, phoneNumber) {
  console.log("djvbsdj",method)
  if (method === "SMS") {
     await sendViaSMS(`Your OTP is ${OTP}`, phoneNumber, "MOTQEN");
  } else if (method === "WhatsApp") {
    await  sendViaWhatApp(`Your OTP is ${OTP}`, phoneNumber, "MOTQEN");
  }
  
}

async function sendViaSMS(message, to, from) {
  // send message using sms api
  console.log(`Sending message: ${message} to: ${to} from: ${from}`);
}

async function sendViaWhatApp(message, to, from) {
  // for send message using whatsapp api
  console.log(`Sending message: ${message} to: ${to} from: ${from}`);
}
