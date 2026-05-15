<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Branch;
use App\Models\Role;
use App\Models\Outlet;
use App\Models\Employee;
use App\Models\Promotion;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PromotionsController extends Controller
{




    public function promotions()
    {
        $promotions = Promotion::with('employee')
            ->latest()
            ->get()
            ->map(fn($p) => [
                'id'                   => $p->id,
                'employee_uid'         => $p->employee_uid,
                'employee_name'        => $p->employee?->name   ?? 'Unknown',
                'employee_img'         => $p->employee?->img    ?? null,
                'employee_email'       => $p->employee?->email  ?? '',
                'job_title'            => $p->job_title,
                'department'           => $p->department,
                'branch'               => $p->branch,
                'role'                 => $p->role,
                'outlet'               => $p->outlet,
                'old_salary'           => $p->old_salary,
                'new_salary'           => $p->new_salary,
                'increment_percentage' => $p->increment_percentage,
                'increment_amount'     => $p->increment_amount,
                'execution_date'       => $p->execution_date,
                'promotion_report'     => $p->promotion_report,
                'created_at'           => $p->created_at,
            ]);

        // All employees for the select dropdown
        $employees = Employee::select(
            'employee_uid', 'name', 'email', 'img',
            'job_title', 'department', 'branch', 'role', 'outlet', 'salary'
        )->orderBy('name')->get();

        // Lookups for the form selects
        $departments = Department::select('id', 'title as name')->get();
        $branches    = Branch::select('id', 'branch_name as name')->get();

        // Roles carry their parent department_id so the frontend can filter them
        $roles = Role::select('id', 'title as name', 'department as department_id')->get();

        // Outlets carry their parent branch_id so the frontend can filter them
        $outlets = Outlet::select('id', 'name', 'branch as branch_id')->get();

        return Inertia::render('hr/promotions', compact(
            'promotions',
            'employees',
            'departments',
            'branches',
            'roles',
            'outlets'
        ));
    }






    /**
     * @deprecated  Kept for backward compat if any other feature uses it.
     * The new UI uses a select, but the route can stay.
     */
    public function searchEmployee(Request $request)
    {
        $q = $request->get('q', '');

        $employees = Employee::where('name', 'like', "%{$q}%")
            ->orWhere('employee_uid', 'like', "%{$q}%")
            ->limit(10)
            ->get(['employee_uid', 'name', 'email', 'img', 'job_title', 'department', 'branch', 'role', 'outlet', 'salary']);

        return response()->json($employees);
    }










    public function store(Request $request)
    {
        $request->validate([
            'employee_uid'         => 'required|exists:employees,employee_uid',
            'job_title'            => 'required|string|max:255',
            'department'           => 'nullable|exists:departments,id',
            'branch'               => 'nullable|exists:branches,id',
            'role'                 => 'nullable|exists:roles,id',
            'outlet'               => 'nullable|exists:outlets,id',
            'old_salary'           => 'required|numeric|min:0',
            'new_salary'           => 'required|numeric|min:0',
            'increment_percentage' => 'nullable|numeric',
            'increment_amount'     => 'nullable|numeric',
            'execution_date'       => 'required|date',
            'promotion_report'     => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        // Guard against duplicate promotions for the same employee
        if (Promotion::where('employee_uid', $request->employee_uid)->exists()) {
            return back()->withErrors([
                'employee_uid' => 'A promotion record already exists for this employee. Please edit the existing record instead.',
            ]);
        }

        $reportPath = $request->file('promotion_report')->store('promotion_reports', 'public');

        $promotion = Promotion::create([
            'employee_uid'         => $request->employee_uid,
            'job_title'            => $request->job_title,
            'department'           => $request->department,
            'branch'               => $request->branch,
            'role'                 => $request->role,
            'outlet'               => $request->outlet,
            'old_salary'           => $request->old_salary,
            'new_salary'           => $request->new_salary,
            'increment_percentage' => $request->increment_percentage,
            'increment_amount'     => $request->increment_amount,
            'execution_date'       => $request->execution_date,
            'promotion_report'     => $reportPath,
        ]);

        // Update employee record
        Employee::where('employee_uid', $request->employee_uid)->update([
            'job_title'  => $request->job_title,
            'department' => $request->department,
            'branch'     => $request->branch,
            'outlet'     => $request->outlet,
            'role'       => $request->role,
            'salary'     => $request->new_salary,
        ]);

        $this->sendPromotionEmail($promotion, $request->old_salary);

        return back()->with('success', 'Promotion recorded successfully!');
    }





    public function update(Request $request, Promotion $promotion)
    {
        $request->validate([
            'employee_uid'         => 'required|exists:employees,employee_uid',
            'job_title'            => 'required|string|max:255',
            'department'           => 'nullable|exists:departments,id',
            'branch'               => 'nullable|exists:branches,id',
            'role'                 => 'nullable|exists:roles,id',
            'outlet'               => 'nullable|exists:outlets,id',
            'old_salary'           => 'required|numeric|min:0',
            'new_salary'           => 'required|numeric|min:0',
            'increment_percentage' => 'nullable|numeric',
            'increment_amount'     => 'nullable|numeric',
            'execution_date'       => 'required|date',
            'promotion_report'     => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $data = [
            'employee_uid'         => $request->employee_uid,
            'job_title'            => $request->job_title,
            'department'           => $request->department,
            'branch'               => $request->branch,
            'role'                 => $request->role,
            'outlet'               => $request->outlet,
            'old_salary'           => $request->old_salary,
            'new_salary'           => $request->new_salary,
            'increment_percentage' => $request->increment_percentage,
            'increment_amount'     => $request->increment_amount,
            'execution_date'       => $request->execution_date,
        ];

        // Replace report file if a new one was uploaded
        if ($request->hasFile('promotion_report')) {
            // Delete old file
            Storage::disk('public')->delete($promotion->promotion_report);
            $data['promotion_report'] = $request->file('promotion_report')->store('promotion_reports', 'public');
        }

        $promotion->update($data);

        // Keep employee record in sync with the latest promotion details
        Employee::where('employee_uid', $request->employee_uid)->update([
            'job_title'  => $request->job_title,
            'department' => $request->department,
            'branch'     => $request->branch,
            'outlet'     => $request->outlet,
            'role'       => $request->role,
            'salary'     => $request->new_salary,
        ]);

        return back()->with('success', 'Promotion updated successfully!');
    }





    public function destroy(Promotion $promotion)
    {
        Storage::disk('public')->delete($promotion->promotion_report);
        $promotion->delete();

        return back()->with('success', 'Promotion deleted successfully!');
    }




    
    private function sendPromotionEmail(Promotion $promotion, $oldSalary): void
    {
        $employee  = Employee::where('employee_uid', $promotion->employee_uid)->first();
        $brandname = Setting::where('id', 1)->value('brand_name') ?? config('app.name');

        if (! $employee?->email) {
            return;
        }

        $data = [
            'brandname'            => $brandname,
            'employee_name'        => $employee->name,
            'job_title'            => $promotion->job_title,
            'old_salary'           => $oldSalary,
            'new_salary'           => $promotion->new_salary,
            'increment_percentage' => $promotion->increment_percentage,
            'increment_amount'     => $promotion->increment_amount,
            'execution_date'       => $promotion->execution_date,
            'report_url'           => Storage::url($promotion->promotion_report),
        ];

        Mail::send(
            'mail.employee.promotion_update',
            $data,
            function ($message) use ($employee, $brandname) {
                $message->to($employee->email)
                    ->subject("Congratulations! Your Promotion at {$brandname}");
            }
        );
    }
}