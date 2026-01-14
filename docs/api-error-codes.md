# API Error Codes Documentation

This document provides comprehensive error documentation for all API endpoints in the ERP system, detailing the error structure, HTTP status codes, and specific error conditions for each endpoint.

## Table of Contents

1. [Common Error Structure](#common-error-structure)
2. [HTTP Status Codes](#http-status-codes)
3. [Authentication Endpoints](#authentication-endpoints)
4. [Dashboard Endpoint](#dashboard-endpoint)
5. [Product CRUD Endpoints](#product-crud-endpoints)
6. [Movement Endpoints](#movement-endpoints)
7. [User Management Endpoints](#user-management-endpoints)

---

## Common Error Structure

All API error responses follow a consistent JSON structure:

### Standard Error Format

```json
{
    "message": "Error description",
    "errors": {
        "field_name": ["Error message 1", "Error message 2"]
    }
}
```

### Key Components

- **message**: Human-readable error description
- **errors**: Optional object containing field-specific validation errors
- **errors** field is only present for validation errors (422 status)

### Examples

**Simple Error (404 Not Found)**:
```json
{
    "message": "Product not found"
}
```

**Validation Error (422 Unprocessable Entity)**:
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email field is required."],
        "password": ["The password confirmation does not match."]
    }
}
```

**Business Logic Error (400 Bad Request)**:
```json
{
    "message": "Insufficient stock for the following products: Wireless Mouse, Keyboard"
}
```

---

## HTTP Status Codes

| Status Code | Meaning | When Used |
|-------------|---------|-----------|
| **200** | OK | Successful GET, PUT, PATCH requests |
| **201** | Created | Successful POST requests |
| **204** | No Content | Successful DELETE requests |
| **400** | Bad Request | Invalid request format, business logic errors |
| **401** | Unauthorized | Missing or invalid authentication |
| **403** | Forbidden | Valid authentication but insufficient permissions |
| **404** | Not Found | Resource not found |
| **422** | Unprocessable Entity | Validation errors |
| **500** | Internal Server Error | Server-side errors |

---

## Authentication Endpoints

### POST /api/login

**Authentication**: Unauthenticated

#### Error Codes

| Status | Condition | Example Response |
|--------|-----------|------------------|
| **400** | Invalid request format | ```json { "message": "The given data was invalid.", "errors": { "email": ["The email field is required."], "password": ["The password field is required."] } }``` |
| **401** | Invalid credentials | ```json { "message": "Credenciales inválidas" }``` |
| **403** | User account inactive | ```json { "message": "Usuario inactivo" }``` |
| **500** | Server error | ```json { "message": "Error processing login request" }``` |

#### Validation Rules

- `email`: required, valid email format
- `password`: required, string

---

### POST /api/logout

**Authentication**: Required (Sanctum token)

#### Error Codes

| Status | Condition | Example Response |
|--------|-----------|------------------|
| **401** | Missing or invalid token | ```json { "message": "Unauthenticated." }``` |
| **500** | Server error during token revocation | ```json { "message": "Error during logout process" }``` |

---

### GET /api/me

**Authentication**: Required (Sanctum token)

#### Error Codes

| Status | Condition | Example Response |
|--------|-----------|------------------|
| **401** | Missing or invalid token | ```json { "message": "Unauthenticated." }``` |
| **500** | Server error | ```json { "message": "Error retrieving user information" }``` |

---

## Dashboard Endpoint

### GET /api/dashboard

**Authentication**: Required (Sanctum token)

#### Error Codes

| Status | Condition | Example Response |
|--------|-----------|------------------|
| **401** | Missing or invalid token | ```json { "message": "Unauthenticated." }``` |
| **500** | Database connection error or calculation error | ```json { "message": "Error retrieving dashboard statistics" }``` |

---

## Product CRUD Endpoints

### GET /api/products

**Authentication**: Required (Sanctum token)

#### Error Codes

| Status | Condition | Example Response |
|--------|-----------|------------------|
| **401** | Missing or invalid token | ```json { "message": "Unauthenticated." }``` |
| **500** | Database error | ```json { "message": "Error retrieving products list" }``` |

---

### POST /api/products

**Authentication**: Required (Sanctum token)

#### Error Codes

| Status | Condition | Example Response |
|--------|-----------|------------------|
| **401** | Missing or invalid token | ```json { "message": "Unauthenticated." }``` |
| **422** | Validation errors | ```json { "message": "The given data was invalid.", "errors": { "name": ["The name field is required."], "price": ["The price must be greater than 0."] } }``` |
| **500** | Database error | ```json { "message": "Error creating product" }``` |

#### Validation Rules

- `name`: required, string
- `description`: nullable, string
- `category`: nullable, string
- `stock`: required, integer, min:0
- `stock_min`: required, integer, min:0
- `price`: required, numeric, min:0

---

### GET /api/products/{id}

**Authentication**: Required (Sanctum token)

#### Error Codes

| Status | Condition | Example Response |
|--------|-----------|------------------|
| **401** | Missing or invalid token | ```json { "message": "Unauthenticated." }``` |
| **404** | Product not found | ```json { "message": "Product not found" }``` |
| **500** | Database error | ```json { "message": "Error retrieving product" }``` |

---

### PUT /api/products/{id}

**Authentication**: Required (Sanctum token)

#### Error Codes

| Status | Condition | Example Response |
|--------|-----------|------------------|
| **401** | Missing or invalid token | ```json { "message": "Unauthenticated." }``` |
| **404** | Product not found | ```json { "message": "Product not found" }``` |
| **422** | Validation errors | ```json { "message": "The given data was invalid.", "errors": { "price": ["The price must be greater than 0."] } }``` |
| **500** | Database error | ```json { "message": "Error updating product" }``` |

#### Validation Rules

- `name`: sometimes, string
- `description`: sometimes, nullable, string
- `category`: sometimes, nullable, string
- `stock`: sometimes, integer, min:0
- `stock_min`: sometimes, integer, min:0
- `price`: sometimes, numeric, min:0

---

### DELETE /api/products/{id}

**Authentication**: Required (Sanctum token)

#### Error Codes

| Status | Condition | Example Response |
|--------|-----------|------------------|
| **401** | Missing or invalid token | ```json { "message": "Unauthenticated." }``` |
| **404** | Product not found | ```json { "message": "Product not found" }``` |
| **500** | Database error | ```json { "message": "Error deleting product" }``` |

---

## Movement Endpoints

### POST /api/movements

**Authentication**: Required (Sanctum token)

#### Error Codes

| Status | Condition | Example Response |
|--------|-----------|------------------|
| **400** | Insufficient stock for sale | ```json { "message": "Insufficient stock for the following products: Wireless Mouse, Keyboard" }``` |
| **401** | Missing or invalid token | ```json { "message": "Unauthenticated." }``` |
| **422** | Validation errors | ```json { "message": "The given data was invalid.", "errors": { "movement_type": ["The movement type field is required."], "items": ["The items field is required when movement type is venta."] } }``` |
| **500** | Database transaction error | ```json { "message": "Failed to create movement" }``` |

#### Validation Rules

- `movement_type`: required, in:venta,entrada,ajuste
- `items`: required_if:movement_type,venta|required_if:movement_type,entrada, array, min:1
- `items.*.product_id`: required_if:movement_type,venta|required_if:movement_type,entrada, integer, exists:products,id
- `items.*.quantity`: required_if:movement_type,venta|required_if:movement_type,entrada, integer, min:1
- `items.*.price`: required_if:movement_type,venta|required_if:movement_type,entrada, numeric, min:0
- `product_id`: required_if:movement_type,ajuste, integer, exists:products,id
- `adjusted_stock`: required_if:movement_type,ajuste, integer, min:0

#### Business Logic Errors

**Insufficient Stock (400)**:
- Triggered when `movement_type` is "venta" and requested quantity exceeds available stock
- Returns specific product names that have insufficient stock

---

### GET /api/sales/summary

**Authentication**: Required (Sanctum token)

#### Error Codes

| Status | Condition | Example Response |
|--------|-----------|------------------|
| **400** | Invalid query parameters | ```json { "message": "Validation failed", "errors": { "month": ["The month must be between 1 and 12."], "year": ["The year must be at least 1900."] } }``` |
| **401** | Missing or invalid token | ```json { "message": "Unauthenticated." }``` |
| **500** | Database error | ```json { "message": "Error calculating sales summary" }``` |

#### Validation Rules

- `month`: required, integer, min:1, max:12
- `year`: required, integer, min:1900, max:(current year + 10)
- `comparePrevious`: sometimes, in:true,false,1,0

---

### GET /api/sales/best-selling-products

**Authentication**: Required (Sanctum token)

#### Error Codes

| Status | Condition | Example Response |
|--------|-----------|------------------|
| **400** | Invalid query parameters | ```json { "message": "Validation failed", "errors": { "limit": ["The limit must be at least 1."] } }``` |
| **401** | Missing or invalid token | ```json { "message": "Unauthenticated." }``` |
| **500** | Database error | ```json { "message": "Error retrieving best selling products" }``` |

#### Validation Rules

- `limit`: sometimes, integer, min:1

---

## User Management Endpoints

> **Note**: All user management endpoints require admin role in addition to authentication.

### GET /api/users

**Authentication**: Required (Sanctum token) + Admin role

#### Error Codes

| Status | Condition | Example Response |
|--------|-----------|------------------|
| **401** | Missing or invalid token | ```json { "message": "Unauthenticated." }``` |
| **403** | User lacks admin role | ```json { "message": "This action is unauthorized." }``` |
| **500** | Database error | ```json { "message": "Error retrieving users list" }``` |

---

### GET /api/users/{user}

**Authentication**: Required (Sanctum token) + Admin role

#### Error Codes

| Status | Condition | Example Response |
|--------|-----------|------------------|
| **401** | Missing or invalid token | ```json { "message": "Unauthenticated." }``` |
| **403** | User lacks admin role | ```json { "message": "This action is unauthorized." }``` |
| **404** | User not found | ```json { "message": "User not found" }``` |
| **500** | Database error | ```json { "message": "Error retrieving user" }``` |

---

### POST /api/users

**Authentication**: Required (Sanctum token) + Admin role

#### Error Codes

| Status | Condition | Example Response |
|--------|-----------|------------------|
| **401** | Missing or invalid token | ```json { "message": "Unauthenticated." }``` |
| **403** | User lacks admin role | ```json { "message": "This action is unauthorized." }``` |
| **422** | Validation errors | ```json { "message": "The given data was invalid.", "errors": { "email": ["The email has already been taken."], "password": ["The password confirmation does not match."] } }``` |
| **500** | Database error | ```json { "message": "Error creating user" }``` |

#### Validation Rules

- `name`: required, string, max:255
- `email`: required, email, unique:users,email
- `password`: required, string, min:8, confirmed
- `role`: required, in:admin,user
- `active`: required, boolean

---

### PUT /api/users/{id}

**Authentication**: Required (Sanctum token) + Admin role

#### Error Codes

| Status | Condition | Example Response |
|--------|-----------|------------------|
| **401** | Missing or invalid token | ```json { "message": "Unauthenticated." }``` |
| **403** | User lacks admin role | ```json { "message": "This action is unauthorized." }``` |
| **404** | User not found | ```json { "message": "User not found" }``` |
| **422** | Validation errors | ```json { "message": "The given data was invalid.", "errors": { "email": ["The email has already been taken."] } }``` |
| **500** | Database error | ```json { "message": "Error updating user" }``` |

#### Validation Rules

- `name`: sometimes, string, max:255
- `email`: sometimes, email, unique:users,email,{id}
- `password`: sometimes, string, min:8, confirmed
- `role`: sometimes, in:admin,user
- `active`: sometimes, boolean

---

### PATCH /api/users/{id}/active

**Authentication**: Required (Sanctum token) + Admin role

#### Error Codes

| Status | Condition | Example Response |
|--------|-----------|------------------|
| **401** | Missing or invalid token | ```json { "message": "Unauthenticated." }``` |
| **403** | User lacks admin role | ```json { "message": "This action is unauthorized." }``` |
| **404** | User not found | ```json { "message": "User not found" }``` |
| **422** | Validation errors | ```json { "message": "The given data was invalid.", "errors": { "active": ["The active field must be true or false."] } }``` |
| **500** | Database error | ```json { "message": "Error updating user status" }``` |

#### Validation Rules

- `active`: required, boolean

---

### DELETE /api/users/{user}

**Authentication**: Required (Sanctum token) + Admin role

#### Error Codes

| Status | Condition | Example Response |
|--------|-----------|------------------|
| **401** | Missing or invalid token | ```json { "message": "Unauthenticated." }``` |
| **403** | User lacks admin role OR attempting to delete self | ```json { "message": "This action is unauthorized." }``` OR ```json { "message": "No podés eliminar tu propio usuario" }``` |
| **404** | User not found | ```json { "message": "User not found" }``` |
| **500** | Database error | ```json { "message": "Error deleting user" }``` |

#### Business Logic Restrictions

- **Cannot Delete Self (403)**: Users cannot delete their own accounts
- **Admin Role Required (403)**: Only users with admin role can delete other users

---

## Error Handling Best Practices

### Client-Side Error Handling

1. **Check HTTP Status Codes**: Always check the status code first
2. **Parse Error Messages**: Display user-friendly error messages
3. **Handle Validation Errors**: Show field-specific error messages
4. **Retry Logic**: Implement retry logic for 500 errors
5. **Authentication Flow**: Redirect to login for 401 errors

### Example Error Handling (JavaScript)

```javascript
async function handleApiResponse(response) {
    if (!response.ok) {
        const errorData = await response.json();
        
        switch (response.status) {
            case 400:
                // Handle business logic errors
                showErrorMessage(errorData.message);
                break;
            case 401:
                // Redirect to login
                redirectToLogin();
                break;
            case 403:
                // Show permission error
                showErrorMessage('Access denied');
                break;
            case 404:
                // Handle not found
                showErrorMessage('Resource not found');
                break;
            case 422:
                // Handle validation errors
                showValidationErrors(errorData.errors);
                break;
            case 500:
                // Handle server errors
                showErrorMessage('Server error, please try again');
                break;
        }
        throw new Error(errorData.message);
    }
    
    return response.json();
}
```

### Server-Side Error Logging

The API logs all 500 errors for debugging purposes. When encountering server errors, include relevant context in bug reports:

- Request method and endpoint
- Request payload (if applicable)
- Timestamp of the error
- Any relevant user information

---

## Troubleshooting Common Issues

### Authentication Issues

**Problem**: Getting 401 errors despite having a token
**Solution**: 
- Check token format: `Authorization: Bearer {token}`
- Verify token hasn't expired
- Ensure token is valid for the current user

### Permission Issues

**Problem**: Getting 403 errors on user management endpoints
**Solution**:
- Verify user has admin role assigned
- Check that the token belongs to an admin user
- Ensure role permissions are properly configured

### Validation Issues

**Problem**: Getting 422 errors with unclear field requirements
**Solution**:
- Check the validation rules in this documentation
- Ensure all required fields are present
- Verify data types match expected formats

### Business Logic Issues

**Problem**: Getting 400 errors for stock operations
**Solution**:
- For sales: Verify product has sufficient stock
- For adjustments: Ensure adjusted stock is non-negative
- Check that product IDs exist in the database

### Database Issues

**Problem**: Getting 500 errors consistently
**Solution**:
- Check database connection
- Verify database migrations are up to date
- Check server logs for specific error details