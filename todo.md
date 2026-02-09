# AutoGestão Pro - Multi-Tenant Car Dealership Platform

## Database & Schema
- [x] Design and implement multi-tenant database schema with RLS
- [x] Create tenants table with subdomain routing
- [x] Create users table with tenant associations
- [x] Create profiles table for user-tenant relationships
- [x] Create vehicles table with inventory data
- [x] Create announcements table
- [ ] Set up Row Level Security (RLS) policies for data isolation
- [x] Create database migrations

## Authentication & Authorization
- [x] Implement OAuth integration with Manus
- [x] Create role-based access control (admin/user)
- [ ] Implement tenant context extraction from subdomain
- [ ] Create protected procedures for authenticated routes
- [ ] Create admin-only procedures for admin routes
- [x] Implement session management and logout

## Tenant Management
- [ ] Create tenant creation procedure
- [ ] Create tenant update procedure
- [ ] Implement subdomain validation and uniqueness
- [ ] Create tenant listing for admins
- [ ] Build tenant management UI (admin only)

## User & Profile Management
- [ ] Create user profile management procedures
- [ ] Implement profile selector for multi-tenant users
- [ ] Create profile switching functionality
- [ ] Build profile UI component
- [ ] Implement role assignment in profiles

## Vehicle Inventory Management
- [ ] Create vehicle CRUD procedures (create, read, update, delete)
- [ ] Implement vehicle search and filtering
- [ ] Create vehicle image upload with S3 integration
- [ ] Build vehicle inventory UI (admin/staff)
- [ ] Create vehicle edit form
- [ ] Implement vehicle deletion with image cleanup

## Storefront & Vehicle Listing
- [ ] Create public vehicle listing procedure
- [ ] Implement vehicle search and filter functionality
- [ ] Build storefront UI component
- [ ] Create vehicle detail view
- [ ] Implement search bar with autocomplete

## Image Upload System
- [ ] Implement S3 presigned URL generation
- [ ] Create image upload handler
- [ ] Build image upload UI component
- [ ] Implement image deletion from S3
- [ ] Add image validation (size, format)

## Admin Dashboard
- [ ] Create metrics calculation procedures
- [ ] Implement vehicle count analytics
- [ ] Create revenue/pricing analytics
- [ ] Build dashboard UI with charts
- [ ] Implement date range filtering for metrics
- [ ] Create performance indicators

## Announcement System
- [ ] Create announcement CRUD procedures
- [ ] Implement announcement preview modal
- [ ] Build announcement management UI
- [ ] Create announcement listing
- [ ] Implement announcement deletion

## Frontend Architecture
- [ ] Set up routing with subdomain detection
- [ ] Create layout components (dashboard, storefront)
- [ ] Implement navigation with profile selector
- [ ] Build responsive design for mobile/tablet
- [ ] Create error boundaries and error handling
- [ ] Implement loading states and skeletons

## Testing & Verification
- [ ] Write unit tests for auth procedures
- [ ] Write unit tests for tenant procedures
- [ ] Write unit tests for vehicle procedures
- [ ] Test RLS policies with different users
- [ ] Test subdomain routing
- [ ] Test profile switching
- [ ] E2E testing for critical flows

## Deployment & Final Steps
- [ ] Verify all environment variables are set
- [ ] Test database migrations
- [ ] Create final checkpoint
- [ ] Document deployment steps
- [ ] Verify SSL/TLS for subdomains


## Multi-Tenant Authentication (Nova)
- [x] Criar hook para detectar subdomínio atual
- [x] Implementar contexto global de tenant
- [x] Criar tela de cadastro de usuário
- [x] Criar telas de login específicas por tenant
- [x] Implementar roteamento dinâmico por subdomínio
- [x] Criar página de seleção de tenant
- [ ] Implementar validação de tenant no backend
- [x] Criar testes para multi-tenancy


## Autenticação Local (Novo)
- [x] Remover OAuth do Manus
- [x] Criar procedures tRPC para login com email/senha
- [x] Criar procedures tRPC para cadastro com email/senha
- [x] Implementar hash de senha com bcrypt
- [x] Atualizar página de Login para usar autenticação local
- [x] Atualizar página de Signup para usar autenticação local
- [x] Implementar validação de email único
- [x] Testar fluxo completo de login e cadastro
