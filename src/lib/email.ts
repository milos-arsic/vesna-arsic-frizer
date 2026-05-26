import { Resend } from "resend";
import { formatSlotDateTime } from "./slots";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const fromEmail = process.env.EMAIL_FROM ?? "Termini <onboarding@resend.dev>";
const shopName = process.env.SHOP_NAME ?? "Весна Аршић – Фризер";
const shopPhone = process.env.SHOP_PHONE ?? "";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping:", subject, "→", to);
    return;
  }

  await resend.emails.send({
    from: fromEmail,
    to,
    subject,
    html,
  });
}

function baseTemplate(content: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #92400e; margin-bottom: 8px;">${shopName}</h2>
      ${content}
      <p style="margin-top: 24px; font-size: 13px; color: #666;">
        Ово је аутоматска порука из система за заказивање термина.
      </p>
    </div>
  `;
}

export async function sendNewRequestToAdmin(params: {
  adminEmail: string;
  customerName: string;
  customerPhone: string;
  slotStart: Date;
  customerNote?: string | null;
  previousSlotStart?: Date | null;
}) {
  const slotLabel = formatSlotDateTime(params.slotStart);
  const note = params.customerNote
    ? `<p><strong>Напомена клијента:</strong> ${params.customerNote}</p>`
    : "";
  const rescheduleNote = params.previousSlotStart
    ? `<p><strong>Захтев за промену термина:</strong> ${formatSlotDateTime(params.previousSlotStart)} → ${slotLabel}</p>`
    : "";

  await sendEmail({
    to: params.adminEmail,
    subject: params.previousSlotStart
      ? `Захтев за промену термина – ${slotLabel}`
      : `Нови захтев за термин – ${slotLabel}`,
    html: baseTemplate(`
      <p>${params.previousSlotStart ? "Стигао је захтев за промену термина." : "Стигао је нови захтев за термин."}</p>
      <ul>
        <li><strong>Термин:</strong> ${slotLabel}</li>
        <li><strong>Клијент:</strong> ${params.customerName}</li>
        <li><strong>Телефон:</strong> ${params.customerPhone}</li>
      </ul>
      ${rescheduleNote}
      ${note}
      <p>Пријавите се у апликацију да одобрите или одбијете захтев.</p>
    `),
  });
}

export async function sendRequestApprovedToCustomer(params: {
  customerEmail: string;
  customerName: string;
  slotStart: Date;
}) {
  const slotLabel = formatSlotDateTime(params.slotStart);
  const cancelNote = shopPhone
    ? `<p>За отказивање термина молимо вас да нас позовете на број <strong>${shopPhone}</strong>.</p>`
    : "";

  await sendEmail({
    to: params.customerEmail,
    subject: `Термин одобрен – ${slotLabel}`,
    html: baseTemplate(`
      <p>Поштовани ${params.customerName},</p>
      <p>Ваш термин је <strong>одобрен</strong>:</p>
      <p style="font-size: 18px;"><strong>${slotLabel}</strong></p>
      ${cancelNote}
      <p>Видимо се!</p>
    `),
  });
}

export async function sendRequestRejectedToCustomer(params: {
  customerEmail: string;
  customerName: string;
  slotStart: Date;
  adminMessage: string;
}) {
  const slotLabel = formatSlotDateTime(params.slotStart);

  await sendEmail({
    to: params.customerEmail,
    subject: `Термин одбијен – ${slotLabel}`,
    html: baseTemplate(`
      <p>Поштовани ${params.customerName},</p>
      <p>Нажалост, ваш захтев за термин <strong>${slotLabel}</strong> је одбијен.</p>
      <p><strong>Разлог:</strong> ${params.adminMessage}</p>
      <p>Можете изабрати други слободан термин у апликацији.</p>
    `),
  });
}

export async function sendCancellationToCustomer(params: {
  customerEmail: string;
  customerName: string;
  slotStart: Date;
}) {
  const slotLabel = formatSlotDateTime(params.slotStart);

  await sendEmail({
    to: params.customerEmail,
    subject: `Термин отказан – ${slotLabel}`,
    html: baseTemplate(`
      <p>Поштовани ${params.customerName},</p>
      <p>Ваш термин <strong>${slotLabel}</strong> је отказан.</p>
      <p>Можете заказати нови термин у апликацији.</p>
    `),
  });
}

export async function sendManualBookingConfirmation(params: {
  customerEmail?: string | null;
  customerName: string;
  slotStart: Date;
}) {
  if (!params.customerEmail) return;

  const slotLabel = formatSlotDateTime(params.slotStart);
  const cancelNote = shopPhone
    ? `<p>За отказивање термина молимо вас да нас позовете на број <strong>${shopPhone}</strong>.</p>`
    : "";

  await sendEmail({
    to: params.customerEmail,
    subject: `Потврда термина – ${slotLabel}`,
    html: baseTemplate(`
      <p>Поштовани ${params.customerName},</p>
      <p>Ваш термин је заказан:</p>
      <p style="font-size: 18px;"><strong>${slotLabel}</strong></p>
      ${cancelNote}
      <p>Видимо се!</p>
    `),
  });
}
