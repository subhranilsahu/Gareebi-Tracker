# Gareebi-Tracker
A personal finance tracker to keep track of income, expenses, and savings all in one place. Know where your money comes from, where it goes, and how much is left before the month ends.



PROJECT-STRUCTURE

gareebi-tracker/
│
├── src/                        # 🔒 [OWNER: Subhranil | Backend Only] — Abhigyan: Read-only (do not edit)
│   ├── main.py                 # [Subhranil] Flask app runner & API route definitions
│   ├── tracker.py              # [Subhranil] Core balance & transaction manager
│   ├── income.py               # [Subhranil] Income dictionary & total calculation logic
│   ├── expenses.py             # [Subhranil] Expense dictionary & total calculation logic
│   └── reports.py              # [Subhranil] Monthly summaries & spending analytics
│
├── templates/                  # 🔒 [OWNER: Abhigyan | Frontend Only] — Subhranil: Read-only (except Jinja/Flask routing if agreed)
│   ├── index.html              # [Abhigyan] Main dashboard UI & summary cards
│   ├── transactions.html       # [Abhigyan] Income/expense forms & transaction table
│   └── accounts.html           # [Abhigyan] Bank & wallet account management view
│
├── static/                     # 🔒 [OWNER: Abhigyan | Frontend Only] — Subhranil: Do not edit
│   ├── css/
│   │   └── style.css           # [Abhigyan] Dark theme, Flexbox/Grid layout, & styling
│   ├── js/
│   │   └── app.js              # [Abhigyan] Frontend interactivity & fetch() API calls
│   └── assets/
│       └── .gitkeep            # [Abhigyan] Icons, images, and static visual assets
│
├── data/                       # 🤝 [OWNER: Subhranil | Shared Read]
│   └── transactions.json       # [Subhranil: Read/Write via Python | Abhigyan: Inspect structure only]
│
├── tests/                      # 🔒 [OWNER: Subhranil | Backend QA]
│   └── test_tracker.py         # [Subhranil] Unit tests for Python functions
│
├── important.txt               # 🤝 [SHARED: Both] Team rules, API contracts, & notes (Coordinate before editing)
├── README.md                   # 🤝 [SHARED: Both] Project documentation (Coordinate before editing)
├── .gitignore                  # 🤝 [SHARED: Both] Ignored files (__pycache__, .venv, .DS_Store)
└── requirements.txt            # 🔒 [OWNER: Subhranil] Python dependencies (Flask, pytest, etc.)