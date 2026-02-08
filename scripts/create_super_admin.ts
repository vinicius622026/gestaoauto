import { createLocalUser } from "../server/auth/localAuth";
import { upsertUser } from "../server/db";

async function main() {
  const email = "viniciusisaias76@gmail.com";
  const password = "Gratida1$";
  const openId = `local:${email.toLowerCase()}`;

  console.log("[super-admin] Ensuring local user exists...");
  try {
    await createLocalUser(email, password);
    console.log("[super-admin] Local user created in local_auth table.");
  } catch (err) {
    const message = (err as Error)?.message ?? "";
    if (message.includes("already exists")) {
      console.log("[super-admin] Local user already exists, skipping creation.");
    } else {
      throw err;
    }
  }

  console.log("[super-admin] Upserting user with admin role...");
  await upsertUser({
    openId,
    email,
    name: "Super Admin",
    role: "admin",
    loginMethod: "local",
  });

  console.log("[super-admin] Done. Super admin ready with: ");
  console.log(`  email: ${email}`);
  console.log(`  password: ${password}`);
  console.log(`  openId: ${openId}`);
}

main().catch((err) => {
  console.error("[super-admin] Failed:", err);
  process.exit(1);
});
