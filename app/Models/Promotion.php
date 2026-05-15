<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    protected $fillable = [
        'employee_uid',
        'job_title',
        'department',
        'branch',
        'role',
        'outlet',
        'old_salary',
        'new_salary',
        'increment_percentage',
        'increment_amount',
        'execution_date',
        'promotion_report',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_uid', 'employee_uid');
    }
}