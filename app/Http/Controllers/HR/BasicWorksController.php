<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Branch;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Holiday;
use App\Models\Leave;
use App\Models\Outlet;
use App\Models\Punishment;
use App\Models\Role;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class BasicWorksController extends Controller
{



    public function dashboard()
    {
        return Inertia::render('dashboard');
    }
















    public function departments()
    {
        $departments = Department::withCount('roles')->latest()->get();
        return Inertia::render('hr/departments', compact('departments'));
    }

    public function storeDepartment(Request $request)
    {
        $request->validate(['title' => 'required|string|unique:departments,title|max:255']);
        Department::create($request->only('title'));
        return back()->with('success', 'Department created.');
    }

    public function updateDepartment(Request $request, Department $department)
    {
        $request->validate(['title' => 'required|string|unique:departments,title,' . $department->id . '|max:255']);
        $department->update($request->only('title'));
        return back()->with('success', 'Department updated.');
    }

    public function destroyDepartment(Department $department)
    {
        $department->delete();
        return back()->with('success', 'Department deleted.');
    }
























    public function roles()
    {
        $roles = Role::with('departmentInfo')->latest()->get();
        $departments = Department::orderBy('title')->get(['id', 'title']);
        return Inertia::render('hr/roles', compact('roles', 'departments'));
    }

    public function storeRole(Request $request)
    {
        $request->validate([
            'title'      => 'required|string|max:255',
            'department' => 'nullable|exists:departments,id',
        ]);
        Role::create($request->only('title', 'department'));
        return back()->with('success', 'Role created.');
    }

    public function updateRole(Request $request, Role $role)
    {
        $request->validate([
            'title'      => 'required|string|max:255',
            'department' => 'nullable|exists:departments,id',
        ]);
        $role->update($request->only('title', 'department'));
        return back()->with('success', 'Role updated.');
    }

    public function destroyRole(Role $role)
    {
        $role->delete();
        return back()->with('success', 'Role deleted.');
    }

























    public function branches()
    {
        $branches = Branch::withCount('outlets')->latest()->get();
        return Inertia::render('hr/branches', compact('branches'));
    }

    public function storeBranch(Request $request)
    {
        $request->validate(['branch_name' => 'required|string|unique:branches,branch_name|max:255']);
        Branch::create($request->only('branch_name'));
        return back()->with('success', 'Branch created.');
    }

    public function updateBranch(Request $request, Branch $branch)
    {
        $request->validate(['branch_name' => 'required|string|unique:branches,branch_name,' . $branch->id . '|max:255']);
        $branch->update($request->only('branch_name'));
        return back()->with('success', 'Branch updated.');
    }

    public function destroyBranch(Branch $branch)
    {
        $branch->delete();
        return back()->with('success', 'Branch deleted.');
    }



























    public function outlets()
    {
        $outlets = Outlet::with('branchInfo')->latest()->get();
        $branches = Branch::orderBy('branch_name')->get(['id', 'branch_name']);
        return Inertia::render('hr/outlets', compact('outlets', 'branches'));
    }

    public function storeOutlet(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'branch'   => 'nullable|exists:branches,id',
            'location' => 'nullable|string|max:255',
            'map'      => 'nullable|string|max:500',
        ]);
        Outlet::create($request->only('name', 'branch', 'location', 'map'));
        return back()->with('success', 'Outlet created.');
    }

    public function updateOutlet(Request $request, Outlet $outlet)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'branch'   => 'nullable|exists:branches,id',
            'location' => 'nullable|string|max:255',
            'map'      => 'nullable|string|max:500',
        ]);
        $outlet->update($request->only('name', 'branch', 'location', 'map'));
        return back()->with('success', 'Outlet updated.');
    }

    public function destroyOutlet(Outlet $outlet)
    {
        $outlet->delete();
        return back()->with('success', 'Outlet deleted.');
    }















    public function holidays()
    {
        $holidays = Holiday::latest()->get();
        return Inertia::render('hr/holidays', compact('holidays'));
    }

    public function storeHoliday(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'reason' => 'required|string|max:1000',
            'start_date' => 'required|date|max:255',
            'end_date' => 'required|date|max:255',
        ]);

        Holiday::create([
            'title' => $request['title'],
            'reason' => $request['reason'],
            'start_date' => $request['start_date'],
            'end_date' => $request['end_date'],
        ]);

        return back()->with('success', 'Holiday added.');
    }

    public function updateHoliday(Request $request)
    {
        $holiday_id = $request['id'];
        $holiday = Holiday::where('id', $holiday_id)->firstOrFail();

        $request->validate([
            'title' => 'required|string|max:255',
            'reason' => 'required|string|max:1000',
            'start_date' => 'required|date|max:255',
            'end_date' => 'required|date|max:255',
        ]);

        $holiday->update([
            'title' => $request['title'],
            'reason' => $request['reason'],
            'start_date' => $request['start_date'],
            'end_date' => $request['end_date'],
        ]);

        return back()->with('success', 'Holiday updated.');
    }

    public function destroyHoliday($id)
    {
        $holiday = Holiday::where('id', $id)->first();
        $holiday->delete();
        return back()->with('success', 'Holiday removed.');
    }



















    public function app_settings()
    {
        $settings = Setting::where('id', 1)->first();
        return Inertia::render('hr/app_settings', compact('settings'));
    }

    public function update_settings(Request $request)
    {
        $request->validate([
            'brand_name'       => ['required', 'string', 'max:255'],
            'brand_logo'       => ['nullable', 'image', 'mimes:png', 'max:10240'], // max 10 MB
            'brand_icon'       => ['nullable', 'image', 'mimes:png', 'max:10240'], // max 10 MB
            'location'         => ['nullable', 'string', 'max:500'],
            'gogle_map'        => ['nullable', 'url', 'max:2000'],
            'facebook'         => ['nullable', 'url', 'max:500'],
            'instagram'        => ['nullable', 'url', 'max:500'],
            'twitter'          => ['nullable', 'url', 'max:500'],
            'linkedin'         => ['nullable', 'url', 'max:500'],
            'contact_email'    => ['nullable', 'email', 'max:255'],
            'about'            => ['nullable', 'string'],
            'privacy_policy'   => ['nullable', 'string'],
            'terms_conditions' => ['nullable', 'string'],
        ], [
            'brand_name.required' => 'Brand name is required.',
            'brand_logo.mimes'    => 'Brand logo must be a PNG image.',
            'brand_logo.max'      => 'Brand logo must not exceed 10 MB.',
            'brand_icon.mimes'    => 'Brand icon must be a PNG image.',
            'brand_icon.max'      => 'Brand icon must not exceed 10 MB.',
            'gogle_map.url'       => 'Google Maps must be a valid URL.',
            'facebook.url'        => 'Facebook must be a valid URL.',
            'instagram.url'       => 'Instagram must be a valid URL.',
            'twitter.url'         => 'Twitter must be a valid URL.',
            'linkedin.url'        => 'LinkedIn must be a valid URL.',
            'contact_email.email' => 'Contact email must be a valid email address.',
        ]);

        $settings = Setting::where('id', 1)->firstOrFail();

        $brandNameChanged = $settings->brand_name !== $request->brand_name;
        $brandLogoChanged = $request->hasFile('brand_logo');
        $brandIconChanged = $request->hasFile('brand_icon');
        $brandChanged     = $brandNameChanged || $brandLogoChanged || $brandIconChanged;

        if ($brandLogoChanged) {
            $assetsDir = public_path('assets');
            if (!is_dir($assetsDir)) mkdir($assetsDir, 0755, true);
            $request->file('brand_logo')->move($assetsDir, 'logo.png');
            $settings->brand_logo = 'assets/logo.png';
        }

        if ($brandIconChanged) {
            $assetsDir = public_path('assets');
            if (!is_dir($assetsDir)) mkdir($assetsDir, 0755, true);
            $request->file('brand_icon')->move($assetsDir, 'hrms_icon.png');
            $settings->brand_icon = 'assets/hrms_icon.png';
        }

        $settings->brand_name       = $request->brand_name;
        $settings->location         = $request->location;
        $settings->gogle_map        = $request->gogle_map;
        $settings->facebook         = $request->facebook;
        $settings->instagram        = $request->instagram;
        $settings->twitter          = $request->twitter;
        $settings->linkedin         = $request->linkedin;
        $settings->contact_email    = $request->contact_email;
        $settings->about            = $request->about;
        $settings->privacy_policy   = $request->privacy_policy;
        $settings->terms_conditions = $request->terms_conditions;
        $settings->save();

        if ($brandChanged) {
            if ($brandNameChanged) {
                $envPath    = base_path('.env');
                $envContent = file_get_contents($envPath);
                $envContent = preg_replace(
                    '/^APP_NAME=.*/m',
                    'APP_NAME="' . addslashes($request->brand_name) . '"',
                    $envContent
                );
                file_put_contents($envPath, $envContent);
            }

            Artisan::call('cache:clear');
            Artisan::call('config:clear');
            Artisan::call('view:clear');
        }

        return back()->with('success', 'Updated!');
    }








    public function leaves()
    {
        $leaves = Leave::with('employee')
            ->latest()
            ->get()
            ->map(function ($leave) {
                return [
                    'id'               => $leave->id,
                    'employee_uid'     => $leave->employee_uid,
                    'employee_name'    => $leave->employee?->name ?? 'Unknown',
                    'employee_email'   => $leave->employee?->email ?? '',
                    'employee_img'     => $leave->employee?->img ?? null,
                    'title'            => $leave->title,
                    'leave_reson'      => $leave->leave_reson,
                    'leave_from_date'  => $leave->leave_from_date,
                    'leave_to_date'    => $leave->leave_to_date,
                    'type'             => $leave->type,
                    'deduction_type'   => $leave->deduction_type,
                    'deduction_amount' => $leave->deduction_amount,
                    'approval'         => $leave->approval,
                    'created_at'       => $leave->created_at,
                ];
            });

        return Inertia::render('hr/leaves', compact('leaves'));
    }









    public function update_leave(Request $request)
    {
        $request->validate([
            'id'               => 'required|exists:leaves,id',
            'approval'         => 'required|in:0,1',
            'type'             => 'required|in:paid,unpaid',
            'deduction_type'   => 'nullable|in:percent,fixed',
            'deduction_amount' => 'nullable|numeric|min:0',
        ]);

        $leave = Leave::with('employee')->findOrFail($request->id);

        $leave->update([
            'approval'         => $request->approval,
            'type'             => $request->type,
            'deduction_type'   => $request->deduction_type   ?? $leave->deduction_type,
            'deduction_amount' => $request->deduction_amount ?? $leave->deduction_amount,
        ]);

        $brandname = Setting::where('id', 1)->value('brand_name') ?? config('app.name');
        $employee  = $leave->employee;
        $email     = $employee?->email;

        if ($email) {
            $status = $request->approval == 1 ? 'Approved' : 'Denied';

            $data = [
                'brandname'        => $brandname,
                'employee_name'    => $employee->name,
                'status'           => $status,
                'title'            => $leave->title,
                'leave_from_date'  => $leave->leave_from_date,
                'leave_to_date'    => $leave->leave_to_date,
                'type'             => ucfirst($leave->type),
                'deduction_type'   => $leave->deduction_type,
                'deduction_amount' => $leave->deduction_amount,
                'approval'         => $request->approval,
            ];

            Mail::send('mail.employee.update_on_leave', $data, function ($message) use ($email, $status) {
                $message->to($email)
                    ->subject("Your Leave Request Has Been {$status}");
            });
        }

        return back()->with('success', 'Leave status updated successfully!');
    }














    public function punishments()
    {
        $punishments = Punishment::with('employee')->latest()->get();
        $employees = Employee::select('employee_uid', 'name', 'email', 'img', 'job_title', 'salary')->get();
        return Inertia::render('hr/punishments', compact('punishments', 'employees'));
    }



    public function storePunishment(Request $request)
    {
        $validated = $request->validate([
            'employee_uid'     => 'required|exists:employees,employee_uid',
            'title'            => 'required|string|max:255',
            'punishment_reason' => 'required|string',
            'effective_from'   => 'required|date',
            'effective_to'     => 'required|date|after_or_equal:effective_from',
            'basic_salary'     => 'required|numeric|min:0',
            'deduction_amount' => 'required|numeric|min:0',
        ]);

        $punishment = Punishment::create($validated);

        $this->sendPunishmentMail($punishment);

        return back()->with('success', 'Punishment record created successfully.');
    }





    public function updatePunishment(Request $request, Punishment $punishment)
    {
        $validated = $request->validate([
            'employee_uid'     => 'required|exists:employees,employee_uid',
            'title'            => 'required|string|max:255',
            'punishment_reason' => 'required|string',
            'effective_from'   => 'required|date',
            'effective_to'     => 'required|date|after_or_equal:effective_from',
            'basic_salary'     => 'required|numeric|min:0',
            'deduction_amount' => 'required|numeric|min:0',
        ]);

        $punishment->update($validated);
        $this->sendPunishmentMail($punishment->fresh()->load('employee'));
        return back()->with('success', 'Punishment record updated successfully.');
    }




    public function destroyPunishment(Punishment $punishment)
    {
        $punishment->delete();
        return back()->with('success', 'Punishment record deleted successfully.');
    }




    private function sendPunishmentMail(Punishment $punishment): void
    {
        $punishment->loadMissing('employee');

        $employee = $punishment->employee;
        $email    = $employee?->email;

        if (!$email) return;

        $brandname = Setting::where('id', 1)->value('brand_name') ?? config('app.name');

        $deductionPct = null;
        $basic = floatval($punishment->basic_salary);
        $ded   = floatval($punishment->deduction_amount);
        if ($basic > 0 && $ded > 0) {
            $deductionPct = round(($ded / $basic) * 100, 2);
        }

        $data = [
            'brandname'        => $brandname,
            'employee_name'    => $employee->name,
            'title'            => $punishment->title,
            'punishment_reason' => $punishment->punishment_reason,
            'effective_from'   => $punishment->effective_from,
            'effective_to'     => $punishment->effective_to,
            'basic_salary'     => $punishment->basic_salary,
            'deduction_amount' => $punishment->deduction_amount,
            'deduction_pct'    => $deductionPct,
        ];

        Mail::send('mail.employee.punishment', $data, function ($message) use ($email, $punishment) {
            $message->to($email)
                ->subject("Disciplinary Action Notice: {$punishment->title}");
        });
    }











    public function announcement()
    {
        $announcements = Announcement::with('employees')->latest()->get();
        $employees = Employee::select('employee_uid', 'name', 'email', 'img')->get();

        return Inertia::render('hr/announcement', [
            'announcements' => $announcements,
            'employees' => $employees
        ]);
    }






    public function store_announcement(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:all,specific',
            'spec_employees' => 'required_if:type,specific|array',
            'spec_employees.*' => 'exists:employees,employee_uid'
        ]);

        $announcement = Announcement::create([
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'spec_employees' => $request->type === 'specific' ? $request->spec_employees : []
        ]);

        if ($request->type === 'specific' && !empty($request->spec_employees)) {
            $announcement->employees()->sync($request->spec_employees);
        }

        return redirect()->back()->with('success', 'Announcement created successfully!');
    }







    public function update_announcement(Request $request)
    {
        $request->validate([
            'id' => 'required|exists:announcements,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:all,specific',
            'spec_employees' => 'required_if:type,specific|array',
            'spec_employees.*' => 'exists:employees,employee_uid'
        ]);

        $announcement = Announcement::findOrFail($request->id);

        $announcement->update([
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'spec_employees' => $request->type === 'specific' ? $request->spec_employees : []
        ]);

        // Sync or detach employees based on type
        if ($request->type === 'specific') {
            if (!empty($request->spec_employees)) {
                $announcement->employees()->sync($request->spec_employees);
            } else {
                $announcement->employees()->detach();
            }
        } else {
            // If type is 'all', remove all employee associations
            $announcement->employees()->detach();
        }

        return redirect()->back()->with('success', 'Announcement updated successfully!');
    }



    public function delete_announcement($id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->employees()->detach();
        $announcement->delete();
        return redirect()->back()->with('success', 'Announcement deleted successfully!');
    }

    //
}
