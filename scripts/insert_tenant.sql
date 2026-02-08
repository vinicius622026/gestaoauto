-- Template SQL to insert a tenant into the `tenants` table.
-- Fill placeholders or use the accompanying Node script `insert_tenant.mjs` to run safely.

INSERT INTO tenants (
  subdomain,
  name,
  description,
  email,
  phone,
  logoUrl,
  address,
  city,
  state,
  zipCode,
  website,
  isActive
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
)
RETURNING *;
