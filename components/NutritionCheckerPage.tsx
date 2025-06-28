import React, { useState, useCallback, useRef, useEffect } from 'react';
import { User, NutritionInfo, TrackedMeal, MealType } from '../types';
import { getNutritionInfoFromImage } from '../services/geminiService';
import NutritionCard from './NutritionCard';
import Spinner from './Spinner';
import WeeklyTracker from './WeeklyTracker';

interface NutritionCheckerPageProps {
  user: User;
  onLogout: () => void;
}

const NutritionCheckerPage: React.FC<NutritionCheckerPageProps> = ({ user, onLogout }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [trackedMeals, setTrackedMeals] = useState<TrackedMeal[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('Breakfast');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const storedMeals = localStorage.getItem('nutrivision_meals');
      if (storedMeals) {
        setTrackedMeals(JSON.parse(storedMeals));
      }
    } catch (e) {
      console.error("Failed to parse tracked meals from localStorage", e);
      setTrackedMeals([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nutrivision_meals', JSON.stringify(trackedMeals));
  }, [trackedMeals]);

  const resetState = () => {
    setImagePreview(null);
    setFile(null);
    setNutritionData(null);
    setError(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if(selectedFile.size > 4 * 1024 * 1024) {
          setError("File size cannot exceed 4MB.");
          return;
      }
      resetState();
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
  });

  const handleAnalyzeClick = useCallback(async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setNutritionData(null);

    try {
      const base64Image = await toBase64(file);
      const data = await getNutritionInfoFromImage(base64Image, file.type);
      setNutritionData(data);
    } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError("An unknown error occurred.");
        }
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  const startCamera = async () => {
    resetState();
    setIsCameraOpen(true);

    const constraints = {
      video: { facingMode: 'environment' }
    };

    try {
      // First attempt: try to get the rear camera
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      // If the rear camera is not found, try any camera
      if (err instanceof DOMException && err.name === "NotFoundError") {
        console.warn("Environment camera not found, trying default camera.");
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (fallbackErr) {
          console.error("Error accessing any camera:", fallbackErr);
          setError("Could not access camera. Please ensure permissions are granted and a camera is available.");
          setIsCameraOpen(false);
        }
      } else {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please ensure permissions are granted.");
        setIsCameraOpen(false);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };
  
  const dataURLtoFile = (dataurl: string, filename: string): File => {
      const arr = dataurl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) throw new Error('Invalid data URL');
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--) u8arr[n] = bstr.charCodeAt(n);
      return new File([u8arr], filename, {type:mime});
  }

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    if (videoRef.current) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if(ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setImagePreview(dataUrl);
            const capturedFile = dataURLtoFile(dataUrl, `capture-${Date.now()}.jpg`);
            setFile(capturedFile);
        }
    }
    stopCamera();
  };

  const handleLogMeal = () => {
    if (!nutritionData) return;
    const newMeal: TrackedMeal = {
      ...nutritionData,
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      mealType: selectedMealType,
    };
    setTrackedMeals(prevMeals => [newMeal, ...prevMeals]);
    resetState();
  };

  const handleDeleteMeal = (mealId: string) => {
    setTrackedMeals(prevMeals => prevMeals.filter(meal => meal.id !== mealId));
  };


  return (
    <>
      <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-teal-400">NutriVision AI</h1>
          <div className="flex items-center space-x-4">
              <span className="text-gray-300 hidden sm:block">Welcome, {user.email}</span>
              <button onClick={onLogout} className="font-semibold text-gray-900 bg-gray-400 hover:bg-gray-300 rounded-md py-2 px-4 transition-colors duration-300">
                  Logout
              </button>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-full h-64 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-gray-700/50 overflow-hidden">
                          {imagePreview ? (
                              <img src={imagePreview} alt="Food preview" className="h-full w-full object-cover" />
                          ) : (
                              <div className="text-center text-gray-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  <p className="mt-2">Image Preview</p>
                              </div>
                          )}
                      </div>
                       <div className="flex w-full space-x-2">
                          <label htmlFor="file-upload" className="flex-1 cursor-pointer text-center bg-teal-500 hover:bg-teal-400 text-gray-900 font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                              Upload Image
                          </label>
                          <input id="file-upload" ref={fileInputRef} name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                          <button onClick={startCamera} className="flex-1 text-center bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                            Take Photo
                          </button>
                      </div>
                      {imagePreview && (
                        <div className="flex w-full space-x-2">
                            <button 
                                onClick={handleAnalyzeClick} 
                                disabled={!file || isLoading} 
                                className="flex-grow w-full py-3 text-lg font-bold rounded-lg text-gray-900 bg-teal-400 hover:bg-teal-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-400 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
                            >
                                {isLoading ? 'Analyzing...' : 'Analyze Nutrition'}
                            </button>
                             <button onClick={resetState} className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                                Clear
                            </button>
                        </div>
                      )}
                  </div>

                  <div className="flex flex-col justify-center">
                      {isLoading && <Spinner />}
                      {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg text-center">{error}</div>}
                      {nutritionData && !isLoading && (
                        <div className="animate-fade-in">
                          <NutritionCard data={nutritionData} />
                          <div className="mt-4 flex items-center space-x-4 bg-gray-700/50 p-3 rounded-lg">
                             <select 
                                value={selectedMealType}
                                onChange={(e) => setSelectedMealType(e.target.value as MealType)}
                                className="w-full bg-gray-600 border border-gray-500 text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                              >
                                <option>Breakfast</option>
                                <option>Lunch</option>
                                <option>Dinner</option>
                                <option>Snack</option>
                              </select>
                            <button 
                              onClick={handleLogMeal}
                              className="w-full font-semibold py-2 px-4 rounded-lg text-gray-900 bg-teal-400 hover:bg-teal-300 transition-colors"
                            >
                              Add to Log
                            </button>
                          </div>
                        </div>
                      )}
                      {!isLoading && !error && !nutritionData && (
                          <div className="text-center text-gray-400 p-8 border-2 border-dashed border-gray-700 rounded-lg h-full flex flex-col justify-center">
                              <h3 className="text-xl font-semibold mb-2">Awaiting Analysis</h3>
                              <p>Upload or take a photo of your meal to see the results here.</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
          <WeeklyTracker meals={trackedMeals} onDeleteMeal={handleDeleteMeal} />
        </main>
      </div>
      {isCameraOpen && (
         <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-2xl h-auto rounded-lg"></video>
            <div className="flex space-x-4 mt-4">
                <button onClick={capturePhoto} className="px-6 py-3 bg-teal-500 text-gray-900 font-bold rounded-full text-lg">Capture</button>
                <button onClick={stopCamera} className="px-6 py-3 bg-gray-600 text-white font-bold rounded-full text-lg">Cancel</button>
            </div>
        </div>
      )}
    </>
  );
};

export default NutritionCheckerPage;