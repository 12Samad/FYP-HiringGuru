"use client";
import * as tf from '@tensorflow/tfjs';
import { useEffect, useState, useRef } from 'react';

interface PostureDetectionProps {
  onPostureCheckComplete?: () => void;
}

const PostureDetection: React.FC<PostureDetectionProps> = ({ onPostureCheckComplete }) => {
    const [model, setModel] = useState<tf.LayersModel | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const loadModel = async () => {
            try {
                const loadedModel = await tf.loadLayersModel('/models/model.json');
                setModel(loadedModel);
                console.log("Posture Detection Model Loaded");
            } catch (error) {
                console.error("Error loading posture model:", error);
            }
        };

        loadModel();
    }, []);

    useEffect(() => {
        if (model) {
            startWebcam();
        }
    }, [model]);

    const startWebcam = async () => {
        if (videoRef.current && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;
            } catch (err) {
                console.error("Error accessing webcam:", err);
            }
        }
    };

    const checkPosture = async () => {
        if (!model || !videoRef.current) return;

        const video = videoRef.current;
        const tensor = tf.browser.fromPixels(video)
            .resizeNearestNeighbor([224, 224])
            .expandDims()
            .toFloat()
            .div(255);

        const prediction = await model.predict(tensor);
        const predictionData = Array.isArray(prediction) ? await prediction[0].data() : await prediction.data();
        const posture = predictionData[0] > 0.5 ? "Good Posture" : "Bad Posture";

        console.log(posture);
        
        // Call the callback if provided
        if (onPostureCheckComplete) {
            onPostureCheckComplete();
        }
    };

    return (
        <div>
            <video ref={videoRef} autoPlay playsInline width="640" height="480" />
            <button onClick={checkPosture}>Check Posture</button>
        </div>
    );
};

export default PostureDetection;