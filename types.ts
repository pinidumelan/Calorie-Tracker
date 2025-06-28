export interface User {
  email: string;
}

export interface MacroNutrient {
  total: number;
  unit: string;
}

export interface Vitamin {
  name: string;
  amount: string;
}

export interface NutritionInfo {
  foodName: string;
  servingSize: string;
  calories: number;
  fat: MacroNutrient;
  carbohydrates: MacroNutrient;
  protein: MacroNutrient;
  vitamins: Vitamin[];
}

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface TrackedMeal extends NutritionInfo {
  id: string; // unique id for each entry
  date: string; // ISO date string YYYY-MM-DD
  mealType: MealType;
}
