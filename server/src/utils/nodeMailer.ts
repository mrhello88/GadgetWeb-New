import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

export const sendEmail = async (toEmail: string, token: string): Promise<void> => {
  const transporter: Transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'false', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER as string,
      pass: process.env.SMTP_PASS as string,
    },
  });

  const mailOptions: SendMailOptions = {
    from: process.env.SMTP_USER,
    to: toEmail,
    subject: 'Verify Email to Register',
    text: 'Please verify your email address to complete your registration.',
    html: `
      <body className="bg-gray-100 font-sans">
        <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-2xl shadow-lg text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Verify Your Email</h1>
          <p className="text-gray-600 text-base mb-6">
            Please verify your email address to complete your registration.
          </p>
          <a href="http://localhost:5173/verify/${token}" 
             className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition">
            Verify Email
          </a>
        </div>
      </body>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
