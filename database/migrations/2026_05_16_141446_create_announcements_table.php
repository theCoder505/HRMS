<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->enum('type', ['specific', 'all'])->default('all');
            $table->json('spec_employees')->nullable();
            $table->timestamps();
        });

        Schema::create('announcement_employee', function (Blueprint $table) {
            $table->id();
            $table->foreignId('announcement_id')->constrained('announcements')->onDelete('cascade');
            $table->string('employee_uid');
            $table->foreign('employee_uid')->references('employee_uid')->on('employees')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['announcement_id', 'employee_uid']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcement_employee');
        Schema::dropIfExists('announcements');
    }
};