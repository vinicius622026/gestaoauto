# AutoGestão Pro - TODO

## Banco de Dados & Segurança
- [x] Criar tabela `tenants` com dados da loja
- [x] Criar tabela `profiles` com usuários/lojistas
- [x] Criar tabela `vehicles` com estoque de veículos
- [x] Implementar helpers de banco de dados para operações Multi-Tenant
- [ ] Implementar RLS (Row Level Security) para isolamento de dados
- [ ] Configurar políticas de segurança por tenant_id

## Autenticação & Subdomínio
- [x] Integrar autenticação com Manus Auth (base implementada)
- [x] Implementar sistema de identificação por subdomínio
- [x] Criar lógica de detecção de tenant a partir da URL
- [x] Implementar login/logout de lojistas (via auth router)
- [x] Criar rotas tRPC para gerenciamento de tenant
- [ ] Criar página de cadastro de lojistas

## Interface Administrativa
- [x] Criar layout com menu lateral (AdminLayout)
- [x] Implementar página de dashboard da loja
- [x] Criar página de gerenciamento de estoque
- [x] Adicionar página de configurações da loja
- [x] Implementar CRUD de veículos com tRPC
- [x] Adicionar upload de imagens para veículos (S3 com hierarquia)
- [x] Integrar dados reais do banco de dados
- [x] Criar formulário avançado com validações
- [x] Implementar galeria de imagens com seleção de capa

## Vitrine Pública
- [x] Criar página pública de exibição de veículos
- [x] Implementar grid responsivo de cards de veículos (otimizado com lazy loading)
- [x] Adicionar filtros e busca de veículos
- [x] Adicionar informações de contato da loja
- [x] Criar rotas tRPC para CRUD de veículos
- [x] Criar página de detalhes do veículo com carousel
- [x] Implementar galeria de imagens com thumbnails
- [x] Integrar WhatsApp lead generation
- [x] Otimizar performance com lazy loading
- [x] Criar componente VehicleCard reutilizável
- [ ] Adicionar filtros avançados
- [ ] Implementar favoritos/wishlist

## Responsividade & UX
- [x] Testar layout em desktop (1920px+)
- [x] Testar layout em tablet (768px-1024px)
- [x] Testar layout em mobile (320px-767px)
- [x] Implementar navegação mobile-friendly
- [x] Adicionar feedback visual (toasts, loading states)
- [x] Implementar tratamento de erros

## Página de Apresentação
- [x] Criar página web interativa de resultados
- [x] Adicionar gráficos e visualizações de dados (Recharts)
- [x] Implementar funcionalidade de download de relatório
- [x] Adicionar funcionalidade de compartilhamento
- [x] Criar abas de navegação (Overview, Arquitetura, Features, Análise)

## Testes & Qualidade
- [x] Escrever testes unitários com Vitest (32 testes passando)
- [x] Testar procedimentos tRPC (auth, tenant, images)
- [x] Validar isolamento de dados entre tenants
- [ ] Testar componentes React críticos
- [ ] Teste de integração end-to-end

## Integração e Ecossistema MCP
- [x] Criar tabela `apiKeys` para gerenciamento de chaves de API
- [x] Criar tabela `webhooks` para notificações
- [x] Implementar autenticação por API Key (middleware)
- [x] Criar endpoints REST para CRUD de veículos (GET, POST, PUT, DELETE)
- [x] Criar helpers de banco de dados para API Keys
- [ ] Configurar Swagger/OpenAPI com documentação automática
- [ ] Integrar API routes no servidor Express
- [ ] Implementar Servidor MCP com SDK oficial
- [ ] Criar tools MCP (get_inventory, search_vehicle, get_vehicle_leads)
- [ ] Implementar isolamento por tenant_id no MCP
- [ ] Criar sistema de Webhooks
- [ ] Implementar página de gerenciamento de API Keys no dashboard
- [ ] Testar segurança e isolamento de dados
- [ ] Documentar API e MCP para desenvolvedores

## Deployment & Finalização
- [ ] Revisar variáveis de ambiente
- [ ] Criar checkpoint final
- [ ] Preparar documentação
- [ ] Validar segurança RLS
