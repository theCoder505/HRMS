<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Models\Setting;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $isEmailChanging = $user->email !== $request->email;

        if ($isEmailChanging) {
            $request->validate([
                'otp' => 'required|string',
                'old_email' => 'required|email',
            ]);

            if ($request->old_email !== $user->email) {
                return back()->withErrors(['old_email' => 'The provided old email does not match our records.']);
            }

            if (!$user->otp || $user->otp != $request->otp || $user->otp_expires_at->isPast()) {
                return back()->withErrors(['otp' => 'The provided OTP is invalid or has expired.']);
            }

            // Clear OTP after successful verification
            $user->otp = null;
            $user->otp_expires_at = null;
            $user->email_verified_at = null;
        }

        $user->fill($request->validated());
        $user->save();

        return to_route('profile.edit')->with('success', 'Profile updated successfully.');
    }

    /**
     * Send OTP for profile or password change.
     */
    public function sendOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'type' => 'required|in:email,password',
        ]);

        $user = $request->user();
        $otp = rand(100000, 999999);
        
        // Save OTP to user record
        $user->update([
            'otp' => $otp,
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        $brandname = Setting::where('id', 1)->value('brand_name') ?? config('app.name');
        $template = $request->type === 'email' ? 'mail.hr.email_change_otp' : 'mail.hr.pwd_change_otp';
        $subject = $request->type === 'email' ? "Email Change OTP - {$brandname}" : "Password Change OTP - {$brandname}";

        Mail::send(
            $template,
            ['otp' => $otp, 'user' => $user, 'brandname' => $brandname],
            function ($message) use ($user, $subject) {
                $message->to($user->email)
                    ->subject($subject);
            }
        );

        return back()->with('status', 'otp-sent');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
