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

From the adjacency matrix *A* we can define *degree matrix D*, a diagonal matrix where each entry $$D_{ij}=d_{i}$$ corresponds to the degree of node $$v_{i}$$ i.e., the number of edges connected to it.
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
   The authors used the following bipolar pairs:  
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

The following factors typically influence the choice of this parameter:

1. Analysis objective:
   - If the signal contains fast events (e.g., artifacts, stimuli), and the goal is to make predictions related to those events, **shorter windows** (up to ~5 seconds) are generally preferred.
   - If the goal is to capture **more stable patterns** (e.g., background brain activity, neurophysiological traits), **longer windows** (5–30 seconds) tend to be more reliable.
2. GCNNs operate on features derived from **inter-channel connectivity**, which are more stable and meaningful over longer time windows.
3. Longer windows also provide **better spectral resolution**, as defined by the formula:

$$
\Delta f = \frac{1}{T}
$$

where $$\Delta f$$ is the frequency resolution, and $$T$$ is the window length in seconds.

5. Shorter windows allow for **more training samples**, which can help with data efficiency and generalization in data-driven models.


### Channels functional features
For each time window, functional features are computed individually for each of the \( N \) EEG channels.

In the original version, the authors use **Power Spectral Density (PSD)**, which estimates how the signal's power is distributed across different frequencies.

$$
PSD(f) = \frac{1}{T} \left| \int_{0}^{T} x(t) e^{-2\pi i f t} dt \right|^2
$$

The following six frequency bands are used:

- **Delta** (1–4 Hz)  
- **Theta** (4–7.5 Hz)  
- **Alpha** (7.5–13 Hz)  
- **Lower Beta** (13–16 Hz)  
- **Higher Beta** (16–30 Hz)  
- **Gamma** (30–40 Hz)

For each frequency band total band power is computed based on PSD distribution:

$$
P_{\text{band}} = \int_{f_{\text{low}}}^{f_{\text{high}}} PSD(f) \ df
$$

As a result, each window yields a feature matrix $$H$$ of size $$N = 8 \times K = 6$$, where each row corresponds to a channel, and each column to a frequency band.

![EEG-GCNN Functional Features](articles/images/gcnn-functional.png)

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

The second part of the feature engineering process in the EEG-GCNN model involves computing features that describe **inter-channel relationships** for each time window.  
From the graph perspective, these relationships are encoded in the **adjacency matrix $$A$$)**, as previously introduced.

The authors propose to construct $$A$$ by averaging two separate adjacency matrices:

$$
A_{ij} = \frac{1}{2} \left( A_{ij}^{s} + A_{ij}^{f} \right)
$$

1. **Geodesic Distance-Based Adjacency**  
   Reflects the **spatial proximity** between EEG electrodes on the scalp, calculated as the angle between electrode positions in 3D space:

$$
A_{ij}^{s} = \arccos \left( \frac{x_i x_j + y_i y_j + z_i z_j}{r^2} \right)
$$

where $$(x_i, y_i, z_i)$$ and $$(x_j, y_j, z_j)$$ are 3D coordinates of electrodes $$i$$ and $$j$$, and $$r$$ is the radius of the spherical head model.

2. **Spectral Coherence-Based Adjacency**  
   Measures the **functional connectivity** between EEG channels based on frequency-domain coherence of their signals:

$$
A_{ij}^{f} = \frac{ \left| E[S_{ij}] \right| }{ \sqrt{ E[S_{ii}] \cdot E[S_{jj}] } }
$$

Here, $$S_{ij}$$ represents the cross-spectral density between signals from electrodes $$i$$ and $$j$$, and $$E[\cdot]$$ denotes the expected value (typically estimated via averaging over frequency bands).

Below are examples of alternative connectivity features to be used:

1.  **Pearson / Spearman Correlation** - measures of codependence between signals
2.  **Phase Locking Value** - shows how stable the phase difference between two signals remains over time.
3.  **Mutual Information** - measures how well knowledge of one signal reduces uncertainty about another.

---

## Model

Now that we have defined the **node feature matrix $$H$$** and the **connectivity (adjacency) matrix $$A$$**, we can move on to the model itself.  
The overall architecture is shown below.

![EEG-GCNN Model architecture](articles/images/gcnn-model.png)

The core of this architecture lies in the **Graph Convolution (GraphConv) layers**, which perform convolution operations over graph-structured data.  
Let's take a closer look at this concept.

### Graph convolution
First, let’s recall the core idea behind convolution in image processing:  
For each pixel, a fixed-size window (e.g., 3×3) is taken, and a **convolution operation** is applied using a predefined filter.  
This results in a new value for the **central pixel** in the output feature map.

![Image convolution](articles/images/pixel-convolution.jpg)

Unlike classical convolution — which applies a fixed filter over a local window to produce a feature map —  
**graph convolution** updates each node’s features by **aggregating information from its neighbors** at every layer.

The core operation of graph convolution (in the spectral or message-passing style) is given by the following formula:

$$
H^{(l+1)} = \sigma\left( \hat{D}^{-1/2} \hat{A} \hat{D}^{-1/2} H^{(l)} W^{(l)} \right)
$$

where:
- $$H^{(l)}$$ — node features at layer $$l$$,
- $$\hat{A} = A + I$$ — adjacency matrix with self-loops added,
- $$\hat{D}$$— degree matrix of $$\hat{A}$$,
- $$W^{(l)}$$ — learnable weight matrix at layer $$l$$,
- $$\sigma$$ — non-linearity (e.g., ReLU).

> To simplify, consider a graph of **three nodes**, all connected with each other.  
Assume each node is described by **two features**. Below are the matrices $$A$$ and $$H$$. Using the formulas from the **graph theory section**, we can also write the convolution operation using the **normalized adjacency matrix**.
![Graph](articles/images/graph-with-values.jpg)
![Graph parameters](articles/images/graph-equations.jpg)
Based on the graph convolution formula, we can now illustrate — in a simplified way — how the features of **node 3** are updated in the next layer, (For simplicity, we omit the weight matrix and the non-linear activation function.)
![Feature update](articles/images/node-update.jpg)
Thus, we can clearly see that at each layer, **nodes "exchange" information with their neighbors** and **update their feature representations** accordingly.
>
In previous explanation, we omitted the **weight matrix** and **non-linearity** for simplicity.  
However, their role is essential for the model's learning capability:

- The **weight matrix** $$W^{(l)}$$ allows the model to **learn which features and connections are more important**, and which are less relevant.  
  This enables the network to model **real dependencies** in the data during training.

- The **non-linearity** $$\sigma$$ (such as ReLU) is necessary, just like in many other machine learning models, to allow the network to learn **complex, non-linear relationships**.  
  Without it, the entire model would collapse into a linear function, which is insufficient for modeling real-world data.

### Predictions 

The model makes predictions **for each individual window** of the EEG signal.  
(In the original paper, the task is to predict whether the EEG segment belongs to a healthy or a diseased subject.)

To obtain **patient-level predictions**, a simple aggregation strategy can be applied:
- For **classification**, majority voting across all windows.
- For **regression**, averaging the predictions over all windows.

### Performance
Classification dataset - сombination of TUAB and MPI LEMON (data imbalance taken into account in performance metrics):
- 203,616 diseased windows
- 21,718 healthy windows
  
For evaluation of the model, the authors propose the following scheme:

![Image convolution](articles/images/gcnn-evaluation.jpg)

To evaluate performance, the model was tested in two configurations:  
- **Deep EEG-GCNN** (with more layers)  
- **Shallow EEG-GCNN** (with fewer layers)  

Both versions were compared against a fully connected neural network (**FCNN**) and **Random Forests**.  
The results are presented in the table below:

| **Model**            | **AUC**         | **Precision**    | **Recall**       | **F1**           | **Bal. Accuracy** |
|----------------------|------------------|------------------|------------------|------------------|-------------------|
| FCNN                 | 0.71 (0.08)      | 0.94 (0.02)      | 0.66 (0.11)      | 0.77 (0.08)      | 0.66 (0.07)       |
| Random Forests       | 0.80 (0.01)      | 0.95 (0.01)      | 0.79 (0.08)      | 0.86 (0.05)      | 0.74 (0.02)       |
| **Deep EEG-GCNN**    | **0.90 (0.04)**  | **0.99 (0.00)**  | 0.74 (0.08)      | 0.84 (0.06)      | **0.85 (0.04)**   |
| **Shallow EEG-GCNN** | **0.90 (0.02)**  | **0.99 (0.01)**  | 0.72 (0.07)      | 0.83 (0.04)      | **0.83 (0.02)**   |

---

## Conclusion

Modeling EEG signals as graphs and applying graph convolution mechanisms has proven to be an effective approach.  
It also offers **high flexibility and interpretability** due to the ability to vary both **functional** and **connectivity-based features**, making the architecture easily adaptable to a wide range of EEG-related tasks, such as **emotion detection** or **neurophysiological factor classification**.

The model’s effectiveness is confirmed by its **significant performance advantage** over fully connected neural networks (FCNN) and Random Forests in the task of classifying healthy vs. diseased subjects.

However, the model has some limitations:

1. **No artifact removal** was applied in the original version, which may negatively affect predictions — especially in low-channel or noisy EEG recordings — despite GCNN's theoretical robustness to such artifacts.

2. **A fixed, pre-defined adjacency matrix** is used at each graph convolution layer.  
   This limits the model’s ability to account for subject-specific variations in connectivity or signal features.

---

## Future Directions

- Explore **dynamic graphs**, where adjacency matrices vary over time or across subjects.
- Integrate **attention mechanisms** to learn edge weights directly during training.
- Combine GCNNs with **temporal models** (e.g., Transformers) to capture dynamics across windows.


---

## References

Kipf, T. N., & Welling, M. (2016). *Semi-supervised classification with graph convolutional networks*. arXiv preprint arXiv:1609.02907.  
https://arxiv.org/abs/1609.02907

Wagh, N., & Varatharajah, Y. (2020). *EEG-GCNN: An EEG-based graph convolutional neural network for classification of brain states*. In *Proceedings of the 3rd International Conference on Machine Learning and Data Engineering (ICMLDE 2020)*.  
https://proceedings.mlr.press/v136/wagh20a.html

Wagh, N. (2020). *EEG-GCNN (Code repository)*. GitHub.  
https://github.com/neerajwagh/eeg-gcnn

Bronstein, M. M., Bruna, J., Cohen, T., & Velickovic, P. (2021). *Understanding Graph Neural Networks*. Distill.  
https://distill.pub/2021/understanding-gnns/

