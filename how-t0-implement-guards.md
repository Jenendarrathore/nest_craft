# 🛡️ Authentication & Authorization Setup in NestJS Base Project

This document explains the purpose and usage of the following key components in the authentication and authorization system:

- `JwtStrategy`
- `AuthenticationGuard`
- `RolesGuard`
- Decorators: `@Public()` and `@Roles()`

---

## ✅ 1. JwtStrategy

### 🔹 Purpose
- Extracts and verifies the JWT token from the `Authorization` header.
- Validates the token and attaches the decoded payload to `request.user`.

### 🔹 Implementation
```ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    return payload; // Available as request.user
  }
}
```

### 🔹 Where to Register
In `AuthModule`:
```ts
imports: [
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.registerAsync({ ... })
],
providers: [JwtStrategy]
```

---

## ✅ 2. AuthenticationGuard

### 🔹 Purpose
- Validates incoming requests using JWT (via `JwtStrategy`).
- Allows bypassing auth using `@Public()` decorator.

### 🔹 Implementation
```ts
@Injectable()
export class AuthenticationGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    return isPublic ? true : super.canActivate(context);
  }
}
```

### 🔹 Where to Register
#### Option 1: Globally in `main.ts`
```ts
app.useGlobalGuards(app.get(AuthenticationGuard));
```

#### Option 2: Globally via `AppModule`
```ts
providers: [
  {
    provide: APP_GUARD,
    useClass: AuthenticationGuard,
  },
],
```

---

## ✅ 3. RolesGuard

### 🔹 Purpose
- Restricts route access based on user roles.
- Works with `@Roles()` decorator.

### 🔹 Implementation
```ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user?.roles?.includes(role));
  }
}
```

### 🔹 Where to Register
#### Globally via `AppModule`:
```ts
providers: [
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
],
```

#### Or use per-route:
```ts
@UseGuards(RolesGuard)
@Roles('admin')
@Get('admin-data')
findAll() {}
```

---

## ✅ 4. Custom Decorators

### 🟡 `@Public()`
Marks a route or controller as public (no authentication required).

```ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Usage:
```ts
@Public()
@Get('health')
checkHealth() {}
```

---

### 🟡 `@Roles(...roles)`
Defines required roles for route access.

```ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

Usage:
```ts
@Roles('admin')
@Get('users')
getUsers() {}
```

---

## 📁 Recommended Folder Structure

```
src/
│
├── auth/
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   ├── auth.service.ts
│
├── common/
│   ├── decorators/
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts
│   ├── guards/
│   │   ├── authentication.guard.ts
│   │   └── roles.guard.ts
```

---

## 🧠 Summary

| Component              | Purpose                                               | Where to Use                                 |
|------------------------|-------------------------------------------------------|-----------------------------------------------|
| `JwtStrategy`          | Verifies JWT and extracts user info                  | Registered in `AuthModule`                    |
| `AuthenticationGuard` | Protects routes globally or selectively              | Global guard in `main.ts` or `AppModule`      |
| `RolesGuard`           | Restricts access by user role                        | Global or per-route using `@Roles()`          |
| `@Public()`            | Marks a route as public                              | On routes that should skip authentication     |
| `@Roles()`             | Specifies required roles for a route                 | On controllers or individual route handlers   |

---# 🛡️ Authentication & Authorization Setup in NestJS Base Project

This document explains the purpose and usage of the following key components in the authentication and authorization system:

- `JwtStrategy`
- `AuthenticationGuard`
- `RolesGuard`
- Decorators: `@Public()` and `@Roles()`

---

## ✅ 1. JwtStrategy

### 🔹 Purpose
- Extracts and verifies the JWT token from the `Authorization` header.
- Validates the token and attaches the decoded payload to `request.user`.

### 🔹 Implementation
```ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    return payload; // Available as request.user
  }
}
```

### 🔹 Where to Register
In `AuthModule`:
```ts
imports: [
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.registerAsync({ ... })
],
providers: [JwtStrategy]
```

---

## ✅ 2. AuthenticationGuard

### 🔹 Purpose
- Validates incoming requests using JWT (via `JwtStrategy`).
- Allows bypassing auth using `@Public()` decorator.

### 🔹 Implementation
```ts
@Injectable()
export class AuthenticationGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    return isPublic ? true : super.canActivate(context);
  }
}
```

### 🔹 Where to Register
#### Option 1: Globally in `main.ts`
```ts
app.useGlobalGuards(app.get(AuthenticationGuard));
```

#### Option 2: Globally via `AppModule`
```ts
providers: [
  {
    provide: APP_GUARD,
    useClass: AuthenticationGuard,
  },
],
```

---

## ✅ 3. RolesGuard

### 🔹 Purpose
- Restricts route access based on user roles.
- Works with `@Roles()` decorator.

### 🔹 Implementation
```ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user?.roles?.includes(role));
  }
}
```

### 🔹 Where to Register
#### Globally via `AppModule`:
```ts
providers: [
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
],
```

#### Or use per-route:
```ts
@UseGuards(RolesGuard)
@Roles('admin')
@Get('admin-data')
findAll() {}
```

---

## ✅ 4. Custom Decorators

### 🟡 `@Public()`
Marks a route or controller as public (no authentication required).

```ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Usage:
```ts
@Public()
@Get('health')
checkHealth() {}
```

---

### 🟡 `@Roles(...roles)`
Defines required roles for route access.

```ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

Usage:
```ts
@Roles('admin')
@Get('users')
getUsers() {}
```

---

## 📁 Recommended Folder Structure

```
src/
│
├── auth/
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   ├── auth.service.ts
│
├── common/
│   ├── decorators/
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts
│   ├── guards/
│   │   ├── authentication.guard.ts
│   │   └── roles.guard.ts
```

---

## 🧠 Summary

| Component              | Purpose                                               | Where to Use                                 |
|------------------------|-------------------------------------------------------|-----------------------------------------------|
| `JwtStrategy`          | Verifies JWT and extracts user info                  | Registered in `AuthModule`                    |
| `AuthenticationGuard` | Protects routes globally or selectively              | Global guard in `main.ts` or `AppModule`      |
| `RolesGuard`           | Restricts access by user role                        | Global or per-route using `@Roles()`          |
| `@Public()`            | Marks a route as public                              | On routes that should skip authentication     |
| `@Roles()`             | Specifies required roles for a route                 | On controllers or individual route handlers   |

---# 🛡️ Authentication & Authorization Setup in NestJS Base Project

This document explains the purpose and usage of the following key components in the authentication and authorization system:

- `JwtStrategy`
- `AuthenticationGuard`
- `RolesGuard`
- Decorators: `@Public()` and `@Roles()`

---

## ✅ 1. JwtStrategy

### 🔹 Purpose
- Extracts and verifies the JWT token from the `Authorization` header.
- Validates the token and attaches the decoded payload to `request.user`.

### 🔹 Implementation
```ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    return payload; // Available as request.user
  }
}
```

### 🔹 Where to Register
In `AuthModule`:
```ts
imports: [
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.registerAsync({ ... })
],
providers: [JwtStrategy]
```

---

## ✅ 2. AuthenticationGuard

### 🔹 Purpose
- Validates incoming requests using JWT (via `JwtStrategy`).
- Allows bypassing auth using `@Public()` decorator.

### 🔹 Implementation
```ts
@Injectable()
export class AuthenticationGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    return isPublic ? true : super.canActivate(context);
  }
}
```

### 🔹 Where to Register
#### Option 1: Globally in `main.ts`
```ts
app.useGlobalGuards(app.get(AuthenticationGuard));
```

#### Option 2: Globally via `AppModule`
```ts
providers: [
  {
    provide: APP_GUARD,
    useClass: AuthenticationGuard,
  },
],
```

---

## ✅ 3. RolesGuard

### 🔹 Purpose
- Restricts route access based on user roles.
- Works with `@Roles()` decorator.

### 🔹 Implementation
```ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user?.roles?.includes(role));
  }
}
```

### 🔹 Where to Register
#### Globally via `AppModule`:
```ts
providers: [
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
],
```

#### Or use per-route:
```ts
@UseGuards(RolesGuard)
@Roles('admin')
@Get('admin-data')
findAll() {}
```

---

## ✅ 4. Custom Decorators

### 🟡 `@Public()`
Marks a route or controller as public (no authentication required).

```ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Usage:
```ts
@Public()
@Get('health')
checkHealth() {}
```

---

### 🟡 `@Roles(...roles)`
Defines required roles for route access.

```ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

Usage:
```ts
@Roles('admin')
@Get('users')
getUsers() {}
```

---

## 📁 Recommended Folder Structure

```
src/
│
├── auth/
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   ├── auth.service.ts
│
├── common/
│   ├── decorators/
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts
│   ├── guards/
│   │   ├── authentication.guard.ts
│   │   └── roles.guard.ts
```

---

## 🧠 Summary

| Component              | Purpose                                               | Where to Use                                 |
|------------------------|-------------------------------------------------------|-----------------------------------------------|
| `JwtStrategy`          | Verifies JWT and extracts user info                  | Registered in `AuthModule`                    |
| `AuthenticationGuard` | Protects routes globally or selectively              | Global guard in `main.ts` or `AppModule`      |
| `RolesGuard`           | Restricts access by user role                        | Global or per-route using `@Roles()`          |
| `@Public()`            | Marks a route as public                              | On routes that should skip authentication     |
| `@Roles()`             | Specifies required roles for a route                 | On controllers or individual route handlers   |

---