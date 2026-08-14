def get_trip_category(budget: float) -> str:
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"


def get_travel_season(month: str) -> str:
    """Tentukan kategori musim berdasarkan nama/angka bulan."""
    month_map = {
        "1": "January",   "2": "February", "3": "March",
        "4": "April",     "5": "May",      "6": "June",
        "7": "July",      "8": "August",   "9": "September",
        "10": "October",  "11": "November","12": "December",
    }

    # Normalise: angka → nama bulan, lalu capitalize
    month_name = month_map.get(month.strip(), month.strip()).capitalize()

    if month_name == "December":
        return "Peak Season"
    elif month_name == "June":
        return "Holiday Season"
    else:
        return "Regular Season"


def calculate_daily_budget(budget: float, days: int) -> float:
    return budget / days


def get_recommended_places(destination: str) -> list:
    places_db = {
        "japan":     ["Tokyo Tower", "Shibuya", "Mount Fuji", "Kyoto Temples", "Osaka Castle"],
        "korea":     ["Gyeongbokgung Palace", "Bukchon Hanok Village", "Jeju Island", "Myeongdong"],
        "paris":     ["Eiffel Tower", "Louvre Museum", "Notre-Dame Cathedral", "Montmartre"],
        "bali":      ["Tanah Lot Temple", "Ubud Monkey Forest", "Kuta Beach", "Tegallalang Rice Terrace"],
        "london":    ["Big Ben", "Tower of London", "British Museum", "Buckingham Palace"],
        "indonesia": ["Bali", "Borobudur", "Raja Ampat", "Labuan Bajo"],
    }

    key = destination.strip().lower()
    return places_db.get(key, ["City Center", "Local Market", "Cultural Museum", "Nature Park"])
