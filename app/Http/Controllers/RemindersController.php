<?php

namespace App\Http\Controllers;

use App\Models\Reminder;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RemindersController extends Controller
{
    private function userId(): int
    {
        return Auth::check() ? Auth::id() : 1;
    }

    public function index()
    {
        $userId = $this->userId();

        $vehicles = Vehicle::where('user_id', $userId)->get()->map(fn($v) => [
            'id'          => $v->id,
            'nameAr'      => $v->name_ar,
            'nameEn'      => $v->name_en,
            'brand'       => $v->brand,
            'type'        => $v->type,
            'plateNumber' => $v->plate_number,
            'color'       => $v->color,
        ]);

        $vehicleIds = $vehicles->pluck('id');
        $reminders  = Reminder::whereIn('vehicle_id', $vehicleIds)->get()->map(fn($r) => [
            'id'        => $r->id,
            'vehicleId' => $r->vehicle_id,
            'serviceId' => $r->service_id,
            'titleAr'   => $r->title_ar,
            'notes'     => $r->notes,
            'dueDate'   => $r->due_date?->toDateString(),
            'dueTime'   => $r->due_time,
            'dueKm'     => $r->due_km,
            'completed' => $r->completed,
        ]);

        return Inertia::render('Phone/Reminders', [
            'vehicles'  => $vehicles,
            'reminders' => $reminders,
        ]);
    }

    public function store(Request $request)
    {
        $userId = $this->userId();

        $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'title_ar'   => 'required|string|max:255',
            'notes'      => 'nullable|string|max:1000',
            'due_date'   => 'nullable|date',
            'due_time'   => 'nullable|string|max:5',
            'due_km'     => 'nullable|integer|min:0',
        ]);

        Vehicle::where('id', $request->vehicle_id)->where('user_id', $userId)->firstOrFail();

        Reminder::create([
            'user_id'    => $userId,
            'vehicle_id' => $request->vehicle_id,
            'service_id' => $request->service_id ?: null,
            'title_ar'   => $request->title_ar,
            'notes'      => $request->notes ?: null,
            'due_date'   => $request->due_date ?: null,
            'due_time'   => $request->due_time ?: null,
            'due_km'     => $request->due_km ?: null,
            'completed'  => false,
        ]);

        return back();
    }

    public function update(Request $request, int $id)
    {
        $userId = $this->userId();
        $reminder = Reminder::findOrFail($id);
        Vehicle::where('id', $reminder->vehicle_id)->where('user_id', $userId)->firstOrFail();

        $request->validate([
            'title_ar' => 'sometimes|string|max:255',
            'notes'    => 'nullable|string|max:1000',
            'due_date' => 'nullable|date',
            'due_time' => 'nullable|string|max:5',
            'due_km'   => 'nullable|integer|min:0',
            'completed'=> 'sometimes|boolean',
        ]);

        $reminder->update($request->only(['title_ar', 'notes', 'due_date', 'due_time', 'due_km', 'completed', 'service_id']));

        return back();
    }

    public function destroy(int $id)
    {
        $userId = $this->userId();
        $reminder = Reminder::findOrFail($id);
        Vehicle::where('id', $reminder->vehicle_id)->where('user_id', $userId)->firstOrFail();
        $reminder->delete();

        return back();
    }

    public function complete(int $id)
    {
        $userId = $this->userId();
        $reminder = Reminder::findOrFail($id);
        Vehicle::where('id', $reminder->vehicle_id)->where('user_id', $userId)->firstOrFail();
        $reminder->update(['completed' => true]);

        return back();
    }
}
