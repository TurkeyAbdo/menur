import { Resend } from "resend";

const FROM_EMAIL = "Menur <onboarding@resend.dev>";

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    const { error } = await getResendClient().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[EMAIL] Failed to send:", error);
      return false;
    }

    console.log(`[EMAIL] Sent to ${to}: ${subject}`);
    return true;
  } catch (err) {
    console.error("[EMAIL] Error:", err);
    return false;
  }
}

export async function sendWelcomeEmail(name: string, email: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Welcome to Menur! مرحباً بك في منيور",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: ltr;">
        <div style="background: #4f46e5; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Menur</h1>
          <p style="color: #c7d2fe; margin: 4px 0 0; font-size: 14px;">Digital Menu Platform</p>
        </div>
        <div style="padding: 32px 24px; background: #ffffff;">
          <h2 style="color: #111827; margin: 0 0 8px;">Welcome, ${name}!</h2>
          <p style="color: #6b7280; line-height: 1.6;">Your account is ready. Here's how to get started:</p>
          <ol style="color: #374151; line-height: 2; padding-left: 20px;">
            <li>Create your first menu</li>
            <li>Add your menu items with photos and descriptions</li>
            <li>Generate a QR code for your tables</li>
            <li>Share your digital menu with customers</li>
          </ol>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.NEXTAUTH_URL || ""}/dashboard"
               style="display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="padding: 16px 24px; background: #f9fafb; text-align: center; color: #9ca3af; font-size: 12px; border-radius: 0 0 12px 12px;">
          Menur - Digital Menu Platform
        </div>
      </div>
    `,
  });
}

export async function sendSubscriptionExpiringEmail(
  name: string,
  email: string,
  tier: string,
  daysLeft: number
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Your Menur ${tier} plan expires in ${daysLeft} days`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #4f46e5; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">Menur</h1>
        </div>
        <div style="padding: 32px 24px; background: #ffffff;">
          <h2 style="color: #111827; margin: 0 0 8px;">Hi ${name},</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Your <strong>${tier}</strong> plan will expire in <strong>${daysLeft} day${daysLeft > 1 ? "s" : ""}</strong>.
            Renew now to keep your menus, QR codes, and analytics running.
          </p>
          <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
            <p style="color: #92400e; margin: 0; font-weight: 600;">
              After expiry, your account will be downgraded to the Free plan.
            </p>
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.NEXTAUTH_URL || ""}/dashboard/billing"
               style="display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Renew Subscription
            </a>
          </div>
        </div>
        <div style="padding: 16px 24px; background: #f9fafb; text-align: center; color: #9ca3af; font-size: 12px; border-radius: 0 0 12px 12px;">
          Menur - Digital Menu Platform
        </div>
      </div>
    `,
  });
}

export async function sendSubscriptionExpiredEmail(
  name: string,
  email: string,
  tier: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Your Menur subscription has expired",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #4f46e5; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">Menur</h1>
        </div>
        <div style="padding: 32px 24px; background: #ffffff;">
          <h2 style="color: #111827; margin: 0 0 8px;">Hi ${name},</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Your <strong>${tier}</strong> plan has expired. Your account has been downgraded to the Free plan.
          </p>
          <p style="color: #6b7280; line-height: 1.6;">
            You can still access your account, but some features are now limited. Upgrade anytime to restore full access.
          </p>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.NEXTAUTH_URL || ""}/dashboard/billing"
               style="display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Resubscribe Now
            </a>
          </div>
        </div>
        <div style="padding: 16px 24px; background: #f9fafb; text-align: center; color: #9ca3af; font-size: 12px; border-radius: 0 0 12px 12px;">
          Menur - Digital Menu Platform
        </div>
      </div>
    `,
  });
}

export async function sendWeeklyReport(
  email: string,
  stats: {
    totalScans: number;
    topMenu: string;
    newFeedback: number;
  }
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Your Weekly Menur Report",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #4f46e5; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">Weekly Report</h1>
        </div>
        <div style="padding: 32px 24px; background: #ffffff;">
          <p style="color: #6b7280;">Here's your weekly summary:</p>
          <div style="display: flex; gap: 12px; margin: 20px 0;">
            <div style="flex: 1; background: #eef2ff; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 32px; font-weight: 700; color: #4f46e5;">${stats.totalScans}</div>
              <div style="color: #6b7280; font-size: 13px; margin-top: 4px;">Total Scans</div>
            </div>
            <div style="flex: 1; background: #f0fdf4; border-radius: 12px; padding: 20px; text-align: center;">
              <div style="font-size: 32px; font-weight: 700; color: #16a34a;">${stats.newFeedback}</div>
              <div style="color: #6b7280; font-size: 13px; margin-top: 4px;">New Reviews</div>
            </div>
          </div>
          ${stats.topMenu ? `<p style="color: #374151;">Top performing menu: <strong>${stats.topMenu}</strong></p>` : ""}
          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.NEXTAUTH_URL || ""}/dashboard/analytics"
               style="display: inline-block; background: #4f46e5; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              View Full Analytics
            </a>
          </div>
        </div>
        <div style="padding: 16px 24px; background: #f9fafb; text-align: center; color: #9ca3af; font-size: 12px; border-radius: 0 0 12px 12px;">
          Menur - Digital Menu Platform
        </div>
      </div>
    `,
  });
}
