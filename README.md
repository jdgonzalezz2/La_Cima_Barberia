# La Cima Barbería

Sistema de gestión SaaS integral diseñado para barberías de alta gama. Esta plataforma permite la administración centralizada de múltiples sucursales, personal, servicios y un motor de reservas automatizado.

## Descripción General

La Cima Barbería es una solución multi-inquilino (multi-tenant) que moderniza la operación diaria de las barberías. Proporciona herramientas avanzadas tanto para los propietarios de negocios como para los profesionales (barberos) y los clientes finales, garantizando una experiencia fluida y profesional.

## Características Principales

### Gestión de Reservas
- Motor de citas con detección automática de colisiones.
- Generación dinámica de horarios disponibles basada en la jornada laboral del staff.
- Proceso de reserva simplificado para el cliente final.

### Panel Administrativo (Dashboard)
- Analytics: Visualización de métricas de rendimiento y tendencias del negocio.
- Gestión Financiera: Control detallado de ingresos, comisiones y saldos.
- Administración de Personal: Gestión de perfiles, roles y servicios asignados a cada barbero.
- Catálogo de Servicios: Configuración de precios base, duraciones y precios personalizados por profesional.

### Portal del Barbero
- Interfaz dedicada para que los barberos consulten su agenda diaria.
- Gestión de disponibilidad y seguimiento de sus propios servicios realizados.

### Arquitectura Multi-tenant
- Aislamiento total de datos entre diferentes organizaciones.
- Soporte para múltiples locales bajo una misma infraestructura.

## Pila Tecnológica

- **Frontend**: Next.js 14 (App Router) utilizando TypeScript.
- **Estilos**: Tailwind CSS para un diseño moderno y responsive.
- **Componentes**: Lucide React para iconografía y Recharts para la visualización de datos.
- **Backend y Base de Datos**: PostgreSQL gestionado a través de InsForge.
- **Comunicación**: @insforge/sdk para la integración de datos y autenticación.
- **Seguridad**: Row Level Security (RLS) implementado directamente en la base de datos para garantizar la integridad del aislamiento de datos.

## Estructura del Proyecto

El repositorio está organizado de la siguiente manera:

- `/frontend`: Aplicación principal desarrollada en Next.js. Contiene todas las rutas, componentes y lógica de negocio de la interfaz de usuario.
- `/migrations`: Scripts SQL que definen el esquema de la base de datos, incluyendo tablas, funciones RPC y políticas de seguridad.
- `.insforge`: Archivos de configuración de la infraestructura backend.

## Configuración y Ejecución Local

Para poner en marcha el proyecto en un entorno de desarrollo, siga estos pasos:

### Requisitos Previos
- Node.js versión 18 o superior.
- Gestor de paquetes npm o pnpm.

### Instrucciones de Instalación
1. Acceda al directorio del frontend:
   ```bash
   cd frontend
   ```
2. Instale las dependencias necesarias:
   ```bash
   npm install
   ```
3. Configure las variables de entorno en un archivo `.env.local` dentro de la carpeta `/frontend`. Asegúrese de incluir las credenciales de InsForge:
   - `NEXT_PUBLIC_INSFORGE_URL`
   - `NEXT_PUBLIC_INSFORGE_ANON_KEY`
4. Inicie el servidor de desarrollo:
   ```bash
   npm run dev
   ```

La aplicación estará disponible de forma predeterminada en `http://localhost:3000`.

## Seguridad y Control de Acceso

El sistema utiliza un modelo de Control de Acceso Basado en Roles (RBAC) asegurado por políticas RLS en la base de datos:

- **Propietario (Owner)**: Tiene control total sobre su tenant, puede gestionar el personal, ver reportes financieros y configurar servicios.
- **Barbero (Staff)**: Puede visualizar su propia agenda y gestionar sus citas.
- **Cliente (Público)**: Tiene permisos para consultar servicios disponibles, perfiles de barberos y agendar citas.

La autenticación se maneja de forma segura a través de los servicios de InsForge, soportando flujos modernos como Magic Links.