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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('brand_name');
            $table->string('brand_logo');
            $table->string('brand_icon');
            $table->text('location');
            $table->text('gogle_map')->nullable();
            $table->string('facebook');
            $table->string('instagram');
            $table->string('twitter');
            $table->string('linkedin');
            $table->string('contact_email');
            $table->longText('about')->nullable();
            $table->longText('privacy_policy')->nullable();
            $table->longText('terms_conditions')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
