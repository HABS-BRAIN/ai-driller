# HABS Brain Network and EEGPT Methods Summary

**Author**: Anton Orlovskii  
**Contact**: adorlovskii@gmail.com

---

## Abstract

During the work with EEG signals in the context of various HABS use cases, it became necessary to explore modern methods for signal processing, feature extraction, and model development. The AI Pillar team is dedicated to analyzing the existing methods by applying them to datasets collected by HABS. Two state-of-the-art approaches — **Brain Network** and **EEGPT** — were found capable of feature extraction in the context of HABS EEG data. However, the features obtained did not yet produce sufficient results when applied to ML models. Further work includes returning to filtering and artifact removal techniques to obtain more relevant features.

---

## Introduction

This work presents a summary of some of the methods found in the state-of-the-art literature and used in studies by the HABS AI-Pillar team.

---

## Brain Network

**Brain Network** refers to a representation of brain connectivity over time, modeled as a graph where:

- **Nodes**: EEG electrodes or brain regions
- **Edges**: Strength/nature of interactions (correlation, coherence, etc.)

![Brain Network visualization](2004.01973v1.pdf-image-042 (1).jpg)

### Common Approach:

1. **EEG Signal Processing** (downsampling, filtering, artifact removal)

    ![Pre-processing steps](raw_filt_artif.png)

2. **Segmentation**: EEG data of shape  
   $N_{\text{channels}} \times T_{\text{recordings}}$ → segments of $t$ seconds

3. **Connectivity Matrix** using Pearson correlation:

   $$\rho_{x,y} = \frac{\mathrm{cov}(x, y)}{\sigma_x \sigma_y}$$

4. **Graph Features** per segment:
   - **Graph Strength**:

     $$
     \bar{s} = \frac{1}{N} \sum_{i=1}^{N} \sum_{j \in \mathcal{N}(i)} w_{ij}
     $$

   - **Clustering Coefficient**:

     $$
     c = \frac{1}{N} \sum_{i=1}^{N} \frac{2e_i}{k_i(k_i - 1)}
     $$

   - **Eigenvector Centrality**:

     $$
     \bar{x} = \frac{1}{N} \sum_{i=1}^{N} \frac{1}{\lambda} \sum_{j=1}^{N} A_{ij} x_j
     $$

---

### LVMH Brain Network Analysis

- 9 EEG sessions
- PANAS scores (positive/negative) from questionnaires
- Alpha & Beta bands, baseline segments only
- PCA used for dimensionality reduction

![PCA correlation circle](PCA_LVMH_9.png)

#### Correlation matrix (9 sessions):

|               | PC1     | PC2      | panas_pos | panas_neg |
|---------------|---------|----------|-----------|-----------|
| **PC1**       | 1.000   | 0.000    | 0.246     | 0.037     |
| **PC2**       | 0.000   | 1.000    | -0.492    | **-0.739** |
| **panas_pos** | 0.246   | -0.492   | 1.000     | 0.035     |
| **panas_neg** | 0.037   | **-0.739** | 0.035     | 1.000     |

#### Correlation matrix (50 sessions):

|               | PC1     | PC2      | panas_pos | panas_neg |
|---------------|---------|----------|-----------|-----------|
| **PC1**       | 1.000   | 0.000    | -0.316    | -0.086    |
| **PC2**       | 0.000   | 1.000    | -0.045    | -0.093    |
| **panas_pos** | -0.316  | -0.045   | 1.000     | -0.363    |
| **panas_neg** | -0.086  | -0.093   | -0.363    | 1.000     |

---

### LVMH Stimuli Tags Prediction (Brain Network)

1. **Data**: 52 subjects, 156 sessions, 4 tags (Baseline, A, B, C)
2. **Features**: Strength, clustering coefficient, eigenvector centrality (1 sec window)
3. **Dimensionality Reduction**: PCA

![Explained Variance](pca_bn_1sec.png)

4. **Models**: SVM and Random Forest (Leave-One-Out, GridSearch)

| Model         | Best Parameters                                            | Accuracy |
|---------------|------------------------------------------------------------|----------|
| **SVC**       | C=1, gamma=scale, kernel=rbf                               | 0.567    |
| **RandomForest** | max_depth=5, min_samples_leaf=4, min_samples_split=10, n_estimators=200 | 0.603    |

![SVC Confusion Matrix](conf_svm.png)
![Random Forest Confusion Matrix](conf_rf.png)

---

## EEGPT: Pretrained Transformer for EEG

![EEGPT Architecture](EEGPT_architecture.png)

### Key Ideas:

- Transformer with masking + attention
- Learns robust, universal representations
- Self-supervised learning via masked denoising

### Loss Function:

$$
\min_{\theta, \phi} \; \mathbb{E}_{x \sim \mathcal{D}} \left[ 
\mathcal{H}(d_{\phi}(z),\, x \odot (1 - M)) + \mathcal{H}(z,\, f_{\theta}(x)) 
\right]
$$

---

### EEGPT Pipeline

- **Tokenization**: EEG → spatio-temporal patches + channel embeddings  
  $$p_{i,j} = x_{i,(j-1)d:jd}, \quad token_{i,j} = W_p^T p_{i,j} + b_p + \sigma_i$$

![Token embedding](EEGPT_patches.png)

- **Masking**: 50% time, 80% channels masked  
  ![Token masking](EEGPT_masking.png)

- **Encoder**: masked input + [CLS]-like summary tokens  
  ![Encoder](EEGPT_Encoder.png)

- **Predictor**: rotary position encoding + transformer  
  ![Predictor](EEGPT_predictor.png)

- **Momentum Encoder**:

  $$\mathcal{L}_A = -\frac{1}{N} \sum_{j=1}^{N} \left\| pred_j,\, \mathrm{LN}(menc_j) \right\|_2^2$$

- **Reconstructor**:

  $$\mathcal{L}_R = -\frac{1}{|\bar{M}|} \sum_{(i,j) \in \bar{M}} \left\| rec_{i,j},\, \mathrm{LN}(p_{i,j}) \right\|_2^2$$

Final Loss:  
$$\mathcal{L} = \mathcal{L}_A + \mathcal{L}_R$$

---

### Linear Probing (Transfer Learning)

![Linear probing](EEGPT_lin_prob.png)

- Frozen encoder + spatial filter + linear classifier

---

### Evaluation (on external datasets)

Tasks: MI, ME, SSVEP, EMO, MULTI, SLEEP, ERN, P300, Abnormal, Event

For P300:

- **Balanced Accuracy**: 0.65  
- **Weighted F1**: 0.72

---

### LVMH Stimuli Tags Prediction (EEGPT)

- 27 sessions, segments A/B/C/Baseline
- Training using Leave-One-Out
- Model overfits, poor generalization

![Training Accuracy](train_acc.png)  
![Validation Accuracy](valid_acc.png)

---

## Discussion & Suggestions

|                  | **EEGPT**                                                                                   | **Brain Network**                                                                 |
|------------------|---------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
| **Pros**         | Pre-trained transformer, flexible to input shape                                           | Graph structure = interpretability + variety of features                         |
| **Cons**         | Computationally expensive, sensitive to hyperparams                                        | Too many parameters to tune effectively                                          |
| **LVMH Findings**| No generalization to unseen subjects                                                        | Low classification accuracy (~60%)                                               |
| **Improvements** | - Better filtering/artifact removal  <br> - Tune: patch size, batch, learning rate         | - Better filtering/artifact removal  <br> - Tune: window, threshold, graph feats |

---

## References

- Li et al. (2020)  
- Wu et al. (2020)  
- Tran et al. (2013)  
- [EEGPT GitHub Repository](https://github.com/eegpt2024)

