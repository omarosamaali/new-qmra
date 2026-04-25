<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        ContactMessage::create([
            'user_id' => Auth::id(),
            'name'    => $request->name,
            'email'   => $request->email,
            'subject' => $request->subject,
            'message' => $request->message,
        ]);

        return back()->with('contact_sent', true);
    }

    // GET /api/admin/messages?key=...
    public function adminIndex(Request $request)
    {
        if (!$this->checkKey($request)) {
            return response()->json(['error' => 'unauthorized'], 401);
        }

        $messages = ContactMessage::orderByDesc('created_at')->get()->map(fn($m) => [
            'id'         => $m->id,
            'name'       => $m->name,
            'email'      => $m->email,
            'subject'    => $m->subject,
            'message'    => $m->message,
            'read'       => $m->read,
            'reply'      => $m->reply,
            'repliedAt'  => $m->replied_at?->format('Y-m-d H:i'),
            'createdAt'  => $m->created_at->format('Y-m-d H:i'),
        ]);

        // Mark all as read
        ContactMessage::where('read', false)->update(['read' => true]);

        return response()->json([
            'total'    => $messages->count(),
            'unread'   => $messages->where('read', false)->count(),
            'messages' => $messages,
        ]);
    }

    // DELETE /api/admin/messages/{id}?key=...
    public function destroy(Request $request, int $id)
    {
        if (!$this->checkKey($request)) {
            return response()->json(['error' => 'unauthorized'], 401);
        }

        ContactMessage::findOrFail($id)->delete();

        return response()->json(['success' => true, 'deleted_id' => $id]);
    }

    // DELETE /api/admin/messages?key=...  — delete all
    public function destroyAll(Request $request)
    {
        if (!$this->checkKey($request)) {
            return response()->json(['error' => 'unauthorized'], 401);
        }

        $count = ContactMessage::count();
        ContactMessage::truncate();

        return response()->json(['success' => true, 'deleted_count' => $count]);
    }

    // POST /api/admin/messages/{id}/reply?key=...
    // Body: { "reply": "نص الرد" }
    public function reply(Request $request, int $id)
    {
        if (!$this->checkKey($request)) {
            return response()->json(['error' => 'unauthorized'], 401);
        }

        $request->validate(['reply' => 'required|string|max:5000']);

        $msg = ContactMessage::findOrFail($id);

        $msg->update([
            'reply'       => $request->reply,
            'replied_at'  => now(),
        ]);

        // Send reply email if mail is configured
        try {
            Mail::raw($request->reply, function ($mail) use ($msg) {
                $mail->to($msg->email, $msg->name)
                     ->subject('رد على رسالتك - قمرة / Reply to your message - Qumra')
                     ->replyTo(config('mail.from.address', 'support@qmra.ae'), 'Qumra Support');
            });
            $emailSent = true;
        } catch (\Exception $e) {
            $emailSent = false;
        }

        return response()->json([
            'success'    => true,
            'emailSent'  => $emailSent,
            'repliedAt'  => $msg->replied_at->format('Y-m-d H:i'),
        ]);
    }

    private function checkKey(Request $request): bool
    {
        $key = env('ADMIN_MESSAGES_KEY', 'qumra-secret-2026');
        return $request->query('key') === $key;
    }
}
