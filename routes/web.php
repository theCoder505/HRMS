<?php

use App\Http\Controllers\FingerPrintDataController;
use App\Http\Controllers\HR\BasicWorksController;
use App\Http\Controllers\HRM\AttendanceController;
use App\Http\Controllers\HRM\EmployeeController;
use App\Http\Controllers\HRM\PayrollController;
use App\Http\Controllers\HRM\PromotionsController;
use App\Http\Controllers\WebPagesController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/about', [WebPagesController::class, 'about'])->name('about');

Route::get('/privacy-policy', [WebPagesController::class, 'privacy'])->name('privacy.policy');

Route::get('/terms-conditions', [WebPagesController::class, 'terms'])->name('terms.conditions');






Route::middleware(['auth.hrm'])->prefix('hrm')->group(function () {
    Route::get('/dashboard', [BasicWorksController::class, 'dashboard'])->name('dashboard');

    Route::get('/departments', [BasicWorksController::class, 'departments'])->name('hr.departments');
    Route::post('/departments', [BasicWorksController::class, 'storeDepartment'])->name('hr.departments.store');
    Route::put('/departments/{department}', [BasicWorksController::class, 'updateDepartment'])->name('hr.departments.update');
    Route::delete('/departments/{department}', [BasicWorksController::class, 'destroyDepartment'])->name('hr.departments.destroy');

    Route::get('/roles', [BasicWorksController::class, 'roles'])->name('hr.roles');
    Route::post('/roles', [BasicWorksController::class, 'storeRole'])->name('hr.roles.store');
    Route::put('/roles/{role}', [BasicWorksController::class, 'updateRole'])->name('hr.roles.update');
    Route::delete('/roles/{role}', [BasicWorksController::class, 'destroyRole'])->name('hr.roles.destroy');

    Route::get('/branches', [BasicWorksController::class, 'branches'])->name('hr.branches');
    Route::post('/branches', [BasicWorksController::class, 'storeBranch'])->name('hr.branches.store');
    Route::put('/branches/{branch}', [BasicWorksController::class, 'updateBranch'])->name('hr.branches.update');
    Route::delete('/branches/{branch}', [BasicWorksController::class, 'destroyBranch'])->name('hr.branches.destroy');

    Route::get('/outlets', [BasicWorksController::class, 'outlets'])->name('hr.outlets');
    Route::post('/outlets', [BasicWorksController::class, 'storeOutlet'])->name('hr.outlets.store');
    Route::put('/outlets/{outlet}', [BasicWorksController::class, 'updateOutlet'])->name('hr.outlets.update');
    Route::delete('/outlets/{outlet}', [BasicWorksController::class, 'destroyOutlet'])->name('hr.outlets.destroy');


    Route::get('/holidays', [BasicWorksController::class, 'holidays'])->name('hr.holidays');
    Route::post('/holidays', [BasicWorksController::class, 'storeHoliday'])->name('hr.holidays.store');
    Route::put('/holidays', [BasicWorksController::class, 'updateHoliday'])->name('hr.holidays.update');
    Route::delete('/holidays/{id}', [BasicWorksController::class, 'destroyHoliday'])->name('hr.holidays.destroy');


    Route::get('/app-settings', [BasicWorksController::class, 'app_settings'])->name('hr.app_settings');
    Route::post('/app-settings', [BasicWorksController::class, 'update_settings'])->name('hr.update_app_settings');





    // Second Phase
    Route::get('/employees', [EmployeeController::class, 'employees'])->name('hr.employees');
    Route::post('/employees/create', [EmployeeController::class, 'storeEmployee'])->name('hr.employees.store');
    Route::post('/employees/update', [EmployeeController::class, 'updateEmployee'])->name('hr.employees.update');
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroyEmployee'])->name('hr.employees.destroy');


    Route::get('/leave-requests', [BasicWorksController::class, 'leaves'])->name('hr.leaves');
    Route::put('/leave-requests/update', [BasicWorksController::class, 'update_leave'])->name('hr.leaves.update');


    Route::get('/announcement', [BasicWorksController::class, 'announcement'])->name('hr.announcement');
    Route::post('/announcement', [BasicWorksController::class, 'store_announcement'])->name('hr.announcement.store');
    Route::put('/announcement/update', [BasicWorksController::class, 'update_announcement'])->name('hr.announcement.update');
    Route::delete('/announcement/{id}', [BasicWorksController::class, 'delete_announcement'])->name('hr.announcement.delete');


    Route::get('/punishments', [BasicWorksController::class, 'punishments'])->name('hr.punishments');
    Route::post('/punishments', [BasicWorksController::class, 'storePunishment'])->name('hr.punishments.store');
    Route::put('/punishments/{punishment}', [BasicWorksController::class, 'updatePunishment'])->name('hr.punishments.update');
    Route::delete('/punishments/{punishment}', [BasicWorksController::class, 'destroyPunishment'])->name('hr.punishments.destroy');


    Route::get('/promotions',                  [PromotionsController::class, 'promotions'])->name('hr.promotions');
    Route::post('/promotions/store',           [PromotionsController::class, 'store'])->name('hr.promotions.store');
    Route::put('/promotions/{promotion}',     [PromotionsController::class, 'update'])->name('hr.promotions.update');
    Route::delete('/promotions/{promotion}',   [PromotionsController::class, 'destroy'])->name('hr.promotions.destroy');
    Route::get('/promotions/search-employee',  [PromotionsController::class, 'searchEmployee'])->name('hr.promotions.search');



    // Third Phase
    Route::get('/attendance', [AttendanceController::class, 'attendance'])->name('hr.attendance');
    Route::post('/attendance', [AttendanceController::class, 'store'])->name('hr.attendance.store');
    Route::put('/attendance/{id}', [AttendanceController::class, 'update'])->name('hr.attendance.update');
    Route::delete('/attendance/{id}', [AttendanceController::class, 'destroy'])->name('hr.attendance.destroy');




    // Fourth Phase
    Route::get('/payrolls', [PayrollController::class, 'payrolls'])->name('hr.payrolls');
    Route::post('/payrolls', [PayrollController::class, 'store'])->name('hr.payrolls.store');
    Route::put('/payrolls/{payroll}', [PayrollController::class, 'update'])->name('hr.payrolls.update');
    Route::delete('/payrolls/{payroll}', [PayrollController::class, 'destroy'])->name('hr.payrolls.destroy');
    Route::post('/payrolls/bulk-release', [PayrollController::class, 'bulkRelease'])->name('hr.payrolls.bulk');
    Route::post('/payrolls/bulk-bonus', [PayrollController::class, 'bulkBonus'])->name('hr.payrolls.bulk-bonus');
});



Route::get('/clear', function () {
    Artisan::call('cache:clear');
    Artisan::call('config:clear');
    Artisan::call('config:cache');
    Artisan::call('view:clear');
    Artisan::call('storage:link');
    
    return "Cleared!";
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/employee.php';