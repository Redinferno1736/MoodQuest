import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, transforms
from timm import create_model
import os
import time
from datetime import datetime, timedelta
import random


def main():
    DATA_DIR = 'C:/VS CODE/MoodQuest/fer2013/data'
    BATCH_SIZE = 24
    IMG_SIZE = 224
    NUM_CLASSES = 7
    EPOCHS = 10
    LEARNING_RATE = 0.001
    SUBSET_FRACTION = 0.70
    DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

    print(f"Starting training at {datetime.now().strftime('%I:%M:%S %p')}")
    print(f"Using device: {DEVICE}")
    print(f"Using {int(SUBSET_FRACTION*100)}% of training data")

    train_transforms = transforms.Compose([
        transforms.Grayscale(num_output_channels=3),
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    val_transforms = transforms.Compose([
        transforms.Grayscale(num_output_channels=3),
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    print("Loading datasets...")
    full_train_dataset = datasets.ImageFolder(os.path.join(DATA_DIR, 'train'), transform=train_transforms)
    val_dataset = datasets.ImageFolder(os.path.join(DATA_DIR, 'val'), transform=val_transforms)

    num_train = len(full_train_dataset)
    subset_size = int(num_train * SUBSET_FRACTION)
    indices = random.sample(range(num_train), subset_size)
    train_dataset = Subset(full_train_dataset, indices)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    print(f"Train samples: {len(train_dataset)} (from {num_train} total)")
    print(f"Val samples: {len(val_dataset)}")

    print("Loading model...")
    model = create_model('efficientnet_b0', pretrained=True, num_classes=NUM_CLASSES)
    model = model.to(DEVICE)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)

    def train_epoch(model, loader, criterion, optimizer, device, epoch, total_epochs):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        epoch_start_time = time.time()

        for batch_idx, (images, labels) in enumerate(loader):
            batch_start_time = time.time()
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

            if batch_idx % 50 == 0:
                elapsed = time.time() - epoch_start_time
                batches_done = batch_idx + 1
                batches_remaining = len(loader) - batches_done

                if batches_done > 0:
                    avg_time_per_batch = elapsed / batches_done
                    eta_seconds = avg_time_per_batch * batches_remaining
                    eta = str(timedelta(seconds=int(eta_seconds)))

                    progress = (batches_done / len(loader)) * 100
                    print(f"  Batch {batch_idx}/{len(loader)} ({progress:.1f}%) | "
                          f"Loss: {loss.item():.4f} | "
                          f"Acc: {100.*correct/total:.2f}% | "
                          f"ETA: {eta}")

        epoch_time = time.time() - epoch_start_time
        return running_loss / len(loader), 100. * correct / total, epoch_time

    def validate(model, loader, criterion, device):
        model.eval()
        running_loss = 0.0
        correct = 0
        total = 0

        val_start_time = time.time()

        with torch.no_grad():
            for images, labels in loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                running_loss += loss.item()
                _, predicted = outputs.max(1)
                total += labels.size(0)
                correct += predicted.eq(labels).sum().item()

        val_time = time.time() - val_start_time
        return running_loss / len(loader), 100. * correct / total, val_time

    print("\n" + "="*70)
    print("STARTING TRAINING")
    print(f"    Training for {EPOCHS} epochs on {int(SUBSET_FRACTION*100)}% of data")
    print("="*70 + "\n")

    best_val_acc = 0.0
    total_train_time = 0
    training_start = time.time()

    for epoch in range(EPOCHS):
        print(f"\n{'='*70}")
        print(f"EPOCH {epoch+1}/{EPOCHS}")
        print(f"{'='*70}")

        train_loss, train_acc, train_time = train_epoch(
            model, train_loader, criterion, optimizer, DEVICE, epoch+1, EPOCHS
        )

        print(f"\n  Running validation...")
        val_loss, val_acc, val_time = validate(model, val_loader, criterion, DEVICE)

        scheduler.step()
        total_train_time += train_time + val_time

        avg_epoch_time = total_train_time / (epoch + 1)
        remaining_epochs = EPOCHS - (epoch + 1)
        eta_total = avg_epoch_time * remaining_epochs
        eta_str = str(timedelta(seconds=int(eta_total)))
        completion_time = datetime.now() + timedelta(seconds=eta_total)

        print(f"\n  EPOCH {epoch+1} SUMMARY:")
        print(f"     Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}%")
        print(f"     Val Loss:   {val_loss:.4f} | Val Acc:   {val_acc:.2f}%")
        print(f"     Epoch Time: {train_time + val_time:.1f}s (Train: {train_time:.1f}s, Val: {val_time:.1f}s)")
        print(f"     Estimated remaining: {eta_str}")
        print(f"     Expected completion: {completion_time.strftime('%I:%M:%S %p')}")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), 'best_fer2013_model_70.pth')
            print(f"\n     NEW BEST MODEL SAVED! Val Acc: {val_acc:.2f}%")

    total_time_str = str(timedelta(seconds=int(total_train_time)))

    print("\n" + "="*70)
    print("TRAINING COMPLETE!")
    print("="*70)
    print(f"Best Validation Accuracy: {best_val_acc:.2f}%")
    print(f"Total Training Time: {total_time_str}")
    print(f"Model saved as: best_fer2013_model.pth")
    print(f"Completed at: {datetime.now().strftime('%I:%M:%S %p')}")
    print("="*70 + "\n")

    emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
    print("Emotion Labels (0-6):")
    for idx, label in enumerate(emotion_labels):
        print(f"   {idx}: {label}")


if __name__ == '__main__':
    import multiprocessing
    multiprocessing.freeze_support()
    main()
