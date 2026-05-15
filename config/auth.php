<?php

return [
    'defaults' => [
        'guard' => env('AUTH_GUARD', 'web'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'hrs'),
    ],

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'hrs',
        ],
        'employee' => [
            'driver' => 'session',
            'provider' => 'employees',
        ],
    ],

    'providers' => [
        'hrs' => [
            'driver' => 'eloquent',
            'model' => env('AUTH_MODEL', App\Models\HRM::class),
        ],

        'employees' => [
            'driver' => 'eloquent',
            'model' => App\Models\Employee::class,
        ],
    ],

    'passwords' => [
        'hrs' => [
            'provider' => 'hrs',
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire' => 60,
            'throttle' => 60,
        ],
        'employees' => [
            'provider' => 'employees',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),
];
