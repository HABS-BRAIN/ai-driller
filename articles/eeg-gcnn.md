# EEG Graph Convolutional Neural Network

**Author**: Anton Orlovskii  
**Date**: July 31th 2025

![Convolution?](articles/images/convolution_fun_definition.png)

## Introduction
While studying state-of-the-art methods for EEG signal analysis, we encountered a wide range of machine learning models and feature extraction techniques — from statistical features derived from the time series of each channel (such as Power Spectral Density or Differential Entropy) and inter-channel relationships (e.g., Brain Network) to "black-box" approaches based on transformer-based architectures (such as EEGPT, LaBraM, and EEG-Conformer). However, a compromise between interpretability and architectural complexity has been lacking. A potential candidate to bridge this gap could be the Graph Convolutional Neural Network (GCNN) architecture, which is based on the concept of Graph Convolution presented by T.N. Kipf, M. Welling in 2016.

---

## Graph theory reminder
A Graph *G = (V, E)* consists of a set of nodes *V* and edges *E*.
Each node and edge can carry its own set of features.
For example, in the context of EEG signals, the nodes may correspond to EEG channels, each described by a set of features (e.g., Power Spectral Density (PSD) across different frequency bands).
Edges can represent the connections between channels, such as the degree of correlation between signals from two channels.

The graph is typically represented using an adjacency matrix *A* of size $$N \times N$$ (where $$N = |V|$$ or number of electrodes in our context)
The values in this matrix indicate the presence or strength of a connection between pairs of nodes. That is:

$$
A_{ij} = 1 \text{ (or weight } w_{ij} \text{ if nodes i and j are connected)}
$$
$$
A_{ij} = 0 \text{ otherwise}
$$

By default, self-loops are not included in the adjacency matrix, i.e., $$A_{ij} = 0$$
However, in some cases, it is useful to include self-connections — for instance, when the adjacency matrix is used as a kind of weight matrix that is multiplied by the node feature vector.
Without self-loops, this multiplication may ignore the information of the node itself. In such cases, we can define:

$$
\hat{A} = A + I
$$

From the adjacency matrix *A* we can define *defgree matrix D*, a diagonal matrix where each entry $$D_{ij}=d_{i}$$ corresponds to the degree of node $$v_{i}$$ i.e., the number of edges connected to it.
This degree matrix is often used to normalize the adjacency matrix.
Normalization allows the adjacency matrix to encode relative information about a node’s connections to its neighbors and prevents rows from dominating simply because the corresponding node has more connections:

$$
A_{norm} = D^{-1}A \text{ or } D^{-1/2}AD^{-1/2}
$$

We can also define the graph Laplacian as:

$$
L = D - A
$$

---

## Feature Extraction

### Preprocessing


### Channels functional features


### Connectivity features


---

## Model

### Graph convolution


---

## Alternatives


---

## References

- T.N. Kipf, M. Welling (2016)
> https://arxiv.org/abs/1609.02907
- N. Wagh, Y. Varatharajah (2020)
> https://proceedings.mlr.press/v136/wagh20a.html
- Authors' github
> https://github.com/neerajwagh/eeg-gcnn 

