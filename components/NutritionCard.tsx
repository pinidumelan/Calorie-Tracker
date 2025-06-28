
import React from 'react';
import { NutritionInfo } from '../types';
import { FlameIcon, ProteinIcon, CarbIcon, FatIcon } from './Icon';

interface NutritionCardProps {
    data: NutritionInfo;
}

const NutritionItem: React.FC<{ icon: React.ReactNode; label: string; value: string; className?: string; }> = ({ icon, label, value, className }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg ${className}`}>
        <div className="flex items-center gap-3">
            {icon}
            <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        <span className="font-bold text-gray-900 dark:text-white">{value}</span>
    </div>
);

const NutritionCard: React.FC<NutritionCardProps> = ({ data }) => {
    return (
        <div className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-5 space-y-4">
            <header className="text-center">
                <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">{data.foodName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{data.servingSize}</p>
            </header>
            
            <div className="flex items-center justify-center gap-4 bg-green-50 dark:bg-green-900/30 p-4 rounded-xl">
                <FlameIcon className="w-8 h-8 text-green-500" />
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Calories</p>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{Math.round(data.calories)}</p>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 border-b border-gray-200 dark:border-slate-700 pb-1">Macro Breakdown</h3>
                <NutritionItem
                    icon={<ProteinIcon className="w-6 h-6 text-blue-500"/>}
                    label="Protein"
                    value={`${data.protein.toFixed(1)} g`}
                    className="bg-blue-50 dark:bg-blue-900/30"
                />
                <NutritionItem
                    icon={<CarbIcon className="w-6 h-6 text-orange-500"/>}
                    label="Carbohydrates"
                    value={`${data.carbohydrates.total.toFixed(1)} g`}
                    className="bg-orange-50 dark:bg-orange-900/30"
                />
                 <div className="pl-12 text-sm text-gray-500 dark:text-gray-400">
                    <div>Sugar: {data.carbohydrates.sugar.toFixed(1)} g</div>
                    <div>Fiber: {data.carbohydrates.fiber.toFixed(1)} g</div>
                </div>
                <NutritionItem
                    icon={<FatIcon className="w-6 h-6 text-yellow-500"/>}
                    label="Fat"
                    value={`${data.fat.total.toFixed(1)} g`}
                    className="bg-yellow-50 dark:bg-yellow-900/30"
                />
                <div className="pl-12 text-sm text-gray-500 dark:text-gray-400">
                    <div>Saturated: {data.fat.saturated.toFixed(1)} g</div>
                </div>
            </div>
        </div>
    );
};

export default NutritionCard;
