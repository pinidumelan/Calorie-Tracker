import React, { useState } from 'react';
import { TrackedMeal, MealType } from '../types';

interface WeeklyTrackerProps {
    meals: TrackedMeal[];
    onDeleteMeal: (id: string) => void;
}

const MealTypePill: React.FC<{type: MealType}> = ({type}) => {
    const colors = {
        Breakfast: 'bg-amber-500/20 text-amber-300',
        Lunch: 'bg-sky-500/20 text-sky-300',
        Dinner: 'bg-indigo-500/20 text-indigo-300',
        Snack: 'bg-rose-500/20 text-rose-300',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[type]}`}>{type}</span>
}

const MealItem: React.FC<{ meal: TrackedMeal; onDelete: (id: string) => void }> = ({ meal, onDelete }) => (
    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors duration-200">
        <div className="flex items-center space-x-3">
            <MealTypePill type={meal.mealType} />
            <div>
                <p className="font-semibold text-white capitalize">{meal.foodName}</p>
                <p className="text-sm text-gray-400">{meal.servingSize}</p>
            </div>
        </div>
        <div className="flex items-center space-x-4">
            <p className="font-bold text-lg text-teal-300">{meal.calories}<span className="text-xs text-gray-400 ml-1">kcal</span></p>
            <button onClick={() => onDelete(meal.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
            </button>
        </div>
    </div>
);

const WeeklyTracker: React.FC<WeeklyTrackerProps> = ({ meals, onDeleteMeal }) => {
    const [activeDay, setActiveDay] = useState(new Date().toISOString().split('T')[0]);

    const dates = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    });

    const mealsByDate = meals.reduce((acc, meal) => {
        (acc[meal.date] = acc[meal.date] || []).push(meal);
        return acc;
    }, {} as Record<string, TrackedMeal[]>);

    const activeDayMeals = mealsByDate[activeDay] || [];
    const mealOrder: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    const sortedMeals = [...activeDayMeals].sort((a,b) => mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType));
    const totalCalories = activeDayMeals.reduce((sum, meal) => sum + meal.calories, 0);

    const getDayLabel = (dateStr: string) => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (dateStr === today) return 'Today';
        if (dateStr === yesterday) return 'Yesterday';
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    }

    return (
        <div className="mt-10">
            <h2 className="text-2xl font-bold text-white mb-4">Weekly Log</h2>
            <div className="bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6">
                <div className="border-b border-gray-700 mb-4">
                    <nav className="-mb-px flex space-x-1 sm:space-x-4 overflow-x-auto pb-2" aria-label="Tabs">
                        {dates.map(date => (
                            <button
                                key={date}
                                onClick={() => setActiveDay(date)}
                                className={`${
                                    activeDay === date
                                        ? 'border-teal-400 text-teal-300'
                                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                } whitespace-nowrap py-3 px-2 sm:px-4 border-b-2 font-medium text-sm sm:text-base transition-colors`}
                            >
                                {getDayLabel(date)}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="space-y-4 min-h-[200px]">
                    <div className="flex justify-between items-baseline">
                        <h3 className="text-xl font-semibold text-white">
                            Total: <span className="text-teal-300">{totalCalories.toLocaleString()}</span> kcal
                        </h3>
                    </div>
                    {sortedMeals.length > 0 ? (
                        <div className="space-y-3">
                            {sortedMeals.map(meal => <MealItem key={meal.id} meal={meal} onDelete={onDeleteMeal} />)}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <p>No meals logged for this day.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WeeklyTracker;
