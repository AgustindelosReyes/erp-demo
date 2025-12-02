# ERP Demo - Docker Setup

This project contains a complete Docker setup for an ERP system with Laravel backend and Next.js frontend.

## Services

- **Laravel Backend** (Port 8000): API server with PHP 8.2 and Laravel 12
- **Next.js Frontend** (Port 3000): React-based frontend with TypeScript
- **MySQL Database** (Port 3306): Database server
- **phpMyAdmin** (Port 8080): Database management interface
- **Nginx** (Port 80): Web server for Laravel

## Prerequisites

- Docker
- Docker Compose

## Setup Instructions

1. **Clone or navigate to the project directory**

2. **Build and start the containers:**
   ```bash
   docker-compose up --build
   ```

3. **Generate Laravel application key:**
   ```bash
   docker-compose exec app php artisan key:generate
   ```

4. **Run database migrations:**
   ```bash
   docker-compose exec app php artisan migrate
   ```

5. **Seed the database (optional):**
   ```bash
   docker-compose exec app php artisan db:seed
   ```

## Access the Application

- **Laravel API**: http://localhost:8000
- **Next.js Frontend**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8080
  - Username: `erp_user`
  - Password: `erp_password`
  - Database: `erp_demo`

## Useful Commands

- **Start containers:** `docker-compose up -d`
- **Stop containers:** `docker-compose down`
- **View logs:** `docker-compose logs -f [service_name]`
- **Execute commands in containers:**
  - Laravel: `docker-compose exec app [command]`
  - Frontend: `docker-compose exec web [command]`
- **Rebuild containers:** `docker-compose up --build --force-recreate`

## Environment Configuration

The `.env` file contains all necessary environment variables. Key settings:

- Database: MySQL with host `db`
- Frontend URL: http://localhost:3000
- API URL: http://localhost:8000

## Development

- Laravel backend code is in `./backend/`
- Next.js frontend code is in `./frontend/`
- Changes to source code will be reflected due to volume mounts

## Troubleshooting

- If containers fail to start, check Docker and Docker Compose versions
- Ensure ports 3000, 8000, 8080, and 3306 are not in use
- For database connection issues, verify the `.env` configuration matches docker-compose settings