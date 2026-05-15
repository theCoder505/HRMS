<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('employee_uid')->unique();
            $table->string('img');
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->text('address');
            $table->text('about');
            $table->string('job_title');
            $table->foreignId('department')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('branch')->nullable()->constrained('branches')->nullOnDelete();
            $table->foreignId('outlet')->nullable()->constrained('outlets')->nullOnDelete();
            $table->foreignId('role')->nullable()->constrained('roles')->nullOnDelete();
            $table->string('clock_in_time');
            $table->string('clock_out_time');
            $table->text('office_days'); // array
            $table->string('weekend'); // array
            $table->date('join_date');
            $table->string('salary');
            $table->string('facebook');
            $table->string('linkedin');
            $table->string('website');
            $table->longText('fingerprint');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
