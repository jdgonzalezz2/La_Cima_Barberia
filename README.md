# Bookeiro

Sistema de gestión SaaS integral diseñado para el ecosistema de barberías premium. Esta plataforma permite la administración centralizada de múltiples inquilinos, personal, servicios y un motor de reservas automatizado con alta confiabilidad.

## Descripción General

Bookeiro es una solución multi-inquilino (multi-tenant) que moderniza la operación diaria de las barberías. Proporciona herramientas avanzadas tanto para los propietarios de negocios como para los profesionales (barberos) y los clientes finales, garantizando una experiencia fluida, escalable y profesional.

## Características Principales

### Gestión de Reservas
- Motor de citas con detección automática de colisiones.
- Generación dinámica de horarios disponibles basada en la jornada laboral personalizada de cada profesional.
- Proceso de reserva optimizado para dispositivos móviles (PWA Ready).

### Panel Administrativo (Dashboard)
- Analytics: Visualización de métricas críticas y tendencias de crecimiento del negocio.
- Gestión Financiera: Control detallado de ingresos, cálculo automático de comisiones y saldos en tiempo real.
- Administración de Personal: Gestión centralizada de perfiles, roles y servicios asignados a cada barbero.
- Catálogo de Servicios: Configuración flexible de precios base, duraciones y ajustes específicos por profesional.

### Portal del Barbero
- Interfaz dedicada y simplificada para que los profesionales consulten su agenda diaria.
- Gestión de disponibilidad autónoma y seguimiento de servicios completados.

### Arquitectura Multi-tenant
- Aislamiento lógico y físico de datos entre diferentes organizaciones.
- Capacidad para desplegar vitrinas públicas personalizadas para cada cliente bajo el dominio de Bookeiro.

## Pila Tecnológica

- **Frontend**: Next.js 14 (App Router) implementado con TypeScript.
- **Estilos**: Tailwind CSS para interfaces responsivas y de alto rendimiento.
- **Componentes**: Lucide React para iconografía consistente y Recharts para análisis de datos visual.
- **Backend y Infraestructura**: PostgreSQL gestionado a través de InsForge.
- **Comunicación**: @insforge/sdk para operaciones de base de datos y autenticación.
- **Seguridad**: Implementación rigurosa de Row Level Security (RLS) para garantizar la privacidad de los datos entre inquilinos.

## Estructura del Proyecto

El repositorio está organizado para separar la lógica de interfaz de la configuración de infraestructura:

- `/frontend`: Aplicación Next.js completa que contiene rutas, componentes y lógica de estado.
- `/migrations`: Scripts SQL estructurados que gestionan el esquema de datos, funciones RPC y políticas de seguridad RLS.
- `.insforge`: Directorio de configuración para la gestión del backend serveless.

## Configuración y Ejecución Local

Siga estas instrucciones para configurar su entorno de desarrollo:

### Requisitos Previos
- Node.js v18.0.0 o superior.
- Un gestor de paquetes compatible (npm, pnpm o yarn).

### Pasos de Instalación
1. Navegue al directorio del frontend:
   ```bash
   cd frontend
   ```
2. Instale las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Configure las variables de entorno necesarias en `.env.local`:
   - `NEXT_PUBLIC_INSFORGE_URL`: URL del proyecto en InsForge.
   - `NEXT_PUBLIC_INSFORGE_ANON_KEY`: Clave pública de acceso.
4. Ejecute el servidor de desarrollo:
   ```bash
   npm run dev
   ```

La plataforma estará accesible en `http://localhost:3000`.

## Seguridad y Roles de Usuario

Bookeiro utiliza un modelo de Control de Acceso Basado en Roles (RBAC) robusto:

- **Propietario (Owner)**: Acceso administrativo total al tenant, configuración de negocio y reportes financieros.
- **Barbero (Staff)**: Permisos limitados a la gestión de su propia agenda y visualización de citas personales.
- **Cliente (Público)**: Acceso exclusivo para consulta de disponibilidad y creación de reservas.

La autenticación se realiza mediante flujos seguros de InsForge, incluyendo el uso de Magic Links para un acceso sin fricciones.
