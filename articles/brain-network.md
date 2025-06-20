# Brain Network

**Author**: Anton Orlovskii  
**Contact**: adorlovskii@gmail.com

---

## Introduction

During the work with EEG signals in the context of various HABS use cases, it became necessary to explore modern methods for signal processing, feature extraction, and model development. The AI Pillar team is dedicated to analyzing the existing methods by applying them to datasets collected by HABS. One of the state-of-the-art approaches — **Brain Network**.

---

## Brain Network

**Brain Network** refers to a representation of the functional or effective connectivity of the brain — how different regions of the brain interact and communicate with each other over time. This network is typically modeled as a graph, where nodes represent specific brain regions or EEG electrodes, and edges represent the strength or nature of interactions between these regions.

![Brain Network visualization](2004.01973v1.pdf-image-042%20(1).jpg)

### Common Approach

1. **EEG input signal is processed** (Down sampling, Filtering, Artifact removal)

    ![Data pre-processing steps visualization](raw_filt_artif.png)

2. **Pre-processed signal** of shape  
   $N_{\text{channels}} \times T_{\text{recordings}}$  
   is sampled into intervals of $t$ seconds.

3. **Brain Network construction** for each sample of shape  
   $N_{\text{channels}} \times t$.  
   A connectivity metric (e.g., Pearson correlation, Coherence, Phase Locked Value) is used to compute the adjacency matrix $A_{ij}$ of size $N \times N$.  
   In our implementation, **Pearson correlation** was used:

   $$
   \rho_{x,y} = \frac{\mathrm{cov}(x, y)}{\sigma_x \sigma_y}
   $$

4. **Graph feature calculation**. From the constructed Brain Network, the following features are computed:

   - **Graph Strength**: average sum of edge weights per node.

     $$
     \bar{s} = \frac{1}{N} \sum_{i=1}^{N} \sum_{j \in \mathcal{N}(i)} w_{ij}
     $$

     Where $w_{ij}$ is the weight of the edge between the *i-th* and *j-th* node.

   - **Clustering Coefficient**: measures the interconnectedness of a node’s neighbors.

     $$
     c = \frac{1}{N} \sum_{i=1}^{N} \frac{2 e_i}{k_i(k_i - 1)}
     $$

     Where $e_i$ is the number of edges between neighbors of node *i*, and $k_i$ is the number of neighbors.

   - **Eigenvector Centrality**: measures node influence recursively — nodes connected to high-scoring nodes contribute more.

     $$
     \bar{x} = \frac{1}{N} \sum_{i=1}^{N} x_i = \frac{1}{N} \sum_{i=1}^{N} \frac{1}{\lambda} \sum_{j=1}^{N} A_{ij} x_j
     $$

     Where $A_{ij}$ is the adjacency matrix and $\lambda$ is its largest eigenvalue.

> Feature calculations were performed using the `bctpy` (Brain Connectivity Toolbox) library.

5. *(Optional)* Apply a significance threshold ($p < 0.05$) to filter out statistically insignificant connections.


## Discussion & Suggestions

|                  | **EEGPT**                                                                                   | **Brain Network**                                                                 |
|------------------|-----------------------------------------------------------------------------------|
| **Pros**         | Graph structure = interpretability + variety of features                         |
| **Cons**         | Too many parameters to tune effectively                                          |
| **Improvements** | - Better filtering/artifact removal  <br> - Tune: window, threshold, graph feats |

---

## References

- Li et al. (2020)  
- Wu et al. (2020)  
- Tran et al. (2013)  

