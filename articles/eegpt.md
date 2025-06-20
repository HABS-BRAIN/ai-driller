## EEGPT: Pretrained Transformer for Universal and Reliable Representation of EEG Signals [Wang et al., 2024]

### Context

Neural network architectures based on Transformers and the Attention mechanism have demonstrated their effectiveness in text and image processing. Recently, similar architectures have been applied to EEG signal analysis.

The EEGPT model provides a **pretrained encoder** designed to be:

- **Universal**: supports EEG from different devices with varying channels and lengths.
- **Reliable**: trained to produce robust latent representations.

This architecture is promising for HABS use cases, especially when there is ambiguity in the ground truth or lack of data intuition. A pretrained self-supervised model (like EEGPT) may help reveal hidden patterns.

---

### Method

![EEGPT Architecture](EEGPT_architecture.png)

EEGPT uses a **masked autoencoder** to learn robust features. It applies random masks to EEG signals and trains the model to reconstruct the original embeddings of the masked parts.

$$
\min_{\theta, \phi} \; \mathbb{E}_{x \sim \mathcal{D}} \; \mathcal{H}(d_{\phi}(z),\, x \odot (1 - \mathbf{M})), \quad 
\text{where } z = f_{\theta}(x \odot \mathbf{M})
$$

To improve representational quality, an auxiliary loss aligns masked and unmasked encodings:

$$
\min_{\theta, \phi} \; \mathbb{E}_{x \sim \mathcal{D}} \left[ 
\mathcal{H}(d_{\phi}(z),\, x \odot (1 - \mathbf{M})) + \mathcal{H}(z,\, f_{\theta}(x))
\right]
$$

---

### Input

Input to the model: filtered and artifact-removed EEG tensor of shape  
`[Batches × N_channels × T_recordings]`.

---

### Local Spatio-Temporal Embedding

![Local spatio-temporal embedding](EEGPT_patches.png)

Steps:

1. Assign a learnable embedding vector $\sigma_i$ to each EEG channel $c_i$.
2. Divide signal into patches $p_{i,j}$:

   $$
   p_{i,j} = x_{i,(j-1)d:jd}
   $$

3. Generate embeddings:

   $$
   \text{Embed}(p_{i,j}) = W_p^T p_{i,j} + b_p
   $$

4. Construct tokens:

   $$
   \text{token}_{i,j} = \text{Embed}(p_{i,j}) + \sigma_i
   $$

---

### Masking

![Token Masking](EEGPT_masking.png)

For training:
- 50% of time patches
- 80% of channel patches

Are masked using binary mask $M$.

Masked input: $x \odot M$  
Unmasked part: $x \odot \bar{M}$

---

### Encoder

![EEGPT Encoder](EEGPT_Encoder.png)

- **Input**: masked tokens + summary tokens (like [CLS] in BERT).
- **Computation**:

  $$
  \text{enc}_j = \mathrm{ENC} \left( \left\{ \text{token}_{i,j} \right\}_{(i,j) \in \mathcal{M}} \right)
  $$

- **Output**: hidden vector of dimension $h$ per patch $j$.

---

### Predictor

![EEGPT Predictor](EEGPT_predictor.png)

- **Rotary positional encoding**:

  $$
  \text{pos}_j = \text{Rotation}_\theta(\text{token}_j)
  $$

- **Input**: encoded patches + queries (random vectors)
- **Computation**:

  $$
  \left\{ \text{pred}_t \right\}_{t=1}^{N} = \mathrm{PRED} \left( \left\{ \text{enc}_j + \text{pos}_j \right\}_{(i,j) \in \mathcal{M}} \right)
  $$

- **Output**: predicted embeddings of masked tokens.

---

### Momentum Encoder

- **Input**: full (unmasked) tokens
- **Computation**:

  $$
  \text{menc}_j = \mathrm{MENC} \left( \left\{ \text{token}_{i,j} \right\}_{(i,j) \in \overline{\mathcal{M} \cup \mathcal{U}}} \right)
  $$

- **Loss**:

  $$
  \mathcal{L}_A = -\frac{1}{N} \sum_{j=1}^{N} \left\| \text{pred}_j,\, \mathrm{LN}(\text{menc}_j) \right\|_2^2
  $$

---

### Reconstructor

![EEGPT Reconstructor](EEGPT_Reconstructor.png)

- **Input**: encoded unmasked ($\text{enc}_j$) + predicted masked ($\text{pred}_j$), both with $\text{pos}_j$.
- **Computation**:

  $$
  \left\{ \text{rec}_{u,t} \right\}_{(u,t) \in \overline{\mathcal{M}}} =
  \mathrm{REC} \left(
  \left\{ \text{enc}_j + \text{pos}_j \right\}_{(i,j) \in \mathcal{M}} \cup
  \left\{ \text{pred}_j + \text{pos}_j \right\}_{(i,j) \in \overline{\mathcal{M}}}
  \right)
  $$

- **Loss**:

  $$
  \mathcal{L}_R = -\frac{1}{|\overline{\mathcal{M}}|} 
  \sum_{(i,j) \in \overline{\mathcal{M}}} 
  \left\| \text{rec}_{i,j},\, \mathrm{LN}(p_{i,j}) \right\|_2^2
  $$

---

### Combined Loss Function

Final loss function:

$$
\mathcal{L} = \mathcal{L}_A + \mathcal{L}_R
$$

This design allows using the pretrained encoder **without retraining**, by improving its representation capability via self-supervised learning.

---

### Linear Probing Method

To apply the pretrained encoder to new data, the **linear probing** scheme is used:

- Pretrained encoder (frozen)
- Spatial filter
- Linear classifier on top

![EEGPT Linear probing method](EEGPT_lin_prob.png)

---

### Evaluation

The model was evaluated on datasets from different EEG paradigms:

- **MI** – Motor imagery  
- **ME** – Motor execution  
- **SSVEP** – Visual stimuli response  
- **EMO** – Emotion classification  
- **MULTI** – Mixed paradigms  
- **SLEEP** – Sleep stage classification  
- **ERN** – Error-related responses  
- **P300** – Stimulus-evoked potential (~300 ms)  
- **Abnormal** – Pathology detection  
- **Event** – Event-related classification (e.g. seizures)

---

### PhysioP300 Dataset Reference

Although not directly aligned with HABS tasks, the **PhysioP300** dataset was selected as a benchmark:

- It involves stimulus presentation and response
- The goal: detect time intervals with presented stimuli

Using EEGPT, results achieved:

- **Balanced Accuracy**: 0.65  
- **Weighted F1**: 0.72

These results were successfully reproduced in-house, confirming reliability.


