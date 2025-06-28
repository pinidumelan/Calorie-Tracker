
import React, { useState, useCallback } from 'react';
import { NutritionInfo, NutritionError } from './types';
import { analyzeFoodImage } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import NutritionCard from './components/NutritionCard';
import Spinner from './components/Spinner';
import { LeafIcon } from './components/Icon';

const App: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [nutritionData, setNutritionData] = useState<NutritionInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleFileSelect = (file: File) => {
        setImageFile(file);
        setNutritionData(null);
        setError(null);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAnalyzeClick = useCallback(async () => {
        if (!imageFile || !imagePreview) {
            setError("Please select an image first.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setNutritionData(null);

        try {
            // "data:image/jpeg;base64,..." -> "..."
            const base64String = imagePreview.split(',')[1];
            if (!base64String) {
                throw new Error("Could not read image data.");
            }
            
            const result = await analyzeFoodImage(base64String, imageFile.type);

            if ('error' in result) {
                setError((result as NutritionError).error);
                setNutritionData(null);
            } else {
                setNutritionData(result as NutritionInfo);
                setError(null);
            }
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, imagePreview]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
            <header className="w-full max-w-4xl mx-auto text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <LeafIcon className="w-10 h-10 text-green-500" />
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-white tracking-tight">
                        NutriSnap
                    </h1>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Snap a photo of your meal and let AI do the counting!
                </p>
            </header>

            <main className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
                <ImageUploader onFileSelect={handleFileSelect} imagePreviewUrl={imagePreview} disabled={isLoading} />

                <button
                    onClick={handleAnalyzeClick}
                    disabled={!imageFile || isLoading}
                    className="w-full flex justify-center items-center gap-3 text-lg font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-slate-600 rounded-xl px-6 py-4 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
                >
                    {isLoading ? (
                        <>
                            <Spinner />
                            Analyzing...
                        </>
                    ) : (
                        "Analyze Meal"
                    )}
                </button>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-lg" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}
                
                {!isLoading && nutritionData && (
                    <div className="animate-fade-in">
                      <NutritionCard data={nutritionData} />
                    </div>
                )}
            </main>
            
            <footer className="w-full max-w-4xl mx-auto text-center mt-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">Powered by Gemini API</p>
            </footer>
        </div>
    );
};

export default App;

