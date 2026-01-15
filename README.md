# Done by Liyang Chen and Junyu Wang.

# Dataviz With GPT

## Learning Objectives

Students will be able to:

- Use ChatGPT to build something in a programming language they're not familiar with (D3) #learning-how-to-learn

## Pre-requisites

This lesson assumes you are familiar with:

- Basic HTML, CSS and JavaScript
- Using GitHub

## Instructions

<!-- We demo some exploratory data analysis with ChatGPT and R -->

<!-- backup in python notebook just in case -->

https://data.boston.gov/dataset/311-service-requests

### Part 1: Setup

1. Install wget

   If on Mac:

   ```sh
   brew install wget
   ```

   If on Windowds/WSL

   ```sh
   sudo apt-get install wget
   ```
2. Create and activate a virtual environment for this project. This creates folder called `venv/` in your repo that will story python packages for this project.

   ```
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the requirements for the python script you'll run below

   ```
   pip install pandas
   ```

### Part 2: Download the data

1. Download data of all 311 calls in Boston from 2025

   ```
   wget -O boston_311_2025_raw.csv https://data.boston.gov/dataset/8048697b-ad64-4bfc-b090-ee00169f2323/resource/9d7c2214-4709-478a-a2e8-fb2020a5bb94/download/tmp8_noelom.csv
   ```
2. Run `pivot.py` to make a new file that has the reasons for 311 calls and their counts

   ```
   python3 pivot.py 
   ```

   This will output a file called `boston_311_2025_by_reason.csv`

### Part 3: Build a D3 visualization with ChatGPT

Use your knowledge of the vocabulary of HTML, CSS and JS to prompt ChatGPT. Your goal is to, with it's help, make a D3 visualization of all of the 311 calls in Boston from 2023.

1. Make a bar chart of the top 10 reasons for 311 calls in the past year (hint: use the `reason` column in the data)
2. The initial bar chart may not look quite right. With the help of ChatGPT, fix anything that looks immediately off (for example, sometimes the axis labels overlap or the bars are out of order etc...)
3. Give the bar chart a good headline and subheadline
4. Make the bar chart horizontal instead of vertical
5. Change the default colors, text size, or anything else
6. Add a citation for where the data comes from and give yourslves a chart authorship credit in the footnotes
7. Create a button that shows an extended bar chart with all of the remaining counts of the `reason` column.

### Part 4: Reflect

1. Make a new file called `dashboard.html`
2. Ask the llm to load `311_boston_data.csv` data directly and make a bar chart of the number of complaints over time within the year.
3. Ask the llm to make a dropbox box that lets you filter by complaint type.
4. Add more interactive elements of your choice (ex: hover effects, filter by other columns, etc. )

What worked? What didn't? Review your classmates' conversations with ChatGPT in Slack. Fill out an AI reflection form about your experience today.
