"""
PlantCare Pro API Documentation
================================

This module contains API documentation helpers and examples for the PlantCare Pro backend.

API Endpoints Overview
----------------------

Authentication
~~~~~~~~~~~~~~
- POST /api/token/ - Obtain JWT token
- POST /api/token/refresh/ - Refresh JWT token

Users
~~~~~
- POST /api/auth/register/ - Register new user
- GET /api/auth/profile/ - Get user profile
- PUT /api/auth/profile/ - Update user profile

Plants
~~~~~~
- GET /api/plants/ - List all plants
- GET /api/plants/{id}/ - Get plant details
- POST /api/plants/identify/ - Identify plant from image
- GET /api/plants/search/ - Search plants

Diseases
~~~~~~~~
- GET /api/diseases/ - List all diseases
- GET /api/diseases/{id}/ - Get disease details
- POST /api/diseases/detect/ - Detect disease from image

My Garden
~~~~~~~~~
- GET /api/my-garden/ - List user's garden plants
- POST /api/my-garden/ - Add plant to garden
- GET /api/my-garden/{id}/ - Get garden plant details
- PUT /api/my-garden/{id}/ - Update garden plant
- DELETE /api/my-garden/{id}/ - Remove from garden

Blog
~~~~
- GET /api/blog/posts/ - List all blog posts
- GET /api/blog/posts/{slug}/ - Get post by slug
- GET /api/blog/posts/latest/ - Get latest posts
"""

from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes

# Common parameters for API documentation
AUTH_HEADER_PARAMETER = OpenApiParameter(
    name='Authorization',
    type=OpenApiTypes.STR,
    location=OpenApiParameter.HEADER,
    required=True,
    description='Bearer token for authentication',
    examples=[OpenApiExample('Valid Token', value='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')]
)

PAGINATION_PARAMETERS = [
    OpenApiParameter(
        name='page',
        type=OpenApiTypes.INT,
        location=OpenApiParameter.QUERY,
        description='Page number'
    ),
    OpenApiParameter(
        name='page_size',
        type=OpenApiTypes.INT,
        location=OpenApiParameter.QUERY,
        description='Number of results per page (default: 10, max: 100)'
    ),
]

# Common responses
COMMON_401_RESPONSE = OpenApiExample(
    'Unauthorized',
    value={'detail': 'Authentication credentials were not provided.'},
    status_codes=['401']
)

COMMON_404_RESPONSE = OpenApiExample(
    'Not Found',
    value={'detail': 'Not found.'},
    status_codes=['404']
)

COMMON_500_RESPONSE = OpenApiExample(
    'Server Error',
    value={'detail': 'Internal server error.'},
    status_codes=['500']
)
