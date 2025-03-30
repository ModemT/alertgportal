# Payment Service API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Common Headers](#common-headers)
5. [Error Responses](#error-responses)
6. [Rate Limiting](#rate-limiting)
7. [API Endpoints](#api-endpoints)
   - [Partners](#partners)
   - [Dashboard Users](#dashboard-users)
   - [Shoppers](#shoppers)
   - [Charges](#charges)
   - [Webhooks](#webhooks)
8. [Data Models](#data-models)
9. [Status Codes](#status-codes)
10. [Examples](#examples)

## Overview

The Payment Service API provides a comprehensive payment management system with features for partner management, shopper management, charge processing, refund handling, and integration with LINE and Slip2Go services.

## Authentication

The API supports multiple authentication methods:

1. **Admin API Key**
   - Required for partner management endpoints
   - Passed in the `X-Admin-API-Key` header

2. **Partner Authentication**
   - Required for shopper and charge management
   - Passed in the `X-Partner-ID` header

3. **JWT Authentication**
   - Used for dashboard user authentication
   - Bearer token in the `Authorization` header

## Base URL

```
https://api.example.com/v1
```

## Common Headers

```http
X-Admin-API-Key: your_admin_api_key
X-Partner-ID: your_partner_id
Authorization: Bearer your_jwt_token
Content-Type: application/json
```

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message description"
}
```

Common HTTP status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 422: Validation Error
- 429: Too Many Requests
- 500: Internal Server Error

## Rate Limiting

- Rate limits are applied per partner
- Default limit: 100 requests per minute
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## API Endpoints

### Partners

#### Create Partner
```http
POST /partners
```

**Headers Required:**
- `X-Admin-API-Key`

**Request Body:**
```json
{
  "name": "Partner Name",
  "email": "partner@example.com",
  "username": "partner_username",
  "password": "secure_password",
  "phone": "+1234567890",
  "account": "partner_account_id"
}
```

**Response (201 Created):**
```json
{
  "id": "prt_123...",
  "name": "Partner Name",
  "email": "partner@example.com",
  "username": "partner_username",
  "phone": "+1234567890",
  "account": "partner_account_id",
  "is_active": true,
  "api_key": "generated_api_key",
  "jwt_secret_key": "generated_jwt_secret"
}
```

#### List Partners
```http
GET /partners
```

**Headers Required:**
- `X-Admin-API-Key`

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum number of records to return (default: 100, max: 100)

**Response (200 OK):**
```json
[
  {
    "id": "prt_123...",
    "name": "Partner Name",
    "email": "partner@example.com",
    "username": "partner_username",
    "phone": "+1234567890",
    "account": "partner_account_id",
    "is_active": true
  }
]
```

#### Get Partner
```http
GET /partners/{partner_id}
```

**Headers Required:**
- `X-Admin-API-Key`

**Response (200 OK):**
```json
{
  "id": "prt_123...",
  "name": "Partner Name",
  "email": "partner@example.com",
  "username": "partner_username",
  "phone": "+1234567890",
  "account": "partner_account_id",
  "is_active": true
}
```

#### Update Partner
```http
PATCH /partners/{partner_id}
```

**Headers Required:**
- `X-Admin-API-Key`

**Request Body:**
```json
{
  "name": "Updated Partner Name",
  "email": "updated@example.com",
  "phone": "+1987654321"
}
```

**Response (200 OK):**
```json
{
  "id": "prt_123...",
  "name": "Updated Partner Name",
  "email": "updated@example.com",
  "username": "partner_username",
  "phone": "+1987654321",
  "account": "partner_account_id",
  "is_active": true
}
```

#### Delete Partner
```http
DELETE /partners/{partner_id}
```

**Headers Required:**
- `X-Admin-API-Key`

**Response (204 No Content)**

### Dashboard Users

#### Create Dashboard User
```http
POST /users
```

**Headers Required:**
- `X-Partner-ID`

**Request Body:**
```json
{
  "username": "dashboard_user",
  "email": "user@example.com",
  "password": "secure_password",
  "is_admin": false
}
```

**Response (201 Created):**
```json
{
  "id": "usr_123...",
  "partner_id": "prt_123...",
  "username": "dashboard_user",
  "email": "user@example.com",
  "is_active": true,
  "is_admin": false
}
```

#### List Dashboard Users
```http
GET /users
```

**Headers Required:**
- `X-Partner-ID`

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum number of records to return (default: 100, max: 100)

**Response (200 OK):**
```json
[
  {
    "id": "usr_123...",
    "partner_id": "prt_123...",
    "username": "dashboard_user",
    "email": "user@example.com",
    "is_active": true,
    "is_admin": false,
    "created_at": "2024-03-29T12:00:00Z",
    "updated_at": "2024-03-29T12:00:00Z"
  }
]
```

#### Get Dashboard User
```http
GET /users/{user_id}
```

**Headers Required:**
- `X-Partner-ID`

**Path Parameters:**
- `user_id`: The ID of the dashboard user to retrieve

**Response (200 OK):**
```json
{
  "id": "usr_123...",
  "partner_id": "prt_123...",
  "username": "dashboard_user",
  "email": "user@example.com",
  "is_active": true,
  "is_admin": false,
  "created_at": "2024-03-29T12:00:00Z",
  "updated_at": "2024-03-29T12:00:00Z"
}
```

**Error Responses:**
- 404 Not Found: When the specified user does not exist or belongs to a different partner

#### Update Dashboard User
```http
PATCH /users/{user_id}
```

**Headers Required:**
- `X-Partner-ID`

**Path Parameters:**
- `user_id`: The ID of the dashboard user to update

**Request Body:**
```json
{
  "username": "updated_username",
  "email": "updated@example.com",
  "password": "new_password",
  "is_active": true,
  "is_admin": true
}
```

All fields are optional. Only the fields you want to update should be included in the request body.

**Response (200 OK):**
```json
{
  "id": "usr_123...",
  "partner_id": "prt_123...",
  "username": "updated_username",
  "email": "updated@example.com",
  "is_active": true,
  "is_admin": true,
  "created_at": "2024-03-29T12:00:00Z",
  "updated_at": "2024-03-29T12:30:00Z"
}
```

**Error Responses:**
- 400 Bad Request: When the new username or email already exists for the partner
- 404 Not Found: When the specified user does not exist or belongs to a different partner

#### Delete Dashboard User
```http
DELETE /users/{user_id}
```

**Headers Required:**
- `X-Partner-ID`

**Path Parameters:**
- `user_id`: The ID of the dashboard user to delete

**Response (204 No Content):**
Empty response with status code 204 indicates successful deletion.

**Error Responses:**
- 404 Not Found: When the specified user does not exist or belongs to a different partner

### Shoppers

#### Create Shopper
```http
POST /shoppers
```

**Headers Required:**
- `X-Partner-ID`

**Request Body:**
```json
{
  "name": "Shopper Name",
  "email": "shopper@example.com",
  "phone": "+1234567890",
  "account": "shopper_account_id"
}
```

**Response (201 Created):**
```json
{
  "id": "shp_123...",
  "partner_id": "prt_123...",
  "name": "Shopper Name",
  "email": "shopper@example.com",
  "phone": "+1234567890",
  "account": "shopper_account_id"
}
```

#### List Shoppers
```http
GET /shoppers
```

**Headers Required:**
- `X-Partner-ID`

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum number of records to return (default: 100, max: 100)

**Response (200 OK):**
```json
[
  {
    "id": "shp_123...",
    "partner_id": "prt_123...",
    "name": "Shopper Name",
    "email": "shopper@example.com",
    "phone": "+1234567890",
    "account": "shopper_account_id"
  }
]
```

#### Get Shopper
```http
GET /shoppers/{shopper_id}
```

**Headers Required:**
- `X-Partner-ID`

**Response (200 OK):**
```json
{
  "id": "shp_123...",
  "partner_id": "prt_123...",
  "name": "Shopper Name",
  "email": "shopper@example.com",
  "phone": "+1234567890",
  "account": "shopper_account_id"
}
```

#### Get Shopper Charges
```http
GET /shoppers/{shopper_id}/charges
```

**Headers Required:**
- `X-Partner-ID`

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum number of records to return (default: 100, max: 100)

**Response (200 OK):**
```json
[
  {
    "id": "chg_123...",
    "partner_id": "prt_123...",
    "shopper_id": "shp_123...",
    "amount": 100.00,
    "currency": "USD",
    "status": "completed",
    "description": "Purchase description",
    "charge_metadata": {}
  }
]
```

#### Create Shopper Refund
```http
POST /shoppers/{shopper_id}/refunds
```

**Headers Required:**
- `X-Partner-ID`

**Request Body:**
```json
{
  "amount": 100.00,
  "currency": "USD",
  "description": "Refund description",
  "charge_metadata": {}
}
```

**Response (201 Created):**
```json
{
  "id": "chg_123...",
  "partner_id": "prt_123...",
  "shopper_id": "shp_123...",
  "amount": -100.00,
  "currency": "USD",
  "status": "refunded",
  "description": "Refund description",
  "charge_metadata": {}
}
```

### Charges

#### Create Charge
```http
POST /charges
```

**Headers Required:**
- `X-Partner-ID`

**Request Body:**
```json
{
  "shopper_id": "shp_123...",
  "amount": 100.00,
  "currency": "USD",
  "description": "Purchase description",
  "charge_metadata": {}
}
```

**Response (201 Created):**
```json
{
  "id": "chg_123...",
  "partner_id": "prt_123...",
  "shopper_id": "shp_123...",
  "amount": 100.00,
  "currency": "USD",
  "status": "pending",
  "description": "Purchase description",
  "charge_metadata": {}
}
```

#### List Charges
```http
GET /charges
```

**Headers Required:**
- `X-Partner-ID`

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum number of records to return (default: 100, max: 100)

**Response (200 OK):**
```json
[
  {
    "id": "chg_123...",
    "partner_id": "prt_123...",
    "shopper_id": "shp_123...",
    "amount": 100.00,
    "currency": "USD",
    "status": "completed",
    "description": "Purchase description",
    "charge_metadata": {}
  }
]
```

#### Update Charge
```http
PATCH /charges/{charge_id}
```

**Headers Required:**
- `X-Admin-API-Key`

**Request Body:**
```json
{
  "status": "completed",
  "description": "Updated description"
}
```

**Response (200 OK):**
```json
{
  "id": "chg_123...",
  "partner_id": "prt_123...",
  "shopper_id": "shp_123...",
  "amount": 100.00,
  "currency": "USD",
  "status": "completed",
  "description": "Updated description",
  "charge_metadata": {}
}
```

#### Get Charge History
```http
GET /charges/{charge_id}/history
```

**Headers Required:**
- `X-Partner-ID`

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum number of records to return (default: 100, max: 100)

**Response (200 OK):**
```json
[
  {
    "id": "hist_123...",
    "charge_id": "chg_123...",
    "previous_status": "pending",
    "new_status": "processing",
    "created_at": "2024-03-20T10:00:00Z"
  }
]
```

### Webhooks

#### LINE Webhook
```http
POST /webhook/line
```

**Headers Required:**
- `X-Line-Signature`

**Request Body:**
```json
{
  "events": [
    {
      "type": "message",
      "message": {
        "type": "image",
        "id": "1234567890",
        "contentProvider": {
          "type": "external"
        },
        "originalContentUrl": "https://example.com/image.jpg"
      },
      "timestamp": 1234567890,
      "source": {
        "type": "user",
        "userId": "user123"
      },
      "replyToken": "reply_token",
      "mode": "active"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "message": "Webhook processed successfully"
}
```

## Data Models

### Partner
```json
{
  "id": "string (UUID)",
  "name": "string",
  "email": "string",
  "username": "string",
  "phone": "string",
  "account": "string",
  "is_active": "boolean",
  "api_key": "string",
  "jwt_secret_key": "string"
}
```

### Dashboard User
```json
{
  "id": "string (UUID)",
  "partner_id": "string (UUID)",
  "username": "string",
  "email": "string",
  "is_active": "boolean",
  "is_admin": "boolean"
}
```

### Shopper
```json
{
  "id": "string (UUID)",
  "partner_id": "string (UUID)",
  "name": "string",
  "email": "string",
  "phone": "string",
  "account": "string"
}
```

### Charge
```json
{
  "id": "string (UUID)",
  "partner_id": "string (UUID)",
  "shopper_id": "string (UUID)",
  "amount": "number",
  "currency": "string",
  "status": "string",
  "description": "string",
  "charge_metadata": "object"
}
```

### Charge Status History
```json
{
  "id": "string (UUID)",
  "charge_id": "string (UUID)",
  "previous_status": "string",
  "new_status": "string",
  "created_at": "string (ISO 8601)"
}
```

## Status Codes

### Charge Status
- `pending`: Initial state
- `processing`: Payment being processed
- `completed`: Payment successful
- `failed`: Payment failed
- `cancelled`: Payment cancelled
- `refunded`: Payment refunded

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `204`: No Content
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Validation Error
- `429`: Too Many Requests
- `500`: Internal Server Error

## Examples

### Creating a Partner
```bash
curl -X POST https://api.example.com/v1/partners \
  -H "X-Admin-API-Key: your_admin_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Example Partner",
    "email": "partner@example.com",
    "username": "example_partner",
    "password": "secure_password",
    "phone": "+1234567890",
    "account": "partner_account_id"
  }'
```

### Creating a Charge
```bash
curl -X POST https://api.example.com/v1/charges \
  -H "X-Partner-ID: your_partner_id" \
  -H "Content-Type: application/json" \
  -d '{
    "shopper_id": "shp_123...",
    "amount": 100.00,
    "currency": "USD",
    "description": "Example purchase",
    "charge_metadata": {
      "order_id": "order_123",
      "product_name": "Example Product"
    }
  }'
```

### Getting Charge History
```bash
curl -X GET "https://api.example.com/v1/charges/chg_123.../history?skip=0&limit=10" \
  -H "X-Partner-ID: your_partner_id"
``` 