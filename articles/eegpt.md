## EEGPT: Pretrained Transformer for Universal and Reliable Representation of EEG Signals

**Author**: Anton Orlovskii  
**Date**: June 20th 2026

### Context

Neural network architectures based on Transformers and the Attention mechanism have demonstrated their effectiveness and potential in text and image processing tasks. In recent years, multiple attempts have been made to apply such architectures to EEG signal analysis. The authors of the model in question provide a pretrained encoder, which they claim to be universal — capable of handling EEG signals recorded from different devices, with varying numbers of channels and signal lengths. Furthermore, it is considered reliable, as the model architecture emphasizes encoder training to produce robust representations in the latent space.

**Such an architecture appears promising for HABS-related tasks, as in some use cases there is a lack of clear intuition behind the data as well as an ambiguous ground truth. In this context, a pretrained self-supervised algorithm (like attention mechanism) could enable the extraction of latent representations that may help uncover previously unknown patterns within the data.**


---

### Method

![EEGPT Architecture](articles/images/EEGPT_architecture.png)

In a general case, the masked autoencoder learns features through a form of denoising autoencoder: input signals occluded with random patch masks are fed into the encoder, and the decoder predicts the original embeddings of the masked patches. 

$$\\min_{\\theta, \\phi} \\; \\mathbb{E}_{x \\sim \\mathcal{D}} \\; \\mathcal{H}(d_{\\phi}(z),\\, x \\odot (1 - \\mathbf{M})), \\quad 
\\text{where } z = f_{\\theta}(x \\odot \\mathbf{M})$$

By minimizing the loss function, the model learns the optimal representation $z$ of the input signal. However, in practice, there is no explicit representation $z$ (no split of encoder and decoder) in the BERT-style model, and the model must be fine-tuned to locate effective representations. Thus, a spatio-temporal representation alignment branch is added to explicitly represent $z$:

$$\\min_{\\theta, \\phi} \\; \\mathbb{E}_{x \\sim \\mathcal{D}} \\left[ 
\\mathcal{H}(d_{\\phi}(z),\\, x \\odot (1 - \\mathbf{M})) + \\mathcal{H}(z,\\, f_{\\theta}(x))
\\right]$$

---

## Input

The expected input of the model is the discretized filtered and artifact-removed EEG data presented as a tensor of shape **[Batches × N_channels × T_recordings]**.(Visualization of input for one batch is presented below).

---

## Local Spatio-Temporal Embedding

Before feeding data as input to the transformer architecture, it is necessary to embed it into tokens. In order to take into account signal variations, the source data is split into sequential patches, for each of which embedding is calculated. It is also necessary to take into account that in the EEG context different channels contain different information, and for the universality of the model, the input data are allowed to contain a variable number of channels, which should also be taken into account when calculating tokens. Thus, patch creation for further preparation of the input signal is performed as follows : 

1. First, the Codax Book is constructed to associate channel $c_{i}$ to the learnable embedding vector $\\sigma_{i}$
2. Second, the EEG signal is divided into equally sized patches in the spatio-temporal dimensions denoted as $p_{i,j}$:
   $$p_{i,j} = x_{i,(j-1)d:jd}$$

3. Third, the embeddings are created with learnable weight-matrix and bias:
   $$\\text{Embed}(p_{i,j}) = W_p^T p_{i,j} + b_p$$

4. Finally, the resulting tokens are created to be fed into the model:
   $$\\text{token}_{i,j} = \\text{Embed}(p_{i,j}) + \\sigma_i$$
   
---

### Masking

![Token Masking](articles/images/EEGPT_masking.png)

For Encoder-Decoder scheme training purposes it is necessary to mask the input tokens by application of binary (1-s and 0-s) mask $M$ (Masking 50% time and 80% channel patches). Resulting in masked part $x \\odot M$ and unmasked one $x \\odot \\bar{M}$.
---


### Encoder

![EEGPT Encoder](articles/images/EEGPT_Encoder.png)

- **Input**: Receives masked tokens concatenated with summary tokens. Summary tokens are randomly initialized and added to the Tokens (similarly as [CLS] in BERT, The which specifically does not represent any actual word; rather, it’s a placeholder that captures a summary of the entire input sequence. Since the [CLS] token is the first position in the sequence, it captures a summary representation of the entire sentence (or sentences) after passing through all the transformer layers. This means that the final vector representation of [CLS] contains the context of the whole sentence, making it highly useful for classification tasks or tasks requiring sentence-level understanding).
- **Computation**:
  $$\\text{enc}_j = \\mathrm{ENC} \\left( \\left\\{ \\text{token}_{i,j} \\right\\}_{(i,j) \\in \\mathcal{M}} \\right)$$

- **Output**: hidden vector of dimension $h$ per patch $j$.

---


### Predictor

![EEGPT Predictor](articles/images/EEGPT_predictor.png)

- **Rotary positional encoding** - Rotary position encoding: to pass positional information to the model, for each token Rotation was used as positional encoding:
  $$\\text{pos}_j = \\text{Rotation}_\\theta(\\text{token}_j)$$

- **Input**: encoded patches + queries (random vectors)
- **Computation**: $enc_{j}$ combined with query-vectors (randomly initialized), served to "collect" the aggregated information from tokens in the learning process. Both have positional encoding.
  $$\\left\\{ \\text{pred}_t \\right\\}_{t=1}^{N} = \\mathrm{PRED} \\left( \\left\\{ \\text{enc}_j + \\text{pos}_j \\right\\}_{(i,j) \\in \\mathcal{M}} \\right)$$

- **Output**: recovered (predicted) patterns $pred_{t}$ of masked signal

---

## Momentum Encoder

- **Input**: initial unmasked signal patched into $token_{i,j}$
- **Computation**:
  $$\\text{menc}_j = \\mathrm{MENC} \\left( \\left\\{ \\text{token}_{i,j} \\right\\}_{(i,j) \\in \\overline{\\mathcal{M} \\cup \\mathcal{U}}} \\right)$$
- **Output**: Initial signal patches encoded into hidden space of dimension $h$
- **Loss**: Momentum encoder calculates the hidden representation of original (unmasked) EEG to align hidden representation of masked input with it, using the following Loss-function:
  $$\\mathcal{L}_A = -\\frac{1}{N} \\sum_{j=1}^{N} \\left\\| \\text{pred}_j,\\, \\mathrm{LN}(\\text{menc}_j) \\right\\|_2^2$$

---

### Reconstructor

![EEGPT Reconstructor](articles/images/EEGPT_Reconstructor.png)

- **Input**: encoded features corresponding to unmasked part of initial masked signal $enc_{j}$ and predicted features corresponding to masked part of initial signal $pred_{j}$. Both with positional encoding $pos_{j}$
- **Computation**:
  $\\left\\{ \\text{rec}_{u,t} \\right\\}_{(u,t) \\in \\overline{\\mathcal{M}}} =
  \\mathrm{REC} \\left(
  \\left\\{ \\text{enc}_j + \\text{pos}_j \\right\\}_{(i,j) \\in \\mathcal{M}} \\cup
  \\left\\{ \\text{pred}_j + \\text{pos}_j \\right\\}_{(i,j) \\in \\overline{\\mathcal{M}}}
  \\right)$
- **Output**: Reconstructed patches corresponding to unmasked part of initial masked signal.
- **Loss**: Reconstructor's goal is to align the reconstructed patches generated by the reconstructor with the raw patches $p_{i,j}$ of unmasked signal $\\bar{M}$. Masked-based reconstruction uses the following loss function: 
  $\\mathcal{L}_R = -\\frac{1}{|\\overline{\\mathcal{M}}|} 
  \\sum_{(i,j) \\in \\overline{\\mathcal{M}}} 
  \\left\\| \\text{rec}_{i,j},\\, \\mathrm{LN}(p_{i,j}) \\right\\|_2^2$

---

## Combined Loss Function

The resulting Loss-function of a model is composed of the two: $\\mathcal{L}_A + \\mathcal{L}_R$. The proposed combined loss-function apart from learning Encoder-Decoder architecture in general, also improves the encoded quality which allows to use the pretrained Encoder on various dataset even **without pre-training**. 

---

## Linear Probing Method

To apply the pretrained encoder to new datasets that were not used during model training, the authors propose a Linear Probe scheme. In addition to the pretrained encoder (with frozen parameters), the scheme includes a spatial filter to align the EEG channels with the model's input format, followed by linear layers that map the encoder's output features to logits corresponding to the target classes.


![EEGPT Linear probing method](articles/images/EEGPT_lin_prob.png)

---

### Evaluation

Evaluation of the model was performed on a set of datasets of a different paradigms. The list of the  paradigms refered in the original paper is presented below: 

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


