 ✅ Features Implemented
#### 🔐 Authentication
Signup with default role assignment (IAM_DEFAULT_ROLE)

Login with hashed password validation

Access/Refresh Tokens using JWT with configurable expiry

Refresh Token Rotation with DB-level storage and invalidation

Logout functionality with token invalidation(vai db)

Global JWT Authentication Guard using @Public() decorator to allow unauthenticated access where required

#### 🔁 Token Management
Access and refresh tokens are signed with separate secrets

Rotation-based refresh strategy implemented

Token secrets and expiry are configurable in .env

#### 🧑‍💼 RBAC (Role-Based Access Control)
User can have multiple roles

@Roles() decorator to restrict route access

Roles and permissions are stored in DB and fetched during guard execution

ActiveUser decorator available for fetching logged-in user from request

#### 🔐 Forgot Password (OTP-Based)
Generates and stores time-limited OTP

Generic response to avoid user enumeration

OTP verification issues a short-lived JWT token for secure password reset

Password reset via token flow


#### 🔑 Authentication Flow
Signup
Validates for duplicate email/username

Fetches default role from config

Hashes password

Stores new user with default role

#### Login
Verifies user by email or username

Compares password

Issues access and refresh token

Stores hashed refresh token in DB

#### Refresh Token
Verifies and decodes refresh token

Compares against hashed token stored in DB

If valid, rotates token and updates DB

#### Logout
Clears hashed refresh token from DB


