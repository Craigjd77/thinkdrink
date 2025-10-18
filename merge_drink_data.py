#!/usr/bin/env python3
"""
Merge the extracted Excel data with existing drinks.json
"""

import json
import sys
from pathlib import Path

def merge_drink_data():
    """Merge Excel data with existing drinks.json"""
    
    # Load existing drinks
    existing_path = "/Users/craigdalessio/thinkdrink-app/data/drinks.json"
    new_data_path = "/Users/craigdalessio/thinkdrink-app/data/drink_think_data.json"
    
    try:
        # Load existing drinks
        with open(existing_path, 'r', encoding='utf-8') as f:
            existing_drinks = json.load(f)
        
        print(f"Loaded {len(existing_drinks)} existing drinks")
        
        # Load new data
        with open(new_data_path, 'r', encoding='utf-8') as f:
            new_drinks = json.load(f)
        
        print(f"Loaded {len(new_drinks)} new drinks from Excel")
        
        # Create a mapping of existing drink names to avoid duplicates
        existing_names = {drink['name'].lower() for drink in existing_drinks}
        
        # Filter new drinks to avoid duplicates
        unique_new_drinks = []
        duplicates = 0
        
        for drink in new_drinks:
            if drink['name'].lower() not in existing_names:
                # Convert to the existing format
                converted_drink = {
                    "id": int(drink['id']),
                    "name": drink['name'],
                    "spirit": extract_spirit(drink['ingredients']),
                    "difficulty": determine_difficulty(drink['ingredients']),
                    "description": drink['instructions'][:200] + "..." if len(drink['instructions']) > 200 else drink['instructions'],
                    "ingredients": drink['ingredients'],
                    "flavor": determine_flavor(drink['ingredients']),
                    "instructions": drink['instructions'],
                    "glass": drink['glass'],
                    "garnish": extract_garnish(drink['instructions']),
                    "moods": convert_mood_scores(drink['mood_scores']),
                    "fancy": drink['mood_scores'].get('fancy', 5.0)
                }
                unique_new_drinks.append(converted_drink)
            else:
                duplicates += 1
        
        print(f"Found {duplicates} duplicate drinks")
        print(f"Adding {len(unique_new_drinks)} unique new drinks")
        
        # Merge the data
        merged_drinks = existing_drinks + unique_new_drinks
        
        # Save merged data
        with open(existing_path, 'w', encoding='utf-8') as f:
            json.dump(merged_drinks, f, indent=2, ensure_ascii=False)
        
        print(f"Successfully merged data! Total drinks: {len(merged_drinks)}")
        print(f"Saved to: {existing_path}")
        
        return merged_drinks
        
    except Exception as e:
        print(f"Error merging data: {e}")
        import traceback
        traceback.print_exc()
        return None

def extract_spirit(ingredients):
    """Extract the main spirit from ingredients"""
    spirits = ['vodka', 'gin', 'rum', 'whiskey', 'tequila', 'bourbon', 'scotch', 'brandy', 'cognac']
    ingredients_str = ' '.join(ingredients).lower()
    
    for spirit in spirits:
        if spirit in ingredients_str:
            return spirit.title()
    return "Mixed"

def determine_difficulty(ingredients):
    """Determine difficulty based on number of ingredients"""
    count = len(ingredients)
    if count <= 3:
        return "Easy"
    elif count <= 5:
        return "Medium"
    else:
        return "Hard"

def determine_flavor(ingredients):
    """Determine flavor profile from ingredients"""
    ingredients_str = ' '.join(ingredients).lower()
    
    flavors = []
    if any(word in ingredients_str for word in ['sweet', 'sugar', 'syrup', 'honey', 'simple']):
        flavors.append('Sweet')
    if any(word in ingredients_str for word in ['sour', 'lemon', 'lime', 'citrus']):
        flavors.append('Sour')
    if any(word in ingredients_str for word in ['bitter', 'bitters']):
        flavors.append('Bitter')
    if any(word in ingredients_str for word in ['spicy', 'pepper', 'hot']):
        flavors.append('Spicy')
    if any(word in ingredients_str for word in ['creamy', 'cream', 'milk']):
        flavors.append('Creamy')
    
    return ', '.join(flavors) if flavors else 'Balanced'

def extract_garnish(instructions):
    """Extract garnish from instructions"""
    garnish_words = ['garnish', 'decorate', 'sprinkle', 'top with', 'add']
    for word in garnish_words:
        if word in instructions.lower():
            # Try to extract the garnish
            parts = instructions.lower().split(word)
            if len(parts) > 1:
                garnish_part = parts[1].split('.')[0].strip()
                return garnish_part[:50] + "..." if len(garnish_part) > 50 else garnish_part
    return "None"

def convert_mood_scores(mood_scores):
    """Convert Excel mood scores to app format"""
    # Map the Excel mood scores to our app's mood system
    moods = {
        "energetic": 5,
        "relaxed": 5,
        "romantic": 5,
        "adventurous": 5,
        "celebratory": 5,
        "cozy": 5
    }
    
    # Use the available scores to populate moods
    if 'thirsty' in mood_scores:
        moods['energetic'] = min(10, max(1, int(mood_scores['thirsty'])))
    if 'calm' in mood_scores:
        moods['relaxed'] = min(10, max(1, int(mood_scores['calm'])))
    if 'fancy' in mood_scores:
        moods['romantic'] = min(10, max(1, int(mood_scores['fancy'])))
    if 'dark' in mood_scores:
        moods['cozy'] = min(10, max(1, int(mood_scores['dark'])))
    if 'celebration' in mood_scores or 'celebrate' in mood_scores:
        moods['celebratory'] = min(10, max(1, int(mood_scores.get('celebration', mood_scores.get('celebrate', 5)))))
    
    return moods

if __name__ == "__main__":
    merge_drink_data()
