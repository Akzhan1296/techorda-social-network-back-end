import nodemailer from "nodemailer";

export const emailAdapter = {
  async sendEmail(email: string, subject: string, message: string) {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "backlesson05@gmail.com",
        //pass: '!qwertyASDF123',
        pass: "ipbpbhdmaxvbdvkh",
      },
    });

    const info = await transport.sendMail({
      from: '"Akzhan" <backlesson05@gmail.com>', // sender address
      to: email,
      subject: subject,
      html: message,
    });

    return info;
  },
};
