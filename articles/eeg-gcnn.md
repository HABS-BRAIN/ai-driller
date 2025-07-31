# EEG Graph Convolutional Neural Network

**Author**: Anton Orlovskii  
**Date**: July 31th 2025

![Convolution?](articles/images/convolution_fun_definition.png)

## Introduction
While studying state-of-the-art methods for EEG signal analysis, we encountered a wide range of machine learning models and feature extraction techniques — from statistical features derived from the time series of each channel (such as Power Spectral Density or Differential Entropy) and inter-channel relationships (e.g., Brain Network) to "black-box" approaches based on transformer-based architectures (such as EEGPT, LaBraM, and EEG-Conformer). However, a compromise between interpretability and architectural complexity has been lacking. A potential candidate to bridge this gap could be the Graph Convolutional Neural Network (GCNN) architecture, which is based on the concept of Graph Convolution presented by T.N. Kipf, M. Welling in 2016.

---

## Graph theory reminder


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

