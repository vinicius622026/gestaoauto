-- Template SQL to insert or upsert an admin user into the `users` table.
-- Use the accompanying Node script `insert_admin.mjs` to run this safely.

INSERT INTO users (
  "openId",
  "name",
  "email",
  "role",
  "createdAt",
  "updatedAt",
  "lastSignedIn"
) VALUES (
  $1, $2, $3, 'admin', NOW(), NOW(), NOW()
)
ON CONFLICT ("openId") DO UPDATE
SET
  "role" = 'admin',
  "name" = EXCLUDED."name",
  "email" = EXCLUDED."email",
  "updatedAt" = NOW()
RETURNING *;
