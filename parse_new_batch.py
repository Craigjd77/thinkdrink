#!/usr/bin/env python3
import json
import re

def parse_cocktail_data():
    # Read existing drinks
    try:
        with open('data/drinks.json', 'r') as f:
            drinks = json.load(f)
    except FileNotFoundError:
        drinks = []
    
    # Create a set of existing drink names for quick lookup
    existing_names = {drink['name'] for drink in drinks}
    
    # New cocktail data
    new_data = """11262 Fireworks Cocktail Alcoholic Champagne Flute 4 oz Champagne|1/3 oz gin|1/2 oz tangerine schnapps Pour into a champagne flute, garnish with a twist of orange, and serve. Champagne|gin|tangerine schnapps 4 5 6 3 4 22 18% 23% 27% 14% 18% 34% 36% x
11676 Genie Martini Cocktail Alcoholic Cocktail Glass 2 oz Gordon's(R) gin|2 oz Martini & Rossi(R) bianco vermouth Pour the ingredients into a shaker filled with ice. Shake quickly and drain into a cockatil glass. Garnish with an olive. Alternatively add olive juice (from the jar) before mixing, according to taste. Gordon's(R) gin|Martini & Rossi(R) bianco vermouth 4 5 6 3 4 22 18% 23% 27% 14% 18% 34% 36% x
11746 Gin Limey Cocktail Alcoholic Highball Glass 1 1/2 oz Seagram's(R) Lime Twisted gin|5 oz tonic water An interesting twist on the original. For those who like more lime taste, pour Seagram's Lime-Twisted gin over ice and fill with Tonic Water. Garnish with a slice of lime. Seagram's(R) Lime Twisted gin|tonic water 4 5 6 3 4 22 18% 23% 27% 14% 18% 34% 36% x
11771 Ginger-bang Champagne Cocktail Alcoholic Champagne Flute 4 oz Champagne|1 - 2 dashes simple syrup|1/4 ozfresh ginger Muddle fresh ginger in the bottom of a bar glass. Add chilled champagne and simple syrup, stir gently and immediately strain into champagne flute. Serve. Champagne|simple syrup|ginger 4 5 6 3 4 22 18% 23% 27% 14% 18% 34% 36% x
11773 Gingeronno Cocktail Alcoholic Highball Glass 1 1/2 oz Amaretto Di Saronno(R) liqueur|6 oz ginger ale Stir ingredients together in a highball glass 3/4 filled with ice cubes. Add a straw and serve. Amaretto Di Saronno(R) liqueur|ginger ale 4 5 6 3 4 22 18% 23% 27% 14% 18% 34% 36% x
11981 Green Gables #2 Cocktail Alcoholic Cocktail Glass 1 1/2 oz sweet vermouth|1 oz gin|2 tsp Green Chartreuse(R) Pour the gin, vermouth and Chartreuse into a mixing glass half-filled with crushed ice. Stir well, strain into a cocktail glass, and serve. sweet vermouth|gin|Green Chartreuse(R) 4 5 6 3 4 22 18% 23% 27% 14% 18% 34% 36% x
12351 Hong Kong Smog Cocktail Alcoholic Cocktail Glass 2 1/4 oz Tanqueray(R) gin|3/4 oz Midori(R) melon liqueur Pour Tanqueray gin and Midori melon liqueur into a shaker half-filled with ice. Stir or shake well. Strain into a chilled cocktail glass, garnish with a melon ball, and serve. Tanqueray(R) gin|Midori(R) melon liqueur 4 5 6 3 4 22 18% 23% 27% 14% 18% 34% 36% x
12366 Hopeless Case Cocktail Alcoholic Old-Fashioned Glass 1 oz sloe gin|1/2 oz peppermint schnapps|3 ozcold cola Pour into an ice-filled old-fashioned glass. Garnish with a slice of lime, and serve. sloe gin|peppermint schnapps|cola 4 5 6 3 4 22 18% 23% 27% 14% 18% 34% 36% x
13122 Kiss in the Dark Cocktail Alcoholic Cocktail Glass 3/4 oz cherry brandy|3/4 oz dry vermouth|3/4 oz gin Stir all ingredients with ice, strain into a cocktail glass, and serve. cherry brandy|dry vermouth|gin 4 5 6 3 4 22 18% 23% 27% 14% 18% 34% 36% x
13572 Magique Cocktail Alcoholic Cocktail Glass 1 1/2 oz dry vermouth|1 oz gin|2 tsp creme de cassis Pour the vermouth, gin and creme de cassis into a mixing glass half-filled with ice cubes. Stir well, strain into a cocktail glass, and serve. dry vermouth|gin|creme de cassis 4 5 6 3 4 22 18% 23% 27% 14% 18% 34% 36% x
14082 Moulin Rouge Cocktail Cocktail Alcoholic Cocktail Glass 1 1/2 oz sloe gin|3/4 oz sweet vermouth|1 dash bitters Stir ingredients together in a mixing glass half-filled with cracked ice. Strain into a cocktail glass, and serve. sloe gin|sweet vermouth|bitters 4 5 6 3 4 22 18% 23% 27% 14% 18% 34% 36% x
14165 My Sweet Midori Cocktail Alcoholic Highball Glass 1 oz Midori(R) melon liqueur|5 oz ginger ale|3 lime Pour the Midori melon liqueur into a highball glass filled with ice cubes. Fill with ginger ale, squeeze in the juice from 2 or 3 lime wedges, and serve. Midori(R) melon liqueur|ginger ale|lime 4 5 6 3 4 22 18% 23% 27% 14% 18% 34% 36% x
14438 On the Rag Cocktail Alcoholic Brandy Snifter 1 1/2 oz dry gin|1/2 oz grenadine syrup|8 oz ginger ale Pour a shot of gin into a brandy snifter. Add the grenadine and ginger ale, and serve. dry gin|grenadine syrup|ginger ale 4 5 6 3 4 22 18% 23% 27% 14% 18% 34% 36% x
14446 On the Square Cocktail Alcoholic Cocktail Glass 1 oz apricot brandy|1/2 oz gin|1/2 oz Calvados(R) brandy Pour the apricot brandy, gin and Calvados brandy into a mixing glass half-filled with ice cubes. Stir well, strain into a cocktail glass, and serve. apricot brandy|gin|Calvados(R) brandy 4 5 6 3 4 22 18% 23% 27% 14% 18% 34% 36% x
14757 Pearasite Cocktail Alcoholic Highball Glass 4 oz Tanqueray(R) gin|5 oz tonic water|5 oz pear syrup Pour the gin, tonic water and pear syrup into a highball glass almost filled with ice cubes. Stir well and serve. Tanqueray(R) gin|tonic water|pear syrup 4 5 6 3 4 22 18% 23% 27% 14% 18% 34% 36% x
15215 Rafooki Navidad Cocktail Alcoholic Margarita Glass 3 oz Tanqueray(R) gin|2 oz lime mix|1/2 lime|1 cup ice Add the following ingredients to a blender, and blend until it becomes a frozen mix..... Tanqueray(R) gin|lime mix|lime|ice 4 5 6 3 4 22 18% 23% 27% 14% 18% 34% 36% x
16175 Vendome Cocktail Alcoholic Cocktail Glass 1 oz Dubonnet(R) Rouge vermouth|1 oz gin|1 oz dry vermouth Stir all ingredients with ice and strain into a chilled cocktail glass. Garnish with a twist of lemon peel, and serve. Dubonnet(R) Rouge vermouth|gin|dry vermouth 4 5 6 3 4 22 18% 23% 27% 14% 18% 34% 36% x
16282 Wicked Willy Cocktail Alcoholic White Wine Glass 2 oz red wine|1/3 oz passion-fruit syrup|2 oz ginger ale Pour into a frosted wine glass, and serve. red wine|passion-fruit syrup|ginger ale 4 5 6 3 4 22 18% 23% 27% 14% 18% 34% 36% x
437 Bannister Cocktail Alcoholic Cocktail glass 1 1/2 oz Gin|1 oz Applejack|1 tblsp Pernod|1/2 tblsp Grenadine In a mixing glass half-filled with crushed ice, combine all of the ingredients. Ster well. Strain into a cocktail glass Gin|Applejack|Pernod|Grenadine 5 8.5 6.5 5 3.5 28.5 18% 30% 23% 18% 12% 34% 61% x
9277 Brain Blaster Cocktail Alcoholic Cup 1.5 oz Hpnotiq(R) liqueur|0.5 oz tequila|1 can Red Bull(R) energy drink "Inventor: Eran Henebury Origin: Random experimentation with different liquors Popular among friends and fraternity brothers. The drink has a peculiar side effect that after consumption of one glass and other hard liquor you consume directly afterwards will have the same taste as the brain blaster Pour 1.5 ounces of hypnotic into the glass/cup, then add .5 ounces of tequila into the glass/cup, add redbull until either the can is empty or the glass is full." Hpnotiq(R) liqueur|tequila|Red Bull(R) energy drink 5 9 6 5 3.5 28.5 18% 32% 21% 18% 12% 34% 61% x
11679 Gentle Bull Cocktail Alcoholic Old-Fashioned Glass 1 1/2 oz white tequila|3/4 oz Kahlua(R) coffee liqueur|1 tbsp cream Shake ingredients in a cocktail shaker with ice. Strain into an old-fashioned glass. white tequila|Kahlua(R) coffee liqueur|cream 5 9 6 5 3.5 28.5 18% 32% 21% 18% 12% 34% 61% x
12969 Kahlua Earthquake Cocktail Alcoholic Highball Glass 1/2 oz white tequila|1/2 oz Kahlua(R) coffee liqueur|5 oz cola Add Kahlua and Tequila to glass, add ice and top up with Cola. white tequila|Kahlua(R) coffee liqueur|cola 5 9 6 5 3.5 28.5 18% 32% 21% 18% 12% 34% 61% x
12996 Kamora Mexican Coffee Cocktail Alcoholic Irish Coffee Cup 1/2 oz white tequila|1/2 oz Kahlua(R) coffee liqueur|1 cup coffee Add Kahlua and tequila to your hot cup of coffee. white tequila|Kahlua(R) coffee liqueur|coffee 5 9 6 5 3.5 28.5 18% 32% 21% 18% 12% 34% 61% x
15306 Red Lemon Cocktail Alcoholic Pint glass Patron(R) silver tequila|Organic brand lemonade|Rose's Red grenadine syrup "Inventory - Steve Skowronski Origin - Mokena,IL. Where it is Popluar - at my house and on my block. I was just looking for something cool and refreshing to drink one hot summer evening. That is when the first Red lemon was born. I've tried this with a few other tequilas and lemonades and it definately tastes the best with Patron and Organic's brand lemnade.2 shots of Patron Silver Tequila in a pint glass. Fill glass with ice, add Organic brand Lemonade, add a splash of Rose's Red Grenadine and let it settle to the bottom. Garnish with a lemon slice or ledge. Salting the rim of the glass is optional. Either way it is a Great Summer Time drink and simple to make." Patron(R) silver tequila|lemonade|grenadine syrup 5 9 6 5 3.5 28.5 18% 32% 21% 18% 12% 34% 61% x
16080 Triple G Cocktail Alcoholic Pint glass 12 ozLipton Green Apple green tea|2 oz tequila|crushed or cubed ice Very simple drink to do and has great sour taste and a bit of bite from the oak aged tequila. This can be a good party drink or to enjoy chillin at the beach. I created this drink at my pad when the only thing I had to mix with the tequila was the Brisk Iced tea.Take a chilled pint glass and fill to half with ice, then pour tequila over ice and fill to the top with Lipton Brisk Iced Green apple Green Tea. green tea|tequila|ice 5 9 6 5 3.5 28.5 18% 32% 21% 18% 12% 34% 61% x
8344 Apricot Jack Cocktail Alcoholic Sour Glass 1 1/2 oz Jack Daniel's(R) Tennessee whiskey|1 oz Hiram Walker(R) apricot brandy|3/4 oz apricot nectar|1 oz sweet and sour mix Pour two shots of Jack Daniels into a whiskey sour glass. Add one shot of Apricot Brandy. Combine with apricot nectar and sweet and sour mix. Top with a lemon, cherry, or orange slice. Stir, and serve. Jack Daniel's(R) Tennessee whiskey|Hiram Walker(R) apricot brandy|apricot nectar|sweet and sour mix 9 7 3 5 2 26 35% 27% 12% 19% 8% 34% 50% x
11001 Dungeon Master Cocktail Alcoholic Cocktail Glass 1 1/2 oz Jack Daniel's(R) Tennessee whiskey|1/2 oz cherry brandy|2 splashes Amer Picon(R) orange bitters|1 tsp sugar syrup Stir ingredients in a cocktail shaker with ice. Strain into glass. Jack Daniel's(R) Tennessee whiskey|cherry brandy|Amer Picon(R) orange bitters|sugar syrup 9 7 3 5 2 26 35% 27% 12% 19% 8% 34% 50% x"""
    
    # Parse the data
    lines = new_data.strip().split('\n')
    added_count = 0
    
    for line in lines:
        if not line.strip():
            continue
            
        parts = line.split('|')
        if len(parts) < 10:
            continue
            
        try:
            # Extract drink ID and name
            id_part = parts[0].strip()
            drink_id = id_part.split()[0]
            drink_name = ' '.join(id_part.split()[1:])
            
            # Skip if already exists
            if drink_name in existing_names:
                print(f"Skipping existing drink: {drink_name}")
                continue
                
            # Extract other fields
            category = parts[1].strip()
            alcoholic = parts[2].strip()
            glass = parts[3].strip()
            ingredients_str = parts[4].strip()
            instructions = parts[5].strip()
            shopping_list = parts[6].strip()
            
            # Parse mood values
            mood_values = parts[7].strip().split()
            if len(mood_values) >= 5:
                dark = float(mood_values[0])
                thirsty = float(mood_values[1])
                calm = float(mood_values[2])
                celebrate = float(mood_values[3])
                score = float(mood_values[4])
            else:
                dark = thirsty = calm = celebrate = score = 5.0
            
            # Parse ingredients
            ingredients = [ing.strip() for ing in ingredients_str.split('|')]
            
            # Determine primary spirit
            spirit = "Mixed"
            for ing in ingredients:
                ing_lower = ing.lower()
                if any(s in ing_lower for s in ['vodka', 'gin', 'rum', 'whiskey', 'whisky', 'bourbon', 'scotch', 'tequila', 'brandy', 'cognac']):
                    if 'vodka' in ing_lower:
                        spirit = "Vodka"
                    elif 'gin' in ing_lower:
                        spirit = "Gin"
                    elif 'rum' in ing_lower:
                        spirit = "Rum"
                    elif any(w in ing_lower for w in ['whiskey', 'whisky', 'bourbon', 'scotch']):
                        spirit = "Whiskey"
                    elif 'tequila' in ing_lower:
                        spirit = "Tequila"
                    elif any(b in ing_lower for b in ['brandy', 'cognac']):
                        spirit = "Brandy"
                    break
            
            # Create drink object
            drink = {
                "id": drink_id,
                "name": drink_name,
                "category": category,
                "alcoholic": alcoholic,
                "glass": glass,
                "ingredients": ingredients,
                "instructions": instructions,
                "spirit": spirit,
                "difficulty": "Medium",
                "description": f"A {category.lower()} cocktail made with {', '.join(ingredients[:3])}.",
                "flavor": "Balanced",
                "garnish": "As specified",
                "moods": {
                    "dark": dark,
                    "thirsty": thirsty,
                    "calm": calm,
                    "celebrate": celebrate,
                    "energetic": max(1, min(10, score - 2)),  # Derived from score
                    "fancy": max(1, min(10, score - 1))       # Derived from score
                }
            }
            
            drinks.append(drink)
            existing_names.add(drink_name)
            added_count += 1
            print(f"Added: {drink_name}")
            
        except Exception as e:
            print(f"Error parsing line: {line[:100]}... - {e}")
            continue
    
    # Save updated drinks
    with open('data/drinks.json', 'w') as f:
        json.dump(drinks, f, indent=2)
    
    print(f"\nSuccessfully added {added_count} new drinks!")
    print(f"Total drinks in database: {len(drinks)}")

if __name__ == "__main__":
    parse_cocktail_data()
