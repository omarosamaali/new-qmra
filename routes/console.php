<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Local reminders are scheduled on-device (Android), so disable remote push scheduling.
// Schedule::command('reminders:notify')->dailyAt('09:00');
