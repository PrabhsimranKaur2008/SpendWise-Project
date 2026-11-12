#include <stdio.h>

int main()
{
    float budget, expense, balance;

    printf("===== SpendWise =====\n");

    printf("Enter monthly budget: ");
    scanf("%f", &budget);

    printf("Enter total expenses: ");
    scanf("%f", &expense);

    balance = budget - expense;

    printf("\nBudget: %.2f", budget);
    printf("\nExpenses: %.2f", expense);
    printf("\nRemaining Balance: %.2f\n", balance);

    if (balance >= 0)
        printf("You are within your budget.");
    else
        printf("You exceeded your budget.");

    return 0;
}
