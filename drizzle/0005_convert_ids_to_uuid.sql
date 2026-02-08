-- Migration: 0005_convert_ids_to_uuid.sql
-- Objetivo: converter chaves primárias e colunas FK inteiras para UUIDs
-- Estratégia: adicionar colunas uuid temporárias, popular via join, depois trocar nomes

-- 1) Habilita extensão necessária para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Adiciona colunas uuid temporárias para todas as PKs
ALTER TABLE users    ADD COLUMN id_new uuid DEFAULT gen_random_uuid();
ALTER TABLE tenants  ADD COLUMN id_new uuid DEFAULT gen_random_uuid();
ALTER TABLE vehicles ADD COLUMN id_new uuid DEFAULT gen_random_uuid();
ALTER TABLE webhooks ADD COLUMN id_new uuid DEFAULT gen_random_uuid();

-- 3) Adiciona colunas uuid temporárias para FK columns (profiles, images, whatsappLeads, apiKeys, webhookEvents)
ALTER TABLE profiles       ADD COLUMN userId_new uuid;
ALTER TABLE profiles       ADD COLUMN tenantId_new uuid;
ALTER TABLE images         ADD COLUMN tenantId_new uuid;
ALTER TABLE images         ADD COLUMN vehicleId_new uuid;
ALTER TABLE whatsappLeads ADD COLUMN tenantId_new uuid;
ALTER TABLE whatsappLeads ADD COLUMN vehicleId_new uuid;
ALTER TABLE apiKeys        ADD COLUMN tenantId_new uuid;
ALTER TABLE webhooks       ADD COLUMN tenantId_new uuid;
ALTER TABLE webhookEvents  ADD COLUMN webhookId_new uuid;
ALTER TABLE webhookEvents  ADD COLUMN tenantId_new uuid;

-- 4) Popula as colunas FK temporárias usando os ids inteiros existentes (mapeando via tables PK integer)
UPDATE profiles p
SET userId_new = u.id_new
FROM users u
WHERE p.userId = u.id;

UPDATE profiles p
SET tenantId_new = t.id_new
FROM tenants t
WHERE p.tenantId = t.id;

UPDATE images i
SET tenantId_new = t.id_new
FROM tenants t
WHERE i.tenantId = t.id;

UPDATE images i
SET vehicleId_new = v.id_new
FROM vehicles v
WHERE i.vehicleId = v.id;

UPDATE whatsappLeads w
SET tenantId_new = t.id_new
FROM tenants t
WHERE w.tenantId = t.id;

UPDATE whatsappLeads w
SET vehicleId_new = v.id_new
FROM vehicles v
WHERE w.vehicleId = v.id;

UPDATE apiKeys k
SET tenantId_new = t.id_new
FROM tenants t
WHERE k.tenantId = t.id;

UPDATE webhooks h
SET tenantId_new = t.id_new
FROM tenants t
WHERE h.tenantId = t.id;

UPDATE webhookEvents e
SET webhookId_new = h.id_new
FROM webhooks h
WHERE e.webhookId = h.id;

UPDATE webhookEvents e
SET tenantId_new = t.id_new
FROM tenants t
WHERE e.tenantId = t.id;

-- 5) Assegura que todas as linhas tenham uuid (para tabelas com dados antigos)
UPDATE users    SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE tenants  SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE vehicles SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE webhooks SET id_new = gen_random_uuid() WHERE id_new IS NULL;

-- 6) Verifica integridade: assegure que todas as FK _new foram populadas
-- (opcional: o deploy pode incluir checagens; aqui apenas falha se houver inconsistência manualmente)

-- 7) Troca as colunas: remove colunas inteiras e renomeia colunas _new para nomes originais
-- Observação: não há constraints FK explícitas nos migrations anteriores, então podemos dropar as colunas inteiras.

-- Remove colunas FK inteiras e renomeia as novas
ALTER TABLE profiles       DROP COLUMN userId;
ALTER TABLE profiles       DROP COLUMN tenantId;
ALTER TABLE profiles       RENAME COLUMN userId_new TO userId;
ALTER TABLE profiles       RENAME COLUMN tenantId_new TO tenantId;

ALTER TABLE images         DROP COLUMN tenantId;
ALTER TABLE images         DROP COLUMN vehicleId;
ALTER TABLE images         RENAME COLUMN tenantId_new TO tenantId;
ALTER TABLE images         RENAME COLUMN vehicleId_new TO vehicleId;

ALTER TABLE whatsappLeads DROP COLUMN tenantId;
BEGIN;

-- 0) extensão para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) ADICIONAR colunas uuid para PKs (sem dropar nada ainda)
ALTER TABLE users    ADD COLUMN IF NOT EXISTS id_new uuid DEFAULT gen_random_uuid();
ALTER TABLE tenants  ADD COLUMN IF NOT EXISTS id_new uuid DEFAULT gen_random_uuid();
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS id_new uuid DEFAULT gen_random_uuid();
ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS id_new uuid DEFAULT gen_random_uuid();

-- 2) Garantir que todas as linhas recebam UUIDs
UPDATE users    SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE tenants  SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE vehicles SET id_new = gen_random_uuid() WHERE id_new IS NULL;
UPDATE webhooks SET id_new = gen_random_uuid() WHERE id_new IS NULL;

-- 3) Adiciona colunas uuid temporárias para FKs nos filhos
ALTER TABLE profiles       ADD COLUMN IF NOT EXISTS userId_new uuid;
ALTER TABLE profiles       ADD COLUMN IF NOT EXISTS tenantId_new uuid;
ALTER TABLE images         ADD COLUMN IF NOT EXISTS tenantId_new uuid;
ALTER TABLE images         ADD COLUMN IF NOT EXISTS vehicleId_new uuid;
ALTER TABLE "whatsappLeads" ADD COLUMN IF NOT EXISTS tenantId_new uuid;
ALTER TABLE "whatsappLeads" ADD COLUMN IF NOT EXISTS vehicleId_new uuid;
ALTER TABLE apiKeys        ADD COLUMN IF NOT EXISTS tenantId_new uuid;
ALTER TABLE webhooks       ADD COLUMN IF NOT EXISTS tenantId_new uuid;
ALTER TABLE webhookEvents  ADD COLUMN IF NOT EXISTS webhookId_new uuid;
ALTER TABLE webhookEvents  ADD COLUMN IF NOT EXISTS tenantId_new uuid;

-- 4) Popula as colunas FK temporárias usando os ids inteiros atuais
UPDATE profiles p
SET userId_new = u.id_new
FROM users u
WHERE p.userId = u.id;

UPDATE profiles p
SET tenantId_new = t.id_new
FROM tenants t
WHERE p.tenantId = t.id;

UPDATE images i
SET tenantId_new = t.id_new
FROM tenants t
WHERE i.tenantId = t.id;

UPDATE images i
SET vehicleId_new = v.id_new
FROM vehicles v
WHERE i.vehicleId = v.id;

UPDATE "whatsappLeads" w
SET tenantId_new = t.id_new
FROM tenants t
WHERE w.tenantId = t.id;

UPDATE "whatsappLeads" w
SET vehicleId_new = v.id_new
FROM vehicles v
WHERE w.vehicleId = v.id;

UPDATE apiKeys k
SET tenantId_new = t.id_new
FROM tenants t
WHERE k.tenantId = t.id;

UPDATE webhooks h
SET tenantId_new = t.id_new
FROM tenants t
WHERE h.tenantId = t.id;

UPDATE webhookEvents e
SET webhookId_new = h.id_new
FROM webhooks h
WHERE e.webhookId = h.id;

UPDATE webhookEvents e
SET tenantId_new = t.id_new
FROM tenants t
WHERE e.tenantId = t.id;

-- 5) Checagens de integridade simples (abortar se houver FK_new nulo)
DO $$
DECLARE cnt integer;
BEGIN
	SELECT count(*) INTO cnt FROM profiles WHERE userId_new IS NULL;
	IF cnt>0 THEN RAISE EXCEPTION 'profiles.userId_new possui % filas nulas', cnt; END IF;
	SELECT count(*) INTO cnt FROM profiles WHERE tenantId_new IS NULL;
	IF cnt>0 THEN RAISE EXCEPTION 'profiles.tenantId_new possui % filas nulas', cnt; END IF;
	SELECT count(*) INTO cnt FROM images WHERE tenantId_new IS NULL;
	IF cnt>0 THEN RAISE EXCEPTION 'images.tenantId_new possui % filas nulas', cnt; END IF;
	SELECT count(*) INTO cnt FROM images WHERE vehicleId_new IS NULL;
	IF cnt>0 THEN RAISE EXCEPTION 'images.vehicleId_new possui % filas nulas', cnt; END IF;
	SELECT count(*) INTO cnt FROM "whatsappLeads" WHERE tenantId_new IS NULL;
	IF cnt>0 THEN RAISE EXCEPTION 'whatsappLeads.tenantId_new possui % filas nulas', cnt; END IF;
	SELECT count(*) INTO cnt FROM "whatsappLeads" WHERE vehicleId_new IS NULL;
	IF cnt>0 THEN RAISE EXCEPTION 'whatsappLeads.vehicleId_new possui % filas nulas', cnt; END IF;
	SELECT count(*) INTO cnt FROM apiKeys WHERE tenantId_new IS NULL;
	IF cnt>0 THEN RAISE EXCEPTION 'apiKeys.tenantId_new possui % filas nulas', cnt; END IF;
	SELECT count(*) INTO cnt FROM webhookEvents WHERE webhookId_new IS NULL;
	IF cnt>0 THEN RAISE EXCEPTION 'webhookEvents.webhookId_new possui % filas nulas', cnt; END IF;
	SELECT count(*) INTO cnt FROM webhookEvents WHERE tenantId_new IS NULL;
	IF cnt>0 THEN RAISE EXCEPTION 'webhookEvents.tenantId_new possui % filas nulas', cnt; END IF;
END$$;

-- 6) Tornar id_new NOT NULL nas tabelas parent
ALTER TABLE users    ALTER COLUMN id_new SET NOT NULL;
ALTER TABLE tenants  ALTER COLUMN id_new SET NOT NULL;
ALTER TABLE vehicles ALTER COLUMN id_new SET NOT NULL;
ALTER TABLE webhooks ALTER COLUMN id_new SET NOT NULL;

-- 7) Renomear antigas colunas para garantir fallback (id -> id_old)
ALTER TABLE users    RENAME COLUMN id TO id_old;
ALTER TABLE tenants  RENAME COLUMN id TO id_old;
ALTER TABLE vehicles RENAME COLUMN id TO id_old;
ALTER TABLE webhooks RENAME COLUMN id TO id_old;

-- 8) Renomeia id_new -> id e adiciona PKs (UUID)
ALTER TABLE users    RENAME COLUMN id_new TO id;
ALTER TABLE users    ADD PRIMARY KEY (id);

ALTER TABLE tenants  RENAME COLUMN id_new TO id;
ALTER TABLE tenants  ADD PRIMARY KEY (id);

ALTER TABLE vehicles RENAME COLUMN id_new TO id;
ALTER TABLE vehicles ADD PRIMARY KEY (id);

ALTER TABLE webhooks RENAME COLUMN id_new TO id;
ALTER TABLE webhooks ADD PRIMARY KEY (id);

-- 9) Para as tabelas filhas: renomeia FK antigas para _old e traz as _new para o nome original
ALTER TABLE profiles       RENAME COLUMN userId TO userId_old;
ALTER TABLE profiles       RENAME COLUMN userId_new TO userId;
ALTER TABLE profiles       RENAME COLUMN tenantId TO tenantId_old;
ALTER TABLE profiles       RENAME COLUMN tenantId_new TO tenantId;

ALTER TABLE images         RENAME COLUMN tenantId TO tenantId_old;
ALTER TABLE images         RENAME COLUMN tenantId_new TO tenantId;
ALTER TABLE images         RENAME COLUMN vehicleId TO vehicleId_old;
ALTER TABLE images         RENAME COLUMN vehicleId_new TO vehicleId;

ALTER TABLE "whatsappLeads" RENAME COLUMN tenantId TO tenantId_old;
ALTER TABLE "whatsappLeads" RENAME COLUMN tenantId_new TO tenantId;
ALTER TABLE "whatsappLeads" RENAME COLUMN vehicleId TO vehicleId_old;
ALTER TABLE "whatsappLeads" RENAME COLUMN vehicleId_new TO vehicleId;

ALTER TABLE apiKeys        RENAME COLUMN tenantId TO tenantId_old;
ALTER TABLE apiKeys        RENAME COLUMN tenantId_new TO tenantId;

ALTER TABLE webhooks       RENAME COLUMN tenantId TO tenantId_old;
ALTER TABLE webhooks       RENAME COLUMN tenantId_new TO tenantId;

ALTER TABLE webhookEvents  RENAME COLUMN webhookId TO webhookId_old;
ALTER TABLE webhookEvents  RENAME COLUMN webhookId_new TO webhookId;
ALTER TABLE webhookEvents  RENAME COLUMN tenantId TO tenantId_old;
ALTER TABLE webhookEvents  RENAME COLUMN tenantId_new TO tenantId;

-- 10) (Opcional) Criar constraints FK apontando para as novas PKs (UUID)
ALTER TABLE profiles ADD CONSTRAINT profiles_user_fkey FOREIGN KEY (userId) REFERENCES users(id);
ALTER TABLE profiles ADD CONSTRAINT profiles_tenant_fkey FOREIGN KEY (tenantId) REFERENCES tenants(id);
ALTER TABLE images ADD CONSTRAINT images_tenant_fkey FOREIGN KEY (tenantId) REFERENCES tenants(id);
ALTER TABLE images ADD CONSTRAINT images_vehicle_fkey FOREIGN KEY (vehicleId) REFERENCES vehicles(id);
ALTER TABLE "whatsappLeads" ADD CONSTRAINT whatsapp_tenant_fkey FOREIGN KEY (tenantId) REFERENCES tenants(id);
ALTER TABLE "whatsappLeads" ADD CONSTRAINT whatsapp_vehicle_fkey FOREIGN KEY (vehicleId) REFERENCES vehicles(id);
ALTER TABLE apiKeys ADD CONSTRAINT apikeys_tenant_fkey FOREIGN KEY (tenantId) REFERENCES tenants(id);
ALTER TABLE webhooks ADD CONSTRAINT webhooks_tenant_fkey FOREIGN KEY (tenantId) REFERENCES tenants(id);
ALTER TABLE webhookEvents ADD CONSTRAINT webhookevents_webhook_fkey FOREIGN KEY (webhookId) REFERENCES webhooks(id);
ALTER TABLE webhookEvents ADD CONSTRAINT webhookevents_tenant_fkey FOREIGN KEY (tenantId) REFERENCES tenants(id);

-- 11) NOTA: mantemos as colunas *_old (ids inteiros) por segurança. Depois de validar, podem ser removidas manualmente.

COMMIT;

-- FIM da migration 0005 (versão segura)
