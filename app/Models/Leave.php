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
        'deduction_type', // percent / fixed
        'deduction_amount', // amount/percent in BDT
        'approval', // approved => 1 else pending
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_uid', 'employee_uid');
    }
}