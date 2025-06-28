
import React from 'react';
import { NutritionInfo } from '../types';

interface NutritionCardProps {
  data: NutritionInfo;
}

const MacroBar: React.FC<{ label: string; value: number; total: number; color: string }> = ({ label, value, total, color }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-300">{label}</span>
                <span className="text-sm font-medium text-gray-400">{value.toFixed(1)}g</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2.5">
                <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};


const NutritionCard: React.FC<NutritionCardProps> = ({ data }) => {
  const { foodName, servingSize, calories, fat, carbohydrates, protein, vitamins } = data;
  const totalMacros = fat.total + carbohydrates.total + protein.total;

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700 animate-fade-in">
        <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-teal-300 capitalize">{foodName}</h2>
            <p className="text-gray-400">Serving Size: {servingSize}</p>
        </div>

        <div className="text-center my-6">
            <p className="text-5xl font-extrabold text-white">{calories}</p>
            <p className="text-gray-400 text-lg">Calories</p>
        </div>

        <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Macronutrients</h3>
            <MacroBar label="Protein" value={protein.total} total={totalMacros} color="bg-sky-400" />
            <MacroBar label="Carbohydrates" value={carbohydrates.total} total={totalMacros} color="bg-amber-400" />
            <MacroBar label="Fat" value={fat.total} total={totalMacros} color="bg-rose-400" />
        </div>

        {vitamins && vitamins.length > 0 && (
             <div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">Vitamins & Minerals</h3>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {vitamins.slice(0, 8).map((vitamin, index) => (
                        <li key={index} className="flex justify-between text-gray-400 border-b border-gray-700 py-1">
                            <span className="font-medium text-gray-300">{vitamin.name}</span>
                            <span>{vitamin.amount}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )}
        <style>
          {`
            @keyframes fade-in {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
              animation: fade-in 0.5s ease-out forwards;
            }
          `}
        </style>
    </div>
  );
};

export default NutritionCard;
