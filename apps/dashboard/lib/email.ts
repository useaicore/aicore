import { Resend } from 'resend';
import { env } from './env';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await resend.emails.send({
    from: 'AICore <auth@yourdomain.com>', // Note: Use a verified domain in production
    to,
    subject,
    html,
  });
}
