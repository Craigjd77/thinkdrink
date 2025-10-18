#!/usr/bin/env python3
"""
Extract data from Drink Think v2.41 Excel file and convert to JSON format
"""

import pandas as pd
import json
import sys
from pathlib import Path

def extract_excel_data():
    """Extract data from the Excel file and convert to JSON"""
    
    excel_path = "/Users/craigdalessio/Downloads/Drink Think v2.41.xlsx"
    
    try:
        # Read the Excel file with different parameters
        print(f"Reading Excel file: {excel_path}")
        
        # Try reading without header first
        df = pd.read_excel(excel_path, header=None)
        
        print(f"Found {len(df)} rows and {len(df.columns)} columns")
        print(f"First few rows with data:")
        
        # Find rows with actual data
        for i in range(min(10, len(df))):
            row_data = df.iloc[i].dropna()
            if len(row_data) > 0:
                print(f"Row {i}: {list(row_data)}")
        
        # Try to find the header row
        header_row = None
        for i in range(min(20, len(df))):
            row = df.iloc[i]
            if any('name' in str(cell).lower() or 'drink' in str(cell).lower() for cell in row if pd.notna(cell)):
                header_row = i
                break
        
        if header_row is not None:
            print(f"Found potential header at row {header_row}")
            df = pd.read_excel(excel_path, header=header_row)
        else:
            print("No clear header found, using first row as header")
            df = pd.read_excel(excel_path, header=0)
        
        print(f"After header processing: {len(df)} rows and {len(df.columns)} columns")
        print(f"Columns: {list(df.columns)}")
        
        # Display first few rows to understand structure
        print("\nFirst 5 rows:")
        print(df.head())
        
        # Convert to JSON format
        drinks_data = []
        
        for index, row in df.iterrows():
            # Skip empty rows
            if pd.isna(row.iloc[1]):  # Assuming column B (index 1) is the drink name
                continue
                
            drink = {
                "id": str(index + 1),
                "name": str(row.iloc[1]) if not pd.isna(row.iloc[1]) else f"Drink {index + 1}",
                "category": str(row.iloc[2]) if not pd.isna(row.iloc[2]) else "Cocktail",
                "alcoholic": str(row.iloc[3]) if not pd.isna(row.iloc[3]) else "Alcoholic",
                "description": str(row.iloc[4]) if not pd.isna(row.iloc[4]) else "",
                # Add any additional columns as needed
            }
            
            # Add any numeric columns (mood scores, etc.)
            for i, col in enumerate(df.columns):
                if i > 4 and not pd.isna(row.iloc[i]):
                    try:
                        drink[f"score_{i-4}"] = float(row.iloc[i])
                    except:
                        drink[f"column_{i}"] = str(row.iloc[i])
            
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
            print(json.dumps(drinks_data[0], indent=2))
        
        return drinks_data
        
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return None

if __name__ == "__main__":
    extract_excel_data()
