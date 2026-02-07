# Guia da Vitrine Pública - AutoGestão Pro

## Visão Geral

A Vitrine Pública é a interface voltada para clientes finais que desejam visualizar e se interessar pelos veículos disponíveis em uma loja. Otimizada para conversão e performance, inclui integração direta com WhatsApp para lead generation.

## Arquitetura

### Fluxo de Dados

```
Cliente Final
    ↓
Vitrine Pública (Storefront.tsx)
    ↓
Listagem com Grid de Cards (VehicleCard.tsx)
    ↓
Página de Detalhes (VehicleDetails.tsx)
    ↓
Integração WhatsApp (Lead Generation)
    ↓
Lojista recebe mensagem no WhatsApp
```

## Componentes

### 1. Storefront.tsx (Página Principal)
- **Localização**: `client/src/pages/Storefront.tsx`
- **Responsabilidade**: Exibir lista de veículos com filtros
- **Recursos**:
  - Header com informações da loja (nome, logo, contato)
  - Seção de busca e filtros
  - Grid responsivo de cards
  - Footer com contato

### 2. VehicleCard.tsx (Card Reutilizável)
- **Localização**: `client/src/components/VehicleCard.tsx`
- **Responsabilidade**: Renderizar card individual do veículo
- **Recursos**:
  - Lazy loading de imagens
  - Skeleton loader durante carregamento
  - Ícones de especificações (combustível, quilometragem, câmbio)
  - Botão de favoritos
  - Botões de "Detalhes" e "WhatsApp"
  - Responsivo para mobile

### 3. VehicleDetails.tsx (Página de Detalhes)
- **Localização**: `client/src/pages/VehicleDetails.tsx`
- **Responsabilidade**: Exibir detalhes completos do veículo
- **Recursos**:
  - Carousel de imagens com navegação
  - Thumbnails para navegação rápida
  - Ficha técnica completa
  - Informações da loja
  - Botão "Tenho Interesse" (WhatsApp)
  - Funcionalidade de compartilhamento
  - Favoritos

## Integração WhatsApp

### Fluxo de Lead Generation

```
Cliente clica em "Tenho Interesse"
    ↓
Gera mensagem automática com dados do veículo
    ↓
Abre WhatsApp do lojista
    ↓
Mensagem pré-preenchida é enviada
    ↓
Lojista recebe lead em tempo real
```

### Implementação

**Função**: `handleWhatsAppClick()` em `VehicleDetails.tsx`

```typescript
const handleWhatsAppClick = () => {
  if (!tenant?.phone) return;

  const message = `Olá! Tenho interesse no ${vehicle.year} ${vehicle.make} ${vehicle.model} anunciado em sua loja. Preço: R$ ${price}. Gostaria de mais informações.`;

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
};
```

**Dados Enviados**:
- Ano, marca e modelo do veículo
- Preço
- Link do anúncio (URL da página)
- Mensagem personalizada

### Configuração Necessária

1. **Número de WhatsApp do Lojista**:
   - Armazenado em `tenants.phone`
   - Deve estar em formato E.164 (ex: +5511987654321)
   - Validado durante cadastro da loja

2. **Variáveis de Ambiente**:
   - Nenhuma variável adicional necessária
   - WhatsApp Web API é pública

## Performance e Otimizações

### Lazy Loading de Imagens

```typescript
<img
  src={imageUrl}
  loading="lazy"
  onLoad={handleImageLoad}
  className="transition-opacity"
/>
```

**Benefícios**:
- Reduz tempo de carregamento inicial
- Melhora Core Web Vitals
- Economiza banda para usuários mobile

### Skeleton Loading

Durante o carregamento de imagens, um skeleton animado é exibido:

```typescript
{!isImageLoaded && (
  <div className="animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
)}
```

### Otimizações de Mobile

1. **Imagens Responsivas**: Diferentes tamanhos para diferentes breakpoints
2. **Touch-Friendly**: Botões com tamanho mínimo de 48x48px
3. **Carregamento Progressivo**: Imagens carregam conforme necessário
4. **Compressão**: Imagens comprimidas antes do upload

## Filtros e Busca

### Filtros Disponíveis

1. **Busca por Marca/Modelo**: Campo de texto com busca em tempo real
2. **Filtro de Ano**: Ano mínimo
3. **Filtro de Preço**: Preço máximo

### Implementação

```typescript
const filteredVehicles = vehicles.filter((v) => {
  const matchesSearch = v.make.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesYear = !filterYear || v.year.toString() === filterYear;
  const matchesPrice = !filterPrice || v.price <= parseInt(filterPrice);
  return matchesSearch && matchesYear && matchesPrice && v.isAvailable;
});
```

## Responsividade

### Breakpoints

- **Mobile** (320px - 767px):
  - Grid 1 coluna
  - Cards full-width
  - Carousel em tela cheia

- **Tablet** (768px - 1024px):
  - Grid 2 colunas
  - Carousel com navegação lateral

- **Desktop** (1025px+):
  - Grid 3 colunas
  - Carousel com controles completos

## Rotas

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | Storefront | Vitrine principal |
| `/vehicle/:id` | VehicleDetails | Detalhes do veículo |

## Dados Exibidos

### Informações da Loja

```typescript
{
  name: string;
  description?: string;
  logoUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
}
```

### Informações do Veículo

```typescript
{
  id: number;
  year: number;
  make: string;
  model: string;
  price: number;
  mileage?: number;
  color?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  description?: string;
  isAvailable: boolean;
  isFeatured?: boolean;
}
```

### Imagens

```typescript
{
  id: number;
  vehicleId: number;
  url: string;
  isCover: boolean;
  displayOrder: number;
}
```

## Fluxo de Usuário

### Visitante Interessado

1. Acessa vitrine via subdomínio (ex: loja-a.autogestao.com.br)
2. Vê lista de veículos em grid
3. Filtra por marca, modelo ou preço
4. Clica em "Detalhes" para ver mais informações
5. Visualiza galeria de imagens com carousel
6. Clica em "Tenho Interesse"
7. WhatsApp abre com mensagem pré-preenchida
8. Envia mensagem para lojista

### Lojista

1. Recebe notificação no WhatsApp
2. Vê dados do veículo e interesse do cliente
3. Responde diretamente ao cliente
4. Agenda visita ou negocia

## Integração com Backend

### Rotas tRPC Utilizadas

```typescript
// Obter informações da loja
trpc.auth.getTenant.useQuery()

// Listar veículos do tenant
trpc.vehicles.list.useQuery()

// Obter detalhes do veículo
trpc.vehicles.getById.useQuery({ id })

// Obter imagens do veículo
trpc.images.getVehicleImages.useQuery({ vehicleId })
```

## Segurança

### Isolamento por Tenant

- Cada loja vê apenas seus próprios veículos
- Filtro automático por `tenantId` em todas as queries
- URLs de imagens são públicas mas organizadas por tenant

### Validações

- Apenas veículos com `isAvailable = true` são exibidos
- Números de telefone validados antes de criar link WhatsApp
- Mensagens sanitizadas antes de URL encoding

## Analytics e Conversão

### Eventos Rastreáveis

1. **Visualização de Vitrine**: Quando página carrega
2. **Clique em Detalhes**: Quando usuário clica em card
3. **Clique em WhatsApp**: Quando usuário inicia conversa

### Métricas Importantes

- Taxa de cliques em "Tenho Interesse"
- Tempo médio na página de detalhes
- Bounce rate da vitrine
- Conversão (clique em WhatsApp)

## Troubleshooting

### Imagens não carregam

1. Verificar URL do S3
2. Verificar permissões de acesso público
3. Verificar formato da imagem

### WhatsApp não abre

1. Verificar número de telefone do tenant
2. Verificar formato E.164
3. Testar link manualmente: `https://wa.me/5511987654321`

### Filtros não funcionam

1. Verificar se veículos têm status `isAvailable = true`
2. Verificar valores dos filtros
3. Limpar cache do navegador

## Próximos Passos

1. **Adicionar Filtros Avançados**: Carroceria, combustível, câmbio
2. **Implementar Favoritos**: Salvar veículos favoritos localmente
3. **Adicionar Reviews**: Avaliações de clientes
4. **Integrar Analytics**: Rastrear cliques e conversões
5. **Otimizar SEO**: Meta tags, schema markup
6. **Adicionar Chat**: Chat em tempo real com lojista

## Referências

- [WhatsApp Business API](https://www.whatsapp.com/business/api)
- [Web Vitals](https://web.dev/vitals/)
- [Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
