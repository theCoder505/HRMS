<?php

use App\Http\Controllers\API\AttendanceFromDevice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');


Route::post('/employees/mark-attendance', [AttendanceFromDevice::class, 'storeAttendance']);

