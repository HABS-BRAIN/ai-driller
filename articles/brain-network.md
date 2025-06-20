# Brain Network

**Author**: Anton Orlovskii  
**Contact**: adorlovskii@gmail.com

---

## Introduction

During the work with EEG signals in the context of various HABS use cases, it became necessary to explore modern methods for signal processing, feature extraction, and model development. The AI Pillar team is dedicated to analyzing the existing methods by applying them to datasets collected by HABS. One of the state-of-the-art approaches — **Brain Network**.

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

