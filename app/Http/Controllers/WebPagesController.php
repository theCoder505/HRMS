<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WebPagesController extends Controller
{

    public function about()
    {
        $data = Setting::where('id', 1)->value('about');
        return Inertia::render('about', compact('data'));
    }

    public function privacy()
    {
        $data = Setting::where('id', 1)->value('privacy_policy');
        return Inertia::render('privacy-policy', compact('data'));
    }

    public function terms()
    {
        $data = Setting::where('id', 1)->value('terms_conditions');
        return Inertia::render('terms-conditions', compact('data'));
    }

    //
}
