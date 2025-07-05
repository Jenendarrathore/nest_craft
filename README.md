# 🚀 nest-craft

> A production-grade NestJS starter kit with clean architecture, role-based access control, JWT auth, media uploads, filtering, and reusable service patterns — built for real projects.

---

## 📦 Features

- ✅ Modular architecture (auth, users, OEMs, gallery, etc.)
- ✅ JWT authentication (access + refresh token rotation)
- ✅ Role-based access (Admin, Sub Admin, User)
- ✅ Local & S3-ready media upload support
- ✅ Advanced filtering (query params + relation population)
- ✅ DTO & entity SOP-based structure
- ✅ Centralized file structure + upload folders
- ✅ Swagger documentation with decorators
- ✅ Config service with `.env` support
- ✅ Clean, extensible base controller/service
- ✅ Soft delete, timestamps, pagination
- ✅ Consistent response wrappers

---

## 🧱 Tech Stack

- **NestJS** (Backend framework)
- **TypeORM** (ORM)
- **PostgreSQL** (Default DB)
- **JWT + Passport** (Auth)
- **Multer / AWS SDK** (Media handling)
- **class-validator / class-transformer**
- **Swagger** (API docs)

---


---
## 📁 Project Structure



## 🧪 Setup Instructions

### 1. 🚧 Bootstrap Project

npm install -g @nestjs/cli
nest new nest-craft

### 2. 🚧 Install Dependecies

npm install @nestjs/config @nestjs/jwt @nestjs/swagger passport passport-jwt bcrypt class-validator class-transformer
npm install typeorm @nestjs/typeorm pg

### 3. 🚧 Configured main.ts
with ConfigService
with ValidationPipe 


### 4. Add ConfigModule in Import in app.module.ts
To Serve variables from env across modules

### 5. Install TypeORM  
npm install typeorm @nestjs/typeorm pg

### 6. Import TYPEORM Module in app.module.ts  
To Establish DB conectivity 

### 7.🧪 DB Setup Instructions
 
#### 1. Login to PG Cli
sudo -u postgres psql

#### 2. Create Role with password
CREATE ROLE admin LOGIN PASSWORD 'Admin3214;

#### 3. Create DB and assign owner 
CREATE DATABASE nest_craft WITH OWNER = admin

### 8.🧪 Install Swagger to document all Apis and setup



#### 1. Install Package
npm install --save @nestjs/swagger swagger-ui-express

#### 2. Setup Swagger in main.ts
const config = new DocumentBuilder()
  .addBearerAuth({
    description: 'JWT Token',
    name: 'Authorization',
    bearerFormat: 'JWT',
    scheme: 'bearer',
    type: 'http',
    in: 'header',
  }, 'jwt')
  .build();

  Use @ApiBearerAuth('jwt') in controllers.

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('/api', app, document)


### 9. Generate users module
nest g module users
nest g service users
nest g controller users

output - creating files 
src/
└── users/
    ├── users.module.ts
    ├── users.service.ts
    ├── users.controller.ts

### 10. Generate auth module
nest g module auth
nest g service auth
nest g controller auth

output - creating files 
src/
└── auth/
    ├── auth.module.ts
    ├── auth.service.ts
    ├── auth.controller.ts


### 11. Create Controllers , services , entites ,dtos folder for every module 
src/users/controllers/users.controller.ts
src/users/services/users.service.ts
src/users/entities/users.entity.ts


### 12. Create Role Entity, Service, Controller

### 13. JWT Authentication  refer the jwt-implementation.md 

### 14. Authentication Flow refer the MD autherization-flow.md
