"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createReferralCode } from "./_actions";

export function ReferralForm() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await createReferralCode({
        owner_name: String(fd.get("owner_name") ?? ""),
        owner_phone: String(fd.get("owner_phone") ?? ""),
        percent: Number(fd.get("percent") ?? 15),
        code: String(fd.get("code") ?? "").toUpperCase().trim() || undefined,
      });
      setMsg(res.ok ? `Код создан: ${res.code}` : `Ошибка: ${res.error}`);
      if (res.ok) (e.target as HTMLFormElement).reset();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div>
        <label className="text-sm">Имя партнёра</label>
        <Input name="owner_name" required minLength={2} />
      </div>
      <div>
        <label className="text-sm">Телефон</label>
        <Input name="owner_phone" required placeholder="+998 __ ___ __ __" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Процент</label>
          <Input name="percent" type="number" defaultValue={15} min={1} max={50} />
        </div>
        <div>
          <label className="text-sm">Код (опционально)</label>
          <Input name="code" placeholder="AUTO" />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Создаём…" : "Создать код"}
      </Button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
