export const categories = ['Salary', 'Freelance', 'Investments', 'Gifts', 'Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Other'];

export const budgetCategories = categories.filter(
  (category) => category !== 'Salary' && category !== 'Investments' && category !== 'Freelance'
);
