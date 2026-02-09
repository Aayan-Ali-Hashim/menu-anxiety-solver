import React from 'react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  imagePreview: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, imagePreview }) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className="upload-section">
      <input 
        type="file" 
        accept="image/*"
        onChange={handleImageChange}
        id="file-upload"
      />
      <label htmlFor="file-upload" className="upload-label">
        {imagePreview ? '✓ Menu uploaded - Click to change' : '📸 Upload Menu Photo'}
      </label>
      
      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="Menu preview" />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;