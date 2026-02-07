# Módulo de Gestão de Estoque - AutoGestão Pro

## Visão Geral

O Módulo de Gestão de Estoque é um sistema completo para lojistas de automóveis gerenciarem seu inventário de veículos, incluindo cadastro, edição, exclusão e gerenciamento de imagens com isolamento total por tenant_id.

## Arquitetura

### Isolamento Multi-Tenant

Todas as operações são isoladas por `tenant_id` em múltiplas camadas:

1. **Banco de Dados**: Cada query inclui verificação de `tenant_id`
2. **Contexto tRPC**: O `tenantId` é enriquecido automaticamente do subdomínio
3. **Armazenamento S3**: Hierarquia de arquivos `/tenant_id/vehicle_id/image_name.jpg`
4. **Validação**: Todas as rotas protegidas verificam propriedade do tenant

### Fluxo de Dados

```
Frontend (VehicleForm)
    ↓
tRPC Procedures (vehicles.create, images.upload)
    ↓
Database Helpers (db.ts, db-images.ts)
    ↓
MySQL (vehicles, images, tenants tables)
    ↓
S3 Storage (Hierarquia isolada por tenant)
```

## Componentes

### Backend

#### Tabelas do Banco de Dados

**vehicles**
- `id`: Primary key
- `tenantId`: Foreign key para isolamento
- `make`, `model`, `year`: Informações básicas
- `price`: Decimal(12,2)
- `color`, `mileage`, `fuelType`, `transmission`, `bodyType`
- `description`: Texto longo
- `imageUrl`, `additionalImages`: URLs (deprecated, usar tabela images)
- `isAvailable`, `isFeatured`: Flags de status
- `createdAt`, `updatedAt`: Timestamps

**images**
- `id`: Primary key
- `tenantId`: Foreign key para isolamento
- `vehicleId`: Foreign key para vehicle
- `url`: URL do S3
- `fileKey`: Caminho no S3 (para deleção)
- `filename`: Nome original
- `mimeType`: Tipo MIME
- `fileSize`: Tamanho em bytes
- `isCover`: Boolean (imagem principal)
- `displayOrder`: Ordem na galeria
- `createdAt`, `updatedAt`: Timestamps

#### Rotas tRPC

**vehicles.ts**
- `list`: Listar veículos do tenant
- `create`: Criar novo veículo
- `update`: Atualizar veículo
- `delete`: Deletar veículo
- `getById`: Obter detalhes do veículo

**images.ts**
- `upload`: Upload de imagem para S3
  - Hierarquia: `/tenant_id/vehicle_id/timestamp-filename`
  - Primeira imagem é capa por padrão
  - Validação de tipo MIME e tamanho (5MB max)
- `getVehicleImages`: Listar imagens do veículo
- `setCover`: Definir imagem como capa
- `delete`: Deletar imagem
- `getCover`: Obter imagem de capa

#### Helpers de Banco de Dados

**db-images.ts**
```typescript
// Todas as funções incluem isolamento por tenant_id
createImage(imageData)
getVehicleImages(vehicleId, tenantId)
getVehicleCoverImage(vehicleId, tenantId)
setImageAsCover(imageId, vehicleId, tenantId)
deleteImage(imageId, vehicleId, tenantId)
getImageById(imageId, vehicleId, tenantId)
updateImageDisplayOrder(imageId, vehicleId, tenantId, displayOrder)
```

### Frontend

#### Componentes React

**VehicleForm.tsx**
- Formulário completo com validação Zod
- Campos: marca, modelo, ano, preço, quilometragem, cor, combustível, câmbio, carroceria, descrição
- Upload de múltiplas imagens com drag-and-drop
- Seleção de imagem de capa
- Feedback visual de loading e progresso
- Responsivo para mobile

**ImageGallery.tsx**
- Visualizador de imagens com navegação
- Seleção de capa com badge visual
- Thumbnail grid para navegação rápida
- Ações: definir como capa, remover imagem
- Indicador de imagem atual e total

**InventoryManagement.tsx**
- Página completa de gerenciamento de estoque
- Tabela de veículos com busca
- Diálogos para formulário e galeria
- Integração com tRPC para CRUD
- Feedback visual com toasts
- Responsivo para desktop, tablet e mobile

## Fluxo de Uso

### 1. Criar Novo Veículo

```typescript
// Frontend
const handleFormSubmit = async (data, imageFiles) => {
  // 1. Criar veículo
  const vehicle = await trpc.vehicles.create.mutateAsync(data);
  
  // 2. Upload de imagens
  for (const file of imageFiles) {
    await trpc.images.upload.mutateAsync({
      vehicleId: vehicle.id,
      file: buffer,
      filename: file.name,
      mimeType: file.type,
      fileSize: file.size,
      setAsCover: isFirst,
    });
  }
};
```

### 2. Editar Veículo

```typescript
// Atualizar dados do veículo
await trpc.vehicles.update.mutateAsync({
  id: vehicleId,
  ...updatedData,
});

// Adicionar novas imagens
await trpc.images.upload.mutateAsync({ ... });

// Remover imagens
await trpc.images.delete.mutateAsync({
  imageId,
  vehicleId,
});
```

### 3. Gerenciar Imagens

```typescript
// Definir como capa
await trpc.images.setCover.mutateAsync({
  imageId,
  vehicleId,
});

// Deletar imagem
await trpc.images.delete.mutateAsync({
  imageId,
  vehicleId,
});

// Listar imagens
const images = await trpc.images.getVehicleImages.useQuery({
  vehicleId,
});
```

## Segurança e Isolamento

### Tenant Isolation

1. **Context Enrichment**: O `tenantId` é extraído do subdomínio automaticamente
2. **Query Filtering**: Todas as queries incluem `WHERE tenantId = ?`
3. **Validação de Propriedade**: Antes de qualquer operação, verifica se o recurso pertence ao tenant
4. **S3 Hierarchy**: Arquivos são organizados por tenant, impedindo acesso cruzado

### Validações

- **Tipo de Arquivo**: Apenas imagens (image/*)
- **Tamanho**: Máximo 5MB por imagem
- **Quantidade**: Sem limite, mas recomendado máximo 20 imagens por veículo
- **Formato**: Suporta PNG, JPG, GIF, WebP

### Proteção de Rotas

Todas as rotas tRPC usam `protectedProcedure`:
```typescript
protectedProcedure
  .input(z.object({ ... }))
  .mutation(async ({ ctx, input }) => {
    const tenantCtx = await enrichContextWithTenant(ctx);
    requireTenantAuth(tenantCtx);
    // ... operação
  });
```

## Responsividade

### Mobile (320px - 767px)
- Formulário em coluna única
- Drag-and-drop simplificado
- Galeria em grid 2x2
- Botões em tamanho touch-friendly

### Tablet (768px - 1024px)
- Formulário em 2 colunas
- Galeria em grid 3x3
- Tabela com scroll horizontal

### Desktop (1920px+)
- Formulário em 2 colunas
- Galeria em grid 4x4
- Tabela completa sem scroll

## Testes

### Testes Unitários

```bash
pnpm test
```

Cobertura:
- ✓ Tenant isolation (19 testes)
- ✓ Auth flow (1 teste)
- ✓ Image operations (12 testes)
- **Total: 32 testes passando**

### Testes Manuais

1. **Criar Veículo**
   - Preencher formulário
   - Upload de imagens
   - Verificar S3 hierarchy
   - Verificar banco de dados

2. **Editar Veículo**
   - Atualizar dados
   - Adicionar/remover imagens
   - Definir nova capa

3. **Isolamento**
   - Logar com tenant A
   - Criar veículo
   - Logar com tenant B
   - Verificar que não vê veículos de A

## Variáveis de Ambiente

Necessárias para funcionamento:
- `DATABASE_URL`: Conexão MySQL
- `VITE_FRONTEND_FORGE_API_URL`: URL da API Manus
- `VITE_FRONTEND_FORGE_API_KEY`: Chave da API para S3

## Próximos Passos

1. **Implementar Deletar de S3**: Adicionar função para deletar arquivos do S3 quando imagem é removida
2. **Compressão de Imagens**: Implementar compressão automática antes do upload
3. **Thumbnails**: Gerar thumbnails automaticamente
4. **Validação de Imagem**: Verificar dimensões mínimas
5. **Cache**: Implementar cache de imagens no frontend
6. **Analytics**: Rastrear uploads e downloads

## Troubleshooting

### Imagens não aparecem
- Verificar URL do S3
- Verificar permissões de acesso
- Verificar tenant_id no fileKey

### Upload falha
- Verificar tamanho do arquivo (máximo 5MB)
- Verificar tipo MIME
- Verificar conexão com S3

### Isolamento não funciona
- Verificar subdomínio na URL
- Verificar tenant_id no contexto
- Verificar queries incluem tenant_id

## Referências

- [Drizzle ORM](https://orm.drizzle.team/)
- [tRPC](https://trpc.io/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [AWS S3](https://aws.amazon.com/s3/)
