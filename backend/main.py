from services.trip_service import (
    get_trip_category,
    calculate_daily_budget,
    get_travel_season,
    get_recommended_places,
)

destination  = input("Destination  : ")
days         = int(input("Days         : "))
budget       = float(input("Budget       : "))
travel_month = input("Travel Month : ")

category     = get_trip_category(budget)
daily_budget = calculate_daily_budget(budget, days)
season       = get_travel_season(travel_month)
places       = get_recommended_places(destination)

print()
print("==================================")
print("           KelanaAI")
print("==================================")
print(f"Destination  : {destination}")
print(f"Days         : {days}")
print(f"Budget       : {budget:.0f} USD")
print(f"Category     : {category}")
print(f"Daily Budget : {daily_budget:.0f} USD/Day")
print(f"Travel Month : {travel_month}")
print(f"Season       : {season}")
print()
print("Recommended Places")
for place in places:
    print(f"- {place}")
