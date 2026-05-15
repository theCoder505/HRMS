<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = [
        'title',
        'description',
        'type', // specific / all
        'spec_employees', // array
    ];

    protected $casts = [
        'spec_employees' => 'array',
    ];

    public function employees()
    {
        return $this->belongsToMany(Employee::class, 'announcement_employee', 'announcement_id', 'employee_uid', 'id', 'employee_uid');
    }
}