# 📘 `nest-craft` Query Rules — API Query Guide (Strapi-Style)

This guide explains how to query list endpoints using `nest-craft`. It follows a **Strapi-style query syntax** that is flexible, frontend-friendly, and highly composable.

---

## 🔧 Base Format

All filters must be passed as query parameters using the following pattern:

```
?filters[<field>][$<operator>]=<value>
```

If no `$<operator>` is provided, it defaults to `$eq` (equality check).

---

## ✅ Supported Features

### 1. 🔍 Filtering

#### Basic Equality

```
GET /api/users?filters[status]=active
```
Same as:
```
GET /api/users?filters[status][$eq]=active
```

#### Supported Operators

| Operator     | Description                     | Example                                 | SQL Equivalent            |
|--------------|----------------------------------|-----------------------------------------|----------------------------|
| `$eq`        | Equals                          | `filters[role][$eq]=admin`              | `role = 'admin'`           |
| `$ne`        | Not equal                       | `filters[role][$ne]=guest`              | `role != 'guest'`          |
| `$gt`        | Greater than                    | `filters[age][$gt]=18`                  | `age > 18`                 |
| `$gte`       | Greater than or equal           | `filters[age][$gte]=18`                 | `age >= 18`                |
| `$lt`        | Less than                       | `filters[price][$lt]=100`               | `price < 100`              |
| `$lte`       | Less than or equal              | `filters[price][$lte]=100`              | `price <= 100`             |
| `$like`      | Partial match (contains)        | `filters[name][$like]=john`             | `name LIKE '%john%'`       |
| `$startsWith`| Starts with                     | `filters[name][$startsWith]=Jo`         | `name LIKE 'Jo%'`          |
| `$endsWith`  | Ends with                       | `filters[name][$endsWith]=hn`           | `name LIKE '%hn'`          |
| `$in`        | Value in list                   | `filters[status][$in]=active,pending`   | `status IN (...)`          |
| `$notIn`     | Value not in list               | `filters[status][$notIn]=blocked`       | `status NOT IN (...)`      |
| `$null`      | Is null / not null              | `filters[deletedAt][$null]=true`        | `deletedAt IS NULL`        |
| `$between`   | Range between two values        | `filters[age][$between]=20,30`          | `age BETWEEN 20 AND 30`    |

---

### 2. ⚖️ Logical Operators

Use `$or` or `$and` for compound conditions.

#### `$or` Example

```
GET /api/users?filters[$or][0][status]=active&filters[$or][1][role]=editor
```

#### `$and` Example

```
GET /api/users?filters[$and][0][status]=active&filters[$and][1][role]=admin
```

---

### 3. 📄 Pagination

Use `pagination[page]` and `pagination[pageSize]`.

```
GET /api/users?pagination[page]=2&pagination[pageSize]=10
```

Defaults:
- Page: 1
- Page Size: 20

---

### 4. 🔃 Sorting

Use `sort=field:order`, where `order` is `asc` or `desc`.

#### Single Field Sort

```
GET /api/users?sort=createdAt:desc
```

#### Multi-field Sort

```
GET /api/users?sort=createdAt:desc,name:asc
```

---

### 5. 🔗 Populating Relations

Use `populate` to include related entities.

#### Single Relation

```
GET /api/users?populate=profile
```

#### Multiple Relations

```
GET /api/users?populate=profile,posts
```

#### Advanced Population

```
GET /api/users?populate[profile][fields][0]=name&populate[profile][fields][1]=email
```

---

### 6. 🧮 Selecting Fields

Limit returned fields with `fields`.

```
GET /api/users?fields[0]=id&fields[1]=name&fields[2]=email
```

---

## 🧪 Full Examples

### 1. Active users older than 30

```
GET /api/users?filters[status]=active&filters[age][$gt]=30
```

### 2. Users whose name contains 'john'

```
GET /api/users?filters[name][$like]=john
```

### 3. Users with role admin OR editor

```
GET /api/users?filters[$or][0][role][$eq]=admin&filters[$or][1][role][$eq]=editor
```

### 4. Paginated, sorted users

```
GET /api/users?pagination[page]=2&pagination[pageSize]=5&sort=createdAt:desc
```

### 5. Populate profile and select specific fields

```
GET /api/users?populate=profile&fields[0]=id&fields[1]=name
```

---

## 📌 Notes

- All values are passed as strings; the backend should cast appropriately.
- Arrays (like in `$in`) must be comma-separated.
- Logical operators can be deeply nested (backend support may vary).

---

> This query format is inspired by [Strapi's REST query language](https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication#filters), and is designed to be intuitive and scalable.