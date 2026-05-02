<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name') }}</title>
    <meta http-equiv="refresh" content="0;url={{ $deepUrl }}">
    <script>
        location.replace(@json($deepUrl));
    </script>
</head>
<body style="font-family: system-ui, sans-serif; text-align: center; padding: 2rem;">
    <p>جاري العودة إلى التطبيق…</p>
    <p><a href="{{ $deepUrl }}">اضغط هنا إذا لم يفتح التطبيق تلقائياً</a></p>
</body>
</html>
