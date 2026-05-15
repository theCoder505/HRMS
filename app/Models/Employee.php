<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Employee extends Authenticatable
{
    use Notifiable;

    protected $table = 'employees';
    protected $primaryKey = 'employee_uid';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'employee_uid',
        'img',
        'name',
        'email',
        'password',
        'address',
        'about',

        'job_title',
        'department',
        'branch',
        'outlet',
        'role',
        'salary',

        'clock_in_time',
        'clock_out_time',
        'office_days',
        'weekend',
        'join_date',
        'facebook',
        'linkedin',
        'website',
        'fingerprint1',
        'fingerprint2',
        'card_identity',
    ];

    protected $casts = [
        'office_days' => 'array',
        'weekend'     => 'array',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'department', 'id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch', 'id');
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class, 'outlet', 'id');
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'role', 'id');
    }
}
