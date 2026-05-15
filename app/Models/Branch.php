<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    protected $fillable = [
        'branch_name',
    ];

    public function outlets()
    {
        return $this->hasMany(Outlet::class, 'branch');
    }
}
