<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Holiday;
use App\Models\Leave;
use App\Models\Payroll;
use App\Models\Punishment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayrollController extends Controller
{



    public function payrolls()
    {
        $payrolls = Payroll::with('employee')
            ->latest()
            ->get()
            ->map(function ($payroll) {
                $includes = $payroll->payment_includes;
                if (is_string($includes)) {
                    $decoded  = json_decode($includes, true);
                    $includes = is_array($decoded) ? $decoded : [];
                }

                return [
                    'id'               => $payroll->id,
                    'employee_uid'     => $payroll->employee_uid,
                    'payment_includes' => $includes,
                    'basic_salary'     => $payroll->basic_salary,
                    'net_amount'       => $payroll->net_amount,
                    'salary_month'     => (int) $payroll->salary_month,
                    'salary_year'      => (int) $payroll->salary_year,
                    'note'             => $payroll->note,
                    'created_at'       => $payroll->created_at,
                    'updated_at'       => $payroll->updated_at,
                    'employee'         => $payroll->employee ? [
                        'name'      => $payroll->employee->name,
                        'img'       => $payroll->employee->img,
                        'job_title' => $payroll->employee->job_title,
                        'salary'    => $payroll->employee->salary,
                        'join_date' => $payroll->employee->join_date,
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
            'join_date',
            'salary'
        )->get();

        $attendance = Attendance::select(
            'id',
            'employee_uid',
            'attend_date',
            'clock_in_time',
            'clock_out_time'
        )->get();

        $leaves = Leave::select(
            'id',
            'employee_uid',
            'title',
            'leave_reson',
            'leave_from_date',
            'leave_to_date',
            'type',
            'deduction_type',
            'deduction_amount',
            'approval'
        )->get();

        $punishments = Punishment::select(
            'id',
            'employee_uid',
            'title',
            'punishment_reason',
            'effective_from',
            'effective_to',
            'basic_salary',
            'deduction_amount'
        )->get();

        $holidays = Holiday::select('id', 'title', 'start_date', 'end_date')->get();

        return Inertia::render('hr/payrolls/records', compact(
            'payrolls',
            'employees',
            'attendance',
            'leaves',
            'punishments',
            'holidays'
        ));
    }



    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_uid'       => 'required|string|exists:employees,employee_uid',
            'payment_includes'   => 'required|array',
            'payment_includes.*' => 'in:bonus,overtime,regular,punishment,late_deduction,leave_deduction,other',
            'basic_salary'       => 'required|numeric|min:0',
            'net_amount'         => 'required|numeric|min:0',
            'salary_month'       => 'required|integer|min:1|max:12',
            'salary_year'        => 'required|integer|min:2000|max:2100',
            'note'               => 'nullable|string|max:1000',
        ]);

        $month      = (int) $validated['salary_month'];
        $year       = (int) $validated['salary_year'];
        $monthStart = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $monthLabel = $monthStart->format('F Y');

        // ── Join-date guard ──────────────────────────────────────────────────
        // Employee must have joined ON OR BEFORE the first day of the salary month.
        $employee = Employee::where('employee_uid', $validated['employee_uid'])->firstOrFail();

        if ($employee->join_date) {
            $joinDate = Carbon::parse($employee->join_date)->startOfDay();

            if ($joinDate->gt($monthStart)) {
                return back()->withErrors([
                    'salary_month' => "This employee joined on {$joinDate->format('F j, Y')} and is not eligible for {$monthLabel} salary.",
                ])->withInput();
            }
        }

        // ── Duplicate guard ──────────────────────────────────────────────────
        $duplicate = Payroll::where('employee_uid', $validated['employee_uid'])
            ->where('salary_month', $month)
            ->where('salary_year', $year)
            ->exists();

        if ($duplicate) {
            return back()->withErrors([
                'salary_month' => "A payroll record already exists for this employee for {$monthLabel}. Edit the existing record instead.",
            ])->withInput();
        }

        Payroll::create([
            'employee_uid'     => $validated['employee_uid'],
            'payment_includes' => json_encode($validated['payment_includes']),
            'basic_salary'     => $validated['basic_salary'],
            'net_amount'       => $validated['net_amount'],
            'salary_month'     => $month,
            'salary_year'      => $year,
            'note'             => $validated['note'] ?? null,
        ]);

        return back()->with('success', 'Payroll record created successfully.');
    }



    
    public function update(Request $request, Payroll $payroll)
    {
        $validated = $request->validate([
            'payment_includes'   => 'required|array',
            'payment_includes.*' => 'in:bonus,overtime,regular,punishment,late_deduction,leave_deduction,other',
            'basic_salary'       => 'required|numeric|min:0',
            'net_amount'         => 'required|numeric|min:0',
            'note'               => 'nullable|string|max:1000',
        ]);

        $payroll->update([
            'payment_includes' => json_encode($validated['payment_includes']),
            'basic_salary'     => $validated['basic_salary'],
            'net_amount'       => $validated['net_amount'],
            'note'             => $validated['note'] ?? null,
        ]);

        return back()->with('success', 'Payroll record updated successfully.');
    }



    
    public function destroy(Payroll $payroll)
    {
        $payroll->delete();
        return back()->with('success', 'Payroll record deleted successfully.');
    }



    
    public function bulkRelease(Request $request)
    {
        $validated = $request->validate([
            'year'  => 'required|integer|min:2000|max:2100',
            'month' => 'required|integer|min:1|max:12',
        ]);

        $year       = (int) $validated['year'];
        $month      = (int) $validated['month'];
        $monthStart = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $monthLabel = $monthStart->format('F Y');

        // UIDs that already have a payroll for this salary_month + salary_year
        $existing = Payroll::where('salary_month', $month)
            ->where('salary_year', $year)
            ->pluck('employee_uid')
            ->toArray();

        $employees = Employee::select('employee_uid', 'salary', 'join_date')
            ->whereNotIn('employee_uid', $existing)
            ->whereNotNull('salary')
            ->where('salary', '>', 0)
            ->get();

        $created = 0;
        $skipped = 0;

        foreach ($employees as $emp) {
            // Skip employees who joined AFTER the first day of the salary month
            if ($emp->join_date) {
                $joinDate = Carbon::parse($emp->join_date)->startOfDay();
                if ($joinDate->gt($monthStart)) {
                    $skipped++;
                    continue;
                }
            }

            Payroll::create([
                'employee_uid'     => $emp->employee_uid,
                'payment_includes' => json_encode(['regular']),
                'basic_salary'     => $emp->salary,
                'net_amount'       => $emp->salary,
                'salary_month'     => $month,
                'salary_year'      => $year,
                'note'             => null,
            ]);

            $created++;
        }

        $msg = "Bulk release complete. {$created} payroll record(s) created for {$monthLabel}.";
        if ($skipped > 0) {
            $msg .= " {$skipped} employee(s) skipped — joined after {$monthLabel}.";
        }

        return back()->with('success', $msg);
    }



    
    public function bulkBonus(Request $request)
    {
        $validated = $request->validate([
            'type'        => 'required|in:percent,fixed',
            'amount'      => 'required|numeric|min:0',
            'bonus_year'  => 'required|integer|min:2000|max:2100',
            'bonus_month' => 'required|integer|min:1|max:12',
            'note'        => 'nullable|string|max:1000',
        ]);

        $year       = (int) $validated['bonus_year'];
        $month      = (int) $validated['bonus_month'];
        $monthStart = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $monthLabel = $monthStart->format('F Y');

        $employees = Employee::select('employee_uid', 'salary', 'join_date')
            ->whereNotNull('salary')
            ->where('salary', '>', 0)
            ->get();

        $processed = 0;
        $skipped   = 0;

        foreach ($employees as $emp) {
            // Skip employees who joined after the bonus month
            if ($emp->join_date) {
                $joinDate = Carbon::parse($emp->join_date)->startOfDay();
                if ($joinDate->gt($monthStart)) {
                    $skipped++;
                    continue;
                }
            }

            $basicSalary = floatval($emp->salary);
            $bonusAmount = $validated['type'] === 'percent'
                ? $basicSalary * (floatval($validated['amount']) / 100)
                : floatval($validated['amount']);

            // net_amount = salary + bonus
            $netAmount = $basicSalary + $bonusAmount;

            $existing = Payroll::where('employee_uid', $emp->employee_uid)
                ->where('salary_month', $month)
                ->where('salary_year', $year)
                ->first();

            if ($existing) {
                $existingIncludes = json_decode($existing->payment_includes, true) ?? [];
                $existing->update([
                    'payment_includes' => json_encode(array_values(array_unique(array_merge($existingIncludes, ['bonus'])))),
                    'net_amount'       => $netAmount,
                    'note'             => $validated['note'] ?? $existing->note,
                ]);
            } else {
                Payroll::create([
                    'employee_uid'     => $emp->employee_uid,
                    'payment_includes' => json_encode(['regular', 'bonus']),
                    'basic_salary'     => $basicSalary,
                    'net_amount'       => $netAmount,
                    'salary_month'     => $month,
                    'salary_year'      => $year,
                    'note'             => $validated['note'] ?? null,
                ]);
            }

            $processed++;
        }

        $msg = "Bonus processed for {$processed} employee(s) for {$monthLabel}.";
        if ($skipped > 0) {
            $msg .= " {$skipped} employee(s) skipped — joined after {$monthLabel}.";
        }

        return back()->with('success', $msg);
    }

    
}
