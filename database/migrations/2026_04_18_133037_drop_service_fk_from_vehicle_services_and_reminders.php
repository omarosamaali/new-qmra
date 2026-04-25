<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicle_services', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
        });
        Schema::table('reminders', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
        });
    }

    public function down(): void {}
};
