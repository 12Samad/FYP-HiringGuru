import os
import numpy as np
import cv2
import tensorflow as tf

# Define dataset paths
dataset_path = "/Users/ayans./Desktop/DatasetForProcessing"
folders = {
    "good": [os.path.join(dataset_path, "Original-good"), os.path.join(dataset_path, "augmented-good")],
    "bad": [os.path.join(dataset_path, "Original-bad"), os.path.join(dataset_path, "augmented-bad")]
}

# MobileNetV2 input size
IMG_SIZE = (224, 224)

# Function to load and preprocess images from multiple folders
def load_and_preprocess_images(folder_paths, label):
    images = []
    labels = []
    
    for folder_path in folder_paths:
        for img_name in os.listdir(folder_path):
            img_path = os.path.join(folder_path, img_name)
            img = cv2.imread(img_path)
            
            if img is None:
                continue  # Skip unreadable images
            
            img = cv2.resize(img, IMG_SIZE)  # Resize to 224x224
            img = img / 255.0  # Normalize to [0,1]
            
            images.append(img)
            labels.append(label)
    
    return np.array(images, dtype=np.float32), np.array(labels, dtype=np.int32)

# Load "good" (original + augmented) and "bad" (original + augmented) images
good_images, good_labels = load_and_preprocess_images(folders["good"], label=0)
bad_images, bad_labels = load_and_preprocess_images(folders["bad"], label=1)

# Combine datasets
X = np.concatenate([good_images, bad_images], axis=0)
y = np.concatenate([good_labels, bad_labels], axis=0)

# Shuffle dataset
indices = np.arange(X.shape[0])
np.random.shuffle(indices)

X = X[indices]
y = y[indices]

# Save preprocessed dataset
np.save("X.npy", X)
np.save("y.npy", y)

print(f"Preprocessing complete! Dataset saved with {X.shape[0]} images.")
