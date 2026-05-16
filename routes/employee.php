<?php

use App\Http\Controllers\Employee\EmployeeAuthController;
use App\Http\Controllers\Employee\EmployeeDashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest:employee')->prefix('employee')->group(function () {
    Route::get('login', [EmployeeAuthController::class, 'create'])->name('employee.login');
    Route::post('login', [EmployeeAuthController::class, 'store']);
});

Route::middleware('auth:employee')->prefix('employee')->group(function () {
    Route::post('logout', [EmployeeAuthController::class, 'destroy'])->name('employee.logout');
    
    Route::get('dashboard', [EmployeeDashboardController::class, 'dashboard'])->name('employee.dashboard');
    Route::get('profile', [EmployeeDashboardController::class, 'profile'])->name('employee.profile');
    
    Route::get('leaves', [EmployeeDashboardController::class, 'leaves'])->name('employee.leaves');
    Route::post('leaves', [EmployeeDashboardController::class, 'submit_leave'])->name('employee.leaves.store');
    
    Route::get('attendance', [EmployeeDashboardController::class, 'attendance'])->name('employee.attendance');
    
    Route::get('payrolls', [EmployeeDashboardController::class, 'payrolls'])->name('employee.payrolls');
    
    Route::get('punishments', [EmployeeDashboardController::class, 'punishments'])->name('employee.punishments');
    
    Route::get('announcements', [EmployeeDashboardController::class, 'announcements'])->name('employee.announcements');
    
    Route::get('holidays', [EmployeeDashboardController::class, 'holidays'])->name('employee.holidays');
});
