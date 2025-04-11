import { useState } from 'react';

const ImageUploader = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);

            // Generate a preview
            const reader = new FileReader();
            reader.onload = () => setPreview(reader.result);
            reader.readAsDataURL(file);
            console.log(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedImage) return;

        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
            const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            console.log(result);
            
        } catch (error) {
            console.error('Error uploading image:', error);
            console.log('this is image:',formData)
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {preview && <img src={preview} alt="Preview" style={{ maxWidth: '300px', marginTop: '10px' }} />}
                <button type="submit">Upload</button>
            </form>
        </div>
    );
};

export default ImageUploader;
