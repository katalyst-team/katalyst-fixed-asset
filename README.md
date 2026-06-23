# Fixed Asset Frontend (katalyst-fixed-asset)

Welcome to the Fixed Asset Frontend project! This document provides a comprehensive guide to understanding, running, and contributing to the project. It's designed to be clear and easy to follow, especially for new team members and interns.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Architecture & Design Patterns](#architecture--design-patterns)
  - [Feature-Based Architecture](#feature-based-architecture)
  - [Context Provider Pattern](#context-provider-pattern)
  - [Component Patterns](#component-patterns)
  - [Service Layer Pattern](#service-layer-pattern)
- [Core Concepts](#core-concepts)
  - [Routing](#routing)
  - [API Communication](#api-communication)
  - [State Management](#state-management)
  - [Authentication](#authentication)
  - [Internationalization](#internationalization)
  - [Styling](#styling)
  - [Forms and Validation](#forms-and-validation)
- [Module Structure](#module-structure)
- [Features](#features)
- [Coding Guidelines](#coding-guidelines)
- [Troubleshooting](#troubleshooting)
- [Learn More](#learn-more)
- [Deploy on Vercel](#deploy-on-vercel)
- [Environment-Based Configuration](#environment-based-configuration)
- [QZ Tray Integration (PrintModalV5)](#qz-tray-integration-printmodalv5)

## Overview

This application serves as the user interface for a comprehensive fixed asset management system. It allows users to manage asset data, track asset movements, handle inbound/outbound operations, manage SKUs, categories, brands, colors, sizes, and perform various asset-related tasks. The application is built using modern web technologies with a focus on performance, developer experience, maintainability, and scalability.

**Key Features:**

 - Multi-language support (English/Indonesian)
 - Real-time asset tracking
 - EPC/RFID integration
 - Asset audit capabilities
 - Barcode/QR code printing
 - Role-based access control
 - Responsive design for mobile and desktop

## Getting Started

Follow these steps to get the project running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js:** (Version specified in `.nvmrc` or latest LTS recommended) - JavaScript runtime environment.
- **Package Manager:** [bun](https://bun.sh/) (required — do not use npm/yarn/pnpm)

### Installation

1.  **Clone the repository:**
     ```bash
     git clone <repository-url>
     cd katalyst-fixed-asset
     ```
2.  **Install dependencies:** Choose the command corresponding to your package manager:

    ```bash
    # Using bun
    bun install
    ```

    This command downloads and installs all the necessary libraries defined in `package.json`.

### Running the Development Server

1.  **Start the server:**

    ```bash
    bun dev
    ```

    Turbopack is enabled by default in the dev script.

2.  **Access the application:**
    Open your web browser and navigate to [http://localhost:7331](http://localhost:7331).

The application will automatically reload if you make changes to the code. You can start exploring the application and editing files, for example, `src/pages/index.tsx` corresponds to the home page.

## Technology Stack

This project utilizes the following technologies:

- **Framework:** [Next.js](https://nextjs.org) (Pages Router with ISR)
  - _Why:_ Provides server-side rendering (SSR), static site generation (SSG), Incremental Static Regeneration (ISR), file-based routing, API routes, and optimizations for a performant React application.
- **Language:** [TypeScript](https://www.typescriptlang.org/)
  - _Why:_ Adds static typing to JavaScript, improving code quality, maintainability, and catching errors during development.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
  - _Why:_ A utility-first CSS framework that allows for rapid UI development directly in your markup without writing custom CSS.
- **UI Components:** [Radix UI](https://www.radix-ui.com/) (Headless Components) & Custom Components (`src/components`)
  - _Why:_ Radix provides unstyled, accessible UI primitives (like dropdowns, dialogs) that we can style with Tailwind. Custom components ensure consistency and reusability.
- **State Management:** [React Query (TanStack Query)](https://tanstack.com/query/latest) + Context API
  - _Why:_ React Query simplifies server state management, caching, and synchronization. Context API handles feature-specific client state through custom providers.
- **Internationalization:** [next-i18next](https://github.com/i18next/next-i18next)
  - _Why:_ Provides comprehensive internationalization support for Next.js applications with namespace-based translations.
- **Form Management:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
  - _Why:_ React Hook Form provides performant form handling with minimal re-renders. Zod enables type-safe schema validation.
- **API Communication:** `fetch` API (likely wrapped in service functions)
  - _Why:_ Standard browser API for making network requests. Service functions encapsulate API logic.
- **Authentication:** Cookies (using [`cookies-next`](https://github.com/andreizanik/cookies-next))
  - _Why:_ Securely stores authentication tokens (like JWTs) in browser cookies for session management. `cookies-next` provides convenient helpers for Next.js.
- **Form Handling:** [React Hook Form](https://react-hook-form.com/)
  - _Why:_ Performant, flexible, and easy-to-use library for managing form state and validation.
- **Schema Validation:** [Zod](https://zod.dev/)
  - _Why:_ TypeScript-first schema declaration and validation library. Used with React Hook Form to validate form data and can also be used for validating API responses.

## Project Structure

The codebase is organized into the following main directories within `src/`:

```
katalyst-fixed-asset/
├── public/             # Static assets (images, fonts)
├── src/
│   ├── components/     # Shared UI components used across multiple features
│   ├── context/        # React Context providers (if any, besides React Query)
│   ├── hooks/
│   │   └── api/        # Custom React Query hooks wrapping service calls
│   ├── lib/            # Utility functions, constants, configurations specific to libraries
│   ├── middleware.ts   # Next.js middleware for request processing (e.g., auth checks)
│   ├── modules/        # Feature-specific code (components, logic hooks, pages)
│   │   ├── auth/       # Authentication modules (SignIn, SignUp, etc.)
│   │   └── dashboard/  # Dashboard feature modules
│   │       ├── category/     # Category management
│   │       ├── sku/          # SKU management
│   │       ├── inventory/    # Inventory tracking
│   │       ├── ledger/       # Ledger operations
│   │       ├── epc/          # EPC/RFID management
│   │       └── [other-features]/
│   ├── pages/          # Next.js page routes and API routes
│   │   ├── api/        # Backend API endpoints provided by the Next.js server
│   │   └── ...         # Frontend page components (file-based routing)
│   ├── services/       # Functions for interacting with backend APIs
│   ├── styles/         # Global styles and Tailwind configuration base
│   ├── types/          # TypeScript type definitions and interfaces
│   └── utils/          # General utility functions used across the application
├── .env.local          # Local environment variables (DO NOT COMMIT)
├── .eslintrc.json      # ESLint configuration (code linting)
├── next.config.js      # Next.js configuration
├── package.json        # Project metadata and dependencies
├── postcss.config.js   # PostCSS configuration (used by Tailwind)
├── tailwind.config.ts  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript compiler configuration
```

- **`src/components/`**: Contains reusable UI components like buttons, inputs, modals, etc., that are not specific to any single feature.
- **`src/context/`**: Holds React Context providers for managing global state, if needed beyond React Query.
- **`src/hooks/api/`**: Central location for custom hooks built on top of React Query. These hooks abstract the data fetching logic (e.g., `useGetProducts`, `useCreateUser`).
- **`src/lib/`**: Often used for library-specific configurations or helper functions (e.g., configuring Axios, date formatting libraries).
- **`src/middleware.ts`**: Handles requests before they reach a page or API route. Useful for authentication checks, redirects, or modifying headers.
- **`src/modules/`**: Organizes code by feature or domain (e.g., `products`, `orders`, `authentication`). Each module can contain its own specific components, hooks (`use{ModuleName}`), and sometimes pages.
- **`src/pages/`**: Defines the application's routes.
  - Files directly under `pages` (like `index.tsx`, `about.tsx`) become browser routes (`/`, `/about`).
  - The `pages/api/` directory defines serverless API endpoints accessible under `/api/*`.
- **`src/services/`**: Contains functions responsible for making API calls to the backend. They handle the actual `fetch` requests, headers, and base URLs.
- **`src/styles/`**: Includes global CSS files and potentially base configurations for Tailwind.
- **`src/types/`**: Stores shared TypeScript interfaces and type definitions (e.g., `User`, `Product`, `ApiResponse`).
- **`src/utils/`**: Contains general helper functions that can be used anywhere in the application (e.g., string manipulation, data formatting, organization-based feature flags).

## Architecture & Design Patterns

### Feature-Based Architecture

The application follows a feature-based architecture where each major feature is organized into its own module:

```
src/modules/dashboard/[feature]/
├── [Feature].tsx           # Main component
├── [Feature]Header.tsx     # Header component
├── [Feature]Item.tsx       # Item component
├── [Feature]Filter.tsx     # Filter component (if applicable)
├── [Feature]Modal*.tsx     # Modal components
├── use[Feature].tsx        # Custom hook with Context Provider
├── components/             # Feature-specific components
├── hooks/                  # Feature-specific hooks
├── schemas/                # Zod schemas for validation
└── index.ts               # Export barrel
```

### Context Provider Pattern

Each feature module implements a consistent Context Provider pattern:

```typescript
// Feature context definition
interface FeatureContextType {
  data: FeatureItemType[];
  filters: FeatureFilterOptions;
  isLoading: boolean;
  currentPage: number;
  totalItems: number;
  // ... other state and methods
}

// Provider component
export const FeatureProvider: React.FC<FeatureProviderProps> = ({ children }) => {
  // State management logic
  return (
    <FeatureContext.Provider value={contextValue}>
      {children}
    </FeatureContext.Provider>
  );
};

// Custom hook for consuming context
export const useFeature = (): FeatureContextType => {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeature must be used within a FeatureProvider');
  }
  return context;
};
```

### Component Patterns

- **Wrapper Components**: Main feature components are wrapped with their providers
- **Composition**: Components are composed of smaller, reusable pieces
- **Consistent Naming**: Components follow clear naming conventions (e.g., `FeatureModalAdd`, `FeatureItem`)
- **Props Interface**: All components have well-defined TypeScript interfaces

### Service Layer Pattern

API services are organized by feature domain with consistent patterns:

```typescript
// Service function structure
export const getFeatureDataService = async ({
  filters,
  organizationId,
  ...params
}: GetFeatureDataParams): Promise<ApiResponse<FeatureResponse>> => {
  return fetcher({
    method: "GET",
    url: `/v1/organizations/${organizationId}/features`,
    params,
  });
};
```

## Core Concepts

Understanding these concepts is key to working effectively with the codebase.

### Routing

- **Pages:** Next.js uses a file-system based router located in the `src/pages` directory. `src/pages/inventory/items.tsx` maps to the `/inventory/items` URL path. Dynamic routes are created using brackets, e.g., `src/pages/products/[id].tsx`.
- **API Routes:** Files inside `src/pages/api` define serverless API endpoints. For example, `src/pages/api/users.ts` creates an endpoint at `/api/users`. These are used for backend tasks or proxying requests.

### API Communication

- **Services (`src/services/`):** Functions here encapsulate the logic for calling specific backend API endpoints. They handle constructing the request (URL, method, body, headers) and often process the response or handle errors.
- **React Query (`src/hooks/api/`):** We use React Query to manage the lifecycle of API data: fetching, caching, background updates, and mutations (Create, Update, Delete). Custom hooks in `src/hooks/api/` wrap service functions, making them easy to use in components while handling loading states, errors, and caching automatically.

### State Management

The application uses a multi-layered state management approach:

- **Server State:** Managed by React Query for all API data fetching, caching, and synchronization.
- **Feature State:** Each feature module uses React Context for local state management (filters, pagination, etc.).
- **Global State:** User context, theme, and other global state managed through React Context.
- **Local State:** Component-specific state using React's built-in hooks (`useState`, `useReducer`).

### Authentication

- **Implementation:** JWT-based authentication with user context management.
- **Token Management:** Stored securely and managed through the user context.
- **Protected Routes:** Middleware handles authentication checks for protected pages.

### Internationalization

- **Framework:** next-i18next for comprehensive i18n support
- **Languages:** English (en) and Indonesian (id)
- **Structure:** Namespace-based translations organized by feature:
  ```
  public/locales/
  ├── en/
  │   ├── common.json
  │   ├── category.json
  │   ├── sku.json
  │   └── [feature].json
  └── id/
      ├── common.json
      ├── category.json
      ├── sku.json
      └── [feature].json
  ```

### Styling

- **Approach:** Utility-first with Tailwind CSS for rapid development.
- **Components:** Styled components using Tailwind utility classes.
- **Design System:** Consistent spacing, colors, and typography through Tailwind configuration.
- **Global Styles:** `src/styles/globals.css` for base styles that cannot be achieved with utility classes.

### Forms and Validation

- **React Hook Form:** Manages form state, handles submissions, and integrates with validation.
- **Zod:** Schema validation library for type-safe form validation.
- **Integration:** React Hook Form + Zod for performant, type-safe forms.
- **Error Handling:** Consistent error display and user feedback.

## Module Structure

Each feature module follows a consistent structure pattern:

### Authentication Modules (`src/modules/auth/`)

- **SignIn/SignUp:** User authentication components
- **Password Reset:** Password recovery functionality
- **Email Verification:** Account verification workflows

### Dashboard Modules (`src/modules/dashboard/`)

- **Category Management:** Categories, brands, colors, sizes with subcategory support
- **SKU Management:** Product variants with attribute collections
- **Fixed Asset Tracking:** Asset levels and item management
- **Ledger Operations:** Inbound/outbound transactions
- **EPC/RFID Management:** Electronic Product Code tracking
- **Asset Audit:** Asset verification and auditing
- **Store Management:** Multi-location support
- **Employee Management:** User and role management
- **API Key Management:** Service authentication

## Features

The application includes the following key features:

- **Authentication:** Complete user lifecycle (sign-in, sign-up, password reset, email verification)
- **Multi-language Support:** English and Indonesian with namespace-based translations
- **Fixed Asset Management:** Comprehensive CRUD operations for fixed asset items
- **Category Management:** Hierarchical organization with categories, brands, colors, sizes
- **SKU Management:** Advanced product variant management with attributes
- **Asset Tracking:** Real-time asset levels, movements, and audit capabilities
- **EPC/RFID Integration:** Electronic Product Code tracking and management
- **Ledger Operations:** Inbound/outbound transaction management
- **Nagatech Sync:** Real-time asset synchronization with organization-based access control
- **Store Management:** Multi-location asset management
- **Barcode/QR Printing:** QZ Tray integration for direct printer communication
- **Responsive Design:** Mobile-first approach with desktop optimization

## Coding Guidelines

Adhering to these guidelines ensures code consistency, readability, and maintainability.

- **Directory Structure:**

  - Service API functions: `src/services/[domain]/`
  - Feature-specific logic/components: `src/modules/[domain]/[feature]/`
  - TypeScript types: `src/types/[domain].ts`
  - React Query hooks: `src/hooks/api/[domain]/`
  - Shared UI components: `src/components/`
  - Translations: `public/locales/[lang]/[namespace].json`

- **Naming Conventions:**

  - React components: `PascalCase` (e.g., `CategoryItem`, `SkuModalAdd`)
  - Hooks: `camelCase` with `use` prefix (e.g., `useCategory`, `useSkuFilters`)
  - Context providers: `[Feature]Provider` (e.g., `CategoryProvider`, `EpcProvider`)
  - Service functions: `[action][Domain]Service` (e.g., `getCategoryDataService`)
  - Types: `[Domain][Type]Type` (e.g., `CategoryItemType`, `SkuFilterOptions`)
  - Translation keys: `[namespace].[section].[key]` (e.g., `category.modal.create.title`)

- **Module Structure:**

  - Each feature module should have its own provider and hook
  - Export components through `index.ts` barrel files
  - Keep related functionality together within modules
  - Use consistent file naming patterns across modules

- **Component Design:**

  - **Props:**
    - Sort props alphabetically for readability
    - If a component accepts only one prop, keep the definition on a single line
    - Prefix callback props with `on` (e.g., `onApplyFilters`, `onSubmit`)
    - Use TypeScript interfaces for all prop definitions
  - **Functions:**
    - Define event handlers inside the component using `const handleEventName = () => {}`
    - Use `useCallback` for event handlers passed as props to prevent unnecessary re-renders
    - Prefer async/await over promise chains for better readability
  - **Imports:**
    - Group imports logically: React imports, third-party libraries, internal modules
    - Use absolute imports with path aliases (e.g., `@/components/Button`)
    - Follow the established import order in existing files
  - **Styling:**
    - Use the `className` prop for applying Tailwind classes
    - Follow consistent spacing and responsive design patterns
    - Use semantic HTML elements where appropriate

- **Context and State Management:**

  - Each feature should have its own context provider
  - Keep context focused on specific feature domains
  - Use React Query for all server state management
  - Implement proper error boundaries and loading states

- **Internationalization:**

  - Use translation keys consistently across components
  - Organize translations by feature namespace
  - Always use `useTranslation` hook for text content
  - Test both supported languages (English and Indonesian)

- **Data Structures:**

  - Define constants like select options outside component rendering logic
  - Use TypeScript interfaces for all data structures
  - Keep type definitions organized by domain in `src/types/`

- **File Size:**

  - Aim to keep individual file sizes manageable (guideline: under 500 lines)
  - Break down complex components into smaller, reusable pieces
  - Use composition over large monolithic components

- **Performance:**
  - Avoid inline functions in props if they cause unnecessary re-renders
  - Use `React.memo` for components that re-render often with the same props
  - Implement proper pagination for large data sets
  - Use React Query's caching effectively

## Troubleshooting

- **Common Issues:** (Add common setup or runtime issues interns might face)
  - _Dependency conflicts:_ Try deleting `node_modules` and `bun.lockb` and reinstalling (`bun install`).
  - _API Errors (401 Unauthorized):_ Ensure you are logged in. Check if the backend server is running and accessible. Check browser console for specific error messages.
  - _Tailwind classes not applying:_ Ensure Tailwind setup is correct (`tailwind.config.ts`, `postcss.config.js`, global CSS import). Restart the dev server.

## Learn More

To learn more about the core technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn-pages-router)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs/)
- [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [React Hook Form Documentation](https://react-hook-form.com/get-started)
- [Zod Documentation](https://zod.dev/)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives/overview/introduction)

You can also check out [the Next.js GitHub repository](https://github.com/vercel/next.js).

## Deploy on Vercel

The easiest way to deploy this Next.js app is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Refer to the [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for detailed instructions.

## Environment-Based Configuration

The application uses `NEXT_PUBLIC_ENV` for environment-based feature flags:

- `"development"` - Local development and staging
- `"production"` - Production environment

### Organization-Based Features

Some features are restricted to specific organization IDs based on the environment. See `src/utils/nagatechSync.ts` for an example implementation pattern.

## QZ Tray Integration (PrintModalV5)

This application now supports QZ Tray for direct printer communication. The new implementation includes:

### Features

1. **Direct Printer Connection**: Connect directly to printers without browser restrictions
2. **Printer Discovery**: Automatically discover and list available printers
3. **Raw ZPL Printing**: Send raw ZPL commands directly to Zebra and compatible printers
4. **Template Processing**: Continue using TLJ templates with QZ Tray output

### Setup Requirements

1. **Install QZ Tray**: Download and install QZ Tray from [https://qz.io/download/](https://qz.io/download/)
2. **Start QZ Tray**: Make sure QZ Tray is running on the client machine
3. **Browser Security**: QZ Tray handles the security certificates automatically

### Usage

1. Open the print modal (PrintModalV5)
2. Click "Connect" to establish connection with QZ Tray
3. Select your printer from the dropdown list
4. Load your TLJ template file
5. Configure field mappings
6. Set print count if needed
7. Click "Print" to send ZPL commands to the printer

### Files Modified

- `src/hooks/usePrintV5.ts` - Hook with QZ Tray integration
- `src/modules/dashboard/ledger/PrintModalV5.tsx` - Updated UI with printer selection
- `src/pages/_document.tsx` - Added QZ Tray script reference
- `public/js/qz-tray.js` - QZ Tray client library

### API Flow

1. Template processing via ThermalLabel API (unchanged)
2. ZPL generation from TLJ template (unchanged)
3. Direct ZPL printing via QZ Tray (new)
4. Ledger item updates with EPC values (unchanged).

---

_This README aims to be a living document. Please update it as the project evolves._

`
