<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tables = ['vehicles', 'notes', 'reminders', 'warranties'];
        foreach ($tables as $table) {
            if (Schema::hasTable($table) && !Schema::hasColumn($table, 'server_id')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->unsignedBigInteger('server_id')->nullable()->after('id');
                });
            }
        }

        if (Schema::hasTable('vehicle_services') && !Schema::hasColumn('vehicle_services', 'server_id')) {
            Schema::table('vehicle_services', function (Blueprint $t) {
                $t->unsignedBigInteger('server_id')->nullable()->after('id');
            });
        }
    }

    public function down(): void
    {
        foreach (['vehicles', 'notes', 'reminders', 'warranties', 'vehicle_services'] as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'server_id')) {
                Schema::table($table, fn (Blueprint $t) => $t->dropColumn('server_id'));
            }
        }
    }
};
