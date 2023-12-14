const nodemailer = require('nodemailer');
const { getMaxListeners } = require('./models/messages');

const sendRoleUpdateNotification = async (email, Requestid) => {
  try {
    if (!email || !email.trim()) {
      throw new Error('Invalid or empty email address');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'mtanveerulhassan2@gmail.com',
        pass: 'vpig twyc crxn ltsz',
      },
      debug: true,
    });

    const info = await transporter.sendMail({
      from: '"TICER" <nomigill573@gmail.com>',
      to: `${email}, ${"masifmirza927@gmail.com"}`,
      subject: `Complain Request Submitted ${Requestid}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">

          <img src="https://www.ticer.pk/wp-content/uploads/2023/06/200W-TICER-Logo-PNG.png.webp"/>
          <h2 style="color: green;">Your complain has been successfully registered </h2>
          <h2>
           Request ID: ${Requestid}</h2>
           <a style=""text-docoration:none; href="www.ticer.com.pk">
Track Your Application</a>
        </div>
      `,
    });

    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = {
  sendRoleUpdateNotification,
};
