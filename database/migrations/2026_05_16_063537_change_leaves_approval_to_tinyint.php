<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change approval from enum to tinyInteger to avoid truncation errors
        // and allow 0 (pending), 1 (approved), 2 (denied)
        DB::statement('ALTER TABLE `leaves` MODIFY `approval` TINYINT DEFAULT 0');
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE `leaves` MODIFY `approval` ENUM('0', '1') DEFAULT '0'");
    }
};
