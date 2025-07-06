"""
Swagger UI integration for SADP backend API documentation and testing.
"""
from flask_swagger_ui import get_swaggerui_blueprint
from flask import jsonify, request

SWAGGER_URL = '/api/docs'  # URL for exposing Swagger UI
API_URL = '/api/docs/spec.json'  # URL for API documentation JSON (changed to avoid confusion)

# Define a function to initialize Swagger UI
def register_swagger_ui(app):
    """
    Register Swagger UI blueprint with Flask app.
    
    Args:
        app: Flask application instance
    """
    swagger_blueprint = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_URL,
        config={
            'app_name': "Secure Application Demo Platform API"
        }
    )
    
    app.register_blueprint(swagger_blueprint, url_prefix=SWAGGER_URL)
    
    # Create an endpoint for serving the API specs
    @app.route(API_URL)
    def swagger_api_spec():
        """Serve API documentation as JSON."""
        return jsonify(get_api_specification())
        
    # Add a direct access route that will serve the documentation HTML
    @app.route('/api/docs/standalone')
    def swagger_standalone():
        """Serve a standalone HTML page with embedded Swagger UI."""
        return f'''
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>SADP API Documentation</title>
            <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css">
        </head>
        <body>
            <div id="swagger-ui"></div>
            <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"></script>
            <script>
                window.onload = function() {{
                    window.ui = SwaggerUIBundle({{
                        url: '{API_URL}',
                        dom_id: '#swagger-ui',
                        deepLinking: true,
                        presets: [
                            SwaggerUIBundle.presets.apis,
                            SwaggerUIBundle.SwaggerUIStandalonePreset
                        ],
                        layout: "BaseLayout"
                    }});
                }}
            </script>
        </body>
        </html>
        '''

def get_api_specification():
    """
    Generate OpenAPI specification for SADP API endpoints.
    
    Returns:
        dict: OpenAPI specification
    """
    return {
        "openapi": "3.0.0",
        "info": {
            "title": "Secure Application Demo Platform API",
            "description": "API documentation for SADP backend services",
            "version": "1.0.0"
        },
        "servers": [
            {
                "url": "http://localhost:5001/api",
                "description": "Development server"
            }
        ],
        "components": {
            "securitySchemes": {
                "BearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT"
                }
            },
            "schemas": {
                "Error": {
                    "type": "object",
                    "properties": {
                        "message": {
                            "type": "string"
                        }
                    }
                },
                "User": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string", "format": "uuid"},
                        "username": {"type": "string"},
                        "email": {"type": "string", "format": "email"},
                        "first_name": {"type": "string"},
                        "last_name": {"type": "string"},
                        "role": {"type": "string"},
                        "is_active": {"type": "boolean"},
                        "created_at": {"type": "string", "format": "date-time"},
                        "last_login": {"type": "string", "format": "date-time", "nullable": True}
                    }
                },
                "LoginRequest": {
                    "type": "object",
                    "properties": {
                        "username": {"type": "string"},
                        "password": {"type": "string", "format": "password"}
                    },
                    "required": ["username", "password"]
                },
                "RegisterRequest": {
                    "type": "object",
                    "properties": {
                        "username": {"type": "string"},
                        "email": {"type": "string", "format": "email"},
                        "password": {"type": "string", "format": "password"},
                        "first_name": {"type": "string"},
                        "last_name": {"type": "string"}
                    },
                    "required": ["username", "email", "password", "first_name", "last_name"]
                },
                "AuthResponse": {
                    "type": "object",
                    "properties": {
                        "message": {"type": "string"},
                        "access_token": {"type": "string"},
                        "refresh_token": {"type": "string"},
                        "user": {"$ref": "#/components/schemas/User"}
                    }
                },
                "Module": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string", "format": "uuid"},
                        "name": {"type": "string"},
                        "slug": {"type": "string"},
                        "description": {"type": "string"},
                        "difficulty": {"type": "string"},
                        "order_index": {"type": "integer"},
                        "is_active": {"type": "boolean"},
                        "created_at": {"type": "string", "format": "date-time"},
                        "updated_at": {"type": "string", "format": "date-time"},
                        "lesson_count": {"type": "integer"}
                    }
                },
                "Lesson": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string", "format": "uuid"},
                        "module_id": {"type": "string", "format": "uuid"},
                        "title": {"type": "string"},
                        "slug": {"type": "string"},
                        "description": {"type": "string"},
                        "content_type": {"type": "string"},
                        "content": {"type": "object"},
                        "order_index": {"type": "integer"},
                        "is_active": {"type": "boolean"},
                        "created_at": {"type": "string", "format": "date-time"},
                        "updated_at": {"type": "string", "format": "date-time"}
                    }
                }
            }
        },
        "paths": {
            "/auth/login": {
                "post": {
                    "summary": "User login",
                    "description": "Authenticate a user and return access and refresh tokens",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/LoginRequest"}
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "Successful login",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/AuthResponse"}
                                }
                            }
                        },
                        "400": {
                            "description": "Bad request - missing required fields",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/Error"}
                                }
                            }
                        },
                        "401": {
                            "description": "Unauthorized - invalid credentials",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/Error"}
                                }
                            }
                        }
                    }
                }
            },
            "/auth/register": {
                "post": {
                    "summary": "User registration",
                    "description": "Register a new user account",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/RegisterRequest"}
                            }
                        }
                    },
                    "responses": {
                        "201": {
                            "description": "Successful registration",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/AuthResponse"}
                                }
                            }
                        },
                        "400": {
                            "description": "Bad request - missing required fields",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/Error"}
                                }
                            }
                        },
                        "409": {
                            "description": "Conflict - username or email already exists",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/Error"}
                                }
                            }
                        }
                    }
                }
            },
            "/auth/refresh": {
                "post": {
                    "summary": "Refresh access token",
                    "description": "Get a new access token using a valid refresh token",
                    "security": [{"BearerAuth": []}],
                    "responses": {
                        "200": {
                            "description": "Successful token refresh",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "message": {"type": "string"},
                                            "access_token": {"type": "string"}
                                        }
                                    }
                                }
                            }
                        },
                        "401": {
                            "description": "Unauthorized - invalid refresh token",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/Error"}
                                }
                            }
                        }
                    }
                }
            },
            "/auth/logout": {
                "post": {
                    "summary": "User logout",
                    "description": "Invalidate the user session",
                    "security": [{"BearerAuth": []}],
                    "responses": {
                        "200": {
                            "description": "Successful logout",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "message": {"type": "string"}
                                        }
                                    }
                                }
                            }
                        },
                        "401": {
                            "description": "Unauthorized - invalid token",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/Error"}
                                }
                            }
                        }
                    }
                }
            },
            "/users/{user_id}": {
                "get": {
                    "summary": "Get user details",
                    "description": "Retrieve details for a specific user",
                    "security": [{"BearerAuth": []}],
                    "parameters": [
                        {
                            "name": "user_id",
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string", "format": "uuid"},
                            "description": "UUID of the user"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "User details",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/User"}
                                }
                            }
                        },
                        "403": {
                            "description": "Forbidden - access denied",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/Error"}
                                }
                            }
                        },
                        "404": {
                            "description": "User not found",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/Error"}
                                }
                            }
                        }
                    }
                }
            },
            "/modules": {
                "get": {
                    "summary": "List modules",
                    "description": "Retrieve a paginated list of modules",
                    "security": [{"BearerAuth": []}],
                    "parameters": [
                        {
                            "name": "page",
                            "in": "query",
                            "schema": {"type": "integer", "default": 1},
                            "description": "Page number"
                        },
                        {
                            "name": "per_page",
                            "in": "query",
                            "schema": {"type": "integer", "default": 9},
                            "description": "Items per page"
                        },
                        {
                            "name": "difficulty",
                            "in": "query",
                            "schema": {"type": "string"},
                            "description": "Filter by difficulty level"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "List of modules",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "properties": {
                                            "data": {
                                                "type": "array",
                                                "items": {"$ref": "#/components/schemas/Module"}
                                            },
                                            "meta": {
                                                "type": "object",
                                                "properties": {
                                                    "page": {"type": "integer"},
                                                    "per_page": {"type": "integer"},
                                                    "total_pages": {"type": "integer"},
                                                    "total_items": {"type": "integer"}
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/modules/{module_id}": {
                "get": {
                    "summary": "Get module details",
                    "description": "Retrieve details for a specific module",
                    "security": [{"BearerAuth": []}],
                    "parameters": [
                        {
                            "name": "module_id",
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string", "format": "uuid"},
                            "description": "UUID of the module"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Module details",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/Module"}
                                }
                            }
                        },
                        "404": {
                            "description": "Module not found",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/Error"}
                                }
                            }
                        }
                    }
                }
            }
            # More paths can be added here
        }
    }
