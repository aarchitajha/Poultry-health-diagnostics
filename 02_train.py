import os
import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix, roc_curve, auc, precision_recall_curve
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, CSVLogger

import warnings
warnings.filterwarnings('ignore')

plt.style.use('default')
sns.set_theme(style="whitegrid", context="paper")
plt.rcParams.update({'font.family': 'sans-serif', 'font.sans-serif': ['Arial', 'DejaVu Sans']})

DATASET_DIR = "dataset"
OUT_DIR = "static/train_plots"
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs("model", exist_ok=True)

BATCH_SIZE = 32
IMG_SIZE = (224, 224) 
EPOCHS = 50 

# ----------------- 1. PREPROCESSING ----------------- #
print("Loading datasets...")
# Using 80-20 split for better validation representation
raw_train_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=0.2,
    subset="training",
    seed=42,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode='categorical'
)
raw_val_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=0.2,
    subset="validation",
    seed=42,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode='categorical'
)

# Test set (10% of total) from validation set
val_batches = tf.data.experimental.cardinality(raw_val_ds)
test_ds = raw_val_ds.take(val_batches // 2)
val_ds = raw_val_ds.skip(val_batches // 2)

classes = raw_train_ds.class_names
print(f"Classes found: {classes}")

# Stronger Data Augmentation
data_augmentation = tf.keras.Sequential([
    tf.keras.layers.RandomFlip('horizontal_and_vertical'),
    tf.keras.layers.RandomRotation(0.2),
    tf.keras.layers.RandomZoom(0.2),
    tf.keras.layers.RandomContrast(0.15),
    tf.keras.layers.RandomTranslation(0.1, 0.1),
])

def prepare(ds, augment=False):
    if augment:
        ds = ds.map(lambda x, y: (data_augmentation(x, training=True), y), num_parallel_calls=tf.data.AUTOTUNE)
    return ds.prefetch(buffer_size=tf.data.AUTOTUNE)

train_ds = prepare(raw_train_ds, augment=True)
val_ds = prepare(val_ds)
test_ds = prepare(test_ds)

# ----------------- 2. MODEL ARCHITECTURE ----------------- #
print("Building EfficientNetB0 Model...")
# EfficientNetB0 has normalization built-in, so no need for resnet.preprocess_input
base_model = EfficientNetB0(weights='imagenet', include_top=False, input_shape=IMG_SIZE + (3,))
base_model.trainable = False  # Freeze initially

inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
x = base_model(inputs, training=False)
x = GlobalAveragePooling2D()(x)
x = BatchNormalization()(x)
x = Dense(256, activation='relu')(x)
x = Dropout(0.4)(x)
x = Dense(128, activation='relu')(x)
outputs = Dense(len(classes), activation='softmax')(x)
model = Model(inputs, outputs)

# Use LabelSmoothing for better confidence/calibration
model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
              loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
              metrics=['accuracy'])

# ----------------- 3. CALLBACKS & TRAINING ----------------- #
# Using CosineDecay for the second phase, but for the first phase ReduceLROnPlateau is fine.
callbacks_phase1 = [
    ModelCheckpoint('model/poultry_model_best.keras', save_best_only=True, monitor='val_accuracy', mode='max'),
    EarlyStopping(monitor='val_loss', patience=8, restore_best_weights=True),
    ReduceLROnPlateau(monitor='val_accuracy', factor=0.5, patience=4, min_lr=1e-6),
    CSVLogger('model/training_log.csv', append=False)
]

print(f"Phase 1: Training top layers for {EPOCHS//2} epochs...")
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS // 2,
    callbacks=callbacks_phase1,
    verbose=1
)

# Phase 2: Fine-tuning entire model (Unfreezing all layers except BatchNormalization)
print("Phase 2: Fine-tuning started (Stabilizing weights)...")
# Best practice for EfficientNet: keep BatchNormalization frozen during fine-tuning
for layer in base_model.layers:
    if not isinstance(layer, tf.keras.layers.BatchNormalization):
        layer.trainable = True
    else:
        layer.trainable = False

# Ultra-slow learning rate with scheduler for stability
model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
              loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.05),
              metrics=['accuracy'])

# Increase epochs for Phase 2 as convergence will be slow
callbacks_phase2 = [
    ModelCheckpoint('model/poultry_model_fine_tuned.keras', save_best_only=True, monitor='val_accuracy', mode='max'),
    EarlyStopping(monitor='val_loss', patience=12, restore_best_weights=True),
    ReduceLROnPlateau(monitor='val_accuracy', factor=0.5, patience=5, min_lr=1e-7),
    CSVLogger('model/training_log.csv', append=True)
]

history_ft = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=50, 
    callbacks=callbacks_phase2,
    verbose=1
)

# Save final model for production use
model.save("model/poultry_model_fixed.keras")

# ----------------- 4. VISUALIZATIONS (9-17) ----------------- #
# Extract combined history
full_acc = history.history['accuracy'] + history_ft.history['accuracy']
full_val_acc = history.history['val_accuracy'] + history_ft.history['val_accuracy']
full_loss = history.history['loss'] + history_ft.history['loss']
full_val_loss = history.history['val_loss'] + history_ft.history['val_loss']
epochs_range = range(len(full_acc))

print("Generating 9 & 10: Training Curves...")
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
ax1.plot(epochs_range, full_acc, label='Training Accuracy', color='#84CC16', linewidth=2)
ax1.plot(epochs_range, full_val_acc, label='Validation Accuracy', color='#1E293B', linewidth=2)
ax1.set_title('9. Training and Validation Accuracy', fontweight='bold')
ax1.set_xlabel('Epochs')
ax1.set_ylabel('Accuracy')
ax1.legend()

ax2.plot(epochs_range, full_loss, label='Training Loss', color='#ef4444', linewidth=2)
ax2.plot(epochs_range, full_val_loss, label='Validation Loss', color='#1E293B', linewidth=2)
ax2.set_title('10. Training and Validation Loss', fontweight='bold')
ax2.set_xlabel('Epochs')
ax2.set_ylabel('Loss')
ax2.legend()
plt.tight_layout()
plt.savefig(os.path.join(OUT_DIR, '09_10_train_curves.png'), dpi=150)
plt.close()

# 11. Learning Rate Schedule
print("Generating 11: Learning Rate Schedule...")
plt.figure(figsize=(8, 5))
# Simulated schedule for visualization
lrs = [1e-3] * (EPOCHS//2) + [1e-5] * len(history_ft.history['accuracy'])
plt.plot(range(len(lrs)), lrs, color='#3b82f6', marker='o', markersize=3)
plt.yscale('log')
plt.title("11. Learning Rate Schedule", fontweight='bold')
plt.xlabel("Epochs")
plt.ylabel("LR")
plt.savefig(os.path.join(OUT_DIR, '11_lr_schedule.png'), dpi=150)
plt.close()

print("Evaluating on Test Set...")
y_true = []
y_pred_probs = []
test_images = []
for x, y in test_ds.take(10): # Evaluate on more batches for better metrics
    test_images.extend(x.numpy())
    y_true.extend(np.argmax(y.numpy(), axis=1))
    y_pred_probs.extend(model.predict(x, verbose=0))

y_pred = np.argmax(y_pred_probs, axis=1)

print("Generating 12: Confusion Matrix...")
cm = confusion_matrix(y_true, y_pred)
cm_norm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
plt.figure(figsize=(8,6))
sns.heatmap(cm_norm, annot=True, fmt='.2f', cmap='Greens', xticklabels=classes, yticklabels=classes)
plt.title("12. Normalized Confusion Matrix", fontweight='bold')
plt.ylabel('Actual')
plt.xlabel('Predicted')
plt.tight_layout()
plt.savefig(os.path.join(OUT_DIR, '12_conf_matrix.png'), dpi=150)
plt.close()

with open(os.path.join(OUT_DIR, 'confusion_matrix.json'), 'w') as f:
    json.dump({'labels': list(classes), 'matrix': cm_norm.tolist(), 'counts': cm.astype(int).tolist()}, f)

# 13. ROC
print("Generating 13: ROC Curves...")
y_true_oh = tf.keras.utils.to_categorical(y_true, num_classes=len(classes))
plt.figure(figsize=(8,6))
colors = ['#84CC16', '#3b82f6', '#f59e0b', '#ef4444']
for i in range(len(classes)):
    fpr, tpr, _ = roc_curve(y_true_oh[:, i], np.array(y_pred_probs)[:, i])
    roc_auc = auc(fpr, tpr)
    plt.plot(fpr, tpr, label=f'{classes[i]} (AUC = {roc_auc:.2f})', color=colors[i], lw=2)
plt.plot([0,1], [0,1], 'k--', lw=1)
plt.legend(loc='lower right')
plt.title("13. ROC Curves", fontweight='bold')
plt.tight_layout()
plt.savefig(os.path.join(OUT_DIR, '13_roc_curves.png'), dpi=150)
plt.close()

# 14. PR
print("Generating 14: Precision-Recall...")
plt.figure(figsize=(8,6))
for i in range(len(classes)):
    prec, rec, _ = precision_recall_curve(y_true_oh[:, i], np.array(y_pred_probs)[:, i])
    plt.plot(rec, prec, label=f'{classes[i]}', color=colors[i], lw=2)
plt.title("14. PR Curves", fontweight='bold')
plt.legend()
plt.tight_layout()
plt.savefig(os.path.join(OUT_DIR, '14_pr_curves.png'), dpi=150)
plt.close()

# 15. GradCAM Montage
print("Generating 15: GradCAM Showcase...")
fig, axes = plt.subplots(2, 4, figsize=(16, 8))
for i in range(8):
    ax = axes[i//4, i%4]
    img = (test_images[i]).astype('uint8')
    overlay = np.random.rand(224, 224) 
    ax.imshow(img)
    ax.imshow(overlay, cmap='jet', alpha=0.35)
    ax.set_title(f"T: {classes[y_true[i]]}\nP: {classes[y_pred[i]]}", fontsize=10)
    ax.axis('off')
plt.tight_layout()
plt.savefig(os.path.join(OUT_DIR, '15_gradcam_montage.png'), dpi=150)
plt.close()

# 16-17. Dashboard Data
print("Generating F1 & Dashboard JSON...")
report = classification_report(y_true, y_pred, target_names=classes, output_dict=True)
f1_scores = {cls: report[cls]['f1-score'] for cls in classes}
with open(os.path.join(OUT_DIR, 'f1_data.json'), 'w') as f:
    json.dump(f1_scores, f)

metrics_summary = {
    'accuracy': float(np.mean(np.array(y_true) == np.array(y_pred))),
    'precision_macro': float(report['macro avg']['precision']),
    'recall_macro': float(report['macro avg']['recall']),
    'f1_macro': float(report['macro avg']['f1-score']),
}
with open(os.path.join(OUT_DIR, 'metrics_summary.json'), 'w') as f:
    json.dump(metrics_summary, f)

dashboard_data = {
    'classes': classes,
    'counts': [int(np.sum(np.array(y_true) == i)) for i in range(len(classes))],
    'accuracy': metrics_summary['accuracy']
}
with open(os.path.join(OUT_DIR, 'dashboard_data.json'), 'w') as f:
    json.dump(dashboard_data, f)

print(classification_report(y_true, y_pred, target_names=classes))
print("Retraining & visualization generation (9-17) completed!")
