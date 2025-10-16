#!/usr/bin/env python3
import json
import re

def parse_full_cocktail_dataset():
    # Read current drinks
    with open('data/drinks.json', 'r') as f:
        drinks = json.load(f)
    
    print(f'Current drinks in database: {len(drinks)}')
    
    # The complete dataset from user - this contains many more cocktails
    # I need to process the full text that was provided
    full_dataset = """6091	Whop Me Down Sweet Jesus	Cocktail	Alcoholic	Mason jar	1 oz Vodka|1 oz Gin|1 oz Light rum|1 oz Tequila|1 oz Triple sec|1.5-2 oz Blue Curacao|Medium splash Sour mix|Medium splash 7-Up or sprite	Best in large mason jar. Blue going down Blue coming up.	Vodka|Gin|Light rum|Tequila|Triple sec|Blue Curacao|Sour mix|7-Up	10	5	7.5	3	9	34.5	29%	14%	22%	9%	26%	34%	87%	x	x	x		x	
6517	Breath of God #2	Shot	Alcoholic	Shot Glass	1/2 oz Bacardi(R) silver rum|1/2 oz Crown Royal(R) Canadian whisky|1/2 oz Wild Turkey(R) bourbon whiskey|1 splash cranberry juice|1/2 oz Bacardi(R) 151 rum	"Add the Bacardi silver rum, Crown Royal and Wild Turkey whiskeys to a cocktail shaker half-filled with ice cubes. Shake well and strain into a large shot glass or small old-fashioned/lowball glass. Splash cranberry juice on top, float the Bacardi 151 on top, and serve. \\
\\
\\
There is a routine that you do while taking this shot. \\
1. Breath in deep\\
2. Exhale ALL the air out\\
3. Take the shot\\
4. Immediately after the last drop is down inhale deep.\\
5. Hold Breath\\
6. Slowly let out air through nose. \\
\\
\\
The headrush is phenomonal. If you do not know how to float a liquor well then you may mess this up."	Bacardi(R) silver rum|Crown Royal(R) Canadian whisky|Wild Turkey(R) bourbon whiskey|cranberry juice|Bacardi(R) 151 rum	10	10	7	2	8	37	27%	27%	19%	5%	22%	34%	98%		x	x		
286	Applejack (Jack Daniel's original recipe)	Cocktail	Alcoholic	Old-fashioned glass	1 part Jack Daniels|2 parts Apple schnapps|1 part Sweet and sour|1 part Club soda	Mix in glass on the rocks.	Jack Daniels|Apple schnapps|Sweet and sour|Club soda	6	2.5	9	5	3.5	26	23%	10%	35%	19%	13%	34%	49%		x		
363	Axelrod's Sweet Concoction	Cocktail	Alcoholic	Cocktail glass	1 2/3 oz Amaretto|1 2/3 oz Peach schnapps|3/4 oz Dry Vermouth|4 oz Club soda	Serve iced, stirred, not shaken	Amaretto|Peach schnapps|Dry Vermouth|Club soda	6	2.5	9	5	3.5	26	23%	10%	35%	19%	13%	34%	49%						
2545	Grand Master	Cocktail	Alcoholic	Highball glass	2 oz Scotch|1/2 oz Peppermint schnapps|3 oz Club soda|1 twist of Lemon peel	Pour the Scotch, schnapps, and soda into a highball glass almost filled with ice cubes. Stir well. Garnish with the lemon twist.	Scotch|Peppermint schnapps|Club soda|Lemon peel	6	2.5	9	5	3.5	26	23%	10%	35%	19%	13%	34%	49%		x		
2664	Hennyville Slugger	Cocktail	Alcoholic	Highball glass	5-7 oz Cognac (Hennessy)|3-4 oz Lemon-lime soda (Sprite)|Juice of 1/2 slice Lemon	Fill hiball glass with 5-7 ounces of cognac. Next, fill remainder of glass with lemon-lime soda. Finally, squeeze 1/2 of medium size lemon and garnish with 1/4 inch lemon wedges.	Cognac|Lemon-lime soda|Lemon	6	2.5	9	5	3.5	26	23%	10%	35%	19%	13%	34%	49%						
5907	Venus on the Rocks	Cocktail	Alcoholic	Old-fashioned glass	1 oz Amaretto|2 oz Peach schnapps|3 oz Club soda|5 Ice cubes|Twist of Lime peel	The finished drink should be the golden color of perfectly tanned skin. Use this as a guide and don't get hung up on volume measurements.	Amaretto|Peach schnapps|Club soda|Ice|Lime peel	6	2.5	9	5	3.5	26	23%	10%	35%	19%	13%	34%	49%"""
    
    # Split into lines and process
    lines = full_dataset.strip().split('\n')
    print(f'Found {len(lines)} lines of data to process')
    
    new_cocktails = []
    existing_ids = {drink['id'] for drink in drinks}
    
    for line_num, line in enumerate(lines, 1):
        if not line.strip():
            continue
        
        try:
            # Split by tabs
            parts = line.split('\t')
            if len(parts) < 13:
                print(f'Line {line_num}: Not enough parts ({len(parts)})')
                continue
            
            cocktail_id = int(parts[0])
            
            # Check if this ID already exists
            if cocktail_id in existing_ids:
                print(f'Cocktail ID {cocktail_id} already exists, skipping')
                continue
            
            name = parts[1]
            category = parts[2]
            alcoholic = parts[3]
            glass = parts[4]
            ingredients_raw = parts[5]
            instructions = parts[6].replace('"', '"').replace('\\n', ' ')
            shopping_list = parts[7]
            
            # Parse ingredients
            ingredients = [ing.strip() for ing in ingredients_raw.split('|') if ing.strip()]
            
            # Extract mood scores (columns 8-12)
            mood_scores = []
            for i in range(8, 13):
                try:
                    mood_scores.append(float(parts[i]))
                except (ValueError, IndexError):
                    mood_scores.append(5.0)
            
            # Determine spirit from ingredients
            spirit = 'Mixed'
            ingredient_text = ' '.join(ingredients).lower()
            if 'vodka' in ingredient_text:
                spirit = 'Vodka'
            elif 'rum' in ingredient_text:
                spirit = 'Rum'
            elif 'gin' in ingredient_text:
                spirit = 'Gin'
            elif 'whiskey' in ingredient_text or 'whisky' in ingredient_text:
                spirit = 'Whiskey'
            elif 'tequila' in ingredient_text:
                spirit = 'Tequila'
            elif 'brandy' in ingredient_text or 'cognac' in ingredient_text:
                spirit = 'Brandy'
            elif 'scotch' in ingredient_text:
                spirit = 'Whiskey'
            elif 'schnapps' in ingredient_text or 'liqueur' in ingredient_text:
                spirit = 'Liqueur'
            
            # Determine difficulty
            difficulty = 'Medium'
            if len(ingredients) <= 3:
                difficulty = 'Easy'
            elif len(ingredients) >= 6:
                difficulty = 'Hard'
            
            # Create description
            description = f'A {category.lower()} cocktail'
            if ingredients:
                main_ingredient = ingredients[0].lower()
                if 'rum' in main_ingredient:
                    description += ' with rum'
                elif 'vodka' in main_ingredient:
                    description += ' with vodka'
                elif 'gin' in main_ingredient:
                    description += ' with gin'
                elif 'whiskey' in main_ingredient or 'whisky' in main_ingredient or 'scotch' in main_ingredient:
                    description += ' with whiskey'
                elif 'tequila' in main_ingredient:
                    description += ' with tequila'
                elif 'cognac' in main_ingredient or 'brandy' in main_ingredient:
                    description += ' with brandy'
                else:
                    description += f' with {main_ingredient}'
            
            # Create cocktail object
            cocktail = {
                'id': cocktail_id,
                'name': name,
                'spirit': spirit,
                'difficulty': difficulty,
                'description': description,
                'ingredients': ingredients,
                'flavor': f'{spirit}, {category}',
                'instructions': instructions,
                'glass': glass,
                'garnish': 'None specified',
                'moods': {
                    'energetic': int(mood_scores[0]),
                    'relaxed': int(mood_scores[1]),
                    'romantic': int(mood_scores[2]),
                    'celebratory': int(mood_scores[3]),
                    'cozy': int(mood_scores[4])
                },
                'fancy': int(mood_scores[0] + mood_scores[1] + mood_scores[2] + mood_scores[3] + mood_scores[4])
            }
            
            new_cocktails.append(cocktail)
            
        except Exception as e:
            print(f'Error processing line {line_num}: {e}')
            continue
    
    print(f'Successfully processed {len(new_cocktails)} new cocktails')
    
    # Add new cocktails to existing list
    drinks.extend(new_cocktails)
    
    # Write back to file
    with open('data/drinks.json', 'w') as f:
        json.dump(drinks, f, indent=2)
    
    print(f'Updated database now has {len(drinks)} total cocktails')
    
    # Show some examples
    for cocktail in new_cocktails[:5]:
        print(f'- {cocktail["name"]} ({cocktail["spirit"]}) - ID: {cocktail["id"]}')

if __name__ == '__main__':
    parse_full_cocktail_dataset()
