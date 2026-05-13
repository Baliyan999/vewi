"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Send, ArrowRight } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import {
  createSupabaseBrowserClient,
  isBrowserSupabaseConfigured,
} from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SetupRequired } from "@/components/couple/setup-required";

export default function CoupleLogin() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isBrowserSupabaseConfigured()) {
    return <SetupRequired demoHref="/dashboard/demo" />;
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: { shouldCreateUser: true },
      });
      if (error) setError(error.message);
      else setSent(true);
    });
  }

  function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });
      if (error) setError(error.message);
      else router.replace("/dashboard");
    });
  }

  return (
    <div className="container-page flex min-h-dvh items-center justify-center py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="surface-card relative w-full max-w-sm overflow-hidden rounded-(--radius-xl) p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-(--color-rose)/30 blur-3xl"
        />
        <div className="relative text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-(--color-accent)/60 text-(--color-primary)">
            <Heart className="h-5 w-5" />
          </div>
          <h1 className="font-display text-3xl">Кабинет молодожёнов</h1>
          <p className="mt-2 text-sm text-(--color-muted-foreground)">
            {sent ? "Введите код из SMS" : "Введите номер, которым вас регистрировали"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.form
              key="verify"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.3 }}
              onSubmit={verify}
              className="relative mt-6 flex flex-col gap-3"
            >
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-значный код"
                inputMode="numeric"
                pattern="[0-9]{6}"
                required
                autoFocus
                className="bg-white text-center font-mono text-lg tracking-[0.4em]"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={pending} size="lg">
                {pending ? "Проверяем…" : "Войти"}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </motion.form>
          ) : (
            <motion.form
              key="send"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.3 }}
              onSubmit={send}
              className="relative mt-6 flex flex-col gap-3"
            >
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="+998 __ ___ __ __"
                required
                autoFocus
                className="bg-white"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={pending} size="lg">
                <Send className="mr-1.5 h-4 w-4" />
                {pending ? "Отправляем…" : "Получить код"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="relative mt-6 text-center text-xs text-(--color-muted-foreground)">
          Хотите посмотреть кабинет до свадьбы?{" "}
          <a href="/dashboard/demo" className="text-(--color-primary) underline">
            Открыть демо
          </a>
        </p>
      </motion.div>
    </div>
  );
}
