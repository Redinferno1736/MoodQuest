# Model Fine-Tuning Documentation

## Overview
This document details the fine-tuning process of the EfficientNet-B0 model for facial expression recognition, used in MoodQuest for real-time mood and stress detection.

The model was fine-tuned on the FER2013 dataset to classify facial expressions into seven classes: Angry, Disgust, Fear, Happy, Sad, Surprise, and Neutral.

## Dataset and Preprocessing
- Dataset: FER2013 dataset stored locally.
- Images are grayscale, resized to 224x224 pixels.
- Converted grayscale images to 3-channel for compatibility with pretrained EfficientNet.
- Data augmentation for training includes random horizontal flip, rotation (+/-10 degrees), brightness and contrast jitter.
- Normalization using ImageNet mean and standard deviation.
- Training subset: Approximately 70% of training data used for faster experiments.

## Training Setup
- Hardware: GPU-enabled training with CUDA if available; fallback to CPU.
- Framework: PyTorch with timm library for EfficientNet.
- Batch size: 24 (adjustable based on available VRAM).
- Epochs: 10 (configurable).
- Learning rate: 0.001.
- Optimizer: Adam.
- Loss function: CrossEntropyLoss.
- Learning rate scheduler: CosineAnnealingLR.

## Training Process
- Training and validation datasets are loaded using PyTorch DataLoader.
- Training loop tracks batch-level loss, accuracy, and estimates time-to-completion.
- Validation performed after each epoch, reporting loss and accuracy.
- Best-performing model on validation set saved as `best_fer2013_model_70.pth`.

## Results
- Achieved best validation accuracy during training sessions.
- Model saved for use in real-time inference within MoodQuest backend.

## Usage
Load the saved model in the backend using PyTorch’s `load_state_dict`:

```

model.load_state_dict(torch.load('best_fer2013_model_70.pth'))
model.eval()

```

Use the model to predict emotions on webcam frames as implemented in MoodQuest.

---

This documentation provides a clear overview of the fine-tuning procedure used to train the facial expression recognition model for the project.



