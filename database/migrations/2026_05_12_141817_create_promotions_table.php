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
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('employee_uid');

            $table->string('job_title');
            $table->foreignId('department')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('branch')->nullable()->constrained('branches')->nullOnDelete();
            $table->foreignId('role')->nullable()->constrained('roles')->nullOnDelete();
            $table->foreignId('outlet')->nullable()->constrained('outlets')->nullOnDelete();

            $table->string('old_salary');
            $table->string('new_salary');
            $table->string('increment_percentage')->nullable();
            $table->string('increment_amount')->nullable();
            $table->date('execution_date');
            $table->string('promotion_report'); // report img/pdf will be sent to email
            
            $table->foreign('employee_uid')->references('employee_uid')->on('employees')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
