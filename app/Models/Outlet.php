<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Outlet extends Model
{
    protected $fillable = [
        'name',
        'branch',
        'location',
        'map',
    ];

    public function branchInfo()
    {
        return $this->belongsTo(Branch::class, 'branch');
    }
}
