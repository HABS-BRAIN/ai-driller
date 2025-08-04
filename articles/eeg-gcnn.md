# EEG Graph Convolutional Neural Network

**Author**: Anton Orlovskii  
**Date**: July 31th 2025

![Convolution?](articles/images/convolution_fun_definition.png)

## Introduction
While studying state-of-the-art methods for EEG signal analysis, we encountered a wide range of machine learning models and feature extraction techniques — from statistical features derived from the time series of each channel (such as Power Spectral Density or Differential Entropy) and inter-channel relationships (e.g., Brain Network) to "black-box" approaches based on transformer-based architectures (such as EEGPT, LaBraM, and EEG-Conformer). However, a compromise between interpretability and architectural complexity has been lacking. A potential candidate to bridge this gap could be the Graph Convolutional Neural Network (GCNN) architecture, which is based on the concept of Graph Convolution presented by T.N. Kipf, M. Welling in 2016. We will consider the model implemetation EEG-GCNN proposed by N. Wagh, Y. Varatharajah (2020).

---

## Graph theory reminder
A Graph *G = (V, E)* consists of a set of nodes *V* and edges *E*.
Each node and edge can carry its own set of features.
For example, in the context of EEG signals, the nodes may correspond to EEG channels, each described by a set of features (e.g., Power Spectral Density (PSD) across different frequency bands).
Edges can represent the connections between channels, such as the degree of correlation between signals from two channels.

![Example of a graph](articles/images/graph_example.png)

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
To prepare the EEG data for GCNN input, a minimal and standardized preprocessing pipeline was applied designed to preserve the clinical realism and structural characteristics of the signals:

1. **Selection of a common subset of bipolar montage electrodes (8 channels):**  
   The following bipolar pairs were used by the authors:  
   - F7–F3, F8–F4  
   - T7–C3, T8–C4  
   - P7–P3, P8–P4  
   - O1–P3, O2–P4
     
   This set provides broad spatial coverage across temporal, parietal, and occipital regions, with good left–right symmetry.

2. **Resampling to 250 Hz:**  

3. **High-pass filter at 1 Hz:**  
   Removes slow drifts and low-frequency artifacts such as movement-related noise or baseline wander.

4. **Notch filter at 50 Hz:**  
   Suppresses power line interference.

> **No artifact removal (e.g., ICA or manual rejection) was applied.**  
> This choice was intentional by the authors, to better reflect real-world clinical conditions where manual preprocessing is often impractical or unavailable.  
> Additionally, GCNNs are designed to extract robust spatial and functional patterns, and are capable of down-weighting localized artifact spikes in favor of more stable and distributed features.

### Windowing the EEG Signal

After preprocessing, the signal is segmented into windows of length *t*.  
The authors chose a window length of *t* = 10 seconds.

The choice of this parameter is typically influenced by the following factors:

1. Analysis objective:
   - If the signal contains fast events (e.g., artifacts, stimuli), and the goal is to make predictions related to those events, **shorter windows** (up to ~5 seconds) are generally preferred.
   - If the goal is to capture **more stable patterns** (e.g., background brain activity, neurophysiological traits), **longer windows** (5–30 seconds) tend to be more reliable.
2. GCNNs operate on features derived from **inter-channel connectivity**, which are more stable and meaningful over longer time windows.
3. Longer windows also provide **better spectral resolution**, as defined by the formula:

     $$\Delta f = \frac{1}{T}$$

     where $$\Delta f$$ is the frequency resolution, and $$T$$ is the window length in seconds.

4. Shorter windows allow for **more training samples**, which can help with data efficiency and generalization in data-driven models.


### Channels functional features
For each time window, functional features are computed individually for each of the \( N \) EEG channels.

In the original version, the authors use **Power Spectral Density (PSD)**, which estimates how the signal's power is distributed across different frequencies.

The following six frequency bands are used:

- **Delta** (1–4 Hz)  
- **Theta** (4–7.5 Hz)  
- **Alpha** (7.5–13 Hz)  
- **Lower Beta** (13–16 Hz)  
- **Higher Beta** (16–30 Hz)  
- **Gamma** (30–40 Hz)  

As a result, each window yields a feature matrix $$H$$ of size $$N = 8 \times K = 6$$, where each row corresponds to a channel, and each column to a frequency band.

Below are examples of alternative features that can be used instead of or in addition to PSD (as each channel might have multiple features extending the feature space):

1. **Time-domain features:**
   - **Mean** – average amplitude of the signal.
   - **Variance** – reflects amplitude variability.
   - **Skewness** – asymmetry of the signal distribution.
   - **Kurtosis** – sharpness or peakedness of the signal distribution.

2. **Hjorth Parameters** – describe the shape and temporal dynamics of the signal:
   - **Activity** – signal variance (overall power).
   - **Mobility** – estimate of average frequency (ratio of variances).
   - **Complexity** – how the frequency content changes over time; deviation from pure sinusoidal behavior.

3. **Entropy-based features:**
   - **Shannon Entropy** – randomness or uncertainty in the signal’s amplitude distribution.
   - **Spectral Entropy** – entropy of the power spectrum; measures how spread-out the frequency content is.

4. **Differential Entropy** - logarithmic measure of signal power for continuous-valued data.

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
- EEG-GCNN github
> https://github.com/neerajwagh/eeg-gcnn 

