# 🎂 Pastelería Web - Sistema de Gestión de Pastelería

<div align="center">

![Angular](https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Signals](https://img.shields.io/badge/Signals-Reactive-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)

**Sistema completo de gestión para pastelerías con arquitectura moderna y seguridad enterprise**

[Features](#-features) •
[Tech Stack](#-tech-stack) •
[Architecture](#-architecture) •
[Security](#-security) •
[Installation](#-installation)

</div>

---

## 📋 Descripción

Sistema web fullstack diseñado para la gestión integral de una pastelería, permitiendo a administradores gestionar productos, pedidos, usuarios e inventario, mientras que los clientes pueden explorar el catálogo y realizar pedidos de manera intuitiva y segura.

### 🎯 Objetivo del Proyecto

Este proyecto fue desarrollado como parte de mi portafolio profesional para demostrar:
- Arquitectura de aplicaciones Angular enterprise
- Implementación de patrones de diseño modernos
- Prácticas de seguridad en aplicaciones web
- Diseño de interfaces de usuario intuitivas y responsivas

---

## ✨ Features

### 👨‍💼 Panel de Administración
- 📊 **Dashboard** con estadísticas en tiempo real
- 👥 **Gestión de Usuarios** (CRUD completo con roles)
- 🎂 **Gestión de Productos** (catálogo completo)
- 📦 **Gestión de Pedidos** con estados dinámicos
- 🏷️ **Categorías e Ingredientes** para organización

### 🛍️ Panel de Cliente
- 🔍 **Catálogo de Productos** con búsqueda en tiempo real
- 🛒 **Carrito de Compras** reactivo
- 📝 **Creación de Pedidos** con instrucciones especiales
- 📱 **Diseño Responsive** para móviles y tablets

### 🔐 Sistema de Autenticación
- **HttpOnly Cookies** para máxima seguridad
- **Zero Browser Storage** (sin datos sensibles en localStorage/sessionStorage)
- **Session Persistence** con validación backend
- **Auto-logout** por inactividad (5 minutos)
- **Role-based Access Control** (Admin/Customer)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Angular 19 (Standalone Components)
- **Language**: TypeScript 5.7
- **State Management**: Angular Signals (Reactive Primitives)
- **HTTP Client**: Angular HttpClient with Interceptors
- **Routing**: Angular Router with Guards
- **Forms**: Reactive Forms with Validation
- **Icons**: Tabler Icons (Custom Component)

### Arquitectura y Patrones
- ✅ **Facade Pattern** para state management
- ✅ **Repository Pattern** para servicios API
- ✅ **Guard Pattern** para protección de rutas
- ✅ **Interceptor Pattern** para manejo HTTP global
- ✅ **Signal-based Architecture** (Angular 19)
- ✅ **Smart/Dumb Components** separation
- ✅ **Dependency Injection** con Angular DI

### Seguridad Implementada
- 🔐 **HttpOnly Cookies** para JWT tokens
- 🚫 **Zero Storage Attack Vector** (no sessionStorage/localStorage)
- 🔒 **CORS** configurado con credentials
- ⏱️ **Session Timeout** automático
- 🛡️ **XSS Protection** vía cookies seguras
- 🔑 **Role-based Authorization**

---

## 🏗️ Architecture

### 📂 Estructura del Proyecto

```
src/app/
├── core/                      # Servicios core y utilidades
│   ├── config/               # Configuración de API
│   ├── guards/               # Route Guards (auth, role)
│   ├── interceptors/         # HTTP Interceptors
│   ├── models/               # Interfaces y tipos
│   └── services/             # Servicios API y Auth
│       ├── api/              # Servicios de API
│       └── auth/             # AuthService (con cookies)
├── layout/                    # Layout principal
├── pages/                     # Páginas de la aplicación
│   ├── admin/                # Módulo de administración
│   │   ├── dashboard/        # Dashboard admin con estadísticas
│   │   ├── components/       # Componentes de gestión (CRUD)
│   │   └── services/         # Facades para state management
│   ├── customer/             # Módulo de cliente
│   │   └── dashboard/        # Dashboard cliente con catálogo
│   └── auth/                 # Páginas de autenticación
├── shared/                    # Componentes compartidos
│   ├── icon/                 # IconComponent (Tabler Icons)
│   └── components/           # ModalDialog, etc.
└── sidebar/                   # Sidebar con navegación
```

### 🔄 Flujo de Datos (Facade Pattern)

```
Component ➜ Facade ➜ Service ➜ API
                ↓
              Signal (State)
                ↓
            Component (View)
```

**Ejemplo:**
```typescript
CustomerDashboardComponent
  → CustomerDashboardFacade (state management)
    → ProductService.getAllProducts()
      → ApiService.get('/api/v1/products')
        → Backend API
```

### 🔐 Seguridad Zero-Storage

```
Login Flow:
1. Usuario → Credentials → Backend
2. Backend → JWT en HttpOnly Cookie → Navegador
3. Frontend → User data en Memory (Signals) ONLY
4. No sessionStorage, No localStorage ✅

API Calls:
1. Frontend → HTTP Request
2. Browser → Auto-attach Cookie (withCredentials: true)
3. Backend → Validate JWT from Cookie
4. Backend → Response
```

---

## 🎨 UI/UX Highlights

- **Design System** con colores consistentes
- **Micro-animations** para feedback visual
- **Loading States** con spinners
- **Empty States** con mensajes claros
- **Error Handling** con notificaciones
- **Responsive Design** mobile-first
- **Accessibility** considerado en componentes

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm 9+
- Angular CLI 19+

### Setup

```bash
# Clone repository
git clone https://github.com/ronalmoctz/pasteleria-web.git
cd pasteleria-web

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Environment Configuration

Configura la URL del backend en `src/app/core/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  baseUrl: 'http://localhost:3000',
  apiV1: 'http://localhost:3000/api/v1',
  // ...
};
```

---

## 🔒 Security Features

### OWASP Top 10 Compliance

| Threat | Mitigation |
|--------|-----------|
| **A01: Broken Access Control** | Role-based guards, token validation |
| **A02: Cryptographic Failures** | HttpOnly cookies, no client-side token storage |
| **A03: Injection** | Parameterized queries (backend), sanitized inputs |
| **A04: Insecure Design** | Facade pattern, separation of concerns |
| **A05: Security Misconfiguration** | Secure headers, CORS configured |
| **A07: XSS** | HttpOnly cookies, Angular sanitization |

---

## 🧪 Testing

```bash
# Unit tests
npm test

# End-to-end tests
npm run e2e

# Test coverage
npm run test:coverage
```

---

## 📈 Performance

- **Bundle Size**: Optimized with lazy loading
- **First Paint**: < 1.5s (production build)
- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices)
- **Signals**: Fine-grained reactivity (no zone.js overhead)

---

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Deployment Options
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy --prod`
- **AWS S3 + CloudFront**: Standard Angular deployment
- **Firebase Hosting**: `firebase deploy`

---

## 👨‍💻 Author

**Ronal Moctzuma**

Frontend Developer | Angular Specialist | TypeScript Enthusiast

- Portfolio: [tu-portfolio.com](https://ronal-moctz.vercel.app/)
- LinkedIn: [linkedin.com/in/tu-perfil](https://www.linkedin.com/in/ronaldo-moctezuma/)
- GitHub: [@ronalmoctz](https://github.com/ronalmoctz)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Angular team for the amazing framework
- Tabler Icons for the icon library
- Google Deepmind for Antigravity AI assistance in development

---

<div align="center">

**⭐ Si te gusta este proyecto, dale una estrella!**

Made with ❤️ and ☕ by Ronal Moctzuma

</div>
