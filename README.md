# Laravel + Vue Application

[![Laravel](https://img.shields.io/badge/Laravel-11.x-red.svg)](https://laravel.com)  
[![Vue](https://img.shields.io/badge/Vue.js-3.x-42b883.svg)](https://vuejs.org)  
[![Docker](https://img.shields.io/badge/Docker-Enabled-0db7ed.svg)](https://www.docker.com/)  
[![Node](https://img.shields.io/badge/Node-22.18-green.svg)](https://nodejs.org/)  
[![Tests](https://img.shields.io/badge/Tests-Backend%20%2F%20Frontend-informational.svg)]()  

---

## Overview

This repository contains a full-stack web application built using Laravel as the backend API and Vue 3 for the frontend. The entire environment runs on Docker via Laravel Sail, including the application server and database. Vue is powered by Vite and uses Tailwind CSS, Pinia for state management, and Sanctum for authentication.

---

## Requirements

Ensure the following are installed:

- Docker Desktop  
- Composer  
- Node.js 22.18 (optional if running frontend inside Sail)  

---

## Environment Setup

### 1. Install PHP and Node Dependencies
```bash
composer install
./vendor/bin/sail npm install
```

### 2. Start the Docker Environment
```bash
./vendor/bin/sail up -d
```

### 3. Run Database Migrations
```bash
./vendor/bin/sail artisan migrate
```

User seeding is not required as the application has built-in user registration.

---

## Running the Application

### Backend (Laravel)
Laravel Sail handles all backend containers.  
To access Artisan:
```bash
./vendor/bin/sail artisan <command>
```

### Frontend (Vue)
To run the Vite development server:
```bash
./vendor/bin/sail npm run dev
```

---

## Architecture

### Backend
The Laravel backend follows a structured and maintainable architecture using the following patterns:

#### Authentication
- Uses Laravel Sanctum for session- or token-based authentication.
- Vue frontend communicates with Sanctum for login, logout, and secure data access.

#### Controllers
- Controllers remain minimal and delegate business logic to Actions.
- Form Requests handle validation and authorization.

#### Actions
- Encapsulate core business operations.
- Increase testability and maintain separation of concerns.

#### Requests
- Provide structure for validation rules.
- Ensure clean controller logic.

### Frontend

#### Vue Components
- Uses Vue 3 Composition API.
- Component-based structure for UI and logic separation.

#### State Management
- Utilizes Pinia for global stores.
- Stores handle application-level state and caching.

#### Styling
- Entire UI uses Tailwind CSS utility classes.

---

## Testing

### Backend Tests (PHPUnit)
```bash
./vendor/bin/sail artisan test
```

### Frontend Tests (Vitest)
```bash
./vendor/bin/sail npm run test
```

Both backend and frontend tests are included for comprehensive coverage.

---

## Development Notes

- Application runs entirely inside Docker for environment consistency.
- Node 22.18 is required if using local Node instead of Sail.
- Database, PHP runtime, and Node services are containerized.
- User registration is built-in, so user seeding is unnecessary.

---

## Additional Documentation

Additional sections such as API routes, deployment workflows, or architecture diagrams can be added upon request.
