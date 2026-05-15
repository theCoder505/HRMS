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
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->string('employee_uid');
            $table->text('payment_includes');
            $table->string('basic_salary');
            $table->string('net_amount');
            $table->string('salary_month');
            $table->string('salary_year');
            $table->string('note')->nullable();
            $table->timestamps();
            $table->foreign('employee_uid')->references('employee_uid')->on('employees')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
