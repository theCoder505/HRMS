<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\Request;

class AttendanceFromDevice extends Controller
{












    public function storeAttendance(Request $request)
    {
        $request->validate([
            'fingerprint' => 'required|string',
            'attend_date' => 'required|date',
            'action_time' => 'required|date_format:H:i',
        ]);

        $fingerprint = $request->fingerprint;

        $employee = Employee::where('fingerprint1', $fingerprint)
            ->orWhere('fingerprint2', $fingerprint)
            ->orWhere('card_identity', $fingerprint)
            ->first();

        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee Not Found!',
            ], 404);
        }

        $attendance = Attendance::where('employee_uid', $employee->employee_uid)
            ->where('attend_date', $request->attend_date)
            ->first();

        if ($attendance) {
            if ($attendance->clock_out_time) {
                return response()->json([
                    'success' => false,
                    'message' => 'Already Clocked Out!',
                ], 200);
            }

            $attendance->update([
                'clock_out_time' => $request->action_time,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Clocked Out Successfully!',
            ], 201);
        }

        Attendance::create([
            'employee_uid'  => $employee->employee_uid,
            'attend_date'   => $request->attend_date,
            'clock_in_time' => $request->action_time,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Clocked In Successfully!',
        ], 201);
    }







    //
}
