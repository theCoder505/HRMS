<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Punishment extends Model
{
    protected $fillable = [
        'employee_uid',
        'title',
        'punishment_reason',
        'effective_from',
        'effective_to',
        'basic_salary',
        'deduction_amount',
    ];

    
    public function employee(){
        return $this->belongsTo(Employee::class, 'employee_uid', 'employee_uid');
    }
}
