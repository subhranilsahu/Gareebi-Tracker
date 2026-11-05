def add_income (amount, category, note, account): # this function will add the info from user.
    income = {
        "type" : "income",
        "amount" : amount,
        "category" : category,
        "note" : note,
        "account" : account
    }
    return income # record mil jayega 

result = add_income(5000,"Pocket Money", "Monthly Allowance","Online")

print(result)

def calculate_total_income(incomes):
    total = 0

    for income in incomes:
        total += income["amount"]

    return total