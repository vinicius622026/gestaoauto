import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL não está definida');
  process.exit(1);
}

console.log('Conectando ao banco de dados...');

const sql = postgres(connectionString, {
  connect_timeout: 30,
  idle_timeout: 10,
  max_lifetime: 60 * 30,
});

async function setupDatabase() {
  try {
    console.log('Criando enums...');
    
    // Create enums
    await sql`CREATE TYPE role_enum AS ENUM ('user', 'admin')`;
    await sql`CREATE TYPE tenant_status AS ENUM ('active', 'inactive')`;
    await sql`CREATE TYPE profile_role AS ENUM ('admin', 'user')`;
    await sql`CREATE TYPE fuel_type AS ENUM ('gasoline', 'diesel', 'electric', 'hybrid')`;
    await sql`CREATE TYPE transmission_type AS ENUM ('manual', 'automatic')`;
    await sql`CREATE TYPE vehicle_status AS ENUM ('available', 'sold', 'maintenance')`;

    console.log('Criando tabelas...');

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        "openId" VARCHAR(64) NOT NULL UNIQUE,
        name TEXT,
        email VARCHAR(320),
        "loginMethod" VARCHAR(64),
        role role_enum NOT NULL DEFAULT 'user',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "lastSignedIn" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create tenants table
    await sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        subdomain VARCHAR(64) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        "logoUrl" TEXT,
        "contactEmail" VARCHAR(320),
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        "zipCode" VARCHAR(20),
        country VARCHAR(100),
        status tenant_status NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "tenantId" INTEGER NOT NULL,
        role profile_role NOT NULL DEFAULT 'user',
        "isActive" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE("userId", "tenantId"),
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY ("tenantId") REFERENCES tenants(id) ON DELETE CASCADE
      )
    `;

    // Create vehicles table
    await sql`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        "tenantId" INTEGER NOT NULL,
        make VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL,
        color VARCHAR(50),
        vin VARCHAR(17) UNIQUE,
        "licensePlate" VARCHAR(20) UNIQUE,
        mileage INTEGER DEFAULT 0,
        "fuelType" fuel_type,
        transmission transmission_type,
        price NUMERIC(12, 2) NOT NULL,
        description TEXT,
        "imageUrls" JSON DEFAULT '[]'::json,
        status vehicle_status NOT NULL DEFAULT 'available',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY ("tenantId") REFERENCES tenants(id) ON DELETE CASCADE
      )
    `;

    // Create announcements table
    await sql`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        "tenantId" INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        "isPublished" BOOLEAN NOT NULL DEFAULT false,
        "publishedAt" TIMESTAMP,
        "createdByUserId" INTEGER NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY ("tenantId") REFERENCES tenants(id) ON DELETE CASCADE,
        FOREIGN KEY ("createdByUserId") REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    // Create indexes
    console.log('Criando índices...');
    await sql`CREATE INDEX idx_openId ON users("openId")`;
    await sql`CREATE INDEX idx_subdomain ON tenants(subdomain)`;
    await sql`CREATE INDEX idx_tenant_status ON tenants(status)`;
    await sql`CREATE INDEX idx_profiles_userId ON profiles("userId")`;
    await sql`CREATE INDEX idx_profiles_tenantId ON profiles("tenantId")`;
    await sql`CREATE INDEX idx_profiles_user_active ON profiles("userId", "isActive")`;
    await sql`CREATE INDEX idx_vehicles_tenantId ON vehicles("tenantId")`;
    await sql`CREATE INDEX idx_vehicles_status ON vehicles(status)`;
    await sql`CREATE INDEX idx_vehicles_make_model ON vehicles(make, model)`;
    await sql`CREATE INDEX idx_announcements_tenantId ON announcements("tenantId")`;
    await sql`CREATE INDEX idx_announcements_isPublished ON announcements("isPublished")`;
    await sql`CREATE INDEX idx_announcements_createdByUserId ON announcements("createdByUserId")`;

    console.log('✅ Banco de dados criado com sucesso!');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Tabelas já existem, pulando criação');
      process.exit(0);
    }
    console.error('❌ Erro ao criar banco de dados:', error.message);
    process.exit(1);
  }
}

setupDatabase();
