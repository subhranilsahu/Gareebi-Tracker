import json

def add_income (amount, category, note, account): # this function will add the info from user.

    # Convert amount into a number
    try:
        amount = float(amount)
    except (ValueError, TypeError):
        return None, "Please enter a valid amount"
    
    # Check if amount is positive.
    if amount <= 0:
        return None, "Amount must be greater than 0"

    # Check if category is not provided
    if not category or not category.strip():
        return None , "Please select a category"

    # Check if account is valid
    allowed_accounts = ["Cash", "Online", "Savings"]

    if account not in allowed_accounts:
        return None, "Please select a valid account"

    # Check income record
    income = {
        "type" : "income",
        "amount" : amount,
        "category" : category,
        "note" : note.strip() if note else "",
        "account" : account
    }
    return income, None # record mil jayega 

def calculate_total_income(incomes):
    total = 0

    for income in incomes:
        total += income["amount"]

    return total

def save_income(income):

    try:
        # Open json file in read mode
        with open("data/transaction.json","r") as file:
            transactions = json.load(file) # read existing transactions from JSON file

            # Check whether the existing data is a list
            if not isinstance(transactions,list):
                return False, "Transaction data is invalid"


            # Add the new income record to the existing list
            transactions.append(income)

            # Open JSON file in write mode
            with open("data/transaction.json","w") as file:
            # Save all transactions back into JSON file
                json.dump(transactions, file, indent = 4)

            # Return success message
            return True, "Income saved successfully"

    # Error Handling

    except FileNotFoundError:
        return False, "Transaction file not found"

    except json.JSONDecodeError:
        return False, "Transaction file contains invalid data"

    except PermissionError:
        return False, "Unable to access transaction file"

    except OSError:
        return False, "Something went wrong while saving income"

income,error = add_income(5000,"Pocket Money","Monthly Allowance", "Cash")

if error:
    print(error)
else:
    success, message = save_income(income)

    print(message)