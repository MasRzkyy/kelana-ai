# ============================================================
#  backend/main.py
#  KelanaAI v2 — Presentation Layer (Session 2)
#  Handles user I/O only. All business logic lives in
#  services/trip_service.py (layered architecture).
# ============================================================

from services.trip_service import (
    get_trip_category,
    calculate_daily_budget,
    get_recommended_places,
    get_recommended_transport,
    get_travel_season,
)

def print_trip_summary(
    destination: str,
    country: str,
    days: int,
    budget: float,
    currency: str,
    travel_month: str,
    category: str,
    daily_budget: float,
    season: str,
    transport: str,
    places: list[str],
) -> None:
    """Print the full KelanaAI trip summary to the terminal."""
    print()
    print("==================================")
    print("           KelanaAI")
    print("==================================")
    print(f'Destination  = "{destination}"')
    print(f"Country      = {country}")
    print(f"Days         = {days}")
    print(f"Budget       = {budget:.0f} {currency}")
    print(f'Category     = "{category}"')
    print(f"Daily Budget = {daily_budget:.0f} {currency}/Day")
    print(f"Season       : {season}")
    print(f"Transport    : {transport}")
    print()
    print("Recommended Places")
    for place in places:
        print(f"  - {place}")
    print("==================================")


# ─── Main ────────────────────────────────────────────────────

destination  = input("Destination  : ")
country      = input("Country      : ")
days         = int(input("Days         : "))
budget       = float(input("Budget       : "))
currency     = input("Currency     : ")
travel_month = input("Travel Month : ")

# ── Business logic (delegated to service layer) ──────────────
category      = get_trip_category(budget)
daily_budget  = calculate_daily_budget(budget, days)
season        = get_travel_season(travel_month)
transport     = get_recommended_transport(category)
places        = get_recommended_places(destination)

# ── Output (presentation layer only) ─────────────────────────
print_trip_summary(
    destination=destination,
    country=country,
    days=days,
    budget=budget,
    currency=currency,
    travel_month=travel_month,
    category=category,
    daily_budget=daily_budget,
    season=season,
    transport=transport,
    places=places,
)