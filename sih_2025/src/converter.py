#!/usr/bin/env python3
"""
SIH 2025 PDF to JSON Converter
Converts PDF files containing team results to structured JSON format
Usage: python converter.py <pdf_file_path>
"""

import pdfplumber
import json
import sys
import os
from pathlib import Path

def extract_pdf_to_json(pdf_path, output_path=None):
    """
    Extract PDF content and convert to structured JSON
    
    Args:
        pdf_path (str): Path to the PDF file
        output_path (str): Optional output JSON file path
    
    Returns:
        dict: Structured data from PDF
    """
    
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    # Create structured data container
    structured_data = {
        "source_file": os.path.basename(pdf_path),
        "pages": [],
        "extraction_timestamp": None
    }
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            print(f"📄 Processing PDF: {pdf_path}")
            print(f"📊 Total pages: {len(pdf.pages)}")
            
            for i, page in enumerate(pdf.pages, start=1):
                print(f"⚙️  Processing page {i}...")
                
                page_data = {
                    "page_number": i,
                    "text": page.extract_text() or "",
                    "tables": page.extract_tables() or []
                }
                structured_data["pages"].append(page_data)
            
            # Add timestamp
            from datetime import datetime
            structured_data["extraction_timestamp"] = datetime.now().isoformat()
            
    except Exception as e:
        raise Exception(f"Error processing PDF: {str(e)}")
    
    # Determine output file path
    if output_path is None:
        pdf_name = Path(pdf_path).stem
        output_path = f"{pdf_name}_structured.json"
    
    # Save to JSON file
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(structured_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Structured JSON saved as: {output_path}")
        print(f"📁 File size: {os.path.getsize(output_path)} bytes")
        
    except Exception as e:
        raise Exception(f"Error saving JSON: {str(e)}")
    
    return structured_data

def filter_bca_mca_teams(json_data):
    """
    Filter and extract BCA/MCA teams from the structured data
    
    Args:
        json_data (dict): Structured JSON data
    
    Returns:
        list: Filtered team data for BCA/MCA teams
    """
    
    teams = []
    
    for page in json_data.get("pages", []):
        for table in page.get("tables", []):
            for row in table:
                if len(row) >= 6:  # Ensure we have enough columns
                    team_number = row[0]
                    category = row[1] if len(row) > 1 else ""
                    team_name = row[2] if len(row) > 2 else ""
                    leader_name = row[3] if len(row) > 3 else ""
                    mobile = row[4] if len(row) > 4 else ""
                    branch = row[5] if len(row) > 5 else ""
                    
                    # Filter for BCA/MCA teams starting from team 43
                    if (team_number and str(team_number).isdigit() and 
                        int(team_number) >= 43 and 
                        branch and 
                        any(keyword in branch.upper() for keyword in ['BCA', 'MCA'])):
                        
                        teams.append({
                            "teamNumber": int(team_number),
                            "category": category,
                            "teamName": team_name,
                            "leaderName": leader_name,
                            "mobile": mobile,
                            "branch": branch.strip(),
                            "status": "Selected",  # Since they're in results
                            "round": "PPT Round"
                        })
    
    return teams

def main():
    """
    Main function to run the converter
    """
    
    if len(sys.argv) < 2:
        print("Usage: python converter.py <pdf_file_path> [output_json_path]")
        print("Example: python converter.py results.pdf")
        return
    
    pdf_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        # Extract PDF to JSON
        json_data = extract_pdf_to_json(pdf_path, output_path)
        
        # Filter BCA/MCA teams
        bca_mca_teams = filter_bca_mca_teams(json_data)
        
        if bca_mca_teams:
            print(f"\n🎯 Found {len(bca_mca_teams)} BCA/MCA teams:")
            for team in bca_mca_teams:
                print(f"  Team {team['teamNumber']}: {team['teamName']} ({team['branch']})")
            
            # Save filtered teams
            filtered_output = output_path.replace('.json', '_bca_mca_teams.json') if output_path else 'bca_mca_teams.json'
            with open(filtered_output, 'w', encoding='utf-8') as f:
                json.dump(bca_mca_teams, f, indent=2, ensure_ascii=False)
            print(f"\n📋 BCA/MCA teams saved to: {filtered_output}")
        else:
            print("\n⚠️  No BCA/MCA teams found in the data")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
