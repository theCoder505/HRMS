<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Holiday;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{






    public function attendance()
    {
        $attendance = Attendance::with('employee')->latest()->get()->map(function ($record) {
            return [
                'id'             => $record->id,
                'employee_uid'   => $record->employee_uid,
                'attend_date'    => $record->attend_date,
                'clock_in_time'  => $record->clock_in_time,
                'clock_out_time' => $record->clock_out_time,
                'created_at'     => $record->created_at,
                'employee'       => $record->employee ? [
                    'employee_uid'  => $record->employee->employee_uid,
                    'name'          => $record->employee->name,
                    'img'           => $record->employee->img,
                    'job_title'     => $record->employee->job_title,
                    'department'    => $record->employee->department,
                    'branch'        => $record->employee->branch,
                    'outlet'        => $record->employee->outlet,
                    'clock_in_time' => $record->employee->clock_in_time,
                    'clock_out_time' => $record->employee->clock_out_time,
                    'office_days'   => $record->employee->office_days,
                    'weekend'       => $record->employee->weekend,
                    'join_date'     => $record->employee->join_date,
                ] : null,
            ];
        });

        $employees = Employee::select(
            'employee_uid',
            'name',
            'img',
            'job_title',
            'department',
            'branch',
            'outlet',
            'clock_in_time',
            'clock_out_time',
            'office_days',
            'weekend',
            'join_date'
        )->get();

        $holidays = Holiday::select('id', 'title', 'start_date', 'end_date')->get();

        return Inertia::render('hr/attendance/reports', compact('attendance', 'employees', 'holidays'));
    }






    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_uid'   => 'required|string|exists:employees,employee_uid',
            'attend_date'    => 'required|date',
            'clock_in_time'  => 'nullable|date_format:H:i',
            'clock_out_time' => 'nullable|date_format:H:i',
        ]);

        Attendance::updateOrCreate(
            [
                'employee_uid' => $validated['employee_uid'],
                'attend_date'  => $validated['attend_date'],
            ],
            [
                'clock_in_time'  => $validated['clock_in_time'] ?? null,
                'clock_out_time' => $validated['clock_out_time'] ?? null,
            ]
        );

        return back()->with('success', 'Attendance record saved successfully.');
    }






    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'employee_uid'   => 'required|string|exists:employees,employee_uid',
            'attend_date'    => 'required|date',
            'clock_in_time'  => 'nullable|date_format:H:i',
            'clock_out_time' => 'nullable|date_format:H:i',
        ]);

        $attendance = Attendance::findOrFail($id);
        $attendance->update($validated);

        return back()->with('success', 'Attendance record updated successfully.');
    }






    public function destroy($id)
    {
        $attendance = Attendance::findOrFail($id);
        $attendance->delete();

        return back()->with('success', 'Attendance record deleted successfully.');
    }
}
