import schedule
import time
import os
import sys
from pathlib import Path

def run_scraper():
    """Run the scraper with predefined parameters"""
    # Get the absolute path to the scraper directory
    scraper_dir = Path(__file__).parent.absolute()
    
    # Change to the scraper directory to ensure correct path resolution
    os.chdir(scraper_dir)
    
    # Construct the command with all parameters
    cmd = f"{sys.executable} scraper.py --symbol WADU_USDT --type all --output-dir {scraper_dir}/output"
    
    # Execute the command
    os.system(cmd)
    print(f"Scraper run completed at {time.strftime('%Y-%m-%d %H:%M:%S')}")

def main():
    # Schedule the job to run every hour
    schedule.every(1).hours.do(run_scraper)
    
    # Run immediately on start
    run_scraper()
    
    # Keep the script running
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

if __name__ == "__main__":
    main()
