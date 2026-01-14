# Laravel Scribe Configuration

## Installation

```bash
composer require knuckleswtf/scribe
```

## Configuration

Create the Scribe configuration file:

```bash
php artisan vendor:publish --provider="Knuckles\Scribe\ScribeServiceProvider" --tag=scribe-config
```

## Basic Configuration

```php
<?php

return [
    'theme' => 'default',
    
    'title' => 'Laravel ERP API',
    'description' => 'API documentation for the Laravel ERP system',
    'base_url' => env('APP_URL', 'http://localhost'),
    
    'routes' => [
        [
            'match' => [
                'domains' => ['*'],
                'prefixes' => ['api/*'],
                'versions' => ['v1'],
            ],
            'include' => [
                // Include all API routes
            ],
            'exclude' => [
                // Exclude specific routes if needed
            ],
            'apply' => [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ],
                'response_calls' => [
                    'methods' => ['get', 'post', 'put', 'patch', 'delete'],
                    'config' => [
                        'app.env' => 'documentation',
                        'app.debug' => false,
                    ],
                    'queryParams' => [
                        // Add query parameters for testing
                    ],
                    'bodyParams' => [
                        // Add body parameters for testing
                    ],
                    'fileParams' => [
                        // Add file parameters for testing
                    ],
                ],
            ],
        ],
    ],
    
    'type' => 'laravel',
    
    'static' => [
        'output_path' => 'public/docs',
    ],
    
    'laravel' => [
        'add_routes' => true,
        'docs_url' => '/docs',
        'middleware' => ['web'],
    ],
    
    'auth' => [
        'enabled' => true,
        'in' => 'bearer',
        'name' => 'Authorization',
        'use_value' => env('SCRIBE_AUTH_KEY'),
        'extra_info' => 'You can retrieve your token by visiting your dashboard and clicking <b>Generate API token</b>.',
    ],
    
    'intro_text' => <<<INTRO
        Welcome to the Laravel ERP API documentation!
        
        This API provides endpoints for managing products, users, movements, and analytics.
        
        ## Authentication
        
        All endpoints require authentication using a Bearer token.
        
        ## Rate Limiting
        
        API requests are rate limited to 60 requests per minute.
        
        ## Error Handling
        
        Errors are returned in a consistent format:
        
        ```json
        {
            "message": "Error description",
            "errors": {
                "field_name": ["Error message"]
            }
        }
        ```
    INTRO,
    
    'example_languages' => [
        'bash',
        'javascript',
        'php',
    ],
    
    'postman' => [
        'enabled' => true,
        'base_url' => env('APP_URL', 'http://localhost'),
        'description' => 'Postman collection for Laravel ERP API',
        'auth' => [
            'type' => 'bearer',
            'bearer' => [
                'value' => '{{token}}',
            ],
        ],
    ],
    
    'openapi' => [
        'enabled' => true,
        'out_file' => 'api-docs/openapi.yaml',
        'logo' => [
            'url' => null,
            'background_color' => '#FFFFFF',
            'type' => null,
        ],
    ],
];
```

## Usage Commands

```bash
# Generate documentation
php artisan scribe:generate

# Generate and serve documentation
php artisan scribe:generate --serve

# Rebuild documentation
php artisan scribe:rebuild

# Check for issues
php artisan scribe:check
```

## Customization

### Custom Response Macros

Create a service provider to add custom response macros:

```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Knuckles\Scribe\Extracting\Strategies\Responses\ResponseCall;

class DocumentationServiceProvider extends ServiceProvider
{
    public function boot()
    {
        ResponseCall::macro('success', function ($data = null, $message = 'Success') {
            return response()->json([
                'message' => $message,
                'data' => $data,
            ]);
        });

        ResponseCall::macro('error', function ($message = 'Error', $errors = [], $statusCode = 422) {
            return response()->json([
                'message' => $message,
                'errors' => $errors,
            ], $statusCode);
        });
    }
}
```

### Custom Annotations

Create custom annotations for common patterns:

```php
<?php

namespace App\Documentation\Annotations;

/**
 * @Annotation
 */
class ERPAuth
{
    public $roles = [];
    public $permissions = [];
}
```

## Best Practices

1. **Keep Documentation Updated**: Always update documentation when API changes
2. **Use Real Examples**: Use realistic data in examples
3. **Test Documentation**: Regularly test generated documentation
4. **Version Control**: Include documentation in version control
5. **Team Review**: Review documentation in code reviews

## Troubleshooting

### Common Issues

1. **Missing Parameters**: Ensure all parameters are documented
2. **Incorrect Examples**: Verify examples match actual responses
3. **Authentication Issues**: Test authentication in documentation
4. **Route Matching**: Check route patterns in configuration

### Debug Mode

Enable debug mode for troubleshooting:

```php
'debug' => env('APP_DEBUG', false),
```

### Custom Middleware

Add custom middleware for documentation:

```php
'middleware' => [
    'web',
    'api',
    \App\Http\Middleware\DocumentationMiddleware::class,
],