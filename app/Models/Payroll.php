<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    protected $fillable = [
        'employee_uid',
        'payment_includes', // array ['bonus', 'overtime', 'regular', 'punishment', 'late_deduction', 'leave_deduction', 'other'] ==> any of these can set or multiple can set also.
        'basic_salary',
        'net_amount',
        'salary_month',
        'salary_year',
        'note',
    ];

    
    public function employee(){
        return $this->belongsTo(Employee::class, 'employee_uid', 'employee_uid');
    }
}
