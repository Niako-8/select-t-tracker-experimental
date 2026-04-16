#!/usr/bin/env python3
"""Convert emoji-based CSV to text-based format for the tracker"""

import csv
import sys

# Emoji to text mapping
EMOJI_MAP = {
    '🟢': 'Green',
    '🟡': 'Amber', 
    '🔴': 'Red',
    '': '',
    'N/A': 'N/A',
    'no data': 'no data'
}

def convert_value(value):
    """Convert emoji or keep text values"""
    value = value.strip()
    
    # Check for special markers
    has_dollar = '$' in value
    has_asterisk = '**' in value or '***' in value or '*' in value
    
    # Extract base emoji/text
    base_value = value
    for marker in ['$', '**', '***', '*']:
        base_value = base_value.replace(marker, '').strip()
    
    # Convert emoji to text
    converted = EMOJI_MAP.get(base_value, base_value)
    
    # Re-add markers
    if has_dollar:
        converted += '$'
    if '***' in value:
        converted += '***'
    elif '**' in value:
        converted += '**'
    elif '*' in value and '**' not in value:
        converted += '*'
    
    return converted

def main():
    input_file = '../select data.csv'
    output_file = 'src/imports/latest_data.csv'
    
    with open(input_file, 'r', encoding='utf-8-sig') as infile:
        reader = csv.reader(infile)
        rows = list(reader)
    
    # Convert data rows (skip header rows)
    converted_rows = []
    for i, row in enumerate(rows):
        if i < 7:  # Keep header rows as-is
            converted_rows.append(row)
        else:
            converted_row = []
            for j, cell in enumerate(row):
                if j >= 2:  # Convert data columns (skip portfolio and product name)
                    converted_row.append(convert_value(cell))
                else:
                    converted_row.append(cell)
            converted_rows.append(converted_row)
    
    # Write output
    with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
        writer = csv.writer(outfile)
        writer.writerows(converted_rows)
    
    print(f"✅ Converted {len(converted_rows)} rows")
    print(f"📝 Output: {output_file}")

if __name__ == '__main__':
    main()

# Made with Bob
