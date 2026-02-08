import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertVehicle,
  profiles,
  tenants,
  users,
  vehicles,
} from "../drizzle/schema";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Defina DATABASE_URL antes de rodar o seed");
  }

  const isLocal = /(^|@)(localhost|127\.0\.0\.1)(:|$)/.test(url);
  const sql = isLocal ? postgres(url) : postgres(url, { ssl: "require" });
  const db = drizzle(sql);

  const seedOpenId = process.env.SEED_OPEN_ID || "seed-admin";

  // Usuário admin base
  const [user] = await db
    .insert(users)
    .values({
      openId: seedOpenId,
      name: "Seed Admin",
      email: "seed.admin@example.com",
      loginMethod: "seed",
      role: "admin",
      lastSignedIn: new Date(),
    })
    .onConflictDoUpdate({
      target: users.openId,
      set: {
        name: "Seed Admin",
        email: "seed.admin@example.com",
        loginMethod: "seed",
        role: "admin",
        lastSignedIn: new Date(),
        updatedAt: new Date(),
      },
    })
    .returning();

  // Loja/tenant
  const [tenant] = await db
    .insert(tenants)
    .values({
      subdomain: "demo-store",
      name: "Loja Demo",
      description: "Loja de teste para validar fluxo",
      email: "contato@demo-store.com",
      phone: "11999990000",
      city: "Sao Paulo",
      state: "SP",
      website: "https://demo-store.example.com",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: tenants.subdomain,
      set: {
        name: "Loja Demo",
        description: "Loja de teste para validar fluxo",
        email: "contato@demo-store.com",
        phone: "11999990000",
        city: "Sao Paulo",
        state: "SP",
        website: "https://demo-store.example.com",
        updatedAt: new Date(),
        isActive: true,
      },
    })
    .returning();

  // Perfil do usuário na loja
  await db
    .delete(profiles)
    .where(and(eq(profiles.userId, user.id), eq(profiles.tenantId, tenant.id)));

  await db.insert(profiles).values({
    userId: user.id,
    tenantId: tenant.id,
    role: "owner",
    isActive: true,
  });

  // Limpa veículos anteriores do tenant para evitar duplicar
  await db.delete(vehicles).where(eq(vehicles.tenantId, tenant.id));

  const vehicleSeeds: InsertVehicle[] = [
    {
      tenantId: tenant.id,
      make: "Toyota",
      model: "Corolla",
      year: 2022,
      color: "Prata",
      mileage: 25000,
      price: "95000.00",
      description: "Sedan confiavel, revisado, unico dono.",
      fuelType: "Flex",
      transmission: "Automatic",
      bodyType: "Sedan",
      imageUrl: "https://placehold.co/800x600?text=Corolla",
      additionalImages: JSON.stringify([
        "https://placehold.co/800x600?text=Corolla+1",
        "https://placehold.co/800x600?text=Corolla+2",
      ]),
      isAvailable: true,
      isFeatured: true,
    },
    {
      tenantId: tenant.id,
      make: "Honda",
      model: "Civic",
      year: 2021,
      color: "Cinza",
      mileage: 30000,
      price: "105000.00",
      description: "Civic completo com teto, revisoes em dia.",
      fuelType: "Flex",
      transmission: "Automatic",
      bodyType: "Sedan",
      imageUrl: "https://placehold.co/800x600?text=Civic",
      additionalImages: JSON.stringify([
        "https://placehold.co/800x600?text=Civic+1",
        "https://placehold.co/800x600?text=Civic+2",
      ]),
      isAvailable: true,
      isFeatured: false,
    },
    {
      tenantId: tenant.id,
      make: "Jeep",
      model: "Compass",
      year: 2023,
      color: "Preto",
      mileage: 15000,
      price: "189000.00",
      description: "SUV com pacote Safety, baixo km.",
      fuelType: "Diesel",
      transmission: "Automatic",
      bodyType: "SUV",
      imageUrl: "https://placehold.co/800x600?text=Compass",
      additionalImages: JSON.stringify([
        "https://placehold.co/800x600?text=Compass+1",
        "https://placehold.co/800x600?text=Compass+2",
      ]),
      isAvailable: true,
      isFeatured: false,
    },
  ];

  await db.insert(vehicles).values(vehicleSeeds);

  await sql.end({ timeout: 5 });

  console.log("Seed criado:");
  console.log({ user, tenant, vehicles: vehicleSeeds.length });
}

main().catch((err) => {
  console.error("Erro ao rodar seed:", err);
  process.exit(1);
});
