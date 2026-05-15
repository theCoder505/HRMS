<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = [
        'title',
        'department',
    ];

    public function departmentInfo()
    {
        return $this->belongsTo(Department::class, 'department');
    }
}
