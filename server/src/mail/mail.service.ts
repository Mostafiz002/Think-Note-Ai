import { Injectable, Logger } from '@nestjs/common';
import SibApiV3Sdk from 'sib-api-v3-sdk';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly client;

  constructor() {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;

    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    this.client = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async sendOtpEmail(args: { to: string; otp: string }) {
    try {
      await this.client.sendTransacEmail({
        sender: {
          email: process.env.EMAIL_FROM,
          name: 'Think Note AI',
        },
        to: [{ email: args.to }],
        subject: `Your Access Key: ${args.otp}`,
        htmlContent: this.buildHtml(args.otp),
      });

      this.logger.log(`OTP email sent to ${args.to}`);
    } catch (error) {
      this.logger.error('Failed to send OTP email', error);
      throw error;
    }
  }

  private buildHtml(otp: string) {
    return `
        <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=JetBrains+Mono&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Inter', sans-serif; color: #1e293b;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1);">
                
                <tr>
                  <td style="padding: 40px 40px 20px 40px; background: linear-gradient(to bottom, #f8fafc, #ffffff);">
                    <div style="font-size: 22px; font-weight: 700; letter-spacing: -0.5px; color: #1e3a8a;">
                      THINK<span style="color: #3b82f6;">NOTE</span>.AI
                    </div>
                    <div style="font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 2px;">
                      Intelligence Sync
                    </div>
                  </td>
                </tr>
  
                <tr>
                  <td style="padding: 20px 40px 40px 40px;">
                    <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 30px;">
                      Your AI workspace is ready. Use the secure access key below to verify your session.
                    </p>
                    
                    <div style="background: #1e3a8a; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 30px; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);">
                      <div style="font-family: 'JetBrains Mono', monospace; font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #ffffff; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        ${otp}
                      </div>
                    </div>
  
                    <p style="font-size: 13px; text-align: center; color: #94a3b8;">
                      Key valid for <span style="color: #1e3a8a; font-weight: 600;">10 minutes</span>. 
                      If you didn't request this, no action is needed.
                    </p>
                  </td>
                </tr>
  
                <tr>
                  <td style="padding: 20px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center;">
                    <div style="font-size: 10px; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">
                      PROTOCOL: SECURE_AUTH // NODE_ID: TN-026
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}

// import { Injectable, Logger } from '@nestjs/common';
// import { Resend } from 'resend';

// @Injectable()
// export class MailService {
//   private readonly logger = new Logger(MailService.name);

//   private readonly resend = new Resend(process.env.RESEND_API_KEY);

//   async sendOtpEmail(args: { to: string; otp: string }) {
//     const from = process.env.EMAIL_FROM || 'ThinkNote <onboarding@resend.dev>';

//     try {
//       await this.resend.emails.send({
//         from,
//         to: args.to,
//         subject: `Your Access Key: ${args.otp}`,
//         html: this.buildHtml(args.otp),
//       });

//       this.logger.log(`OTP email sent to ${args.to}`);
//     } catch (error) {
//       this.logger.error('Failed to send OTP email', error);
//       throw error;
//     }
//   }

//   private buildHtml(otp: string) {
//     return `
//       <!DOCTYPE html>
//       <html>
//       <body style="margin:0;padding:0;background:#f0f4f8;font-family:Inter,sans-serif;">
//         <div style="max-width:500px;margin:40px auto;background:#fff;border-radius:20px;padding:40px;text-align:center;">

//           <h2 style="color:#1e3a8a;">THINK<span style="color:#3b82f6;">NOTE</span>.AI</h2>

//           <p style="color:#475569;">Your secure access key:</p>

//           <div style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);
//                       padding:25px;border-radius:12px;margin:20px 0;">
//             <span style="font-size:36px;letter-spacing:10px;color:#fff;font-family:monospace;">
//               ${otp}
//             </span>
//           </div>

//           <p style="font-size:12px;color:#94a3b8;">
//             Valid for 10 minutes. If you didn't request this, ignore it.
//           </p>

//         </div>
//       </body>
//       </html>
//     `;
//   }
// }

// import { Injectable, Logger } from '@nestjs/common';
// import nodemailer from 'nodemailer';

// @Injectable()
// export class MailService {
//   private readonly logger = new Logger(MailService.name);

//   private readonly transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: Number(process.env.EMAIL_PORT ?? 587),
//     secure: false,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   async sendOtpEmail(args: { to: string; otp: string }) {
//     const from = process.env.EMAIL_FROM ?? process.env.EMAIL_USER;
//     if (!from) {
//       this.logger.warn('EMAIL_FROM/EMAIL_USER not set; skipping mail send');
//       return;
//     }

//     const htmlContent = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <style>
//           @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=JetBrains+Mono&display=swap');
//         </style>
//       </head>
//       <body style="margin: 0; padding: 0; background-color: #f0f4f8; font-family: 'Inter', sans-serif; color: #1e293b;">
//         <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8; padding: 40px 20px;">
//           <tr>
//             <td align="center">
//               <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1);">

//                 <tr>
//                   <td style="padding: 40px 40px 20px 40px; background: linear-gradient(to bottom, #f8fafc, #ffffff);">
//                     <div style="font-size: 22px; font-weight: 700; letter-spacing: -0.5px; color: #1e3a8a;">
//                       THINK<span style="color: #3b82f6;">NOTE</span>.AI
//                     </div>
//                     <div style="font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 2px;">
//                       Intelligence Sync
//                     </div>
//                   </td>
//                 </tr>

//                 <tr>
//                   <td style="padding: 20px 40px 40px 40px;">
//                     <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 30px;">
//                       Your AI workspace is ready. Use the secure access key below to verify your session.
//                     </p>

//                     <div style="background: #1e3a8a; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 30px; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.2);">
//                       <div style="font-family: 'JetBrains Mono', monospace; font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #ffffff; text-shadow: 0 2px 10px rgba(0,0,0,0.1);">
//                         ${args.otp}
//                       </div>
//                     </div>

//                     <p style="font-size: 13px; text-align: center; color: #94a3b8;">
//                       Key valid for <span style="color: #1e3a8a; font-weight: 600;">10 minutes</span>.
//                       If you didn't request this, no action is needed.
//                     </p>
//                   </td>
//                 </tr>

//                 <tr>
//                   <td style="padding: 20px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center;">
//                     <div style="font-size: 10px; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">
//                       PROTOCOL: SECURE_AUTH // NODE_ID: TN-026
//                     </div>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>
//         </table>
//       </body>
//       </html>
//     `;

//     await this.transporter.sendMail({
//       from,
//       to: args.to,
//       subject: `Your Access Key: ${args.otp}`,
//       text: `Verification code: ${args.otp}`,
//       html: htmlContent,
//     });
//   }
// }
