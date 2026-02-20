# NLP & Large Language Models — Complete Reference

> LLMs are the most transformative technology in software since the internet. Understanding them deeply — not just using them — is a superpower.

---

## NLP Fundamentals

### Text Preprocessing Pipeline
```python
import re
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords

def preprocess(text: str) -> list[str]:
    # Lowercase
    text = text.lower()
    # Remove HTML
    text = re.sub(r'<[^>]+>', '', text)
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    # Tokenize
    tokens = word_tokenize(text)
    # Remove punctuation
    tokens = [t for t in tokens if t.isalpha()]
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    tokens = [t for t in tokens if t not in stop_words]
    # Lemmatize (go → go, running → run, better → good)
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(t) for t in tokens]
    return tokens
```

### Text Representation

**Bag of Words (BoW):**
```python
from sklearn.feature_extraction.text import CountVectorizer

vectorizer = CountVectorizer(max_features=10000)
X = vectorizer.fit_transform(corpus)
# Sparse matrix: rows=documents, cols=vocabulary
```

**TF-IDF (Term Frequency-Inverse Document Frequency):**
```python
from sklearn.feature_extraction.text import TfidfVectorizer

# TF(t,d) = count(t in d) / total_terms(d)
# IDF(t) = log(N / df(t))   where df = docs containing term
# TF-IDF = TF × IDF

tfidf = TfidfVectorizer(
    max_features=20000,
    ngram_range=(1, 2),     # Unigrams + bigrams
    sublinear_tf=True,       # log(1+tf) instead of raw tf
    analyzer='word'
)
X = tfidf.fit_transform(corpus)
```

**Word Embeddings:**
```python
# Word2Vec
from gensim.models import Word2Vec

model = Word2Vec(
    sentences=tokenized_corpus,
    vector_size=100,      # Embedding dimension
    window=5,             # Context window
    min_count=5,          # Ignore rare words
    sg=0,                 # CBOW (0) or Skip-gram (1)
    negative=5,           # Negative sampling
)

# Semantic operations
model.wv.most_similar('king')
model.wv.similarity('cat', 'dog')
# King - Man + Woman ≈ Queen
result = model.wv.most_similar(
    positive=['king', 'woman'],
    negative=['man']
)

# FastText: handles out-of-vocabulary words (subword)
# GloVe: co-occurrence statistics
```

---

## Transformer Architecture Deep Dive

### From Raw Text to Model Input

**Tokenization:**
```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# BPE (Byte-Pair Encoding): used in GPT, RoBERTa
# WordPiece: used in BERT
# SentencePiece: language-agnostic, used in T5, LLaMA

encoded = tokenizer(
    "Hello, world!",
    padding=True,
    truncation=True,
    max_length=512,
    return_tensors="pt"
)
print(encoded['input_ids'])     # Token IDs
print(encoded['attention_mask']) # 1=real token, 0=padding

# Special tokens
# [CLS] = Classification token (first token in BERT)
# [SEP] = Separator (between sentences in BERT)
# <|endoftext|> = End of text (GPT)
# <pad> = Padding

# Vocabulary sizes
# BERT: 30,522 vocab
# GPT-4: ~100,000 vocab (cl100k_base)
# LLaMA-3: 128,256 vocab
```

### Attention Mechanism In Depth
```python
import torch
import torch.nn.functional as F
import math

def scaled_dot_product_attention(Q, K, V, mask=None):
    """
    Q: (batch, heads, seq_len, d_k)
    K: (batch, heads, seq_len, d_k)
    V: (batch, heads, seq_len, d_v)
    """
    d_k = Q.shape[-1]
    # Scaled dot product
    scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(d_k)
    # scores: (batch, heads, seq_len, seq_len)

    # Causal mask (decoder/GPT: prevent attending to future)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float('-inf'))

    # Softmax over last dim
    weights = F.softmax(scores, dim=-1)  # Attention weights

    # Weighted sum of values
    output = torch.matmul(weights, V)  # (batch, heads, seq_len, d_v)
    return output, weights
```

**Why √d_k scaling?**
As d_k grows, dot products grow in magnitude, pushing softmax into regions with very small gradients (vanishing gradient). Dividing by √d_k keeps the variance of the dot products around 1.

### Positional Encodings Explained

**Sinusoidal (original):**
```python
def sinusoidal_encoding(max_len, d_model):
    pe = torch.zeros(max_len, d_model)
    position = torch.arange(0, max_len).unsqueeze(1).float()
    div_term = torch.exp(
        torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model)
    )
    pe[:, 0::2] = torch.sin(position * div_term)  # Even positions
    pe[:, 1::2] = torch.cos(position * div_term)  # Odd positions
    return pe
```

**RoPE (Rotary Position Embedding):**
- Encodes positions as rotations in 2D space
- Relative position naturally captured (rotation of Q's position - K's position)
- Enables extrapolation to longer sequences
- Used in: LLaMA, Mistral, Falcon, Qwen

**ALiBi (Attention with Linear Biases):**
- Add linear penalty to attention scores based on distance
- `score[i,j] -= m * |i-j|`
- Better extrapolation at inference vs training length

---

## Major Model Families

### GPT Family (Decoder-Only)
```
GPT-1 (2018): 117M params, 12 layers, 12 heads
GPT-2 (2019): 1.5B params
GPT-3 (2020): 175B params — few-shot learning emergence
InstructGPT (2022): RLHF fine-tuning
ChatGPT (2022): InstructGPT + conversation
GPT-4 (2023): Multimodal, much larger

Architecture:
- Token + positional embeddings
- N × transformer decoder blocks
  - Masked self-attention
  - LayerNorm (pre-norm variant)
  - FFN (4× expansion, GELU)
- Output: linear + softmax over vocabulary
```

### BERT Family (Encoder-Only)
```
BERT (2018): 110M (base) / 340M (large) params
Pretraining: MLM (Masked Language Model) + NSP
Fine-tuning: Add task head, train on labeled data

Variants:
RoBERTa: Removes NSP, more data, better tokenizer
ALBERT: Parameter sharing across layers, smaller
DistilBERT: Knowledge distillation, 40% smaller, 97% accuracy
DeBERTa: Disentangled attention, state-of-art for understanding tasks
```

### Open Source LLMs
```
LLaMA (Meta):  7B, 13B, 34B, 70B — Apache 2.0
Mistral:       7B, 8×7B MoE — Apache 2.0
Qwen:          0.5B to 72B
Phi-3:         3.8B — Small but capable
DeepSeek:      7B to 671B MoE — Strong reasoning
Gemma:         2B, 7B, 27B — Google
Command R:     35B, 104B — Cohere
```

---

## Training Large Language Models

### Pretraining
```python
# Next token prediction (autoregressive)
# Loss = average NLL over all tokens
for batch in dataloader:
    input_ids = batch['input_ids'][:, :-1]   # All but last
    labels = batch['input_ids'][:, 1:]        # All but first

    logits = model(input_ids)  # (batch, seq_len, vocab)
    loss = F.cross_entropy(
        logits.reshape(-1, vocab_size),
        labels.reshape(-1)
    )
    loss.backward()
```

**Data mixture matters:**
- The Pile, Common Crawl, books, Wikipedia, code (The Stack)
- Quality filtering: deduplication, toxicity filter, perplexity filter
- Blend ratio affects capabilities

**Training at scale:**
- GPT-3: ~300B tokens
- LLaMA-3: ~15T tokens
- Chinchilla optimal: N_params × 20 tokens (challenged by recent models)

### RLHF (Reinforcement Learning from Human Feedback)
```
Step 1: Supervised Fine-Tuning (SFT)
  - Collect demonstration data (human wrote ideal responses)
  - Fine-tune base model on demonstrations

Step 2: Reward Model Training
  - Collect comparison data (human rates responses A vs B)
  - Train reward model to predict human preference
  - RM(context, response) → scalar reward

Step 3: PPO (Proximal Policy Optimization)
  - Use RM to score LLM responses
  - Update LLM to maximize reward
  - KL penalty to prevent diverging too far from SFT model

reward = RM(response) - β * KL(LLM || SFT_LLM)
```

### DPO (Direct Preference Optimization)
```python
# Simpler alternative to RLHF + PPO
# No separate reward model needed
# Directly optimizes from preference pairs (chosen, rejected)

# Loss:
# -log σ(β * [log π(y_w|x) - log π_ref(y_w|x)] -
#          β * [log π(y_l|x) - log π_ref(y_l|x)])
```

---

## Fine-Tuning

### Full Fine-Tuning
```python
from transformers import AutoModelForSequenceClassification, Trainer, TrainingArguments

model = AutoModelForSequenceClassification.from_pretrained("bert-base-uncased")

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=16,
    learning_rate=2e-5,
    warmup_steps=500,
    weight_decay=0.01,
    fp16=True,
    evaluation_strategy="epoch",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
)
trainer.train()
```

### LoRA (Low-Rank Adaptation)
```python
# Instead of fine-tuning all weights W,
# add low-rank update: W' = W + ΔW = W + BA
# where B is (d × r) and A is (r × k), r << min(d,k)
# Only train B and A (much fewer parameters)

from peft import get_peft_model, LoraConfig, TaskType

config = LoraConfig(
    r=16,                        # Rank (4, 8, 16, 32, 64)
    lora_alpha=32,               # Scaling factor (lora_alpha/r)
    target_modules=["q_proj", "v_proj"],  # Which modules to adapt
    lora_dropout=0.05,
    task_type=TaskType.CAUSAL_LM
)

model = get_peft_model(base_model, config)
model.print_trainable_parameters()
# ~1% of total parameters trainable!
```

**QLoRA:** Quantize base model to 4-bit, train LoRA adapters in 16-bit.
Enables fine-tuning 70B models on consumer GPUs.

---

## Inference & Deployment

### Key Generation Parameters
```python
from transformers import pipeline

generator = pipeline("text-generation", model="meta-llama/Llama-3-8B-Instruct")

output = generator(
    "Explain transformers",
    max_new_tokens=500,
    temperature=0.7,        # 0 = deterministic, 1 = creative, >1 = chaotic
    top_p=0.9,              # Nucleus sampling: sample from top 90% prob mass
    top_k=50,               # Top-k sampling: sample from top 50 tokens
    repetition_penalty=1.1, # Penalize repeated tokens
    do_sample=True,         # Probabilistic sampling (False = greedy)
)
```

**Temperature explained:**
```python
# Softmax with temperature T
probs = softmax(logits / T)
# T → 0: distribution sharpens (greedy)
# T = 1: normal distribution
# T → ∞: uniform distribution
```

### Quantization
```python
# 4-bit quantization with bitsandbytes
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",        # NormalFloat4
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,   # QLoRA double quantization
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3-70B-Instruct",
    quantization_config=bnb_config,
    device_map="auto"
)
# 70B fp16: ~140GB VRAM → 70B int4: ~40GB VRAM
```

### KV Cache
```
During generation, attention keys and values are recomputed each step.
KV cache: store K, V tensors from previous steps.

Memory: O(batch × heads × seq_len × d_head)
Context length limits determined by KV cache size.

Optimizations:
- Paged attention (vLLM): non-contiguous KV cache pages
- Flash attention: fused kernel, avoids materializing full attention matrix
- Multi-Query Attention (MQA): single K,V head shared by all Q heads
- Grouped Query Attention (GQA): small number of K,V heads (LLaMA 3, Mistral)
```

### vLLM for Production
```python
from vllm import LLM, SamplingParams

llm = LLM(
    model="meta-llama/Llama-3-8B-Instruct",
    tensor_parallel_size=4,   # Across 4 GPUs
    max_model_len=32768,
    gpu_memory_utilization=0.90,
)

sampling_params = SamplingParams(temperature=0.8, max_tokens=512)

outputs = llm.generate(
    ["What is the capital of France?", "Explain quantum computing"],
    sampling_params
)
```

---

## Prompting Techniques

### Zero-Shot
```
"Classify the sentiment of this review as positive, negative, or neutral:
'The movie was absolutely breathtaking!'

Sentiment:"
```

### Few-Shot (In-Context Learning)
```
"Classify the sentiment:

Review: 'Best pizza I've ever had!' → positive
Review: 'Terrible service, cold food' → negative
Review: 'Delivery was on time' → neutral

Review: 'This product exceeded my expectations!' → "
```

### Chain-of-Thought (CoT)
```
"Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls.
Each can has 3 balls. How many tennis balls does he have?

A: Roger starts with 5 balls. He buys 2 × 3 = 6 more balls.
5 + 6 = 11. The answer is 11.

Q: The cafeteria had 23 apples. If they used 20 for lunch and bought 6 more,
how many apples do they have?

A: Let me think step by step."
```

### System Prompts
```python
messages = [
    {
        "role": "system",
        "content": "You are a precise technical assistant. Answer concisely. "
                   "If you're unsure, say so rather than guessing."
    },
    {
        "role": "user",
        "content": "Explain the difference between INNER JOIN and LEFT JOIN"
    }
]
```

### ReAct (Reasoning + Acting)
```
Thought: I need to find the current price of Bitcoin
Action: search("bitcoin current price USD")
Observation: Bitcoin is currently trading at $68,432

Thought: Now I have the price, I can answer the question
Answer: The current Bitcoin price is $68,432 USD
```

---

## RAG (Retrieval-Augmented Generation)

```python
# Architecture:
# 1. Index documents: chunk → embed → store in vector DB
# 2. Query: embed question → retrieve relevant chunks → prompt

from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Indexing
splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=64,
    separators=["\n\n", "\n", ". ", " "]
)
chunks = splitter.split_documents(documents)

embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-large-en-v1.5"
)
vectorstore = Chroma.from_documents(chunks, embeddings)

# Retrieval
def rag_query(question: str, k: int = 5) -> str:
    relevant_chunks = vectorstore.similarity_search(question, k=k)
    context = "\n\n".join([c.page_content for c in relevant_chunks])

    prompt = f"""Answer the question based on the context provided.
If the answer isn't in the context, say "I don't have that information."

Context:
{context}

Question: {question}

Answer:"""

    return llm.generate(prompt)
```

### Vector Databases
| Database | Best For |
|---|---|
| Pinecone | Managed, production, easy |
| Weaviate | Self-hosted, multimodal |
| Qdrant | Self-hosted, fast, Rust |
| Chroma | Development, local |
| pgvector | PostgreSQL extension |
| Milvus | High scale, distributed |

### Embedding Models
```
text-embedding-3-large (OpenAI): 3072 dims, commercial
BAAI/bge-large-en-v1.5: 1024 dims, open-source, excellent
e5-large-v2: 1024 dims, good multilingual
nomic-embed-text: 768 dims, fully open-source
```

---

## LLM Evaluation

### Metrics
```python
# BLEU (n-gram overlap, translation quality)
from nltk.translate.bleu_score import sentence_bleu
score = sentence_bleu([reference.split()], hypothesis.split())

# ROUGE (recall-based, summarization)
from rouge_score import rouge_scorer
scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'])
scores = scorer.score(reference, hypothesis)

# BERTScore (semantic similarity)
from bert_score import score
P, R, F1 = score(hypotheses, references, lang='en')

# Human eval / LLM-as-judge (most reliable)
# MT-Bench, AlpacaEval, LMSYS Arena (ELO ratings)
```

### Benchmarks
| Benchmark | Tests |
|---|---|
| MMLU | 57-subject knowledge |
| HumanEval / MBPP | Code generation |
| GSM8K | Grade school math |
| MATH | Competition mathematics |
| BBH (BIG-Bench Hard) | Reasoning |
| TruthfulQA | Truthfulness |
| HellaSwag | Commonsense |
| ARC | Science QA |

---

## AI Safety & Alignment

### Key Concepts
- **Alignment**: ensuring AI systems do what humans actually want
- **RLHF**: fine-tune with human feedback to align behavior
- **Constitutional AI** (Anthropic): use AI to rate itself against principles
- **Red-teaming**: adversarial testing for failure modes
- **Jailbreaking**: prompt injection to bypass safety training
- **Hallucination**: model generates confident but false information

### Responsible Deployment
- Never trust model output in high-stakes contexts without verification
- Implement content filters for safety-critical applications
- Log all inputs/outputs for audit
- Human-in-the-loop for consequential decisions
- Set appropriate temperature (0 for factual, higher for creative)
- Use retrieval to ground responses in facts (RAG)
- Validate structured outputs (JSON, code) before execution

---

*LLMs are not magic — they're statistical models trained on human text. The magic is in what emerges from scale. Understand the architecture, and you can engineer the future.*
