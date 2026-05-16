<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\Holiday;
use App\Models\Leave;
use App\Models\Payroll;
use App\Models\Punishment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EmployeeDashboardController extends Controller
{
    public function dashboard()
    {
        $employee = Auth::guard('employee')->user();
        
        $totalLeaves = Leave::where('employee_uid', $employee->employee_uid)->count();
        $pendingLeaves = Leave::where('employee_uid', $employee->employee_uid)->where('approval', '0')->count();
        
        $payrollsCount = Payroll::where('employee_uid', $employee->employee_uid)->count();
        $punishmentsCount = Punishment::where('employee_uid', $employee->employee_uid)->count();

        return Inertia::render('employee/dashboard', [
            'employee' => $employee,
            'totalLeaves' => $totalLeaves,
            'pendingLeaves' => $pendingLeaves,
            'payrollsCount' => $payrollsCount,
            'punishmentsCount' => $punishmentsCount,
            'announcementsCount' => Announcement::count(),
        ]);
    }

    public function profile()
    {
        $employee = Auth::guard('employee')->user();
        return Inertia::render('employee/profile', compact('employee'));
    }

    public function leaves()
    {
        $employee = Auth::guard('employee')->user();
        $leaves = Leave::where('employee_uid', $employee->employee_uid)->latest()->get();
        return Inertia::render('employee/leaves', compact('leaves'));
    }

    public function submit_leave(Request $request)
    {
        $employee = Auth::guard('employee')->user();
        $request->validate([
            'title' => 'required|string|max:255',
            'leave_reson' => 'required|string',
            'leave_from_date' => 'required|date',
            'leave_to_date' => 'required|date|after_or_equal:leave_from_date',
        ]);

        Leave::create([
            'employee_uid' => $employee->employee_uid,
            'title' => $request->title,
            'leave_reson' => $request->leave_reson,
            'leave_from_date' => $request->leave_from_date,
            'leave_to_date' => $request->leave_to_date,
            'approval' => 0, // Pending
        ]);

        return back()->with('success', 'Leave request submitted successfully.');
    }

    public function attendance(Request $request)
    {
        $employee = Auth::guard('employee')->user();
        
        $query = Attendance::where('employee_uid', $employee->employee_uid)->latest('attend_date');

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('attend_date', [$request->start_date, $request->end_date]);
        }

        $attendances = $query->get();
        return Inertia::render('employee/attendance', compact('attendances'));
    }

    public function payrolls()
    {
        $employee = Auth::guard('employee')->user();
        $payrolls = Payroll::where('employee_uid', $employee->employee_uid)->latest()->get();
        return Inertia::render('employee/payrolls', compact('payrolls'));
    }

    public function punishments()
    {
        $employee = Auth::guard('employee')->user();
        $punishments = Punishment::where('employee_uid', $employee->employee_uid)->latest()->get();
        return Inertia::render('employee/punishments', compact('punishments'));
    }

    public function announcements()
    {
        $employee = Auth::guard('employee')->user();

        $announcements = Announcement::where('type', 'all')
            ->orWhereHas('employees', function ($q) use ($employee) {
                // Qualify with pivot table to avoid "Column ambiguous" error
                $q->where('announcement_employee.employee_uid', $employee->employee_uid);
            })
            ->latest()
            ->get();

        return Inertia::render('employee/announcements', compact('announcements'));
    }

    public function holidays()
    {
        $holidays = Holiday::latest()->get();
        return Inertia::render('employee/holidays', compact('holidays'));
    }
}
