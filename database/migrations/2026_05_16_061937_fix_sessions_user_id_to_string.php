<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the foreign key index if it exists, then change user_id to varchar
        // so it can store string employee primary keys like 'HRV_842133_2026'
        DB::statement('ALTER TABLE `sessions` MODIFY `user_id` VARCHAR(255) NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE `sessions` MODIFY `user_id` BIGINT UNSIGNED NULL');
    }
};
