<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Leave extends Model
{
    protected $fillable = [
        'employee_uid',
        'title',
        'leave_reson',
        'leave_from_date',
        'leave_to_date',
        'type',
        'deduction_type',
        'deduction_amount',
        'approval',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_uid', 'employee_uid');
    }
}