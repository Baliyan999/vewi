#!/usr/bin/env python3
"""
QR-Фотограф — pricing calculator.

Считает себестоимость одной свадьбы по тарифу, маржу платформы, чистую
прибыль на учредителя и точку безубыточности. Источник цифр и подробное
объяснение — docs/unit-economics.md.

Использование:

    python3 scripts/pricing-calc.py

Чтобы поиграть со сценариями — измени константы в блоке CONFIG ниже.
"""

from dataclasses import dataclass


# ──────────────────────────── CONFIG ────────────────────────────
# Меняй эти константы и перезапускай.

# Курс UZS → USD (примерно, на 2026)
UZS_PER_USD = 12_600

# % с продажи, который уходит организатору (свадебное агентство / тамада)
ORGANIZER_CUT = 0.50      # 50% оргу, 50% платформе

# Сколько учредителей делят прибыль платформы
FOUNDERS = 2

# Какой провайдер хранения использовать
#   "r2"      — Cloudflare R2 (рекомендуется: storage дороже, но egress = $0)
#   "hetzner" — Hetzner Object Storage (storage дешевле, egress платный)
STORAGE = "r2"

# Микс продаж — какая доля продаж приходится на каждый тариф (сумма = 1.0)
SALES_MIX = {
    "basic":   0.20,
    "pro":     0.60,
    "premium": 0.20,
}

# Прибыль каждому учредителю в месяц, которую хотим заложить
TARGET_PER_FOUNDER_USD = 1500


# ────────────────────── Стоимость инфраструктуры ──────────────────────

PROVIDER_COSTS = {
    "r2": {
        "storage_per_gb_month_usd": 0.015,
        "egress_per_gb_usd":        0.00,
        # Cloudflare R2 ещё берёт за operations, но это копейки на нашем
        # объёме (~$0.01-0.15 на свадьбу) — учтено в COMPUTE_PER_WEDDING.
    },
    "hetzner": {
        "storage_per_gb_month_usd": 0.0065,   # €5.99/ТБ/мес ≈ $0.0065/ГБ
        "egress_per_gb_usd":        0.001,    # €1/ТБ после 1ТБ free
    },
}

# Compute, SMS и прочее — амортизированные на 1 свадьбу при ~30 свадеб/мес
COMPUTE_PER_WEDDING_USD = 0.36   # доля CPX21 + время на ZIP/thumbs
SMS_PER_WEDDING_USD     = 0.02   # ~5 OTP × $0.004

# Фиксированные расходы платформы в месяц (не зависят от числа свадеб)
FIXED_MONTHLY_USD = (
    6.25   # Hetzner CPX21 — compute
    + 25.00  # Supabase Pro
    + 7.50   # R2 base storage (~500ГБ)
    + 10.00  # Eskiz SMS пополнение
    + 1.25   # Домен амортизация
    + 5.00   # Резерв (мониторинг, бэкапы, мелочь)
)


# ──────────────────────────── Тарифы ────────────────────────────

@dataclass
class Tier:
    name: str
    price_uzs: int
    avg_storage_gb: float          # средний объём данных на свадьбу
    retention_months: float        # сколько месяцев данные лежат
    avg_egress_gb: float           # сколько суммарно выгружается (downloads + live)

    @property
    def price_usd(self) -> float:
        return self.price_uzs / UZS_PER_USD

    @property
    def gb_months(self) -> float:
        return self.avg_storage_gb * self.retention_months

    def storage_cost_usd(self) -> float:
        return self.gb_months * PROVIDER_COSTS[STORAGE]["storage_per_gb_month_usd"]

    def egress_cost_usd(self) -> float:
        return self.avg_egress_gb * PROVIDER_COSTS[STORAGE]["egress_per_gb_usd"]

    def cost_usd(self) -> float:
        return (
            self.storage_cost_usd()
            + self.egress_cost_usd()
            + COMPUTE_PER_WEDDING_USD
            + SMS_PER_WEDDING_USD
        )

    def organizer_cut_usd(self) -> float:
        return self.price_usd * ORGANIZER_CUT

    def platform_cut_usd(self) -> float:
        return self.price_usd * (1 - ORGANIZER_CUT)

    def platform_profit_usd(self) -> float:
        return self.platform_cut_usd() - self.cost_usd()

    def margin_pct(self) -> float:
        if self.platform_cut_usd() == 0:
            return 0
        return self.platform_profit_usd() / self.platform_cut_usd() * 100


TIERS = {
    "basic": Tier(
        name="Basic",
        price_uzs=390_000,
        avg_storage_gb=2,
        retention_months=14 / 30,
        avg_egress_gb=5,
    ),
    "pro": Tier(
        name="Pro",
        price_uzs=790_000,
        avg_storage_gb=20,
        retention_months=1,
        avg_egress_gb=50,
    ),
    "premium": Tier(
        name="Premium",
        price_uzs=1_690_000,
        avg_storage_gb=135,
        retention_months=6,
        avg_egress_gb=300,
    ),
}


# ──────────────────────────── Отчёт ────────────────────────────

def fmt_usd(v: float) -> str:
    return f"${v:>7.2f}"

def fmt_pct(v: float) -> str:
    return f"{v:>5.1f}%"

def print_tier_table():
    print(f"{'Тариф':<10}{'UZS':>11}{'USD':>9}{'Орг 50%':>11}"
          f"{'Себест':>11}{'Чистыми':>11}{'Маржа':>9}{'/учред':>10}")
    print("─" * 82)
    for key, tier in TIERS.items():
        per_founder = tier.platform_profit_usd() / FOUNDERS
        print(
            f"{tier.name:<10}"
            f"{tier.price_uzs:>11,}"
            f"{fmt_usd(tier.price_usd):>9}"
            f"{fmt_usd(tier.organizer_cut_usd()):>11}"
            f"{fmt_usd(tier.cost_usd()):>11}"
            f"{fmt_usd(tier.platform_profit_usd()):>11}"
            f"{fmt_pct(tier.margin_pct()):>9}"
            f"{fmt_usd(per_founder):>10}"
        )

def avg_platform_profit_per_wedding() -> float:
    """Средняя чистая прибыль платформы со свадьбы при заданном микcе."""
    return sum(
        TIERS[key].platform_profit_usd() * share
        for key, share in SALES_MIX.items()
    )

def weddings_for_target(target_per_founder_usd: float) -> float:
    """Сколько свадеб нужно/мес, чтобы каждый учредитель получал target."""
    total_target = target_per_founder_usd * FOUNDERS + FIXED_MONTHLY_USD
    avg_profit = avg_platform_profit_per_wedding()
    if avg_profit <= 0:
        return float("inf")
    return total_target / avg_profit


def print_breakeven():
    avg_profit = avg_platform_profit_per_wedding()
    print(f"Микс продаж: {SALES_MIX}")
    print(f"Средняя прибыль платформы со свадьбы: ${avg_profit:.2f}")
    print(f"Фиксированные расходы в месяц: ${FIXED_MONTHLY_USD:.2f}")
    print()
    print(f"{'Цель / учред / мес':<30}{'Свадеб / мес':>15}")
    print("─" * 45)
    for tgt in [500, 1000, 1500, 2000, 3000, 5000]:
        n = weddings_for_target(tgt)
        per_day = n / 30
        print(f"  ${tgt:<26,} {n:>10.0f}   (~{per_day:.1f} / день)")


def print_market_size():
    """Сколько чистыми получает каждый учредитель при разной доле рынка."""
    avg_profit = avg_platform_profit_per_wedding()
    weddings_in_tashkent_per_month = 75 * 30  # ~75 свадеб в день в среднем
    print(f"{'Доля рынка':<14}{'Свадеб / мес':>15}{'/учред / мес':>17}")
    print("─" * 46)
    for share in [0.005, 0.01, 0.02, 0.03, 0.05, 0.10]:
        n = weddings_in_tashkent_per_month * share
        gross = n * avg_profit
        per_founder = (gross - FIXED_MONTHLY_USD) / FOUNDERS
        per_founder = max(0, per_founder)
        print(f"{share*100:>5.1f}%{'':>9}{n:>12.0f}{fmt_usd(per_founder):>17}")


def main():
    print("=" * 82)
    print("QR-Фотограф — Unit Economics Calculator")
    print("=" * 82)
    print()
    print(f"  Курс         : 1 USD = {UZS_PER_USD:,} UZS")
    print(f"  Storage      : {STORAGE.upper()} "
          f"(${PROVIDER_COSTS[STORAGE]['storage_per_gb_month_usd']}/ГБ/мес, "
          f"egress ${PROVIDER_COSTS[STORAGE]['egress_per_gb_usd']}/ГБ)")
    print(f"  Орг-комиссия : {ORGANIZER_CUT*100:.0f}%")
    print(f"  Учредителей  : {FOUNDERS}")
    print()

    print("▌ Себестоимость и маржа по тарифам")
    print()
    print_tier_table()
    print()

    print("▌ Точка безубыточности")
    print()
    print_breakeven()
    print()

    print("▌ Сценарии по доле рынка (Ташкент, ~75 свадеб/день)")
    print()
    print_market_size()
    print()

    print("=" * 82)


if __name__ == "__main__":
    main()
