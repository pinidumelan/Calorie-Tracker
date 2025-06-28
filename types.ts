
export interface NutritionInfo {
  foodName: string;
  calories: number;
  protein: number;
  carbohydrates: {
    total: number;
    sugar: number;
    fiber: number;
  };
  fat: {
    total: number;
    saturated: number;
  };
  servingSize: string;
}

export interface NutritionError {
  error: string;
}
