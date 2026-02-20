# Deep Learning & Neural Networks — Complete Reference

> Deep learning didn't change programming — it changed what's possible. Understand it from the math up.

---

## Neural Network Fundamentals

### The Perceptron
Simplest neuron: `ŷ = σ(w·x + b)`

- **Inputs**: x₁, x₂, ..., xₙ
- **Weights**: w₁, w₂, ..., wₙ
- **Bias**: b
- **Activation**: σ(z) — nonlinearity

Without activation functions, stacking layers = single linear transformation.

### Feedforward Network (MLP)
```
Input → [Layer 1: Linear → Activation] → [Layer 2: ...] → Output
```

Matrix form for one layer:
```
Z = XW + b     (linear transformation)
A = σ(Z)       (element-wise activation)
```

### Activation Functions

| Function | Formula | Range | Use |
|---|---|---|---|
| Sigmoid | 1/(1+e⁻ˣ) | (0,1) | Output for binary classification |
| Tanh | (eˣ-e⁻ˣ)/(eˣ+e⁻ˣ) | (-1,1) | Hidden layers (historical) |
| ReLU | max(0,x) | [0,∞) | Default hidden layers |
| Leaky ReLU | max(0.01x, x) | (-∞,∞) | Fix dying ReLU |
| ELU | x if x>0, α(eˣ-1) if x≤0 | (-α,∞) | Smooth, negative saturation |
| GELU | x·Φ(x) | (-∞,∞) | Transformers, BERT, GPT |
| Swish | x·σ(x) | (-∞,∞) | EfficientNet |
| Softmax | eˣᵢ/Σeˣⱼ | (0,1)ₙ | Multi-class output |

**Dying ReLU problem:** Neurons output 0 for all inputs (negative pre-activation). Gradient = 0, no learning. Fix: Leaky ReLU, initialize weights carefully.

---

## Backpropagation

### Forward Pass
Compute activations layer by layer, saving intermediate values.

### Backward Pass (Chain Rule)
```
dL/dw = dL/da × da/dz × dz/dw
```

For a network with L layers:
```python
# Simplified backprop
# Forward
z1 = W1 @ x + b1
a1 = relu(z1)
z2 = W2 @ a1 + b2
output = softmax(z2)
loss = cross_entropy(output, y)

# Backward
dL_dz2 = output - y                    # Gradient of CE+softmax
dL_dW2 = a1.T @ dL_dz2                # Gradient w.r.t. W2
dL_db2 = dL_dz2.sum(axis=0)
dL_da1 = dL_dz2 @ W2.T                # Backprop through layer 2
dL_dz1 = dL_da1 * relu_grad(z1)       # Backprop through activation
dL_dW1 = x.T @ dL_dz1
dL_db1 = dL_dz1.sum(axis=0)
```

### Vanishing/Exploding Gradients
- **Vanishing**: gradients → 0 deep layers (sigmoid, tanh)
- **Exploding**: gradients → ∞
- Fix vanishing: ReLU, residual connections, batch normalization
- Fix exploding: gradient clipping, careful initialization

---

## Loss Functions

### Classification
```python
# Binary cross-entropy
L = -[y log(p) + (1-y) log(1-p)]

# Categorical cross-entropy (multi-class)
L = -Σ yᵢ log(pᵢ)

# Focal loss (for imbalanced classes)
L = -α(1-p)ᵞ log(p)    # Focuses on hard examples
```

### Regression
```python
L1 (MAE):  Σ|ŷ - y|         # Robust to outliers
L2 (MSE):  Σ(ŷ - y)²        # Sensitive to outliers
Huber:     L1 if |e|>δ, L2 otherwise  # Best of both
```

### Contrastive Learning
```python
# InfoNCE (used in CLIP, SimCLR)
L = -log(exp(sim(z, z+)/τ) / Σ exp(sim(z, zⱼ)/τ))
# Pull similar pairs together, push different pairs apart
```

---

## Optimization

### Gradient Descent Variants
```
SGD: W ← W - α × ∇L(single sample or mini-batch)
+ Memory efficient
- Noisy, sensitive to LR

Momentum: m = β₁m + (1-β₁)∇L; W ← W - αm
+ Accelerates convergence, escapes local minima
- Additional hyperparameter

RMSprop: v = β₂v + (1-β₂)(∇L)²; W ← W - α∇L/√(v+ε)
+ Adaptive per-parameter learning rate
+ Good for RNNs

Adam: Combines momentum + RMSprop (adaptive)
m = β₁m + (1-β₁)∇L           (first moment)
v = β₂v + (1-β₂)(∇L)²        (second moment)
m̂ = m/(1-β₁ᵗ)                (bias correction)
v̂ = v/(1-β₂ᵗ)                (bias correction)
W ← W - α × m̂/(√v̂ + ε)

Defaults: β₁=0.9, β₂=0.999, ε=1e-8, α=0.001
```

### AdamW (Adam + Weight Decay)
```
W ← W - α × m̂/(√v̂ + ε) - α × λ × W
```
Decoupled weight decay — standard for transformer training.

### Learning Rate Scheduling
```python
# Step decay
lr = initial_lr * decay_rate^(epoch // decay_steps)

# Cosine annealing
lr = lr_min + 0.5*(lr_max - lr_min) * (1 + cos(π * t/T))

# Warmup + cosine decay (standard for transformers)
# Linear warmup for first N steps, then cosine decay

# Cyclical LR (Smith 2017)
# Oscillate between bounds
```

### Weight Initialization
```python
# Xavier/Glorot (tanh, sigmoid)
W ~ U(-√(6/(n_in+n_out)), √(6/(n_in+n_out)))

# He/Kaiming (ReLU)
W ~ N(0, √(2/n_in))

# In PyTorch
nn.init.kaiming_uniform_(layer.weight, nonlinearity='relu')
nn.init.zeros_(layer.bias)
```

---

## Regularization

### Dropout
```python
# During training: zero each neuron with probability p
# During inference: multiply by (1-p) [or use inverted dropout]
nn.Dropout(p=0.5)
```
- Prevents co-adaptation of features
- Ensemble effect: each pass is a different "thinned" network

### Batch Normalization
```python
# Normalize activations within mini-batch
# z_norm = (z - μ_batch) / σ_batch
# y = γ * z_norm + β  (learnable scale + shift)
nn.BatchNorm1d(features)   # After linear
nn.BatchNorm2d(channels)   # After conv
```
Benefits: reduces internal covariate shift, allows higher LR, reduces sensitivity to initialization

### Layer Normalization
```python
# Normalize across features (not batch)
# Used in transformers (batch size=1 friendly)
nn.LayerNorm(normalized_shape)
```

### Data Augmentation
```python
# Image augmentation
transforms.Compose([
    transforms.RandomHorizontalFlip(),
    transforms.RandomCrop(32, padding=4),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.RandomRotation(10),
    transforms.ToTensor(),
    transforms.Normalize(mean, std)
])
```

---

## Convolutional Neural Networks (CNNs)

### Convolution Operation
```
Output[i,j] = Σ Input[i+m, j+n] × Kernel[m,n]

Kernel: learnable filter (3×3, 5×5 common)
Stride: step size (1=full slide, 2=halve spatial dims)
Padding: same (output = input size), valid (no padding)
```

**Output size:** `(H - K + 2P) / S + 1`

### CNN Building Blocks
```python
# Typical block
nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding)
nn.BatchNorm2d(out_channels)
nn.ReLU()
nn.MaxPool2d(kernel_size=2, stride=2)  # Spatial downsampling
```

### Key CNN Architectures

**ResNet (Residual Networks):**
```python
# Skip connection (residual block)
def forward(self, x):
    identity = x
    out = self.conv1(x)
    out = self.bn1(out)
    out = self.relu(out)
    out = self.conv2(out)
    out = self.bn2(out)
    out += identity    # Skip connection!
    out = self.relu(out)
    return out
```
- Solves vanishing gradients for very deep nets
- ResNet-50, ResNet-101, ResNet-152

**EfficientNet:**
- Compound scaling: width × depth × resolution simultaneously
- NAS (neural architecture search) derived
- Most efficient for accuracy/FLOPs ratio

**Vision Transformer (ViT):**
- Split image into patches → embed → standard transformer
- Outperforms CNNs at scale (needs lots of data)

---

## Recurrent Neural Networks (RNNs)

### Vanilla RNN
```
hₜ = tanh(Wₓxₜ + Wₕhₜ₋₁ + b)
yₜ = Wyₜhₜ
```
Problem: vanishing gradients through time

### LSTM (Long Short-Term Memory)
```
# Gates control information flow
fₜ = σ(Wf·[hₜ₋₁, xₜ] + bf)   # Forget gate
iₜ = σ(Wi·[hₜ₋₁, xₜ] + bi)   # Input gate
c̃ₜ = tanh(Wc·[hₜ₋₁, xₜ] + bc) # Candidate cell
cₜ = fₜ ⊙ cₜ₋₁ + iₜ ⊙ c̃ₜ    # Cell state update
oₜ = σ(Wo·[hₜ₋₁, xₜ] + bo)   # Output gate
hₜ = oₜ ⊙ tanh(cₜ)            # Hidden state
```

### GRU (Gated Recurrent Unit)
- Simplified LSTM, fewer parameters
- Two gates: Reset, Update
- Often similar performance to LSTM

---

## Transformer Architecture

### Self-Attention
```python
# Q, K, V = linear projections of input
Q = X @ W_Q   # Query
K = X @ W_K   # Key
V = X @ W_V   # Value

# Scaled dot-product attention
Attention = softmax(QKᵀ / √d_k) @ V
```
- Every position attends to every other
- `√d_k` scaling: prevent vanishing gradients in softmax

### Multi-Head Attention
```python
# Run h attention heads in parallel, concatenate
MultiHead(Q,K,V) = Concat(head₁, ..., headₕ) @ W_O
# Each head learns different relationships
```

### Transformer Block
```python
# Pre-norm variant (more stable training)
def forward(self, x, mask=None):
    # Self-attention with residual
    x = x + self.attn(self.norm1(x), mask)
    # FFN with residual
    x = x + self.ffn(self.norm2(x))
    return x
```

**FFN:** Two linear layers with GELU activation, 4× expansion
`FFN(x) = max(0, xW₁+b₁)W₂+b₂`  (or GELU)

### Positional Encoding
Transformers have no inherent sense of position:
```python
# Sinusoidal (original Attention is All You Need)
PE[pos, 2i]   = sin(pos / 10000^(2i/d_model))
PE[pos, 2i+1] = cos(pos / 10000^(2i/d_model))

# Learned embeddings: common in modern models (GPT, BERT)
# Rotary Position Embedding (RoPE): used in LLaMA, Mistral
# ALiBi: attention bias, extrapolates to longer sequences
```

---

## Language Models

### GPT (Decoder-only Transformer)
- Causal (autoregressive) attention: each token attends only to past
- Task: predict next token `P(xₜ | x₁, ..., xₜ₋₁)`
- Pretraining: next-token prediction on massive text
- Fine-tuning: instruction following, RLHF

### BERT (Encoder-only Transformer)
- Bidirectional: attends to all positions
- Pretraining: Masked Language Modeling (15% tokens masked)
- Fine-tuning: add task head, train on labeled data
- Best for: classification, NER, QA (not generation)

### Encoder-Decoder (T5, BART)
- Encoder: encode input (bidirectional)
- Decoder: generate output autoregressively
- Best for: translation, summarization, seq2seq

---

## Training at Scale

### Mixed Precision Training
```python
from torch.cuda.amp import autocast, GradScaler
scaler = GradScaler()

with autocast():           # FP16 forward pass
    output = model(input)
    loss = criterion(output, target)

scaler.scale(loss).backward()  # Scale loss, FP16 backward
scaler.step(optimizer)
scaler.update()
```
- FP16 computation: 2x faster, 2x less memory
- FP32 master weights: prevent precision loss

### Gradient Accumulation
```python
# Train with effective batch size = batch_size × accumulation_steps
for i, (input, target) in enumerate(dataloader):
    output = model(input)
    loss = criterion(output, target) / accumulation_steps
    loss.backward()
    if (i + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad()
```

### Distributed Training

**Data Parallelism (DDP — most common):**
- Each GPU holds full model copy
- Each GPU processes different data batch
- Gradients synced via all-reduce
```python
model = torch.nn.parallel.DistributedDataParallel(model, device_ids=[rank])
```

**Model Parallelism:**
- Split model across GPUs
- Pipeline parallelism: different layers on different GPUs
- Tensor parallelism: split individual weight matrices

**ZeRO (Zero Redundancy Optimizer):**
- Stage 1: Shard optimizer states
- Stage 2: Shard optimizer states + gradients
- Stage 3: Shard everything (optimizer + gradients + parameters)
- Implemented in DeepSpeed, FSDP

---

## Modern Deep Learning Stack

```python
# PyTorch (preferred research + production)
import torch
import torch.nn as nn

class MyModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(784, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 10)
        )

    def forward(self, x):
        return self.layers(x)

# Training loop
model = MyModel().to(device)
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=0.01)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=num_epochs)

for epoch in range(num_epochs):
    model.train()
    for X, y in train_loader:
        X, y = X.to(device), y.to(device)
        optimizer.zero_grad()
        logits = model(X)
        loss = nn.CrossEntropyLoss()(logits, y)
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
    scheduler.step()
```

---

## Key Papers to Know

| Paper | Contribution |
|---|---|
| Attention Is All You Need (2017) | Transformer architecture |
| BERT (2018) | Bidirectional pretraining |
| GPT-3 (2020) | Large-scale language models, few-shot |
| AlexNet (2012) | Deep learning on ImageNet |
| ResNet (2015) | Residual connections |
| GAN (2014) | Generative adversarial networks |
| VAE (2013) | Variational autoencoders |
| CLIP (2021) | Contrastive image-text learning |
| Diffusion (DDPM 2020) | Denoising diffusion |
| LoRA (2021) | Efficient fine-tuning |
| InstructGPT (2022) | RLHF for alignment |
| Flash Attention (2022) | IO-aware attention |

---

*Deep learning is applied linear algebra. The mysticism disappears when you can implement it from scratch.*
