
# 🧠 NestCraft Filtering Structure (BaseHelperService)

This document outlines the structure of dynamic filtering used in NestCraft. The system supports flexible, nested filtering logic with support for `AND`/`OR`, operators, and type-safe values.

---

## ✅ Filter Structure Overview

The filter object is structured as a combination of `$and` and `$or` conditions.

### Basic Format:
```ts
{
  $and?: FilterCondition[];
  $or?: FilterCondition[];
}
```

Each `FilterCondition` is a key-value mapping of the field to a filtering expression.

---

## 🏗️ Example Filter Object

```ts
const filters = {
  $and:[{
    
  $and: [
    {
      "status": { $eq: "active" }
    },
    {
      "created_at": { $gte: "2024-01-01", $lte: "2024-12-31" }
    },
    {
      "user.role": { $in: ["admin", "editor"] }
    }
  ],
  $or: [
    {
      "title": { $ilike: "%report%" }
    },
    {
      "description": { $ilike: "%summary%" }
    }
  ]
  }]
};
```

# Note  The filter should be wrapred in either $and ,$or at the top level  
```
filters: {
        $and: [{
          name: { $containsi: 'john' },
          $or: [
            { age: { $lt: 25 } },
            { isActive: { $eq: true } },
          ],
          $and: [
            { status: { $in: ['active', 'draft'] } },
            { bio: { $notContainsi: 'retired' } },
          ],
          createdAt: { $between: ['2023-01-01', '2026-01-01'] },
        }]
      },
```

---

## 🧩 Supported Operators

| Operator   | Description                   | Example                              |
| ---------- | ----------------------------- | ------------------------------------ |
| `$eq`      | Equal to                      | `{ status: { $eq: "active" } }`      |
| `$ne`      | Not equal to                  | `{ age: { $ne: 30 } }`               |
| `$in`      | Value is in list              | `{ role: { $in: ["admin"] } }`       |
| `$nin`     | Value is not in list          | `{ tag: { $nin: ["archived"] }}`     |
| `$gte`     | Greater than or equal to      | `{ age: { $gte: 18 } }`              |
| `$lte`     | Less than or equal to         | `{ price: { $lte: 100 } }`           |
| `$gt`      | Greater than                  | `{ age: { $gt: 18 } }`               |
| `$lt`      | Less than                     | `{ age: { $lt: 60 } }`               |
| `$ilike`   | Case-insensitive like (ILIKE) | `{ name: { $ilike: "%john%" } }`     |
| `$null`    | Check for NULL                | `{ deleted_at: { $null: true } }`    |
| `$notNull` | Check for NOT NULL            | `{ deleted_at: { $notNull: true } }` |

---

## 🔀 Combining Filters

You can nest conditions using `$and` and `$or` for complex logic.

```ts
const filter = {
  $and: [
    {
      $or: [
        { "user.name": { $ilike: "%john%" } },
        { "user.email": { $ilike: "%@company.com" } }
      ]
    },
    {
      "is_active": { $eq: true }
    }
  ]
};
```

---

## 🧪 TypeScript Types

```ts
type PrimitiveValue = string | number | boolean | null;

type FieldCondition = {
  $eq?: PrimitiveValue;
  $ne?: PrimitiveValue;
  $in?: PrimitiveValue[];
  $nin?: PrimitiveValue[];
  $gte?: PrimitiveValue;
  $lte?: PrimitiveValue;
  $gt?: PrimitiveValue;
  $lt?: PrimitiveValue;
  $ilike?: string;
  $null?: boolean;
  $notNull?: boolean;
};

type FilterCondition = {
  [field: string]: FieldCondition;
};

type Filter = {
  $and?: (Filter | FilterCondition)[];
  $or?: (Filter | FilterCondition)[];
};
```

---

## 🛠️ Usage Example

### API Endpoint:
```http
GET /documents?filters=<base64-encoded-json>
```

### Transformed Filter:
```ts
{
  $and: [
    { "document_type": { $eq: "Letter" } },
    { "created_at": { $gte: "2024-01-01", $lte: "2024-06-30" } }
  ]
}
```

---

## 📝 Notes

- Field names can be nested like `"metadata.properties.language"` or `"user.role"`.
- Transform filters client-side before sending to server.
- On server, use `BaseHelperService.applyFilterQuery()` to convert the structure into a SQLAlchemy or Prisma query.

---

## 📚 Related

- `BasicFilterQueryDto`
- `BaseHelperService`
- `buildQueryFromFilters()` (frontend utility)
