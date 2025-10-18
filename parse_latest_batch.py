#!/usr/bin/env python3
"""
Parse latest batch of cocktail data and add to drinks.json
"""

import json
import re
from datetime import datetime

def parse_cocktail_line(line):
    """Parse a single cocktail line from the raw data"""
    # Split by tabs
    parts = line.strip().split('\t')
    
    if len(parts) < 15:
        return None
    
    try:
        # Extract basic information
        drink_id = parts[0]
        name = parts[1]
        category = parts[2]
        alcoholic = parts[3]
        glass = parts[4]
        ingredients_raw = parts[5]
        instructions = parts[6]
        shopping_list = parts[7]
        
        # Extract mood scores (assuming they're in positions 8-13)
        dark = float(parts[8]) if parts[8] and parts[8] != '' else 5
        thirsty = float(parts[9]) if parts[9] and parts[9] != '' else 5
        calm = float(parts[10]) if parts[10] and parts[10] != '' else 5
        celebrate = float(parts[11]) if parts[11] and parts[11] != '' else 5
        score = float(parts[12]) if parts[12] and parts[12] != '' else 5
        
        # Map mood scores to our mood system
        # dark -> cozy, thirsty -> energetic, calm -> relaxed, celebrate -> celebratory
        # We'll need to infer romantic and adventurous from context
        moods = {
            "energetic": min(10, max(1, thirsty)),
            "relaxed": min(10, max(1, calm)),
            "romantic": min(10, max(1, (dark + calm) / 2)),  # Infer from dark/calm
            "adventurous": min(10, max(1, (thirsty + celebrate) / 2)),  # Infer from energetic/celebratory
            "celebratory": min(10, max(1, celebrate)),
            "cozy": min(10, max(1, dark))
        }
        
        # Parse ingredients
        ingredients = []
        if ingredients_raw:
            # Split by pipe and clean up
            ingredient_parts = ingredients_raw.split('|')
            for ingredient in ingredient_parts:
                ingredient = ingredient.strip()
                if ingredient:
                    ingredients.append(ingredient)
        
        # Determine spirit type from ingredients
        spirit = "Mixed"
        spirit_keywords = {
            "vodka": ["vodka"],
            "gin": ["gin"],
            "rum": ["rum"],
            "whiskey": ["whiskey", "whisky", "bourbon", "scotch"],
            "tequila": ["tequila"],
            "brandy": ["brandy", "cognac"]
        }
        
        ingredients_lower = " ".join(ingredients).lower()
        for spirit_type, keywords in spirit_keywords.items():
            if any(keyword in ingredients_lower for keyword in keywords):
                spirit = spirit_type.title()
                break
        
        # Determine difficulty
        difficulty = "Easy"
        if len(ingredients) > 5:
            difficulty = "Hard"
        elif len(ingredients) > 3:
            difficulty = "Medium"
        
        # Create drink object
        drink = {
            "id": int(drink_id) if drink_id.isdigit() else hash(drink_id) % 100000,
            "name": name,
            "category": category,
            "alcoholic": alcoholic == "Alcoholic",
            "glass": glass,
            "ingredients": ingredients,
            "instructions": instructions,
            "spirit": spirit,
            "difficulty": difficulty,
            "description": f"A {category.lower()} perfect for {get_mood_description(moods)} moments.",
            "flavor": get_flavor_profile(ingredients),
            "garnish": extract_garnish(instructions),
            "moods": moods
        }
        
        return drink
        
    except (ValueError, IndexError) as e:
        print(f"Error parsing line: {line[:100]}... Error: {e}")
        return None

def get_mood_description(moods):
    """Generate a description based on dominant moods"""
    sorted_moods = sorted(moods.items(), key=lambda x: x[1], reverse=True)
    dominant = sorted_moods[0]
    
    mood_descriptions = {
        "energetic": "energetic and lively",
        "relaxed": "relaxed and calm",
        "romantic": "romantic and intimate",
        "adventurous": "adventurous and bold",
        "celebratory": "celebratory and festive",
        "cozy": "cozy and comforting"
    }
    
    return mood_descriptions.get(dominant[0], "special")

def get_flavor_profile(ingredients):
    """Determine flavor profile from ingredients"""
    ingredients_str = " ".join(ingredients).lower()
    
    if any(word in ingredients_str for word in ["chocolate", "cacao", "cocoa"]):
        return "Rich & Chocolatey"
    elif any(word in ingredients_str for word in ["fruit", "juice", "cranberry", "orange", "pineapple"]):
        return "Fruity & Refreshing"
    elif any(word in ingredients_str for word in ["coffee", "espresso", "kahlua"]):
        return "Coffee & Bold"
    elif any(word in ingredients_str for word in ["cream", "milk", "bailey"]):
        return "Creamy & Smooth"
    elif any(word in ingredients_str for word in ["spice", "ginger", "cinnamon"]):
        return "Spiced & Warm"
    else:
        return "Classic & Balanced"

def extract_garnish(instructions):
    """Extract garnish information from instructions"""
    garnish_keywords = ["garnish", "garnished", "decorate", "decorated", "topped"]
    garnish_items = []
    
    # Common garnishes to look for
    common_garnishes = ["cherry", "olive", "lime", "lemon", "orange", "mint", "strawberry", "chocolate"]
    
    instructions_lower = instructions.lower()
    for garnish in common_garnishes:
        if garnish in instructions_lower:
            garnish_items.append(garnish)
    
    return garnish_items[:3] if garnish_items else []

def main():
    # Read the raw data
    raw_data = """5016	Sex on the Pool Table	Cocktail	Alcoholic	Any Glass	1 part Triple sec|1 part Peach schnapps|1 part Chambord raspberry liqueur|1 part Midori melon liqueur|1 part Grapefruit juice	Over ice mix equal parts of each alchohol. Top with the grapefruit juice. Shake to blend.	Triple sec|Peach schnapps|Chambord raspberry liqueur|Midori melon liqueur|Grapefruit juice	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
8166	Amaretto Sour #2	Cocktail	Alcoholic	Highball Glass	50 ml amaretto almond liqueur|25 ml lemon juice|25 ml sugar syrup|3 dashes Angostura(R) bitters|2 splashes pineapple juice	Add all ingredients to a cocktail shaker half-filled with ice cubes. Shake vigorously, pour over ice in a highball glass, and serve.	amaretto almond liqueur|lemon juice|sugar syrup|Angostura(R) bitters|pineapple juice	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
8563	Balm Cocktail	Cocktail	Alcoholic	Cocktail Glass	2 oz sherry|3/4 ozfresh orange juice|1/2 oz Cointreau(R) orange liqueur|2 dashes Angostura(R) bitters|2 slices oranges	Mix all ingredients with the orange slices and shake well with ice. Strain into a chilled martini glass, garnish with flamed orange peel, and serve.	sherry|orange juice|Cointreau(R) orange liqueur|Angostura(R) bitters|oranges	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
8653	Barnstormer	Cocktail	Alcoholic	Old-Fashioned Glass	1 1/2 oz Canadian whisky|1/2 oz peppermint schnapps|1 tsp dark creme de cacao|1 tsp white creme de cacao|1/2 oz lemon juice	Pour whisky, peppermint schnapps, creme de cacao liqueurs and lemon juice into a cocktail shaker half-filled with ice cubes. Shake well, strain into an old-fashioned glass almost filled with ice cubes, and serve.	Canadian whisky|peppermint schnapps|dark creme de cacao|white creme de cacao|lemon juice	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%				x		
8654	Barney Fizz	Cocktail	Alcoholic	Collins Glass	1 oz amaretto almond liqueur|1/2 oz Everclear(R) alcohol|1 oz raspberry liqueur|3 oz grape juice|1  egg|1 tbsp sugar	Blend ingredients in a blender with ice and pour into a collins glass.	amaretto almond liqueur|Everclear(R) alcohol|raspberry liqueur|grape juice|egg|sugar	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
8779	Berry Blaster	Cocktail	Alcoholic	Hurricane Glass	30 ml creme de cassis|15 ml peach schnapps|30 ml Parfait Amour(R) orange liqueur|10 ml lemon juice|Fill with cranberry juice	Invented in Alice Springs, N.T, Australia by Daniel O'Connell.  Actually inspired as none of the above liqueurs were fast movers on our cocktail shelf in the bar i work in, ended up tasting pretty damn good! went through 6 bottles of cassis and parfait amour on the weekend!Fill Hurricane glass with blocked ice, place liqueur in order of ingredients.  Lemon juice should mix with cranberry juice and layer on top of the liqueurs, garnish with a lemon wheel.	creme de cassis|peach schnapps|Parfait Amour(R) orange liqueur|lemon juice|cranberry juice	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
8923	Black Mozart Sparkler	Cocktail	Alcoholic	Champagne Tulip	2 cl Mozart(R) Black chocolate liqueur|2 cl cherry brandy|2 cl cherry juice|1 dashfresh lime juice|red sparkling wine	Shake ingredients in a shaker and pour into a champagne tulip. Top with dry red sparkling wine. Garnish with a red cherry on a cocktail stick, and serve.	Mozart(R) Black chocolate liqueur|cherry brandy|cherry juice|lime juice|red sparkling wine	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
8964	Blackberry Julep	Cocktail	Alcoholic	Highball Glass	1 1/2 oz Marie Brizard(R) creme de mure|1 ozfresh lemon juice|1/2 oz simple syrup|1 tbsp mixed-berry marinade|1 oz water	Shake blackberry liqueur, lemon juice and simple syrup with ice, and strain into a highball glass filled with crushed ice. Stir until the glass begins to frost. Garnish with the berry marinade, and serve.	Marie Brizard(R) creme de mure|lemon juice|simple syrup|mixed-berry marinade|water	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
9564	Call of the Snowfields (Lumike...	Cocktail	Alcoholic	Cocktail Glass	2 cl Lapponia Lakka cloudberry liqueur|2 cl Parfait Amour(R) orange liqueur|2 cl cream|2 cl pineapple juice|grated nutmeg	Blend with ice and pour into cocktail glass. Sprinkle grated nutmeg on top.	Lapponia Lakka cloudberry liqueur|Parfait Amour(R) orange liqueur|cream|pineapple juice|nutmeg	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
9594	Canadian Blackberry	Cocktail	Alcoholic	Old-Fashioned Glass	2 oz Canadian whisky|1/2 oz blackberry brandy|1/2 ozfresh orange juice|1 tspfresh lemon juice|1/2 tsp superfine sugar	Pour the whisky, brandy, juices and sugar into a cocktail shaker half-filled with ice cubes. Shake well, strain into an old-fashioned glass 1/4 filled with ice cubes, and serve.	Canadian whisky|blackberry brandy|orange juice|lemon juice|superfine sugar	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%				x		
10361	Cosmopolitan Delight	Cocktail	Alcoholic	Old-Fashioned Glass	1 1/2 oz brandy|1/2 oz Curacao orange liqueur|1/2 oz simple syrup|3/4 ozfresh lemon juice|1/4 oz orgeat syrup|1 splash red wine	Shake all ingredients with ice and serve over ice in an old-fashioned glass. Top with a splash of red wine. Garnish with fresh fruit, and serve.	brandy|Curacao orange liqueur|simple syrup|lemon juice|orgeat syrup|red wine	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
10574	Daily Mail	Cocktail	Alcoholic	Old-Fashioned Glass	2 1/2 oz Scotch whisky|1/2 tsp powdered sugar|2 tsp lemon juice|2 dashes Curacao orange liqueur|1 dash amaretto almond liqueur	Stir all ingredients together in a lowball or old-fashioned glass, and serve.	Scotch whisky|powdered sugar|lemon juice|Curacao orange liqueur|amaretto almond liqueur	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%				x		
11018	Earl of Sardinia	Cocktail	Alcoholic	Old-Fashioned Glass	1 1/2 oz Campari(R) bitters|1/2 oz creme de cassis|3 oz grapefruit juice|1 oz pineapple juice|1 tsp grenadine syrup	Pour all ingredients into a cocktail shaker half-filled with ice cubes. Shake, strain into an old-fashioned glass almost filled with crushed ice, and serve.	Campari(R) bitters|creme de cassis|grapefruit juice|pineapple juice|grenadine syrup	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
11236	Fiddlers Toast	Cocktail	Alcoholic	Wine Goblet	3 oz Champagne|1/2 oz Grand Marnier(R) orange liqueur|1/2 oz lime juice|2 oz orange juice|Blue Curacao liqueur|1 tsp sugar	Pour champagne, grand marnier and juices into a wine goblet three-quarters filled with broken ice. Add a slice of orange, and float a curacao-soaked sugar cube on top. Serve with short straws.	Champagne|Grand Marnier(R) orange liqueur|lime juice|orange juice|Blue Curacao liqueur|sugar	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
11472	Frozen Dreamsicle	Cocktail	Alcoholic	Hurricane Glass	4 oz orange juice|1 oz amaretto almond liqueur|1/4 oz grenadine syrup|2 scoops ice|1 scoop(large) vanilla ice cream	Combine all ingredients together in a blender. Blend until smooth and pour into a tall glass. Top with whipped cream, and serve.	orange juice|amaretto almond liqueur|grenadine syrup|ice|vanilla ice cream	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
11637	Gamble	Cocktail	Alcoholic	Wine Goblet	1 oz apricot brandy|3/4 oz Mandarine Napoleon(R) orange liqueur|1/2 oz sweet sherry|1 oz mango juice|3 tbsp vanilla ice cream	Blend briefly with half a glassful of crushed ice. Serve in a wine goblet.	apricot brandy|Mandarine Napoleon(R) orange liqueur|sweet sherry|mango juice|vanilla ice cream	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
11696	German Bight	Cocktail	Alcoholic	Cocktail Glass	1 oz apple schnapps|1/2 oz Barenfang(R) honey liqueur|1/3 oz rosso vermouth|1/3 oz dry vermouth|2 oz pineapple juice	Shake, strain into a cocktail glass, and serve.	apple schnapps|Barenfang(R) honey liqueur|rosso vermouth|dry vermouth|pineapple juice	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
12023	Grimaldi	Cocktail	Alcoholic	Cocktail Glass	1 oz Safari(R) liqueur|1 oz Pecher Mignon(R) peach liqueur|1/3 oz Bols(R) Blue Curacao liqueur|1 oz pineapple juice	Shake and strain into a cocktail glass. Garnish with a cherry, and serve.	Safari(R) liqueur|Pecher Mignon(R) peach liqueur|Bols(R) Blue Curacao liqueur|pineapple juice	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
12157	Harry Potter	Cocktail	Alcoholic	Highball Glass	1 oz blackberry liqueur|1 oz DeKuyper(R) Buttershots liqueur|1 oz Chambord(R) raspberry liqueur|1 splash cranberry juice	Shake ingredients together in a cocktail shaker half-filled with ice cubes. Serve,	blackberry liqueur|DeKuyper(R) Buttershots liqueur|Chambord(R) raspberry liqueur|cranberry juice	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
12857	Jimmy's Jetplane	Cocktail	Alcoholic	Highball Glass	1 oz Hpnotiq(R) liqueur|1/2 oz Sourz(R) apple liqueur|1/2 oz Midori(R) melon liqueur|2 oz pineapple juice|1/4 oz lime juice	This cocktail was invented by Jimmy Walsh who while messing around with Hpnotiq stumbled upon a mix which tasted very similar to a popular type of candy here in New Zealand.   The cocktail sells extremely well thanks to its appearance, novelty value, and its ease to drink.Shake all ingredients and strain into a highball glass full of ice.   Garnish with a lemon wheel and an aeroplane shaped candy.   The perfect candy is a gummi like substance that comes in many colours.	Hpnotiq(R) liqueur|Sourz(R) apple liqueur|Midori(R) melon liqueur|pineapple juice|lime juice	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
13200	La Rosa	Cocktail	Alcoholic	Cocktail Glass	1/2 oz Scotch whisky|1/2 oz Chambord(R) raspberry liqueur|1 oz Ocean Spray(R) Cranberry Juice Cocktail|1 squeezefresh lime juice	Pour the Scotch whisky, Chambord raspberry liqueur and Ocean Spray cranberry juice cocktail into a cocktail glass with crushed ice. Add a small squeeze of fresh lime juice and stir gently. Garnish with a lime wedge, and serve.	Scotch whisky|Chambord(R) raspberry liqueur|Ocean Spray(R) Cranberry Juice Cocktail|lime juice	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%				x		
13257	Lazy Lover	Cocktail	Alcoholic	Cocktail Glass	1 1/2 oz Southern Comfort(R) peach liqueur|1/2 oz armagnac|1 oz pineapple juice|3/4 oz lime juice|1/2 oz passion-fruit syrup	Shake and strain into a cocktail glass. Garnish with a speared cherry, and serve.	Southern Comfort(R) peach liqueur|armagnac|pineapple juice|lime juice|passion-fruit syrup	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
13534	Lust for Life	Cocktail	Alcoholic	Cocktail Glass	1 1/2 oz Galliano(R) herbal liqueur|1/2 oz Marie Brizard(R) peach liqueur|1 ozfresh orange juice|1/2 oz heavy cream	Shake all ingredients with ice and strain into a chilled cocktail glass. Dust with nutmeg, and serve.	Galliano(R) herbal liqueur|Marie Brizard(R) peach liqueur|orange juice|heavy cream	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
13829	Metropolis #2	Cocktail	Alcoholic	Cocktail Glass	2 oz armagnac|1 oz ruby grapefruit juice|1/2 oz orgeat syrup|1/2 oz Luxardo(R) maraschino liqueur|1/2 oz lemon juice	Add ingredients to a cocktail shaker half-filled with ice cubes. Shake well and strain into a chilled martini cocktail glass. Garnish with a piece of ruby grapefruit, and serve.	armagnac|ruby grapefruit juice|orgeat syrup|Luxardo(R) maraschino liqueur|lemon juice	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
14423	Old Nick	Cocktail	Alcoholic	Old-Fashioned Glass	2 oz Canadian whisky|1/2 oz Drambuie(R) Scotch whisky|1/2 oz orange juice|1/2 oz lemon juice|3 dashes orange bitters	Combine the whisky, Drambuie, orange juice, lemon juice and orange bitters in a cocktail shaker half-filled with ice cubes. Shake well, and strain into an old-fashioned glass almost filled with ice cubes. Garnish with a twist of lemon and a maraschino cherry.	Canadian whisky|Drambuie(R) Scotch whisky|orange juice|lemon juice|orange bitters	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%				x		
14514	Orange Tree	Cocktail	Alcoholic	Old-Fashioned Glass	2/3 oz Mandarine Napoleon(R) orange liqueur|2/3 oz cognac|2/3 oz apricot brandy|2/3 oz mandarin juice|2 oz lemonade	Pour into an old-fashioned glass filled with broken ice. Add an orange slice, and serve.	Mandarine Napoleon(R) orange liqueur|cognac|apricot brandy|mandarin juice|lemonade	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
14971	Plastered Possum	Cocktail	Alcoholic	Hurricane Glass	1 oz Cointreau(R) orange liqueur|1 oz Galliano(R) herbal liqueur|1 oz Midori(R) melon liqueur|1 oz cream|4 oz pineapple juice	Shake ingredients in a cocktail shaker and pour into a hurricane glass.	Cointreau(R) orange liqueur|Galliano(R) herbal liqueur|Midori(R) melon liqueur|cream|pineapple juice	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
14978	Playmate	Cocktail	Alcoholic	Cocktail Glass	1/2 oz apricot brandy|1/2 oz brandy|1/2 oz Grand Marnier(R) orange liqueur|1/2 oz orange juice|1  egg|1 dash Angostura(R) bitters	Shake with ice and strain into a cocktail glass.	apricot brandy|brandy|Grand Marnier(R) orange liqueur|orange juice|egg|Angostura(R) bitters	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
15185	Queen Of Scots	Cocktail	Alcoholic	Cocktail Glass	1 tsp sugar|2 tsp water|1 tsp lemon juice|2 oz Scotch whisky|1/2 tsp Green Chartreuse(R)|1/2 tsp Blue Curacao liqueur	Shake with ice and strain into a cocktail glass.	sugar|water|lemon juice|Scotch whisky|Green Chartreuse(R)|Blue Curacao liqueur	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%				x		
15227	Rainbow Sour	Cocktail	Alcoholic	Old-Fashioned Glass	1 oz Pineau des Charentes(R) red wine|1 oz Marie Brizard(R) Apry apricot brandy|3/4 ozfresh lemon juice|1/2 oz simple syrup	Shake all ingredients with ice and pour into an old-fashioned glass. Garnish with a cherry and an orange slice, and serve.	Pineau des Charentes(R) red wine|Marie Brizard(R) Apry apricot brandy|lemon juice|simple syrup	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
15416	Royal Silver	Cocktail	Alcoholic	White Wine Glass	4 oz Champagne|1/2 oz Marie Brizard(R) Poire Williams pear liqueur|1/2 oz Cointreau(R) orange liqueur|1 1/2 oz grapefruit juice	Rim a wine glass with grenadine and caster sugar. Shake all ingredients (except champagne) and strain into the glass. Add champagne, and serve.	Champagne|Marie Brizard(R) Poire Williams pear liqueur|Cointreau(R) orange liqueur|grapefruit juice	9	2	6	6	2	25	36%	8%	24%	24%	8%	35%	46%						
10169	Coco Blossom	Cocktail	Alcoholic	Parfait Glass	1 oz amaretto almond liqueur|1 oz dark creme de cacao|3 oz Tequila Rose(R) strawberry cream liqueur|1 oz milk	Shake all ingredients in a cocktail shaker with ice. Strain into glass. You can also add ice or a splash of soda to make fizzy.	amaretto almond liqueur|dark creme de cacao|Tequila Rose(R) strawberry cream liqueur|milk	8	7	2	6	2	25	32%	28%	8%	24%	8%	35%	46%					x	
12625	Irish Rose	Cocktail	Alcoholic	Old-Fashioned Glass	1 oz Tequila Rose(R) strawberry cream liqueur|1 oz Bailey's(R) Irish cream|1 oz brown creme de cacao	Pour ingredients into a stainless steel shaker over ice, shake until completely cold then strain into a chilled stemmed glass or rocks glass filled with ice.	Tequila Rose(R) strawberry cream liqueur|Bailey's(R) Irish cream|brown creme de cacao	8	7	2	6	2	25	32%	28%	8%	24%	8%	35%	46%					x	
5783	Trilby Cocktail	Cocktail	Alcoholic	Cocktail glass	3/4 oz Sweet Vermouth|1 1/2 oz Bourbon|2 dashes Orange bitters	Stir all ingredients with ice, strain into a cocktail glass, and serve.	Sweet Vermouth|Bourbon|Orange bitters	5	2.5	1	3	1	12.5	40%	20%	8%	24%	8%	35%	79%				x		
5796	Trogg's Nog	Cocktail	Alcoholic	Highball glass	Ice cubes|1 oz Grand Marnier|1/2 oz white Creme de Cacao|Fill with Eggnog	Pour liquor over ice, fill with eggnog, and stir.	Ice|Grand Marnier|Creme de Cacao|Eggnog	5	2.5	1	3	1	12.5	40%	20%	8%	24%	8%	35%	79%						
5820	Tropical Waters	Cocktail	Alcoholic	Highball glass	1 1/2 oz Blue Curacao|1 1/2 oz Melon liqueur|3 oz Sprite|Ice cubes	Pour the Melon liqueur and the Blue curacao into a highball glass. Then add Sprite, and finally the ice cubes	Blue Curacao|Melon liqueur|Sprite|Ice	5	2.5	1	3	1	12.5	40%	20%	8%	24%	8%	35%	79%						
5911	Vermouth Cassis	Cocktail	Alcoholic	Highball glass	1 1/2 oz Dry Vermouth|3/4 oz Creme de Cassis|Carbonated water	Stir vermouth and creme de cassis in a highball glass with ice cubes. Fill with carbonated water, stir again, and serve.	Dry Vermouth|Creme de Cassis|Carbonated water	5	2.5	1	3	1	12.5	40%	20%	8%	24%	8%	35%	79%						
5932	Viking Blood	Cocktail	Alcoholic	Highball glass	2 cl Aquavit|2 cl Tia maria|Fill with Sprite or 7-Up|Ice cubes	Pour Aquavit and Tia Maria over ice, fill with Sprite/7-Up and stir.	Aquavit|Tia maria|Sprite|Ice	5	2.5	1	3	1	12.5	40%	20%	8%	24%	8%	35%	79%						
5941	Viscous Robert	Cocktail	Alcoholic	Old-fashioned glass	1 oz Angostura bitters|1 dash Southern Comfort|Twist of Lemon peel	Pour Bitters over rocks, and swirl in a dash of Southern Comfort. Garnish with lemon peel and and an umbrella (or the most frou-frou accoutrement you have on hand)	Angostura bitters|Southern Comfort|Lemon peel	5	2.5	1	3	1	12.5	40%	20%	8%	24%	8%	35%	79%						
6004	Washington Cocktail	Cocktail	Alcoholic	Cocktail glass	1 1/2 oz Dry Vermouth|3/4 oz Brandy|1/2 tsp Sugar syrup|2 dashes Bitters	Stir all ingredients with ice, strain into a cocktail glass, and serve.	Dry Vermouth|Brandy|Sugar syrup|Bitters	5	2.5	1	3	1	12.5	40%	20%	8%	24%	8%	35%	79%						
6101	Widow's Kiss	Cocktail	Alcoholic	Cocktail glass	1 oz Brandy|1/2 oz Yellow Chartreuse|1/2 oz Benedictine|1 dash Bitters	Shake all ingredients with ice, strain into a cocktail glass, and serve.	Brandy|Yellow Chartreuse|Benedictine|Bitters	5	2.5	1	3	1	12.5	40%	20%	8%	24%	8%	35%	79%						
6164	Yellow Parrot	Cocktail	Alcoholic	Cocktail glass	3/4 oz Yellow Chartreuse|3/4 oz Apricot brandy|1/4 oz Anisette	Stir with ice in a mixing glass. Strain into chilled cocktail glass.	Yellow Chartreuse|Apricot brandy|Anisette	5	2.5	1	3	1	12.5	40%	20%	8%	24%	8%	35%	79%					"""
    
    # Parse all lines
    lines = raw_data.strip().split('\n')
    new_drinks = []
    
    for line in lines:
        if line.strip():
            drink = parse_cocktail_line(line)
            if drink:
                new_drinks.append(drink)
    
    print(f"Parsed {len(new_drinks)} new drinks")
    
    # Load existing drinks
    try:
        with open('data/drinks.json', 'r') as f:
            existing_drinks = json.load(f)
    except FileNotFoundError:
        existing_drinks = []
    
    # Get existing IDs to avoid duplicates
    existing_ids = {drink['id'] for drink in existing_drinks}
    
    # Add new drinks (skip duplicates)
    added_count = 0
    for drink in new_drinks:
        if drink['id'] not in existing_ids:
            existing_drinks.append(drink)
            existing_ids.add(drink['id'])
            added_count += 1
        else:
            print(f"Skipping duplicate ID: {drink['id']} - {drink['name']}")
    
    print(f"Added {added_count} new drinks to database")
    
    # Save updated drinks
    with open('data/drinks.json', 'w') as f:
        json.dump(existing_drinks, f, indent=2)
    
    print(f"Total drinks in database: {len(existing_drinks)}")

if __name__ == "__main__":
    main()
