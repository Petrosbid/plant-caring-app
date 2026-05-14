# PlantCare Pro API Documentation

## Overview

This is the API documentation for the PlantCare Pro backend. The API is built with Django REST Framework and provides endpoints for plant identification, disease detection, garden management, and a blog system.

## API Documentation UIs

Once the backend server is running, you can access interactive API documentation at:

- **Swagger UI**: `http://localhost:8000/api/docs/`
- **ReDoc**: `http://localhost:8000/api/redoc/`
- **OpenAPI Schema**: `http://localhost:8000/api/schema/`

## Quick Start

### 1. Install Dependencies

```bash
cd Backend
pip install -r requirements.txt
```

### 2. Run Migrations

```bash
python manage.py migrate
```

### 3. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 4. Run Development Server

```bash
python manage.py runserver
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Obtain Token

**Endpoint:** `POST /api/token/`

```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'
```

**Response:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Refresh Token

**Endpoint:** `POST /api/token/refresh/`

```bash
curl -X POST http://localhost:8000/api/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "your_refresh_token"}'
```

### Using Authenticated Endpoints

Include the access token in the Authorization header:

```bash
curl -X GET http://localhost:8000/api/plants/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## API Endpoints

### Authentication

| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| POST   | `/api/token/`         | Obtain JWT token  |
| POST   | `/api/token/refresh/` | Refresh JWT token |

### Users

| Method | Endpoint              | Description         | Auth Required |
|--------|-----------------------|---------------------|---------------|
| POST   | `/api/auth/register/` | Register new user   | No            |
| GET    | `/api/auth/profile/`  | Get user profile    | Yes           |
| PUT    | `/api/auth/profile/`  | Update user profile | Yes           |

### Plants

| Method | Endpoint                | Description               | Auth Required |
|--------|-------------------------|---------------------------|---------------|
| GET    | `/api/plants/`          | List all plants           | No            |
| GET    | `/api/plants/{id}/`     | Get plant details         | No            |
| POST   | `/api/plants/identify/` | Identify plant from image | Yes           |
| GET    | `/api/plants/search/`   | Search plants             | No            |

### Diseases

| Method | Endpoint                | Description               | Auth Required |
|--------|-------------------------|---------------------------|---------------|
| GET    | `/api/diseases/`        | List all diseases         | No            |
| GET    | `/api/diseases/{id}/`   | Get disease details       | No            |
| POST   | `/api/diseases/detect/` | Detect disease from image | Yes           |

### My Garden

| Method | Endpoint               | Description               | Auth Required |
|--------|------------------------|---------------------------|---------------|
| GET    | `/api/my-garden/`      | List user's garden plants | Yes           |
| POST   | `/api/my-garden/`      | Add plant to garden       | Yes           |
| GET    | `/api/my-garden/{id}/` | Get garden plant details  | Yes           |
| PUT    | `/api/my-garden/{id}/` | Update garden plant       | Yes           |
| DELETE | `/api/my-garden/{id}/` | Remove from garden        | Yes           |

### Blog

| Method | Endpoint                  | Description         | Auth Required |
|--------|---------------------------|---------------------|---------------|
| GET    | `/api/blog/posts/`        | List all blog posts | No            |
| GET    | `/api/blog/posts/{slug}/` | Get post by slug    | No            |
| GET    | `/api/blog/posts/latest/` | Get latest posts    | No            |
| POST   | `/api/blog/posts/`        | Create new post     | Yes (Admin)   |
| PUT    | `/api/blog/posts/{id}/`   | Update post         | Yes (Admin)   |
| DELETE | `/api/blog/posts/{id}/`   | Delete post         | Yes (Admin)   |

## Error Responses

### Standard Error Response Format

```json
{
  "error": "Error message here",
  "detail": "Detailed error description"
}
```

### HTTP Status Codes

| Code | Description  |
|------|--------------|
| 200  | Success      |
| 201  | Created      |
| 400  | Bad Request  |
| 401  | Unauthorized |
| 403  | Forbidden    |
| 404  | Not Found    |
| 500  | Server Error |

## Pagination

List endpoints support pagination. The response includes:

```json
{
  "count": 100,
  "next": "https://api.example.org/posts/?page=2",
  "previous": null,
  "results": [...]
}
```

### Pagination Parameters

- `page`: Page number
- `page_size`: Number of items per page (default: 10, max: 100)

## Filtering and Search

Many endpoints support filtering and search. Check the Swagger UI for available filters on each endpoint.

### Example: Search Plants

```bash
GET /api/plants/?search=rose
GET /api/plants/?category=flower
GET /api/plants/?difficulty=easy
```

## Rate Limiting

API endpoints may have rate limiting applied. Check the response headers:

- `X-RateLimit-Limit`: Maximum requests per hour
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets

## CORS

The API supports CORS for cross-origin requests from the frontend application.

Allowed origins (configured in `settings.py`):
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://192.168.1.10:5173`

## Media Files

Images and other media files are served at `/media/` during development.

## Code Examples

### Python (Requests)

```python
import requests

# Login and get token
response = requests.post('http://localhost:8000/api/token/', json={
    'username': 'testuser',
    'password': 'testpass123'
})
token = response.json()['access']

# Use token to access protected endpoint
headers = {'Authorization': f'Bearer {token}'}
response = requests.get('http://localhost:8000/api/my-garden/', headers=headers)
print(response.json())
```

### JavaScript (Fetch)

```javascript
// Login and get token
const tokenResponse = await fetch('http://localhost:8000/api/token/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'testuser', password: 'testpass123' })
});
const { access } = await tokenResponse.json();

// Use token to access protected endpoint
const response = await fetch('http://localhost:8000/api/my-garden/', {
  headers: { 'Authorization': `Bearer ${access}` }
});
const data = await response.json();
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Add token to requests
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Make request
const response = await api.get('/my-garden/');
console.log(response.data);
```

## Support

For issues or questions, please check:
- Django Admin: `http://localhost:8000/admin/`
- API Documentation: `http://localhost:8000/api/docs/`
