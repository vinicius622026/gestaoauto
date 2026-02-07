export async function sendEmail(to: string, subject: string, body: string) {
  // Minimal mailer: log the message. Integrate real provider (SMTP/API) via env vars later.
  console.info("[mailer] sendEmail to=", to);
  console.info("[mailer] subject=", subject);
  console.info("[mailer] body=", body);
  return true;
}
