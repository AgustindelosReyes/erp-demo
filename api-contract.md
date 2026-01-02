# API Contract for Movements

## Endpoint

POST /api/movements

## Authentication

Bearer token required.

## Request Payload

For "venta" and "entrada":

```json
{
  "movement_type": "venta" | "entrada",
  "items": [
    {
      "product_id": integer,
      "quantity": integer (min: 1),
      "price": number (min: 0)
    }
  ]
}
```

- `movement_type`: Required. Must be "venta", "entrada", or "ajuste".
- `items`: Required array of at least 1 item for "venta" and "entrada".
- Each item must have valid product_id (exists in products), quantity > 0, price >= 0.

For "ajuste":

```json
{
  "movement_type": "ajuste",
  "product_id": integer,
  "adjusted_stock": integer (>= 0)
}
```

- `product_id`: Required for "ajuste". Must exist in products.
- `adjusted_stock`: Required for "ajuste". Integer >= 0.

## Responses

### Success for "venta" (Sale)

Status: 201

```json
{
  "message": "Sale movement registered successfully"
}
```

- Checks stock for each item.
- If any item has insufficient stock, fails.
- Decrements stock for each item.
- Creates Movement and MovementItems.

### Success for "entrada" (Entry)

Status: 201

```json
{
  "message": "Entry movement registered successfully"
}
```

- No stock check.
- Increments stock for each item.
- Creates Movement and MovementItems.

### Success for "ajuste" (Adjustment)

Status: 201

```json
{
  "message": "Adjustment movement registered successfully"
}
```

- No stock check.
- Sets product stock to adjusted_stock.
- Creates Movement and MovementItem with quantity = adjusted_stock, price = 0.

### Error for insufficient stock (only for "venta")

Status: 400

```json
{
  "message": "Insufficient stock for the following products: Product Name1, Product Name2"
}
```

### Validation Error

Status: 422

```json
{
  "message": "The movement type field is required. (and/or other validation errors)",
  "errors": {
    "movement_type": ["The movement type field is required."]
  }
}
```

## Examples

### Example 1: Successful Sale

Request:

```json
{
  "movement_type": "venta",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 100.00
    },
    {
      "product_id": 2,
      "quantity": 1,
      "price": 200.00
    }
  ]
}
```

Response: 201, `{"message": "Sale movement registered successfully"}`

### Example 2: Successful Entry

Request:

```json
{
  "movement_type": "entrada",
  "items": [
    {
      "product_id": 1,
      "quantity": 5,
      "price": 50.00
    }
  ]
}
```

Response: 201, `{"message": "Entry movement registered successfully"}`

### Example 3: Successful Adjustment

Request:

```json
{
  "movement_type": "ajuste",
  "product_id": 1,
  "adjusted_stock": 50
}
```

Response: 201, `{"message": "Adjustment movement registered successfully"}`

### Example 4: Insufficient Stock

Request:

```json
{
  "movement_type": "venta",
  "items": [
    {
      "product_id": 1,
      "quantity": 10,
      "price": 100.00
    }
  ]
}
```

Response: 400, `{"message": "Insufficient stock for the following products: Product 1"}`