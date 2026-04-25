<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reminders', function (Blueprint $table) {
            $table->text('notes')->nullable()->after('title_ar');
            $table->string('due_time', 5)->nullable()->after('due_date'); // "HH:MM"
        });
    }

    public function down(): void
    {
        Schema::table('reminders', function (Blueprint $table) {
            $table->dropColumn(['notes', 'due_time']);
        });
    }
};
