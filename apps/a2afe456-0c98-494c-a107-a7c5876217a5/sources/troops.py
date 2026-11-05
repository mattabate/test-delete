import pandas as pd

data = [
    {"troop": "Banana Bandits", "species": "Capuchin", "members": 12, "bananas_per_day": 48, "favorite_snack": "Ripe bananas"},
    {"troop": "Jungle Jesters", "species": "Howler", "members": 8, "bananas_per_day": 26, "favorite_snack": "Green bananas"},
    {"troop": "Canopy Crew", "species": "Spider Monkey", "members": 15, "bananas_per_day": 61, "favorite_snack": "Plantains"},
    {"troop": "Vine Vandals", "species": "Macaque", "members": 20, "bananas_per_day": 85, "favorite_snack": "Ripe bananas"},
    {"troop": "Treetop Troop", "species": "Gibbon", "members": 6, "bananas_per_day": 19, "favorite_snack": "Baby bananas"},
    {"troop": "Mango Marauders", "species": "Squirrel Monkey", "members": 10, "bananas_per_day": 33, "favorite_snack": "Ripe bananas"},
]
troops = pd.DataFrame(data)
