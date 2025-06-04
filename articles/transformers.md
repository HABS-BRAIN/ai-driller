# Attention Models Application in EEG Signal Processing

While working on neuro-marker identification through EEG signal processing, we came across attention models. This post aims to provide a comprehensive overview of the attention mechanism in EEG processing.
The transformer architecture was first introduced in ["Attention is All You Need"](https://arxiv.org/abs/1706.03762) as a method for interpreting textual information. Given this architecture's success, we investigate how effectively these models can process EEG signals.

![Transformers](https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.francetvpro.fr%2Fcontenu-de-presse%2F30159&psig=AOvVaw3PpD7xlr51GHFYLjqshgfW&ust=1749127742233000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCMj2zd_m140DFQAAAAAdAAAAABAE "transformers")

## Generic Transformer Architecture
Transformers use encoders to learn a latent representation of the input and decoders to generate an output from the latent representation.

The architecture of a Transformer comprises five main components:
* Tokenization: Splits raw data into discrete units (tokens).
* Embedding: Converts tokens into fixed-dimensional real-valued vectors.
* Positional Encoding: Adds information about the order of the tokens to the embeddings.
* Transformer Block: Processes the sequence using multi-head self-attention and feedforward neural networks. Residual connections and layer normalization are used to stabilize and accelerate learning.
* Output Layer: Converts the final processed vectors into predictions, typically using a linear (dense) layer followed by a softmax activation for classification tasks—or another appropriate output head, depending on the task.

![Transformer Architecture](https://www.google.com/url?sa=i&url=https%3A%2F%2Fmachinelearningmastery.com%2Fthe-transformer-model%2F&psig=AOvVaw3c5lzhNxu7owsSZ1Zg_ELi&ust=1749127935170000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCIDR8bvn140DFQAAAAAdAAAAABAE)

### Self attention mechanism
The model calculates attention scores between each word and all words in the sentence (including itself), allowing each word's representation to be informed by the broader context of the entire sequence.

We begin with an input matrix $\( X \)$, composed of vectors $\( \vec{x}_i \)$, where each $\( \vec{x}_i \)$ corresponds to a word in the input sequence.
For each vector $\( \vec{x}_i \)$, we construct three new vectors:
* Query vector $\( \vec{q}_i \)$: Encodes information about which other words the model should attend to when representing $\( \vec{x}_i \)$.
* Key vector $\( \vec{k}_i \)$: Functions like a tag. It holds identifying information that allows other words to determine whether they should attend to this word.
* Value vector $\( \vec{v}_i \)$: Contains the actual information to be passed along in the attention mechanism.

These vectors may have the same or different dimensionalities compared to the original input vectors, depending on the model design. They are computed by multiplying the input matrix $\( X \)$ with the corresponding learned weight matrices:


