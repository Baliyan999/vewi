"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  createSupabaseBrowserClient,
  isBrowserSupabaseConfigured,
} from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SetupRequired } from "@/components/couple/setup-required";

export default function AdminLogin() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  if (!isBrowserSupabaseConfigured()) {
    return <SetupRequired demoHref="/dashboard/demo" />;
  }

  function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (error) setError(error.message);
      else setSent(true);
    });
  }

  function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });
      if (error) setError(error.message);
      else router.replace("/admin");
    });
  }

  return (
    <div className="container-page flex min-h-dvh items-center justify-center py-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Админ</CardTitle>
          <CardDescription>
            {sent
              ? "Введите код, который пришёл на почту"
              : "Войдите с админ-почты — получите код"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <form onSubmit={verifyCode} className="flex flex-col gap-3">
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-значный код"
                inputMode="numeric"
                pattern="[0-9]{6}"
                required
                autoFocus
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={pending}>
                {pending ? "Проверяем…" : "Войти"}
              </Button>
            </form>
          ) : (
            <form onSubmit={sendCode} className="flex flex-col gap-3">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                autoFocus
                placeholder="admin@example.com"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={pending}>
                {pending ? "Отправляем…" : "Получить код"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
