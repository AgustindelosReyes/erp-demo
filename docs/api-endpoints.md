# API Endpoints Documentation

This document provides comprehensive documentation for all API endpoints in the ERP system, following the standard defined in [API Documentation Standard](api-documentation-standard.md).

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Dashboard Endpoint](#dashboard-endpoint)
3. [Product CRUD Endpoints](#product-crud-endpoints)
4. [Movement Endpoints](#movement-endpoints)
5. [User Management Endpoints](#user-management-endpoints)

---

## Authentication Endpoints

### Login

**POST** `/api/login`

Authenticate a user and return an API token.

**Authentication**: Unauthenticated

**Request Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| email | string | Yes | The user's email address | user@example.com |
| password | string | Yes | The user's password | secret123 |

**Response Examples**:

**Success (200)**:
```json
{
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "user@example.com",
        "active": true,
        "roles": [
            {
                "name": "admin",
                "guard_name": "web"
            }
        ]
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
}
```

**Error - Invalid Credentials (401)**:
```json
{
    "message": "Credenciales inválidas"
}
```

**Error - Inactive User (403)**:
```json
{
    "message": "Usuario inactivo"
}
```

**Validation Rules**:
- email: required, valid email format
- password: required

---

### Logout

**POST** `/api/logout`

Logout the authenticated user by revoking their current API token.

**Authentication**: Required (Sanctum token)

**Request Headers**:
```
Authorization: Bearer {token}
```

**Response Examples**:

**Success (200)**:
```json
{
    "message": "Logged out successfully"
}
```

**Error - Unauthenticated (401)**:
```json
{
    "message": "Unauthenticated."
}
```

---

### Get Current User

**GET** `/api/me`

Get the currently authenticated user's information including their roles.

**Authentication**: Required (Sanctum token)

**Request Headers**:
```
Authorization: Bearer {token}
```

**Response Examples**:

**Success (200)**:
```json
{
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "active": true,
    "roles": [
        {
            "name": "admin",
            "guard_name": "web"
        }
    ]
}
```

**Error - Unauthenticated (401)**:
```json
{
    "message": "Unauthenticated."
}
```

---

## Dashboard Endpoint

### Get Dashboard Statistics

**GET** `/api/dashboard`

Get dashboard statistics including total users, products, movements, and current month sales.

**Authentication**: Required (Sanctum token)

**Request Headers**:
```
Authorization: Bearer {token}
```

**Response Examples**:

**Success (200)**:
```json
{
    "total_users": 5,
    "total_products": 150,
    "total_movements": 234,
    "total_sales_current_month": 1500.50
}
```

**Error - Unauthenticated (401)**:
```json
{
    "message": "Unauthenticated."
}
```

---

## Product CRUD Endpoints

### List Products

**GET** `/api/products`

Get a paginated list of all products.

**Authentication**: Required (Sanctum token)

**Query Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| page | integer | No | Page number for pagination | 1 |
| per_page | integer | No | Items per page (default: 15) | 20 |

**Response Examples**:

**Success (200)**:
```json
{
    "data": [
        {
            "id": 123,
            "name": "Wireless Mouse",
            "description": "High-precision wireless mouse",
            "category": "Electronics",
            "stock": 50,
            "stock_min": 10,
            "price": 29.99,
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-15T10:30:00Z"
        }
    ],
    "pagination": {
        "total": 150,
        "per_page": 15,
        "current_page": 1,
        "last_page": 10,
        "from": 1,
        "to": 15
    }
}
```

**Error - Unauthenticated (401)**:
```json
{
    "message": "Unauthenticated."
}
```

---

### Create Product

**POST** `/api/products`

Create a new product.

**Authentication**: Required (Sanctum token)

**Request Body**:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| name | string | Yes | The product name | Wireless Mouse |
| description | string | No | The product description | High-precision wireless mouse |
| category | string | No | Product category | Electronics |
| stock | integer | Yes | Stock quantity (must be >= 0) | 50 |
| stock_min | integer | Yes | Minimum stock level (must be >= 0) | 10 |
| price | number | Yes | Product price (must be >= 0) | 29.99 |

**Response Examples**:

**Success (201)**:
```json
{
    "message": "Product created successfully",
    "data": {
        "id": 123,
        "name": "Wireless Mouse",
        "description": "High-precision wireless mouse",
        "category": "Electronics",
        "stock": 50,
        "stock_min": 10,
        "price": 29.99,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
    }
}
```

**Error - Validation Failed (422)**:
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "name": ["The name field is required."],
        "price": ["The price must be greater than 0."]
    }
}
```

**Error - Unauthenticated (401)**:
```json
{
    "message": "Unauthenticated."
}
```

**Validation Rules**:
- name: required, string
- description: nullable, string
- category: nullable, string
- stock: required, integer, min:0
- stock_min: required, integer, min:0
- price: required, numeric, min:0

---

### Get Product

**GET** `/api/products/{id}`

Get a specific product by ID.

**Authentication**: Required (Sanctum token)

**Path Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| id | integer | Yes | The product ID | 123 |

**Response Examples**:

**Success (200)**:
```json
{
    "data": {
        "id": 123,
        "name": "Wireless Mouse",
        "description": "High-precision wireless mouse",
        "category": "Electronics",
        "stock": 50,
        "stock_min": 10,
        "price": 29.99,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
    }
}
```

**Error - Not Found (404)**:
```json
{
    "message": "Product not found"
}
```

**Error - Unauthenticated (401)**:
```json
{
    "message": "Unauthenticated."
}
```

---

### Update Product

**PUT** `/api/products/{id}`

Update an existing product.

**Authentication**: Required (Sanctum token)

**Path Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| id | integer | Yes | The product ID | 123 |

**Request Body** (all fields optional):

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| name | string | No | The product name | Wireless Mouse Pro |
| description | string | No | The product description | Enhanced wireless mouse |
| category | string | No | Product category | Electronics |
| stock | integer | No | Stock quantity (must be >= 0) | 75 |
| stock_min | integer | No | Minimum stock level (must be >= 0) | 15 |
| price | number | No | Product price (must be >= 0) | 39.99 |

**Response Examples**:

**Success (200)**:
```json
{
    "message": "Product updated successfully",
    "data": {
        "id": 123,
        "name": "Wireless Mouse Pro",
        "description": "Enhanced wireless mouse",
        "category": "Electronics",
        "stock": 75,
        "stock_min": 15,
        "price": 39.99,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-16T14:20:00Z"
    }
}
```

**Error - Validation Failed (422)**:
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "price": ["The price must be greater than 0."]
    }
}
```

**Error - Not Found (404)**:
```json
{
    "message": "Product not found"
}
```

**Error - Unauthenticated (401)**:
```json
{
    "message": "Unauthenticated."
}
```

**Validation Rules**:
- name: sometimes, string
- description: sometimes, nullable, string
- category: sometimes, nullable, string
- stock: sometimes, integer, min:0
- stock_min: sometimes, integer, min:0
- price: sometimes, numeric, min:0

---

### Delete Product

**DELETE** `/api/products/{id}`

Delete a product by ID.

**Authentication**: Required (Sanctum token)

**Path Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| id | integer | Yes | The product ID | 123 |

**Response Examples**:

**Success (204)**: No content

**Error - Not Found (404)**:
```json
{
    "message": "Product not found"
}
```

**Error - Unauthenticated (401)**:
```json
{
    "message": "Unauthenticated."
}
```

---

## Movement Endpoints

### Register Movement

**POST** `/api/movements`

Register a new movement (sale, entry, or stock adjustment).

**Authentication**: Required (Sanctum token)

**Request Body**:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| movement_type | string | Yes | The type of movement (venta, entrada, ajuste) | venta |
| items | array | Conditional | Array of movement items (required for venta/entrada) | [{"product_id": 1, "quantity": 2, "price": 29.99}] |
| items.*.product_id | integer | Conditional | The product ID | 1 |
| items.*.quantity | integer | Conditional | The quantity (must be >= 1) | 2 |
| items.*.price | number | Conditional | The price per unit (must be >= 0) | 29.99 |
| product_id | integer | Conditional | The product ID for adjustment (required for ajuste) | 1 |
| adjusted_stock | integer | Conditional | The adjusted stock level (must be >= 0) | 100 |

**Response Examples**:

**Success - Sale (201)**:
```json
{
    "message": "Sale movement registered successfully"
}
```

**Success - Entry (201)**:
```json
{
    "message": "Entry movement registered successfully"
}
```

**Success - Adjustment (201)**:
```json
{
    "message": "Adjustment movement registered successfully"
}
```

**Error - Insufficient Stock (400)**:
```json
{
    "message": "Insufficient stock for the following products: Wireless Mouse, Keyboard"
}
```

**Error - Validation Failed (422)**:
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "movement_type": ["The movement type field is required."],
        "items": ["The items field is required when movement type is venta."]
    }
}
```

**Error - Unauthenticated (401)**:
```json
{
    "message": "Unauthenticated."
}
```

**Validation Rules**:
- movement_type: required, in:venta,entrada,ajuste
- items: required_if:movement_type,venta|required_if:movement_type,entrada, array, min:1
- items.*.product_id: required_if:movement_type,venta|required_if:movement_type,entrada, integer, exists:products,id
- items.*.quantity: required_if:movement_type,venta|required_if:movement_type,entrada, integer, min:1
- items.*.price: required_if:movement_type,venta|required_if:movement_type,entrada, numeric, min:0
- product_id: required_if:movement_type,ajuste, integer, exists:products,id
- adjusted_stock: required_if:movement_type,ajuste, integer, min:0

---

### Sales Summary

**GET** `/api/sales/summary`

Get sales summary for a specific month and year. Optionally compare with previous month.

**Authentication**: Required (Sanctum token)

**Query Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| month | integer | Yes | The month (1-12) | 1 |
| year | integer | Yes | The year | 2024 |
| comparePrevious | boolean | No | Compare with previous month | true |

**Response Examples**:

**Success (200)**:
```json
{
    "totalSales": 1500.50,
    "totalMovements": 25,
    "previousTotalSales": 1200.00,
    "previousTotalMovements": 20,
    "salesDifference": 300.50,
    "movementsDifference": 5
}
```

**Success - Without Comparison (200)**:
```json
{
    "totalSales": 1500.50,
    "totalMovements": 25
}
```

**Error - Validation Failed (400)**:
```json
{
    "message": "Validation failed",
    "errors": {
        "month": ["The month must be between 1 and 12."],
        "year": ["The year must be at least 1900."]
    }
}
```

**Error - Unauthenticated (401)**:
```json
{
    "message": "Unauthenticated."
}
```

**Validation Rules**:
- month: required, integer, min:1, max:12
- year: required, integer, min:1900, max:(current year + 10)
- comparePrevious: sometimes, in:true,false,1,0

---

### Best Selling Products

**GET** `/api/sales/best-selling-products`

Get best selling products for the current period.

**Authentication**: Required (Sanctum token)

**Query Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| limit | integer | No | Maximum number of products to return (default: 10) | 5 |

**Response Examples**:

**Success (200)**:
```json
[
    {
        "product_id": 1,
        "product_name": "Wireless Mouse",
        "total_quantity": 150
    },
    {
        "product_id": 2,
        "product_name": "Mechanical Keyboard",
        "total_quantity": 89
    }
]
```

**Error - Validation Failed (400)**:
```json
{
    "message": "Validation failed",
    "errors": {
        "limit": ["The limit must be at least 1."]
    }
}
```

**Error - Unauthenticated (401)**:
```json
{
    "message": "Unauthenticated."
}
```

**Validation Rules**:
- limit: sometimes, integer, min:1

---

## User Management Endpoints

> **Note**: All user management endpoints require admin role.

### List Users

**GET** `/api/users`

Get a paginated list of all users with their roles.

**Authentication**: Required (Sanctum token) + Admin role

**Query Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| page | integer | No | Page number for pagination | 1 |
| per_page | integer | No | Items per page (default: 20) | 10 |

**Response Examples**:

**Success (200)**:
```json
{
    "data": [
        {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "role": "admin",
            "active": true
        },
        {
            "id": 2,
            "name": "Jane Smith",
            "email": "jane@example.com",
            "role": "user",
            "active": true
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 2,
        "per_page": 20,
        "total": 25
    }
}
```

**Error - Unauthenticated (401)**:
```json
{
    "message": "Unauthenticated."
}
```

**Error - Unauthorized (403)**:
```json
{
    "message": "This action is unauthorized."
}
```

---

### Get User

**GET** `/api/users/{user}`

Get a specific user by ID.

**Authentication**: Required (Sanctum token) + Admin role

**Path Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| user | integer | Yes | The user ID | 123 |

**Response Examples**:

**Success (200)**:
```json
{
    "data": {
        "id": 123,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin",
        "active": true
    }
}
```

**Error - Not Found (404)**:
```json
{
    "message": "User not found"
}
```

**Error - Unauthenticated (401)**:
```json
{
    "message": "Unauthenticated."
}
```

**Error - Unauthorized (403)**:
```json
{
    "message": "This action is unauthorized."
}
```

---

### Create User

**POST** `/api/users`

Create a new user.

**Authentication**: Required (Sanctum token) + Admin role

**Request Body**:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| name | string | Yes | The user's name | John Doe |
| email | string | Yes | The user's email address | john@example.com |
| password | string | Yes | The user's password (min 8 characters) | secret123 |
| password_confirmation | string | Yes | Password confirmation | secret123 |
| role | string | Yes | User role (admin, user) | admin |
| active | boolean | Yes | Whether the user is active | true |

**Response Examples**:

**Success (201)**:
```json
{
    "message": "Usuario creado",
    "data": {
        "id": 123,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin",
        "active": true
    }
}
```

**Error - Validation Failed (422)**:
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email has already been taken."],
        "password": ["The password confirmation does not match."]
    }
}
```

**Error - Unauthenticated (401)**:
```json
{
    "message": "Unauthenticated."
}
```

**Error - Unauthorized (403)**:
```json
{
    "message": "This action is unauthorized."
}
```

**Validation Rules**:
- name: required, string, max:255
- email: required, email, unique:users,email
- password: required, string, min:8, confirmed
- role: required, in:admin,user
- active: required, boolean

---

### Update User

**PUT** `/api/users/{id}`

Update an existing user.

**Authentication**: Required (Sanctum token) + Admin role

**Path Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| id | integer | Yes | The user ID | 123 |

**Request Body** (all fields optional):

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| name | string | No | The user's name | John Smith |
| email | string | No | The user's email address | john.smith@example.com |
| password | string | No | The user's password (min 8 characters) | newpassword123 |
| password_confirmation | string | No | Password confirmation | newpassword123 |
| role | string | No | User role (admin, user) | user |
| active | boolean | No | Whether the user is active | false |

**Response Examples**:

**Success (200)**:
```json
{
    "message": "Usuario actualizado",
    "data": {
        "id": 123,
        "name": "John Smith",
        "email": "john.smith@example.com",
        "role": "user",
        "active": false
    }
}
```

**Error - Validation Failed (422)**:
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email has already been taken."]
    }
}
```

**Error - Not Found (404)**:
```json
{
    "message": "User not found"
}
```

**Error - Unauthenticated (401)**:
```json
{
    "message": "Unauthenticated."
}
```

**Error - Unauthorized (403)**:
```json
{
    "message": "This action is unauthorized."
}
```

**Validation Rules**:
- name: sometimes, string, max:255
- email: sometimes, email, unique:users,email,{id}
- password: sometimes, string, min:8, confirmed
- role: sometimes, in:admin,user
- active: sometimes, boolean

---

### Update User Active Status

**PATCH** `/api/users/{id}/active`

Update only the active status of a user.

**Authentication**: Required (Sanctum token) + Admin role

**Path Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| id | integer | Yes | The user ID | 123 |

**Request Body**:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| active | boolean | Yes | Whether the user is active | false |

**Response Examples**:

**Success (200)**:
```json
{
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "active": false,
    "roles": [
        {
            "name": "admin",
            "guard_name": "web"
        }
    ]
}
```

**Error - Validation Failed (422)**:
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "active": ["The active field must be true or false."]
    }
}
```

**Error - Not Found (404)**:
```json
{
    "message": "User not found"
}
```

**Error - Unauthenticated (401)**:
```json
{
    "message": "Unauthenticated."
}
```

**Error - Unauthorized (403)**:
```json
{
    "message": "This action is unauthorized."
}
```

**Validation Rules**:
- active: required, boolean

---

### Delete User

**DELETE** `/api/users/{user}`

Delete a user by ID. Users cannot delete themselves.

**Authentication**: Required (Sanctum token) + Admin role

**Path Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| user | integer | Yes | The user ID | 123 |

**Response Examples**:

**Success (204)**: No content

**Error - Cannot Delete Self (403)**:
```json
{
    "message": "No podés eliminar tu propio usuario"
}
```

**Error - Not Found (404)**:
```json
{
    "message": "User not found"
}
```

**Error - Unauthenticated (401)**:
```json
{
    "message": "Unauthenticated."
}
```

**Error - Unauthorized (403)**:
```json
{
    "message": "This action is unauthorized."
}
```

---

## Authentication Requirements Summary

| Endpoint | Authentication Required | Additional Requirements |
|----------|------------------------|-------------------------|
| POST /api/login | No | None |
| POST /api/logout | Yes | Valid Sanctum token |
| GET /api/me | Yes | Valid Sanctum token |
| GET /api/dashboard | Yes | Valid Sanctum token |
| GET /api/products | Yes | Valid Sanctum token |
| POST /api/products | Yes | Valid Sanctum token |
| GET /api/products/{id} | Yes | Valid Sanctum token |
| PUT /api/products/{id} | Yes | Valid Sanctum token |
| DELETE /api/products/{id} | Yes | Valid Sanctum token |
| POST /api/movements | Yes | Valid Sanctum token |
| GET /api/sales/summary | Yes | Valid Sanctum token |
| GET /api/sales/best-selling-products | Yes | Valid Sanctum token |
| GET /api/users | Yes | Valid Sanctum token + Admin role |
| GET /api/users/{user} | Yes | Valid Sanctum token + Admin role |
| POST /api/users | Yes | Valid Sanctum token + Admin role |
| PUT /api/users/{id} | Yes | Valid Sanctum token + Admin role |
| PATCH /api/users/{id}/active | Yes | Valid Sanctum token + Admin role |
| DELETE /api/users/{user} | Yes | Valid Sanctum token + Admin role |

## Error Response Format

All error responses follow this standard format:

```json
{
    "message": "Error description",
    "errors": {
        "field_name": ["Error message 1", "Error message 2"]
    }
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 500: Internal Server Error