# Brain Network

**Author**: Anton Orlovskii  
**Contact**: adorlovskii@gmail.com

---

## Introduction

During the work with EEG signals in the context of various HABS use cases, it became necessary to explore modern methods for signal processing, feature extraction, and model development. The AI Pillar team is dedicated to analyzing the existing methods by applying them to datasets collected by HABS. One of the state-of-the-art approaches — **Brain Network**.

---

## Brain Network

**Brain Network** refers to a representation of the functional or effective connectivity of the brain, how different regions of the brain interact and communicate with each other over time. This network is typically modeled as a graph, where nodes represent specific brain regions or EEG electrodes, and edges represent the strength or nature of interactions between these regions.

![Brain Network visualization](2004.01973v1.pdf-image-042%20(1).jpg)

The common approach to utilizing the brain network can be described follows:

1. **EEG input signal is processed** (Down sampling, Filtering, Artifact removal)

    ![Data pre-processing steps visualization](raw_filt_artif.png)

2. **Pre-processed signal** of shape  
   $N_{\text{channels}} \times T_{\text{recordings}}$  
   is sampled into intervals of $t$ seconds.

3.  For each sample  ($N_{channels} \times t$) **Brain Network** is constructed using metric measuring connectivity between each pair of channels (Pearson correlation\cite{li_emotion_2020}, Coherence\cite{li_emotion_2020}, Phase Locked Value\cite{wu2020investigating}, etc.) resulting in a graph representation with an associated adjacency matrix $A_{ij}$ of size $N \times N$. In our implementation **Pearson correlation** was chosen as a metric, as in the reference literature, it gives the best results.

   $$
   \rho_{x,y} = \frac{\mathrm{cov}(x, y)}{\sigma_x \sigma_y}
   $$

4. **Graph feature calculation**. For obtained Brain Network of each sample graph, measures are calculated. Then these measures are used as features. In our implementation, we used the following features:

   - **Graph Strength**:- is the sum of the weights (level of correlation in our case) of all edges connected to it, averaged over all nodes in the graph. This gives a sense of how strongly, on average, nodes are connected. This feature allows us to identify the time periods in which the brain was the most "activated".
     $$
     \bar{s} = \frac{1}{N} \sum_{i=1}^{N} \sum_{j \in \mathcal{N}(i)} w_{ij}
     $$

     Where $w_{ij}$ is the weight of the edge between the *i-th* and *j-th* node.

   - **Clustering Coefficient**: measures the extent to which node's neighbors  are interconnected to each other averaged over all nodes in the graph.

     $$
     c = \frac{1}{N} \sum_{i=1}^{N} \frac{2 e_i}{k_i(k_i - 1)}
     $$

     Where $e_i$ is the number of edges between neighbors of node *i*, and $k_i$ is the number of neighbors.

   - **Eigenvector Centrality**: measures the average node’s influence based on the principle that connections to high-scoring nodes contribute more to a node’s score. The formula is recursive.
     $$
     \bar{x} = \frac{1}{N} \sum_{i=1}^{N} x_i = \frac{1}{N} \sum_{i=1}^{N} \frac{1}{\lambda} \sum_{j=1}^{N} A_{ij} x_j
     $$

     Where $A_{ij}$ is the adjacency matrix and $\lambda$ is its largest eigenvalue.

> Feature calculations were performed using the `bctpy` (Brain Connectivity Toolbox) library.

5. *(Optional)* Apply a significance threshold ($p < 0.05$) to filter out statistically insignificant connections.


## Discussion & Suggestions

| **Brain Network** |                                                                                  |
|-------------------|----------------------------------------------------------------------------------|
| **Pros**          | Graph structure = interpretability + variety of features                        |
| **Cons**          | Too many parameters to tune effectively                                         |
| **Improvements**  | - Better filtering/artifact removal  <br> - Tune: window, threshold, graph feats |



---

## References

- Li et al. (2020)  
- Wu et al. (2020)  
- Tran et al. (2013)  

