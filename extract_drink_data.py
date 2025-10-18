#!/usr/bin/env python3
"""
Extract drink data from the Excel file and convert to JSON format for ThinkDrink app
"""

import pandas as pd
import json
import sys
from pathlib import Path

def extract_drink_data():
    """Extract drink data from the Excel file and convert to JSON"""
    
    excel_path = "/Users/craigdalessio/Downloads/Drink Think v2.41.xlsx"
    
    try:
        print(f"Reading Excel file: {excel_path}")
        
        # Read the main data sheet (10_1.0.9 has the most complete data)
        df = pd.read_excel(excel_path, sheet_name='10_1.0.9')
        
        print(f"Found {len(df)} drinks with {len(df.columns)} columns")
        print(f"Columns: {list(df.columns)}")
        
        # Show sample data
        print("\nSample drinks:")
        for i in range(min(3, len(df))):
            row = df.iloc[i]
            print(f"Drink {i+1}: {row['d_name']} - {row['d_cat']}")
        
        # Convert to JSON format for ThinkDrink app
        drinks_data = []
        
        for index, row in df.iterrows():
            # Skip rows with missing names
            if pd.isna(row['d_name']) or str(row['d_name']).strip() == '':
                continue
                
            # Extract ingredients list
            ingredients = []
            if not pd.isna(row['d_ingredients']):
                ingredients = [ing.strip() for ing in str(row['d_ingredients']).split('|') if ing.strip()]
            
            # Extract shopping list
            shopping = []
            if not pd.isna(row['d_shopping']):
                shopping = [item.strip() for item in str(row['d_shopping']).split('|') if item.strip()]
            
            # Create mood scores (using the numeric columns)
            mood_scores = {}
            for col in df.columns:
                if col not in ['id', 'd_name', 'd_cat', 'd_alcohol', 'd_glass', 'd_ingredients', 'd_instructions', 'd_shopping']:
                    if not pd.isna(row[col]) and isinstance(row[col], (int, float)):
                        mood_scores[col.lower().replace(' ', '_')] = float(row[col])
            
            drink = {
                "id": str(int(row['id'])) if not pd.isna(row['id']) else str(index + 1),
                "name": str(row['d_name']).strip(),
                "category": str(row['d_cat']).strip() if not pd.isna(row['d_cat']) else "Cocktail",
                "alcoholic": str(row['d_alcohol']).strip() if not pd.isna(row['d_alcohol']) else "Alcoholic",
                "glass": str(row['d_glass']).strip() if not pd.isna(row['d_glass']) else "Any Glass",
                "ingredients": ingredients,
                "instructions": str(row['d_instructions']).strip() if not pd.isna(row['d_instructions']) else "",
                "shopping_list": shopping,
                "mood_scores": mood_scores,
                "image": f"https://via.placeholder.com/300x200?text={str(row['d_name']).replace(' ', '+')}"
            }
            
            drinks_data.append(drink)
        
        # Save to JSON
        output_path = "/Users/craigdalessio/thinkdrink-app/data/drink_think_data.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(drinks_data, f, indent=2, ensure_ascii=False)
        
        print(f"\nExtracted {len(drinks_data)} drinks")
        print(f"Saved to: {output_path}")
        
        # Show sample of extracted data
        print("\nSample extracted drink:")
        if drinks_data:
            sample = drinks_data[0]
            print(f"Name: {sample['name']}")
            print(f"Category: {sample['category']}")
            print(f"Ingredients: {sample['ingredients'][:3]}...")
            print(f"Mood scores: {sample['mood_scores']}")
        
        return drinks_data
        
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    extract_drink_data()
