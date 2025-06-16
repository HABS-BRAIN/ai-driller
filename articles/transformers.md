# Attention Models Application in EEG Signal Processing

**Author:** Arthur de Leusse  
**Date:** June 6th 2025

![Transformers](https://www.francetvpro.fr/sites/default/files/styles/crop_format_bandeau/public/images/2017/05/09/phototele-862781_3.jpg.webp?itok=aCiHftXn)

While working on neuro-marker identification through EEG signal processing, we came across attention models. This post aims to provide a comprehensive overview of the attention mechanism in EEG processing.

The transformer architecture was first introduced in ["Attention is All You Need"](https://arxiv.org/abs/1706.03762) as a method for interpreting textual information. Given this architecture's success, we investigate how effectively these models can process EEG signals.

## Generic Transformer Architecture

Transformers use encoders to learn a latent representation of the input and decoders to generate an output from the latent representation.

The architecture of a Transformer comprises five main components:

- **Tokenization:** Splits raw data into discrete units (tokens).
- **Embedding:** Converts tokens into fixed-dimensional real-valued vectors.
- **Positional Encoding:** Adds information about the order of the tokens to the embeddings.
- **Transformer Block:** Processes the sequence using multi-head self-attention and feedforward neural networks. Residual connections and layer normalization are used to stabilize and accelerate learning.
- **Output Layer:** Converts the final processed vectors into predictions, typically using a linear (dense) layer followed by a softmax activation for classification tasks—or another appropriate output head, depending on the task.

### Self Attention Mechanism

We calculate to what extent each word in the sentence is related to all the words of the sentence including itself. It is the concept of incorporating information from other words in the input sequence to encode a specific word.

![Transformer Architecture](https://machinelearningmastery.com/wp-content/uploads/2021/08/attention_research_1.png)

#### How Does It Work?

We begin with an input matrix **X**, composed of vectors **x̄ᵢ**, where each **x̄ᵢ** corresponds to a word in the input sequence.

For each vector **x̄ᵢ**, we construct three new vectors:

- **Query vector q̄ᵢ:** Encodes information about which other words the model should attend to when representing **x̄ᵢ**.
- **Key vector k̄ᵢ:** Functions like a tag. It holds identifying information that allows other words to determine whether they should attend to this word.
- **Value vector v̄ᵢ:** Contains the actual information to be passed along in the attention mechanism.

These vectors may have the same or different dimensionalities compared to the original input vectors, depending on the model design. They are computed by multiplying the input matrix **X** with the corresponding learned weight matrices:


$Q = XW^Q$,$\quad K = XW^K$,$\quad V = XW^V$



Here,$W^Q$,$W^K$,$W^V$ are the weight matrices for the queries, keys, and values respectively. These weights are learned through backpropagation during the training of the neural network.

Once we have the **Q** and **K** matrices, we compute the dot product of **Q** and the transpose of **K** to measure the similarities between words. We then apply the softmax function to these scores to obtain the attention weights. These weights indicate how much focus each word gives to every other word.

Finally, each word's new representation is computed as a weighted sum of the value vectors using these attention weights. This results in a contextualized representation for each word. We can go further and have a Multi-Headed Attention architecture.

The idea is to have multiple sets of weight matrices for the queries, keys, and values, where each set focuses on a different aspect of a word. Then, the outputs of all the heads are concatenated and passed through a final linear layer to mix the information.

---

## Link with EEG Analysis

Given an input matrix $X \in \mathbb{R}^{T \times C}$ where $C$ is the number of EEG channels and $T$ is the number of time points, our predictive objective is to estimate $X_{t+1}$.


### Tokenization

EEG signals are difficult to work with. They exhibit a high noise-to-signal ratio, substantial variability between individuals, and are continuous in nature.

To tackle the noise and variability, a common first step is to band-pass filter the signal, remove physical artifacts (e.g., eye blinks), and normalize the resulting signal.

The continuous nature of EEG data presents another major challenge. Two principal strategies address this:

* **Temporal Segmentation**: segment the signal into short epochs (a few seconds) of fixed length **T**. This creates a matrix of shape **T × C**, where **T** is the number of time steps and **C** is the number of electrodes. Define vectors **v̄ᵢ**, where **i ∈ [0, T]**, and feed these vectors to the Transformer encoder.

* **Frequency-Based Imaging**: apply the Fast Fourier Transform (FFT) to the signal, producing a matrix of shape **T × F**, where **F** represents frequency bins. Map the intensity of these frequencies to RGB values to generate an image, which can be processed by a Vision Transformer (ViT).

The limitation of this approach arises from the FFT assumption that the signal is composed of sinusoidal components—an approximation that can lead to loss of information.

* **Self Attention with EEG**: similarly as for the language, with EEG it is important to understand which epoch of signal has which influence on another. To do this, proceed exactly as you would with words: first compute the **Q**, **K** and **V** projections, then build the attention matrix using the following formula:

$A = softmax(QK^T / √d_k) × V$


Where:

- **Query vector q̄ᵢ:** Contains the information about which other epoch/token carries information which is relevant for the current epoch/token **x̄ᵢ**.
- **Key vector k̄ᵢ:** Functions like a tag. It holds the signature of the sample.
- **Value vector v̄ᵢ:** Contains the actual EEG features (e.g.: power, phase).

## Temporal Transformer Encoder (TTE)

### Architecture Overview

The TTE architecture is encoder-only. Once you have your filtered, tokenized EEG signal with its temporal positional embedding, you pass it through a stack (L layers) of multi-head self-attention followed by a position-wise MLP. The contextualized token embeddings produced by the final layer are then globally pooled and fed to a lightweight prediction head, typically a single fully connected soft-max layer, for the task of your choice (e.g.: **X_(t+1)**, emotion recognition, authentication, ...).

### Mathematical Formulation

The computations inside one encoder layer are exactly the two equations shown below:



$h^t_\ell = \mathrm{LN} \left( \mathrm{MHA}(z^t_{\ell-1}) + z^t_{\ell-1} \right), \quad \ell = 1, 2, \dots, L$



$z^t_\ell = \mathrm{LN} \left( \mathrm{MLP}(h^t_\ell) + h^t_\ell \right), \quad \ell = 1, 2, \dots, L$



### Symbol Legend

| Symbol | Meaning / Role |
|--------|----------------|
| l | Index of the current layer (1 ≤ l ≤ L) |
| L | Total number of Transformer layers in the temporal branch |
| $^t$ | Superscript indicating the *temporal* path of ETST |
| $z^t_{l-1}$ | Input to layer l: final output of the previous layer (or embeddings + PE for l=1) |
| $h^t_l$ | Intermediate representation *after* MHA and *before* the MLP in layer l |
| $z^t_l$ | Final output of layer l (after MLP, residual addition, and LN) — becomes the input to layer l+1 |
| **MHA** | *Multi-Head Self-Attention* (context mixing across time steps) |
| **MLP** | Position-wise feed-forward network (typically Linear → GELU/ReLU → Linear) |
| **LN** | *Layer Normalization* applied after the residual addition (post-norm scheme) |
| + | Residual connection (element-wise addition) |

## Spatial Transformer Encoder (STE)

The STE architecture is nearly identical to the TTE, but it focuses on dependencies *between channels* instead of between time steps. Each EEG channel is assigned an index, which is embedded (via sinusoidal functions) and added to the token representations to form a spatial positional encoding. The resulting sequence is then processed by the same stack of L encoder layers (MHA → MLP).

A single spatial layer is described by:


$h^s_\ell = \mathrm{LN} \left( \mathrm{MHA}(z^s_{\ell-1}) + z^s_{\ell-1} \right), \quad \ell = 1, 2, \dots, L$


$z^s_\ell = \mathrm{LN} \left( \mathrm{MLP}(h^s_\ell) + h^s_\ell \right), \quad \ell = 1, 2, \dots, L$





The STE output can be concatenated or averaged with the TTE output before the final prediction head. In this case, we talk about an ETST architecture.


## Potential Limitations

In order for the model to achieve a high accuracy, the EEG signal must be very well pre-processed, which is challenging due to the high level of noise and artifacts it contains.

## Conclusion

The use of transformers appears to be a promising approach in EEG signal processing. Indeed, the ETST architecture allows the NN to . The main current challenge lies in the pre-processing of the raw signal, which could be the focus of a future blog post.


---
## References

- Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). [Attention is all you need](https://arxiv.org/abs/1706.03762). *Advances in Neural Information Processing Systems (NeurIPS)*, 30, 5998–6008.

- He, X., Yi, Y., Liu, H., Huang, Z., Tang, Y.-Y., & Tang, R. (2022). [Modulation of attention networks serving sustained attention in healthy young adults via EEG neurofeedback](https://www.nature.com/articles/s41598-022-18502-3). *Scientific Reports*, 12, 14691. https://doi.org/10.1038/s41598-022-18502-3
