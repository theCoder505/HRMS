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
        Schema::create('leaves', function (Blueprint $table) {
            $table->id();
            $table->string('employee_uid');
            $table->string('title');
            $table->text('leave_reson');
            $table->date('leave_from_date');
            $table->date('leave_to_date');
            $table->enum('type', ['paid', 'unpaid'])->default('paid');
            $table->enum('deduction_type', ['percent', 'fixed'])->default('fixed');
            $table->string('deduction_amount')->default(0);
            $table->enum('approval', [0, 1])->default(0);
            $table->foreign('employee_uid')->references('employee_uid')->on('employees')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leaves');
    }
};
