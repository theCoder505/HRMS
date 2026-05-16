<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\Request;

class AttendanceFromDevice extends Controller
{




    public function addFingerPrint(Request $request)
    {
        $request->validate([
            'employee_uid' => 'required|string',
            'fingerprint1' => 'required|string',
            'fingerprint2' => 'nullable|string',
            'card_identity' => 'nullable|string',
        ]);

        $employee = Employee::where('employee_uid', $request['employee_uid'])->first();
        $employee->fingerprint1 = $request['fingerprint1'];
        $employee->fingerprint2 = $request['fingerprint2'];
        $employee->card_identity = $request['card_identity'];
        $employee->save();

        return response()->json([
            'success' => true,
            'message' => 'Fingers Taken!',
        ], 201);
    }

    // {
    //     "employee_uid": "HRV_252647_2026",
    //     "fingerprint1": "Alan-001",
    //     "fingerprint2": "Alan-002",
    //     "card_identity": "Alan-Card-001"
    // }





    







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

    // {
    //     "fingerprint": "FP-011",
    //     "attend_date": "2026-05-16",
    //     "action_time": "18:50",
    // }




    //
}
