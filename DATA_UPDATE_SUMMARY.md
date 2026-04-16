# Data Update Summary - April 16, 2026

## Overview
This experimental repository contains the Select T Product Acceleration Tracker with updated data from the latest "select data.csv" file.

## Repository Information
- **Original Repository**: https://github.com/Niako-8/select-t-tracker
- **Experimental Repository**: https://github.com/Niako-8/select-t-tracker-experimental
- **Last Updated**: April 16, 2026

## Key Changes from Original

### 1. Data Structure Changes
- **Removed**: "Valuable" (PMM Led) column - no longer in the new data
- **Added**: "Consumability Metrics Across Customer Journey" column (6th consumable column)
- **Updated**: All status data converted from emoji format (🟢🟡🔴) to text format (Green/Amber/Red)

### 2. Column Count Changes
- **Consumable columns**: 5 → 6 (added Consumability Metrics)
- **Total tenet columns**: 11 → 12
- **Table colspan**: Updated from 15 to 16

### 3. Portfolio Name
- Changed back from "e-Comm Only" to "e-Comm" to match source data

### 4. Data Updates
All product statuses have been updated with the latest information from April 16, 2026:

#### Data Portfolio (7 products)
- watsonx Orchestrate
- Bob (formerly Project Bob)
- watsonx.gov
- Guardium Data Security Center
- watsonx.data
- watsonx.data integration
- Planning Analytics

#### Automation Portfolio (10 products)
- Terraform
- Instana
- Concert
- Kubecost
- Cloudability
- webMethods Hybrid Integration
- Vault
- Verify
- NS1
- Maximo

#### e-Comm Portfolio (4 products)
- MaaS 360
- Aspera
- Cognos
- SPSS

### 5. Notable Data Changes
- **Bob**: Status updated, now shows as "Bob" instead of "Project Bob"
- **Planning Analytics**: Platform-Enabled status changed from Red to Green
- **Kubecost & Cloudability**: New triple asterisk (***) markers added for Consumability Metrics
- **Various products**: Updated target completion dates (e.g., Apr 29 instead of Apr-28)

## Technical Implementation

### Data Conversion
A Python script (`convert_data.py`) was created to convert emoji-based CSV data to text format:
- 🟢 → Green
- 🟡 → Amber
- 🔴 → Red
- Preserves special markers ($, *, **, ***)

### Code Updates
1. Updated `columnDefinitions` in App.jsx to include new Consumability Metrics column
2. Updated table header colspan values
3. Updated portfolio list
4. Updated last updated date to April 16, 2026

## How to Use This Repository

### Local Development
```bash
cd select-t-tracker-experimental
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```

### Update Data
1. Place new CSV file in the root directory as `../select data.csv`
2. Run the conversion script:
   ```bash
   python3 convert_data.py
   ```
3. Test the changes locally
4. Commit and push to GitHub

## Deployment
The repository includes GitHub Actions workflow for automatic deployment to GitHub Pages.
Once enabled, the site will be available at:
https://niako-8.github.io/select-t-tracker-experimental/

## Data Validation Checklist
- ✅ All emoji symbols converted to text
- ✅ Special markers ($, *, **, ***) preserved
- ✅ Column count matches data structure
- ✅ All products from source data included
- ✅ Portfolio groupings correct
- ✅ Team member names accurate
- ✅ Build completes successfully

## Next Steps
1. Review the experimental dashboard at the local dev server
2. Verify all data is displaying correctly
3. Check for any missing or incorrect information
4. Enable GitHub Pages if satisfied with results
5. Share the experimental URL for team review

## Notes
- Original dashboard remains untouched at https://github.com/Niako-8/select-t-tracker
- This experimental version can be safely tested without affecting production
- Data conversion script can be reused for future updates