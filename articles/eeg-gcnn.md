# EEG Graph Convolutional Neural Network

**Author**: Anton Orlovskii  
**Date**: July 31th 2025

!(articles/images/convolution fun definition.png)

## Introduction

During the work with EEG signals in the context of various HABS use cases, it became necessary to explore modern methods for signal processing, feature extraction, and model development. The AI Pillar team is dedicated to analyzing the existing methods by applying them to datasets collected by HABS. One of the state-of-the-art approaches — **Brain Network**.

---

## Brain Network

**Brain Network** refers to a representation of the functional or effective connectivity of the brain, how different regions of the brain interact and communicate with each other over time. This network is typically modeled as a graph, where nodes represent specific brain regions or EEG electrodes, and edges represent the strength or nature of interactions between these regions.

![Brain Network visualization](articles/images/brain-network.jpg)

The common approach to utilizing the brain network can be described follows:

1. **EEG input signal is processed** (Down sampling, Filtering, Artifact removal)

    ![Data pre-processing steps visualization](articles/images/raw_filt_artif.png)

2. **Pre-processed signal** of shape $N_{\text{channels}} \times T_{\text{recordings}}$ is sampled into intervals of $t$ seconds.

3.  For each sample  ($N_{channels} \times t$) **Brain Network** is constructed using metric measuring connectivity between each pair of channels (Pearson correlation, Coherence, Phase Locked Value, etc.) resulting in a graph representation with an associated adjacency matrix $A_{ij}$ of size $N \times N$. In our implementation **Pearson correlation** was chosen as a metric, as in the reference literature, it gives the best results.

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
| **Improvements**  | - Better filtering/artifact removal  <br> - Tune: window, threshold, graph features |



---

## References

- Author's github with 
> https://github.com/neerajwagh/eeg-gcnn 
- Neeraj Wagh, Yogatheesan Varatharajah (2020)
> https://proceedings.mlr.press/v136/wagh20a.html

