import { authRouter } from "../server/trpc/auth";

async function run() {
  try {
    const timestamp = Date.now();
    const email = `e2e+${timestamp}@example.com`;
    const password = "Senha123!";

    console.log("Signing up:", email);
    const su = await authRouter.signUp({ email, password, name: "E2E Tester" });
    console.log("signUp result:", su);

    console.log("Signing in:", email);
    const si = await authRouter.signIn({ email, password });
    console.log("signIn result:", si);

    console.log("getSession:");
    const sess = await authRouter.getSession({ token: si.token });
    console.log("session payload:", sess);

    console.log("getCurrentUser:");
    const user = await authRouter.getCurrentUser({ token: si.token });
    console.log("current user:", user);

    console.log("E2E auth test completed successfully");
    process.exit(0);
  } catch (err) {
    console.error("E2E auth test failed:", err);
    process.exit(2);
  }
}

run();
