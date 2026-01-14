# Laravel ERP API Documentation Standard

## Overview

This document defines the comprehensive documentation standard for our Laravel ERP project using Laravel Scribe. The standard ensures consistency, clarity, and completeness across all API endpoints.

## Table of Contents

1. [General Guidelines](#general-guidelines)
2. [Endpoint Metadata](#endpoint-metadata)
3. [Request Parameters](#request-parameters)
4. [Response Examples](#response-examples)
5. [Authentication Requirements](#authentication-requirements)
6. [Validation Rules](#validation-rules)
7. [Endpoint Type Examples](#endpoint-type-examples)
8. [Enforcement and Team Adoption](#enforcement-and-team-adoption)

## General Guidelines

### Documentation Philosophy
- **Clarity First**: Documentation should be immediately understandable by developers
- **Consistency**: All endpoints follow the same documentation patterns
- **Completeness**: Every endpoint must be fully documented
- **Accuracy**: Documentation must match actual implementation
- **Maintainability**: Documentation should be easy to update and maintain

### File Organization
- Documentation comments are placed directly in controller methods
- Use PHPDoc-style comments with Scribe-specific annotations
- Keep documentation close to the code it describes
- Use consistent formatting and structure

### Naming Conventions
- Use clear, descriptive endpoint descriptions
- Parameter names should match request field names exactly
- Response field names should match JSON output exactly
- Use consistent terminology across all endpoints

## Endpoint Metadata

Every endpoint must include the following metadata annotations:

```php
/**
 * @group ERP Operations
 * @subgroup Products
 * 
 * @authenticated
 * 
 * @response 200 {
 *     "message": "Success message",
 *     "data": {...}
 * }
 * 
 * @response 401 {
 *     "message": "Unauthenticated."
 * }
 * 
 * @response 422 {
 *     "message": "The given data was invalid.",
 *     "errors": {
 *         "field_name": ["Error message"]
 *     }
 * }
 */
```

### Required Metadata Elements

#### 1. Group and Subgroup
```php
@group ERP Operations
@subgroup Products
```
- **@group**: High-level category (e.g., "ERP Operations", "Authentication", "Analytics")
- **@subgroup**: Specific functional area (e.g., "Products", "Users", "Movements")

#### 2. Authentication
```php
@authenticated
```
- Use `@authenticated` for endpoints requiring authentication
- Use `@unauthenticated` for public endpoints
- Document specific permission requirements in endpoint description

#### 3. Response Status Codes
```php
@response 200 {...}
@response 401 {...}
@response 422 {...}
```
- Document all possible HTTP status codes
- Include realistic response examples
- Use consistent error message formats

## Request Parameters

### Parameter Types and Documentation

#### 1. Path Parameters
```php
/**
 * @urlParam id integer required The ID of the product. Example: 123
 */
```

#### 2. Query Parameters
```php
/**
 * @queryParam page integer Page number for pagination. Example: 1
 * @queryParam per_page integer Items per page. Example: 15
 * @queryParam search string Search term for filtering. Example: laptop
 * @queryParam sort string Sort field. Example: created_at
 * @queryParam direction string Sort direction (asc/desc). Example: desc
 */
```

#### 3. Body Parameters
```php
/**
 * @bodyParam name string required The product name. Example: Wireless Mouse
 * @bodyParam description string The product description. Example: High-precision wireless mouse
 * @bodyParam category string Product category. Example: Electronics
 * @bodyParam stock integer required Stock quantity. Example: 50
 * @bodyParam stock_min integer required Minimum stock level. Example: 10
 * @bodyParam price number required Product price. Example: 29.99
 */
```

### Parameter Validation Documentation

#### Required vs Optional
- Always specify `required` for mandatory parameters
- Use `nullable` for optional parameters that can be null
- Provide realistic examples for all parameters

#### Data Types
- `integer` for whole numbers
- `number` for decimal numbers
- `string` for text
- `boolean` for true/false values
- `array` for lists
- `object` for complex objects

#### Validation Rules
Document validation rules that match your FormRequest classes:

```php
/**
 * @bodyParam stock integer required min:0 The stock quantity must be non-negative. Example: 50
 * @bodyParam price number required min:0.01 The price must be greater than zero. Example: 29.99
 * @bodyParam category string in:electronics,books,clothing Must be one of the specified categories. Example: electronics
 */
```

## Response Examples

### Success Responses

#### 1. Single Resource Response
```php
/**
 * @response 200 {
 *     "data": {
 *         "id": 123,
 *         "name": "Wireless Mouse",
 *         "description": "High-precision wireless mouse",
 *         "category": "Electronics",
 *         "stock": 50,
 *         "stock_min": 10,
 *         "price": 29.99,
 *         "created_at": "2024-01-15T10:30:00Z",
 *         "updated_at": "2024-01-15T10:30:00Z"
 *     }
 * }
 */
```

#### 2. Collection Response with Pagination
```php
/**
 * @response 200 {
 *     "data": [
 *         {
 *             "id": 123,
 *             "name": "Wireless Mouse",
 *             "category": "Electronics",
 *             "stock": 50,
 *             "price": 29.99
 *         }
 *     ],
 *     "pagination": {
 *         "total": 150,
 *         "per_page": 15,
 *         "current_page": 1,
 *         "last_page": 10,
 *         "from": 1,
 *         "to": 15
 *     }
 * }
 */
```

#### 3. Action Response
```php
/**
 * @response 201 {
 *     "message": "Product created successfully",
 *     "data": {
 *         "id": 123,
 *         "name": "Wireless Mouse",
 *         "category": "Electronics",
 *         "stock": 50,
 *         "price": 29.99
 *     }
 * }
 */
```

### Error Responses

#### 1. Authentication Error
```php
/**
 * @response 401 {
 *     "message": "Unauthenticated."
 * }
 */
```

#### 2. Authorization Error
```php
/**
 * @response 403 {
 *     "message": "This action is unauthorized."
 * }
 */
```

#### 3. Validation Error
```php
/**
 * @response 422 {
 *     "message": "The given data was invalid.",
 *     "errors": {
 *         "name": ["The name field is required."],
 *         "price": ["The price must be a number."]
 *     }
 * }
 */
```

#### 4. Not Found Error
```php
/**
 * @response 404 {
 *     "message": "Product not found."
 * }
 */
```

#### 5. Server Error
```php
/**
 * @response 500 {
 *     "message": "Internal server error."
 * }
 */
```

## Authentication Requirements

### Authentication Methods

#### 1. Sanctum Token Authentication
```php
/**
 * @authenticated
 * 
 * All requests must include an Authorization header with a valid Sanctum token:
 * 
 * ```
 * Authorization: Bearer {token}
 * ```
 * 
 * Tokens can be obtained by calling the /api/login endpoint.
 */
```

#### 2. Role-Based Access Control
```php
/**
 * @authenticated
 * @middleware role:admin
 * 
 * This endpoint requires admin privileges.
 */
```

#### 3. Permission-Based Access Control
```php
/**
 * @authenticated
 * @middleware permission:manage-products
 * 
 * This endpoint requires the 'manage-products' permission.
 */
```

### Authentication Documentation Standards

#### 1. Always Document Authentication
- Use `@authenticated` for protected endpoints
- Use `@unauthenticated` for public endpoints
- Specify any additional middleware requirements

#### 2. Document Token Requirements
```php
/**
 * @authenticated
 * 
 * Requires a valid Sanctum API token in the Authorization header.
 * 
 * Example:
 * ```
 * GET /api/products
 * Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
 * ```
 */
```

#### 3. Document Permission Requirements
```php
/**
 * @authenticated
 * @middleware role:admin
 * 
 * Requires admin role to access this endpoint.
 * 
 * Users with the following roles can access this endpoint:
 * - admin
 */
```

## Validation Rules

### Validation Documentation Standards

#### 1. Match FormRequest Validation
Documentation must exactly match the validation rules in your FormRequest classes:

```php
// FormRequest
public function rules()
{
    return [
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|min:8|confirmed',
    ];
}

// Documentation
/**
 * @bodyParam name string required max:255 The user's name. Example: John Doe
 * @bodyParam email string required email|unique:users,email The user's email address. Example: john@example.com
 * @bodyParam password string required min:8 The user's password. Example: secret123
 */
```

#### 2. Document Custom Validation Messages
```php
/**
 * @bodyParam email string required email|unique:users,email The email must be unique. Example: john@example.com
 * @bodyParam password string required min:8 The password must be at least 8 characters. Example: secret123
 */
```

#### 3. Document Conditional Validation
```php
/**
 * @bodyParam movement_type string required in:venta,entrada,ajuste The type of movement. Example: venta
 * @bodyParam items array required_if:movement_type,venta|required_if:movement_type,entrada Items for the movement. Example: [{"product_id": 1, "quantity": 2, "price": 29.99}]
 * @bodyParam product_id integer required_if:movement_type,ajuste The product ID for adjustment. Example: 1
 * @bodyParam adjusted_stock integer required_if:movement_type,ajuste The adjusted stock level. Example: 100
 */
```

### Common Validation Patterns

#### 1. Required Fields
```php
@bodyParam field_name type required Description. Example: value
```

#### 2. Optional Fields
```php
@bodyParam field_name type Description. Example: value
```

#### 3. Nullable Fields
```php
@bodyParam field_name type nullable Description. Example: value
```

#### 4. Enum Values
```php
@bodyParam status string in:active,inactive,pending Must be one of: active, inactive, pending. Example: active
```

#### 5. Numeric Ranges
```php
@bodyParam quantity integer min:1 max:1000 Must be between 1 and 1000. Example: 50
@bodyParam price number min:0.01 Must be greater than 0. Example: 29.99
```

#### 6. String Length
```php
@bodyParam name string max:255 Must not exceed 255 characters. Example: Product Name
```

## Endpoint Type Examples

### 1. CRUD Endpoints

#### Product CRUD Example
```php
/**
 * @group ERP Operations
 * @subgroup Products
 * 
 * @authenticated
 * 
 * @response 200 {
 *     "data": [
 *         {
 *             "id": 123,
 *             "name": "Wireless Mouse",
 *             "category": "Electronics",
 *             "stock": 50,
 *             "price": 29.99
 *         }
 *     ],
 *     "pagination": {
 *         "total": 150,
 *         "per_page": 15,
 *         "current_page": 1,
 *         "last_page": 10
 *     }
 * }
 */
public function index()
{
    $products = Product::orderBy('id', 'desc')->paginate(15);
    return response()->json([
        'data' => $products->items(),
        'pagination' => [
            'total' => $products->total(),
            'per_page' => $products->perPage(),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
        ],
    ]);
}

/**
 * @group ERP Operations
 * @subgroup Products
 * 
 * @authenticated
 * 
 * @bodyParam name string required The product name. Example: Wireless Mouse
 * @bodyParam description string The product description. Example: High-precision wireless mouse
 * @bodyParam category string Product category. Example: Electronics
 * @bodyParam stock integer required min:0 The stock quantity. Example: 50
 * @bodyParam stock_min integer required min:0 The minimum stock level. Example: 10
 * @bodyParam price number required min:0 The product price. Example: 29.99
 * 
 * @response 201 {
 *     "message": "Product created successfully",
 *     "data": {
 *         "id": 123,
 *         "name": "Wireless Mouse",
 *         "category": "Electronics",
 *         "stock": 50,
 *         "price": 29.99
 *     }
 * }
 * 
 * @response 422 {
 *     "message": "The given data was invalid.",
 *     "errors": {
 *         "name": ["The name field is required."],
 *         "price": ["The price must be greater than 0."]
 *     }
 * }
 */
public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|string',
        'description' => 'nullable|string',
        'category' => 'nullable|string',
        'stock' => 'required|integer|min:0',
        'stock_min' => 'required|integer|min:0',
        'price' => 'required|numeric|min:0',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $product = Product::create($validator->validated());
    return response()->json(['message' => 'Product created successfully', 'data' => $product], 201);
}
```

### 2. Complex Business Logic Endpoints

#### Movement Registration Example
```php
/**
 * @group ERP Operations
 * @subgroup Movements
 * 
 * @authenticated
 * 
 * Register a new movement (sale, entry, or stock adjustment).
 * 
 * For sales and entries, provide items array with product details.
 * For adjustments, provide product_id and adjusted_stock.
 * 
 * @bodyParam movement_type string required The type of movement. Must be one of: venta, entrada, ajuste. Example: venta
 * @bodyParam items array required_if:movement_type,venta|required_if:movement_type,entrada Array of movement items. Example: [{"product_id": 1, "quantity": 2, "price": 29.99}]
 * @bodyParam items.*.product_id integer required The product ID. Example: 1
 * @bodyParam items.*.quantity integer required min:1 The quantity. Example: 2
 * @bodyParam items.*.price number required min:0 The price per unit. Example: 29.99
 * @bodyParam product_id integer required_if:movement_type,ajuste The product ID for adjustment. Example: 1
 * @bodyParam adjusted_stock integer required_if:movement_type,ajuste The adjusted stock level. Example: 100
 * 
 * @response 201 {
 *     "message": "Sale movement registered successfully"
 * }
 * 
 * @response 400 {
 *     "message": "Insufficient stock for the following products: Wireless Mouse"
 * }
 * 
 * @response 422 {
 *     "message": "The given data was invalid.",
 *     "errors": {
 *         "movement_type": ["The movement type field is required."]
 *     }
 * }
 */
public function store(StoreMovementRequest $request)
{
    // Implementation with complex business logic
    // Stock validation, transaction handling, etc.
}
```

### 3. Analytics and Reporting Endpoints

#### Sales Summary Example
```php
/**
 * @group Analytics
 * @subgroup Sales
 * 
 * @authenticated
 * 
 * Get sales summary for a specific month and year.
 * Optionally compare with previous month.
 * 
 * @queryParam month integer required The month (1-12). Example: 1
 * @queryParam year integer required The year. Example: 2024
 * @queryParam comparePrevious boolean Compare with previous month. Example: true
 * 
 * @response 200 {
 *     "totalSales": 1500.50,
 *     "totalMovements": 25,
 *     "previousTotalSales": 1200.00,
 *     "previousTotalMovements": 20,
 *     "salesDifference": 300.50,
 *     "movementsDifference": 5
 * }
 * 
 * @response 400 {
 *     "message": "Validation failed",
 *     "errors": {
 *         "month": ["The month must be between 1 and 12."]
 *     }
 * }
 */
public function salesSummary(Request $request)
{
    $validator = Validator::make($request->all(), [
        'month' => 'required|integer|min:1|max:12',
        'year' => 'required|integer|min:1900|max:' . (date('Y') + 10),
        'comparePrevious' => 'sometimes|in:true,false,1,0',
    ]);

    // Implementation with database queries and calculations
}

/**
 * @group Analytics
 * @subgroup Products
 * 
 * @authenticated
 * 
 * Get best selling products for the current period.
 * 
 * @queryParam limit integer Maximum number of products to return. Default: 10. Example: 5
 * 
 * @response 200 [
 *     {
 *         "product_id": 1,
 *         "product_name": "Wireless Mouse",
 *         "total_quantity": 150
 *     }
 * ]
 */
public function bestSellingProducts(Request $request)
{
    $limit = $request->query('limit', 10);
    
    $result = DB::table('movement_items')
        ->join('movements', 'movement_items.movement_id', '=', 'movements.id')
        ->join('products', 'movement_items.product_id', '=', 'products.id')
        ->where('movements.movement_type', 'venta')
        ->select('movement_items.product_id', 'products.name as product_name', DB::raw('SUM(movement_items.quantity) as total_quantity'))
        ->groupBy('movement_items.product_id', 'products.name')
        ->orderBy('total_quantity', 'desc')
        ->limit($limit)
        ->get();

    return response()->json($result, 200);
}
```

### 4. Authentication Endpoints

#### Login Example
```php
/**
 * @group Authentication
 * 
 * Authenticate a user and return an API token.
 * 
 * @unauthenticated
 * 
 * @bodyParam email string required The user's email address. Example: user@example.com
 * @bodyParam password string required The user's password. Example: secret123
 * 
 * @response 200 {
 *     "user": {
 *         "id": 1,
 *         "name": "John Doe",
 *         "email": "user@example.com",
 *         "roles": [
 *             {
 *                 "name": "admin",
 *                 "guard_name": "web"
 *             }
 *         ]
 *     },
 *     "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
 * }
 * 
 * @response 401 {
 *     "message": "Credenciales inválidas"
 * }
 * 
 * @response 403 {
 *     "message": "Usuario inactivo"
 * }
 */
public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Credenciales inválidas'], 401);
    }

    if (!$user->active) {
        return response()->json(['message' => 'Usuario inactivo'], 403);
    }

    $token = $user->createToken('API Token')->plainTextToken;
    $user->load('roles');

    return response()->json([
        'user' => $user,
        'token' => $token,
    ]);
}
```

## Enforcement and Team Adoption

### 1. Code Review Checklist

#### Documentation Requirements
- [ ] All endpoints have complete metadata (@group, @subgroup, @authenticated)
- [ ] All request parameters are documented with types and examples
- [ ] All response examples are provided (success and error cases)
- [ ] Validation rules match FormRequest classes
- [ ] Authentication requirements are clearly documented

#### Quality Standards
- [ ] Examples use realistic, meaningful values
- [ ] Error messages are consistent across endpoints
- [ ] Documentation is up-to-date with implementation
- [ ] No placeholder text or incomplete documentation

### 2. Development Workflow

#### Before Implementation
1. Review the endpoint requirements
2. Identify the endpoint type (CRUD, business logic, analytics)
3. Plan the documentation structure
4. Create FormRequest validation rules

#### During Implementation
1. Write documentation comments alongside code
2. Ensure examples match actual implementation
3. Test all documented scenarios
4. Verify validation rules are accurate

#### Before Commit
1. Run Scribe documentation generation
2. Review generated documentation for completeness
3. Test all documented endpoints
4. Update any discrepancies

### 3. Team Guidelines

#### Documentation Standards
- All new endpoints must include complete documentation
- Updates to existing endpoints must update documentation
- Examples should use realistic, production-like data
- Error responses must be documented for all scenarios

#### Review Process
- Documentation is part of the definition of done
- Code reviews must include documentation review
- Missing or incomplete documentation blocks merge approval
- Regular documentation audits should be conducted

#### Tools and Automation
- Use Scribe's validation features to catch documentation issues
- Include documentation checks in CI/CD pipeline
- Use pre-commit hooks to validate documentation completeness
- Generate and publish documentation automatically

### 4. Maintenance

#### Regular Updates
- Update documentation when API changes
- Review and update examples quarterly
- Validate all endpoints monthly
- Remove deprecated endpoints from documentation

#### Version Management
- Document API version changes
- Maintain backward compatibility notes
- Plan migration paths for breaking changes
- Communicate changes to API consumers

## Conclusion

This documentation standard ensures that our Laravel ERP API is well-documented, maintainable, and developer-friendly. By following these guidelines, we create consistent, accurate, and helpful documentation that serves both our development team and API consumers.

Remember: Good documentation is not optional—it's essential for a successful API.