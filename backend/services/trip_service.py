def get_trip_category(budget: float) -> str:
    if budget < 1000:
        return "Backpacker"
    elif budget < 3000:
        return "Standard"
    else:
        return "Luxury"

def calculate_daily_budget(budget: float, days: int) -> float:
    return budget / days

def get_recommended_places(destination: str) -> list[str]:
    places_db: dict[str, list[str]] = {
        "japan":   ["Tokyo Tower", "Shibuya", "Mount Fuji", "Kyoto Temples", "Osaka Castle"],
        "korea":   ["Gyeongbokgung Palace", "Bukchon Hanok Village", "Jeju Island", "Myeongdong"],
        "paris":   ["Eiffel Tower", "Louvre Museum", "Notre-Dame Cathedral", "Montmartre"],
        "bali":    ["Tanah Lot Temple", "Ubud Monkey Forest", "Kuta Beach", "Tegallalang Rice Terrace"],
        "london":  ["Big Ben", "Tower of London", "British Museum", "Buckingham Palace"],
    }

    key = destination.strip().lower()
    return places_db.get(key, ["City Center", "Local Market", "Cultural Museum", "Nature Park"])

def get_recommended_transport(category: str) -> str:
    transport_map = {
        "Backpacker": "Bus",
        "Standard":   "Train",
        "Luxury":     "Flight",
    }
    return transport_map.get(category, "Public Transport")


def get_travel_season(month: str) -> str:
    month_map = {
        "1": "January",   "2": "February", "3": "March",
        "4": "April",     "5": "May",      "6": "June",
        "7": "July",      "8": "August",   "9": "September",
        "10": "October",  "11": "November","12": "December",
    }

    # Normalise: convert numeric string → month name
    month_name = month_map.get(month.strip(), month.strip()).capitalize()

    if month_name == "December":
        return "Holiday Season"
    elif month_name in ("June", "July", "August"):
        return "Peak Season"
    else:
        return "Regular Season"
