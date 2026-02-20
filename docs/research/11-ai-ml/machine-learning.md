# Machine Learning — Fundamentals to Production

> ML is not magic. It's linear algebra, calculus, and probability applied carefully. Understand the math, then trust the tools.

---

## The Core Framework

### What Is Machine Learning?
A system that **learns** from data to make predictions or decisions, without being explicitly programmed for each case.

**Types:**
- **Supervised**: labeled data → predict labels on new data
- **Unsupervised**: unlabeled data → find structure/patterns
- **Semi-supervised**: small labeled + large unlabeled
- **Reinforcement Learning**: agent learns from environment rewards
- **Self-supervised**: labels derived from data itself (BERT, GPT pretraining)

---

## Mathematical Foundations

### Linear Algebra (Essential)
- **Vectors**: 1D arrays of numbers. Feature vectors, word embeddings
- **Matrices**: 2D arrays. Datasets, weight matrices
- **Matrix multiplication**: core of neural networks
- **Dot product**: similarity measure, attention mechanism
- **Eigenvalues/Eigenvectors**: PCA, covariance analysis
- **SVD (Singular Value Decomposition)**: dimensionality reduction, recommendations
- **Norms**: L1 (Manhattan), L2 (Euclidean), used in regularization

### Calculus
- **Gradient**: direction of steepest ascent
- **Partial derivatives**: sensitivity of function to each input
- **Chain rule**: backbone of backpropagation
  - `∂L/∂w = ∂L/∂z × ∂z/∂w`
- **Jacobian**: matrix of all partial derivatives
- **Hessian**: second-order derivative matrix (curvature)

### Probability & Statistics
- **Probability distributions**: Gaussian, Bernoulli, Categorical, Beta
- **MLE (Maximum Likelihood Estimation)**: find parameters that maximize P(data|params)
- **MAP (Maximum A Posteriori)**: MLE + prior (Bayesian)
- **Bayes' Theorem**: P(A|B) = P(B|A)P(A) / P(B)
- **Expectation, Variance, Covariance**
- **Central Limit Theorem**: sum of many independent RVs → Gaussian
- **Information theory**: entropy H(X) = -Σ p(x) log p(x)

---

## Classical ML Algorithms

### Linear Regression
Predict continuous value: `ŷ = Wx + b`

**Objective:** Minimize MSE: `L = (1/n)Σ(ŷᵢ - yᵢ)²`

**Normal equation:** `W = (XᵀX)⁻¹Xᵀy` — exact solution, O(d³) — slow for large d

**Gradient descent:** Iteratively update `W ← W - α ∇L`

**Ridge regression (L2 regularization):** `L + λ||W||²`  — prevents overfitting, shrinks weights
**Lasso (L1 regularization):** `L + λ||W||₁` — sparse weights (feature selection)

### Logistic Regression
Binary classification: `P(y=1|x) = σ(Wx + b)` where `σ(z) = 1/(1+e⁻ᶻ)`

**Loss:** Binary cross-entropy: `L = -Σ[y log(ŷ) + (1-y)log(1-ŷ)]`

**Multi-class:** softmax: `P(y=k|x) = exp(zₖ) / Σ exp(zⱼ)`

### Decision Trees
- Recursively split data on feature thresholds
- Split criterion: Gini impurity or Information Gain (entropy reduction)
- Pros: interpretable, no feature scaling needed, handles mixed types
- Cons: overfit, unstable

**Gini impurity:** `G = 1 - Σ pᵢ²`
**Entropy:** `H = -Σ pᵢ log₂(pᵢ)`

### Random Forest
- Ensemble of decision trees
- **Bagging**: each tree trained on bootstrap sample (random subset with replacement)
- **Feature randomness**: each split considers random subset of features
- Final prediction: majority vote (classification) or average (regression)
- Reduces variance, robust to overfitting
- Feature importance: mean decrease in impurity

### Gradient Boosting (XGBoost, LightGBM, CatBoost)
- Additive model: `F(x) = Σ hₜ(x)` where each `hₜ` corrects residuals of previous
- **XGBoost:** Efficient, regularized, handles missing values
- **LightGBM:** Leaf-wise tree growth, faster on large datasets
- **CatBoost:** Native categorical features, ordered boosting
- Often best-in-class for tabular data

**Key hyperparameters:**
- `n_estimators`: number of trees
- `learning_rate`: shrinkage (smaller = more robust, needs more trees)
- `max_depth`: tree depth (controls overfitting)
- `subsample`, `colsample_bytree`: randomization

### Support Vector Machines (SVM)
- Find hyperplane maximizing margin between classes
- **Kernel trick**: implicitly map to higher-dimensional space
  - Linear, RBF (Gaussian), Polynomial, Sigmoid
- **Soft margin**: allow some misclassification (C parameter)
- C: high = hard margin (fits training), low = soft margin (more regularization)
- Effective in high-dimensional spaces, but slow on large datasets

### k-Nearest Neighbors (kNN)
- Store all training data
- Predict: take k nearest neighbors, vote
- No training, but O(n) prediction
- Curse of dimensionality: distances become meaningless in high dim

### Naive Bayes
- Assumes feature independence given class
- `P(y|x) ∝ P(y) Π P(xᵢ|y)`
- Fast, works well for text classification
- Gaussian NB (continuous), Multinomial NB (text), Bernoulli NB

### k-Means Clustering
- Assign points to k clusters by nearest centroid
- Update centroids to cluster mean
- Repeat until convergence
- O(n × k × iterations)
- Sensitive to initialization (k-means++)
- Must choose k (elbow method, silhouette score)

### PCA (Principal Component Analysis)
- Dimensionality reduction
- Find orthogonal directions (principal components) of maximum variance
- Steps: center data → covariance matrix → eigendecomposition → project
- Used for: visualization, noise reduction, feature extraction
- Retain top k components explaining variance threshold (e.g., 95%)

---

## The ML Workflow

### 1. Problem Definition
- Frame as ML problem (regression/classification/etc.)
- Define success metric
- Understand data collection

### 2. Data Collection & Exploration
```python
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv('data.csv')
df.info()           # Types, null counts
df.describe()       # Statistics
df.head()           # Sample rows

# Distribution of target
df['target'].value_counts()  # Classification
df['price'].hist()           # Regression

# Correlations
sns.heatmap(df.corr(), annot=True)

# Missing values
df.isnull().sum()
```

### 3. Data Preprocessing
```python
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer

# Handle missing values
imputer = SimpleImputer(strategy='median')
X = imputer.fit_transform(X)

# Feature scaling (important for: SVM, kNN, linear models, neural nets)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)  # Use SAME scaler!

# Categorical encoding
from sklearn.preprocessing import OneHotEncoder
encoder = OneHotEncoder(sparse=False)
X_encoded = encoder.fit_transform(X[['category']])
```

### 4. Feature Engineering
```python
# Create features
df['feature_ratio'] = df['a'] / (df['b'] + 1e-8)
df['log_price'] = np.log1p(df['price'])
df['date_month'] = pd.to_datetime(df['date']).dt.month

# Text features
from sklearn.feature_extraction.text import TfidfVectorizer
tfidf = TfidfVectorizer(max_features=10000, ngram_range=(1,2))
X_text = tfidf.fit_transform(df['text'])
```

### 5. Model Training & Selection
```python
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1)
model.fit(X_train, y_train)

# Evaluation
y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:,1]
print(classification_report(y_test, y_pred))
print("AUC:", roc_auc_score(y_test, y_proba))

# Cross-validation (more reliable estimate)
cv_scores = cross_val_score(model, X, y, cv=5, scoring='roc_auc')
print(f"CV AUC: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")
```

### 6. Hyperparameter Tuning
```python
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV

# Grid search (exhaustive)
param_grid = {
    'n_estimators': [100, 200, 500],
    'learning_rate': [0.05, 0.1, 0.2],
    'max_depth': [3, 4, 5]
}
grid_search = GridSearchCV(model, param_grid, cv=5, scoring='roc_auc', n_jobs=-1)
grid_search.fit(X_train, y_train)
best_params = grid_search.best_params_

# Optuna (modern, Bayesian optimization)
import optuna
def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 100, 1000),
        'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3, log=True),
    }
    model = GradientBoostingClassifier(**params)
    return cross_val_score(model, X, y, cv=3).mean()

study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=100)
```

---

## Evaluation Metrics

### Classification
```
Accuracy = (TP + TN) / (TP + TN + FP + FN)
Precision = TP / (TP + FP)   — of predicted positives, how many are correct?
Recall = TP / (TP + FN)      — of actual positives, how many did we catch?
F1 = 2 × (P × R) / (P + R)  — harmonic mean
AUC-ROC: area under TPR vs FPR curve (0.5=random, 1.0=perfect)
PR-AUC: precision-recall curve (better for imbalanced)
```

**When to use which:**
- Medical diagnosis: maximize Recall (don't miss cancer)
- Spam filter: maximize Precision (don't block good emails)
- Balanced: use F1

### Regression
```
MAE (Mean Absolute Error): Σ|ŷ - y| / n
MSE (Mean Squared Error): Σ(ŷ - y)² / n — penalizes outliers more
RMSE: √MSE — same units as target
R² (R-squared): 1 - SS_res/SS_tot — proportion of variance explained
MAPE: Mean Absolute Percentage Error
```

---

## Bias-Variance Trade-off

```
Total Error = Bias² + Variance + Irreducible Noise

Bias: error from wrong assumptions (underfitting)
  - High bias: model too simple, can't capture patterns

Variance: sensitivity to training data fluctuations (overfitting)
  - High variance: model memorizes training data, fails on new data
```

**Overfitting detection:** Training error << Test error
**Underfitting detection:** Both training and test error are high

**Regularization techniques:**
- L1/L2 penalty on weights
- Dropout (neural nets)
- Early stopping
- Data augmentation
- Cross-validation for model selection

---

## Handling Imbalanced Data

```python
# Oversampling minority class
from imblearn.over_sampling import SMOTE
X_resampled, y_resampled = SMOTE(random_state=42).fit_resample(X_train, y_train)

# Undersampling majority class
from imblearn.under_sampling import RandomUnderSampler
X_resampled, y_resampled = RandomUnderSampler().fit_resample(X_train, y_train)

# Class weights (tell model to weight minority more)
from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(class_weight='balanced')

# Use appropriate metric (not accuracy!)
# PR-AUC or F1 instead of accuracy
```

---

## Feature Importance & Explainability

### Built-in Methods
```python
# Feature importance from tree models
importances = model.feature_importances_
pd.Series(importances, index=feature_names).sort_values(ascending=False)
```

### SHAP Values
```python
import shap
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)
shap.summary_plot(shap_values, X_test)          # Global
shap.waterfall_plot(explainer(X_test)[0])       # Local (single prediction)
```

### LIME
```python
from lime import lime_tabular
explainer = lime_tabular.LimeTabularExplainer(X_train)
exp = explainer.explain_instance(X_test[0], model.predict_proba)
exp.show_in_notebook()
```

---

## Scikit-learn Pipeline

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer

# Define preprocessing for different column types
numeric_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
    ('encoder', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer([
    ('num', numeric_transformer, numeric_features),
    ('cat', categorical_transformer, categorical_features)
])

# Full pipeline
clf = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', LogisticRegression())
])

clf.fit(X_train, y_train)
# Now scaler is part of pipeline — no leakage when using CV!
```

---

## Production ML

### Challenges
- **Data drift**: distribution of input data changes over time
- **Concept drift**: relationship between features and target changes
- **Model staleness**: model becomes less accurate over time
- **Training-serving skew**: different preprocessing in training vs serving

### Monitoring
- Log predictions and features
- Monitor prediction distribution (compare to training)
- Track performance metrics over time
- Alert on drift (PSI — Population Stability Index, KL divergence)

### MLOps Tools
- **MLflow**: experiment tracking, model registry, serving
- **Kubeflow**: ML on Kubernetes
- **DVC**: data versioning
- **Weights & Biases**: experiment tracking, visualization
- **Feast**: feature store
- **BentoML**: model serving
- **Seldon / KServe**: model serving on Kubernetes

### Feature Store
```
Online store (Redis): low-latency serving features
Offline store (Parquet/BigQuery): historical features for training
Feature pipeline: transforms raw data → features
```

---

*ML is 80% data and 20% model. Garbage in, garbage out — but clean data with simple models often beats dirty data with complex models.*
