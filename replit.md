# Community Hub Application

## Overview

This is a comprehensive neighborhood community hub application designed as a private portal for residential communities and apartment buildings. The system provides residents with a centralized platform to share announcements, engage in discussions, conduct polls, and participate in marketplace activities.

The application follows a modern full-stack architecture with a React-based frontend and Express.js backend. Currently transitioning from MongoDB to PostgreSQL with Drizzle ORM for better Replit integration. The system implements role-based access control (RBAC) with three user types: residents, moderators, and administrators.

## Recent Changes (August 2025)

- ✓ Reverted back to MongoDB as requested by user
- ✓ Set up JWT authentication with environment secrets
- ✓ Fixed rate limiting IPv6 compatibility issues
- ✓ Created extraordinary landing page with gradient design
- ✓ Fixed JSX compilation errors and Zustand state management
- ✓ Created futuristic components: hologram cards, neural backgrounds, AI assistant
- ✓ Implemented extraordinary 2900-era design with quantum portal and smart dashboard  
- → User requested innovative features "comme il est realisé en 2900"
- → Added revolutionary AI assistant ARIA with neural network animations

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with Vite as the build tool and follows a component-based architecture. Key architectural decisions include:

- **Component Library**: Uses shadcn/ui components with Radix UI primitives for consistent, accessible UI components
- **Styling**: TailwindCSS for utility-first styling with CSS custom properties for theming
- **State Management**: Zustand for global state management with persistence for authentication state
- **Data Fetching**: TanStack Query (React Query) for server state management and caching
- **Form Management**: React Hook Form with Zod schema validation for type-safe form handling
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
The backend follows a RESTful API architecture with Express.js:

- **Framework**: Express.js with TypeScript for type safety
- **Database**: MongoDB with Mongoose ODM for schema definition and data modeling
- **Authentication**: JWT-based authentication with access/refresh token pattern using httpOnly cookies
- **Authorization**: Role-based access control (RBAC) with permission-based guards
- **Real-time Communication**: WebSocket implementation for live updates on posts, comments, and notifications
- **File Uploads**: S3-compatible storage with pre-signed URLs for secure file handling

### Database Design
Now using MongoDB as requested by user. Collections are structured around core entities:

- **Users**: Stores user profiles, roles, and community associations
- **Communities**: Represents residential communities with configurable settings
- **Posts**: Content creation with support for announcements, services, marketplace items, and polls
- **Comments**: Threaded discussions on posts
- **Votes**: Poll participation tracking
- **Reports**: Content moderation system
- **Notifications**: User notification management

### Security & Middleware
Comprehensive security layer implementation:

- **Rate Limiting**: Tiered rate limiting for different endpoint categories
- **Input Validation**: Zod schemas for request/response validation
- **Content Moderation**: Spam detection and reporting system
- **CORS Configuration**: Environment-specific CORS policies
- **Request Logging**: Structured logging with Pino for observability

### Real-time Features
WebSocket integration for live user experience:

- **Live Updates**: Real-time post creation and comment notifications
- **Poll Results**: Live poll tally updates
- **User Presence**: Connection management with community-based rooms
- **Notification System**: Instant delivery of user notifications

## External Dependencies

### Database
- **MongoDB**: Primary database using Mongoose ODM for schema validation and data modeling
- **Connection Management**: Automatic reconnection handling and error logging

### Cloud Storage
- **S3-Compatible Storage**: File upload handling with pre-signed URLs for security
- **Configuration**: Environment-based configuration for different storage providers
- **File Validation**: Type and size restrictions for uploaded content

### Authentication Services
- **JWT**: JSON Web Token implementation for stateless authentication
- **bcryptjs**: Password hashing and verification
- **Cookie Management**: Secure httpOnly cookie implementation for token storage

### Real-time Communication
- **Socket.IO**: WebSocket implementation for real-time features
- **Room Management**: Community-based message routing
- **Authentication Integration**: Token-based WebSocket authentication

### Development & Build Tools
- **Vite**: Frontend build tool with HMR and optimizations
- **TypeScript**: Type safety across the entire application
- **ESLint & Prettier**: Code quality and formatting standards
- **Drizzle Kit**: Database migration management (configured for PostgreSQL but using MongoDB)

### Monitoring & Logging
- **Pino**: Structured JSON logging for production environments
- **Development Logging**: Pretty-printed logs for development environment
- **Error Handling**: Centralized error handling with appropriate HTTP status codes

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library with consistent design patterns
- **Lucide React**: Icon library for consistent iconography