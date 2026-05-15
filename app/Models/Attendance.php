<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'employee_uid',
        'attend_date',
        'clock_in_time',
        'clock_out_time',
    ];

    
    public function employee(){
        return $this->belongsTo(Employee::class, 'employee_uid', 'employee_uid');
    }
}
