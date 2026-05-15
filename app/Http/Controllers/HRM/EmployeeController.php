<?php

namespace App\Http\Controllers\HRM;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Outlet;
use App\Models\Role;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EmployeeController extends Controller
{





    public function employees()
    {
        $employees = Employee::with(['department', 'branch', 'outlet', 'role'])
            ->latest()
            ->get()
            ->map(function ($emp) {
                return [
                    'id'               => $emp->id,
                    'employee_uid'     => $emp->employee_uid,
                    'img'              => $emp->img,
                    'name'             => $emp->name,
                    'email'            => $emp->email,
                    'password'         => $emp->password,
                    'address'          => $emp->address,
                    'about'            => $emp->about,
                    'job_title'        => $emp->job_title,

                    // Raw FK integers
                    'department'       => $emp->getRawOriginal('department'),
                    'branch'           => $emp->getRawOriginal('branch'),
                    'outlet'           => $emp->getRawOriginal('outlet'),
                    'role'             => $emp->getRawOriginal('role'),

                    // Eager-loaded relation labels (safe from column/relation name clash)
                    'department_label' => $emp->getRelation('department')?->title,
                    'branch_label'     => $emp->getRelation('branch')?->branch_name,
                    'outlet_label'     => $emp->getRelation('outlet')?->name,
                    'role_label'       => $emp->getRelation('role')?->title,

                    // Time stored as HH:mm:ss in DB — slice to HH:mm for the time input
                    'clock_in_time'    => $emp->clock_in_time  ? substr($emp->clock_in_time,  0, 5) : null,
                    'clock_out_time'   => $emp->clock_out_time ? substr($emp->clock_out_time, 0, 5) : null,

                    'office_days'      => $emp->office_days ?? [],
                    'weekend'          => $emp->weekend      ?? [],
                    'join_date'        => $emp->join_date,
                    'salary'           => $emp->salary,
                    'facebook'         => $emp->facebook,
                    'linkedin'         => $emp->linkedin,
                    'website'          => $emp->website,
                    'fingerprint1'     => $emp->fingerprint1,
                    'fingerprint2'     => $emp->fingerprint2,
                    'card_identity'    => $emp->card_identity,
                    'created_at'       => $emp->created_at,
                ];
            });

        $departments = Department::orderBy('title')->get(['id', 'title']);
        $roles       = Role::orderBy('title')->get(['id', 'title', 'department']);
        $branches    = Branch::orderBy('branch_name')->get(['id', 'branch_name']);
        $outlets     = Outlet::orderBy('name')->get(['id', 'name', 'branch']);

        return Inertia::render('hr/employees', compact(
            'employees',
            'departments',
            'roles',
            'branches',
            'outlets'
        ));
    }






    private function generateUid(): string
    {
        $brandName = Setting::where('id', 1)->value('brand_name') ?? 'EMP';
        $prefix    = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $brandName), 0, 3));
        $year      = date('Y');

        do {
            $uid = $prefix . '_' . rand(111111, 999999) . '_' . $year;
        } while (Employee::where('employee_uid', $uid)->exists());

        return $uid;
    }






    private function formatTime(?string $time): ?string
    {
        if (!$time) return null;
        if (substr_count($time, ':') === 2) return $time;
        return $time . ':00';
    }













    private function handleImageUpload(Request $request, ?string $existing = null): ?string
    {
        if (!$request->hasFile('img')) return $existing;

        $dir = public_path('employees');
        if (!is_dir($dir)) mkdir($dir, 0755, true);

        $file     = $request->file('img');
        $filename = uniqid('emp_', true) . '.' . $file->getClientOriginalExtension();
        $file->move($dir, $filename);

        if ($existing && file_exists(public_path($existing))) {
            @unlink(public_path($existing));
        }

        return 'employees/' . $filename;
    }













    public function storeEmployee(Request $request)
    {
        $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'email'          => ['required', 'email', 'max:255', 'unique:employees,email'],
            'password'       => ['required', 'string', 'max:255'],
            'img'            => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:15360'],
            'address'        => ['nullable', 'string', 'max:500'],
            'about'          => ['nullable', 'string', 'max:1500'],
            'job_title'      => ['nullable', 'string', 'max:255'],
            'department'     => ['nullable', 'integer', 'exists:departments,id'],
            'role'           => ['nullable', 'integer', 'exists:roles,id'],
            'branch'         => ['nullable', 'integer', 'exists:branches,id'],
            'outlet'         => ['nullable', 'integer', 'exists:outlets,id'],
            'clock_in_time'  => ['nullable', 'date_format:H:i'],
            'clock_out_time' => ['nullable', 'date_format:H:i'],
            'office_days'    => ['nullable', 'array'],
            'office_days.*'  => ['string', 'in:Sat,Sun,Mon,Tue,Wed,Thu,Fri'],
            'weekend'        => ['nullable', 'array'],
            'weekend.*'      => ['string', 'in:Sat,Sun,Mon,Tue,Wed,Thu,Fri'],
            'join_date'      => ['nullable', 'date'],
            'salary'         => ['nullable', 'numeric', 'min:0'],
            'facebook'       => ['nullable', 'url', 'max:500'],
            'linkedin'       => ['nullable', 'url', 'max:500'],
            'website'        => ['nullable', 'url', 'max:500'],
            'fingerprint1'  => ['nullable', 'string'],
            'fingerprint2'  => ['nullable', 'string'],
            'card_identity' => ['nullable', 'string'],
        ]);

        $imgPath = $this->handleImageUpload($request);

        Employee::create([
            'employee_uid'   => $this->generateUid(),
            'img'            => $imgPath,
            'name'           => $request->name,
            'email'          => $request->email,
            'password'       => $request->password, // plain text as requested
            'address'        => $request->address,
            'about'          => $request->about,
            'job_title'      => $request->job_title,
            'department'     => $request->department,
            'role'           => $request->role,
            'branch'         => $request->branch,
            'outlet'         => $request->outlet,
            'clock_in_time'  => $this->formatTime($request->clock_in_time),
            'clock_out_time' => $this->formatTime($request->clock_out_time),
            'office_days'    => $request->office_days ?? [],
            'weekend'        => $request->weekend     ?? [],
            'join_date'      => $request->join_date,
            'salary'         => $request->salary,
            'facebook'       => $request->facebook,
            'linkedin'       => $request->linkedin,
            'website'        => $request->website,
            'fingerprint1'   => $request->fingerprint1,
            'fingerprint2'   => $request->fingerprint2,
            'card_identity'  => $request->card_identity,
        ]);

        return back()->with('success', 'Added Successfully!');
    }














    public function updateEmployee(Request $request)
    {
        $id = (int) $request->input('id');

        if (!$id) {
            return back()->withErrors(['id' => 'Employee not found.']);
        }

        $employee = Employee::where('id', $id)->first();

        if (!$employee) {
            return back()->withErrors(['id' => 'Employee not found.']);
        }

        $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'email'          => ['required', 'email', 'max:255', Rule::unique('employees', 'email')->ignore($employee->employee_uid, 'employee_uid')],
            'password'       => ['nullable', 'string', 'max:255'],
            'img'            => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:15360'],
            'address'        => ['nullable', 'string', 'max:500'],
            'about'          => ['nullable', 'string', 'max:1500'],
            'job_title'      => ['nullable', 'string', 'max:255'],
            'department'     => ['nullable', 'integer', 'exists:departments,id'],
            'role'           => ['nullable', 'integer', 'exists:roles,id'],
            'branch'         => ['nullable', 'integer', 'exists:branches,id'],
            'outlet'         => ['nullable', 'integer', 'exists:outlets,id'],
            'clock_in_time'  => ['nullable', 'date_format:H:i'],
            'clock_out_time' => ['nullable', 'date_format:H:i'],
            'office_days'    => ['nullable', 'array'],
            'office_days.*'  => ['string', 'in:Sat,Sun,Mon,Tue,Wed,Thu,Fri'],
            'weekend'        => ['nullable', 'array'],
            'weekend.*'      => ['string', 'in:Sat,Sun,Mon,Tue,Wed,Thu,Fri'],
            'join_date'      => ['nullable', 'date'],
            'salary'         => ['nullable', 'numeric', 'min:0'],
            'facebook'       => ['nullable', 'url', 'max:500'],
            'linkedin'       => ['nullable', 'url', 'max:500'],
            'website'        => ['nullable', 'url', 'max:500'],
            'fingerprint1'   => ['nullable', 'string'],
            'fingerprint2'   => ['nullable', 'string'],
            'card_identity'  => ['nullable', 'string'],
        ]);

        $imgPath = $this->handleImageUpload($request, $employee->img);

        $employee->img            = $imgPath;
        $employee->name           = $request->name;
        $employee->email          = $request->email;
        if ($request->filled('password')) {
            $employee->password   = $request->password;
        }
        $employee->address        = $request->address;
        $employee->about          = $request->about;
        $employee->job_title      = $request->job_title;
        $employee->department     = $request->department;
        $employee->role           = $request->role;
        $employee->branch         = $request->branch;
        $employee->outlet         = $request->outlet;
        $employee->clock_in_time  = $this->formatTime($request->clock_in_time);
        $employee->clock_out_time = $this->formatTime($request->clock_out_time);
        $employee->office_days    = $request->office_days ?? [];
        $employee->weekend        = $request->weekend     ?? [];
        $employee->join_date      = $request->join_date;
        $employee->salary         = $request->salary;
        $employee->facebook       = $request->facebook;
        $employee->linkedin       = $request->linkedin;
        $employee->website        = $request->website;
        $employee->fingerprint1   = $request->fingerprint1;
        $employee->fingerprint2   = $request->fingerprint2;
        $employee->card_identity  = $request->card_identity;
        $employee->save();

        return back()->with('success', 'Record Updated!');
    }





    public function destroyEmployee($id)
    {
        $employee = Employee::where('id', $id)->firstOrFail();

        if ($employee->img && file_exists(public_path($employee->img))) {
            @unlink(public_path($employee->img));
        }

        $employee->delete();
        return back()->with('success', 'Employee Fired!');
    }
}
