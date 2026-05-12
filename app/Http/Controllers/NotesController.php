<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Services\CloudSync;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotesController extends Controller
{
    private function userId(): int
    {
        return Auth::check() ? Auth::id() : 1;
    }

    public function index()
    {
        $userId = $this->userId();
        $notes  = Note::where('user_id', $userId)
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn($n) => [
                'id'           => (int) $n->id,
                'title'        => $n->title,
                'content'      => $n->content,
                'colorIdx'     => (int) $n->color_idx,
                'reminderDate' => $n->reminder_date?->toDateString(),
                'reminderTime' => $n->reminder_time,
                'createdAt'    => $n->created_at->toISOString(),
                'updatedAt'    => $n->updated_at->toISOString(),
            ]);

        return Inertia::render('Phone/Notes', ['notes' => $notes]);
    }

    public function store(Request $request)
    {
        $userId = $this->userId();
        $note   = Note::create([
            'user_id'       => $userId,
            'title'         => $request->title        ?? '',
            'content'       => $request->content      ?: null,
            'color_idx'     => (int) ($request->color_idx ?? 0),
            'reminder_date' => $request->reminder_date ?: null,
            'reminder_time' => $request->reminder_time ?: null,
        ]);
        CloudSync::pushNote($note, 'post');
        return back();
    }

    public function update(Request $request, int $id)
    {
        $userId = $this->userId();
        $note   = Note::where('id', $id)->where('user_id', $userId)->firstOrFail();
        $note->update([
            'title'         => $request->title        ?? $note->title,
            'content'       => $request->has('content')       ? ($request->content       ?: null) : $note->content,
            'color_idx'     => $request->has('color_idx')     ? (int) $request->color_idx          : $note->color_idx,
            'reminder_date' => $request->has('reminder_date') ? ($request->reminder_date ?: null)  : $note->reminder_date,
            'reminder_time' => $request->has('reminder_time') ? ($request->reminder_time ?: null)  : $note->reminder_time,
        ]);
        CloudSync::pushNote($note->fresh(), 'put');
        return back();
    }

    public function destroy(int $id)
    {
        $userId   = $this->userId();
        $note     = Note::where('id', $id)->where('user_id', $userId)->firstOrFail();
        $serverId = $note->server_id;
        $note->delete();
        if ($serverId) CloudSync::deleteNote($serverId);
        return back();
    }
}
