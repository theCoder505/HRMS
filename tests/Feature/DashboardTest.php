<?php

use App\Models\HRM;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = HRM::factory()->create());

    $this->get('/dashboard')->assertOk();
});