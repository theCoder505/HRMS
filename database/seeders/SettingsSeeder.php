<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Setting::exists()) {
            Setting::create([
                'brand_name' => 'HR Venture',
                'brand_logo' => '/assets/logo.png',
                'brand_icon' => 'assets/hrms_icon.png',
                'location' => 'HRVenture, House 49, Road 90, Gulshan-2, Dhaka 1212',
                'gogle_map' => 'HRVenture',
                'facebook' => 'https://www.facebook.com/HRVenture',
                'instagram' => 'https://www.instagram.com/HRVenture',
                'twitter' => 'https://www.twitter.com/HRVenture',
                'linkedin' => 'https://www.linkedin.com/HRVenture',
                'contact_email' => 'contact@hrventure.com',
                'about' => 'About Us',
                'privacy_policy' => 'Our Privacy Poolicy',
                'terms_conditions' => 'Our Terms & Conditions',
            ]);
        }
    }
}
