<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->renameColumn('fingerprint', 'fingerprint1');
            $table->longText('fingerprint2')->nullable()->after('fingerprint1');
            $table->longText('card_identity')->nullable()->after('fingerprint2');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->renameColumn('fingerprint1', 'fingerprint');
            $table->dropColumn(['fingerprint2', 'card_identity']);
        });
    }
};