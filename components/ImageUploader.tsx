
import React, { useRef } from 'react';
import { UploadIcon } from './Icon';

interface ImageUploaderProps {
    onFileSelect: (file: File) => void;
    imagePreviewUrl: string | null;
    disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, imagePreviewUrl, disabled }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };

    const handleAreaClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className="w-full">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={disabled}
            />
            <div
                onClick={handleAreaClick}
                className={`relative w-full aspect-video rounded-xl border-2 border-dashed flex items-center justify-center text-center p-4 transition-all duration-300 ease-in-out
                ${disabled ? 'cursor-not-allowed bg-gray-100 dark:bg-slate-700' : 'cursor-pointer bg-gray-50 dark:bg-slate-700/50 border-gray-300 dark:border-slate-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-slate-700'}
                `}
            >
                {imagePreviewUrl ? (
                    <img src={imagePreviewUrl} alt="Food preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                        <UploadIcon className="w-10 h-10" />
                        <span className="font-semibold">Click to upload an image</span>
                        <span className="text-sm">or drag and drop</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUploader;
