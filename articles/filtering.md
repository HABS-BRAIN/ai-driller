# EEG pre-processing methods

**Author:** Arthur de Leusse  
**Date:** July 15th 2025

## 1) Motivations

As discussed in our previous blog “Attention models for EEG signals processing”
EEG signals are hard to work with. Indeed, they have a low signal to noise
ratio, they vary a from a person to another and they are filled with muscle
and movement artifacts. Hence, finding a good pre-processing method is crucial
in neuro-markers identification. This post aims to provide an overview of the
state-of the art methods for EEG filtering.

## 2 Wavelet Transfrom (wt)

# 2.1 Time and Frequency Duality

In 1807 Jean Baptiste Joseph Fourier, a French mathematician, introduced the
Fourier series, a way of representing any periodic function as a sum of sine and
cosine functions.
Later, mathematicians introduced a generalization of Fourier’s work to non-
periodic ones. This mathematical tool was named the Fourier Transform (FT).
The Fourier Transform is a massive revolution in signal processing. However,
it has one main challenge, the loss of the time information. This is where the
wavelet transform kicks in.

# 2.1.1 Wavelet transform

The wavelet transform is a tool that allows us to decompose a signal into a set
of simple oscillating functions, called a proper wavelet.
What is a proper wavelet? A proper wavelet is a wavelet ψ(t) which
must satisfy the following two conditions:

![Wavelet Transform Example](articles/images/image_wt.png)

1. **Finite energy:**  
   $\displaystyle \int_{-\infty}^{\infty} |\psi(t)|^{2}\,dt < \infty$  

   This ensures that $\psi(t) \in L^{2}(\mathbb{R})$, meaning the wavelet has finite energy and is square‑integrable.
   
2. **Zero mean:**  
   $\displaystyle \int_{-\infty}^{\infty} \psi(t)\,dt = 0$  

   This condition ensures that the wavelet has no DC component.  
   It captures local variations in the signal, being sensitive to changes but not to constant trends.


# What do we mean by best fitting wavelet? 

We can squeeze the wavelets with a scaling coefficient a. Thus, for all values of t, we compute the dot product
for all values of a and see which is the one that returns the highest value. This
gives us a duality for time and frequency.

| Magnitude \\ Sign | **Positive** | **Negative** |
|-------------------|--------------|--------------|
| **Large** | Strong match with wavelet shape  <br>(same polarity) | Strong match with inverted wavelet  <br>(opposite polarity) |
| **Small** | Weak similarity to wavelet shape  <br>(slight positive correlation) | Weak similarity to inverted wavelet  <br>(slight negative correlation) |


# What do we mean by best fitting wavelet?

We can squeeze the wavelets with a scaling coefficient a. Thus, for all values of t, we compute the dot product
for all values of a and see which is the one that returns the highest value. This
gives us a duality for time and frequency.

## 3 Independent component analysis (ICA)
We are going to explain this method through the cocktail party problem. Let’s
imagine that we have a room with some microphones and people enjoying a
party. We would like to extract from the ambient noise a specific conversation.
To do so, we will have some important assumptions.

# 3.1 Original setup for ICA
First, we assume that the observed sources are built through a mixing matrix
and a set of source vectors. Mixing model:

$\mathbf{X} = \mathbf{A}\mathbf{S}$  

* $\mathbf{X} \in \mathbb{R}^{n \times T}$ : observed signals ( $n$ sensors, $T$ time points)  
* $\mathbf{A} \in \mathbb{R}^{n \times m}$ : mixing matrix  
* $\mathbf{S} \in \mathbb{R}^{m \times T}$ : source signals (independent components)  

Independent Component Analysis assumes the sources  
$\displaystyle \mathbf{S} = [s_1(t),\, s_2(t),\, \dots,\, s_m(t)]^{\top}$ are  

* **Statistically independent**:  
 $p(s_1, s_2, \dots, s_m) = \prod_{i=1}^{m} p(s_i)$

* **Non‑Gaussian**:  
 $\exists, i \in {1,\dots,m}\ \text{such that}\ s_i(t) \not\sim \mathcal{N}(0,\sigma^{2})$

# 3.2 Goal of ICA  

The goal of ICA is to find a matrix $W$ such that  
$\mathbf{s} = W\mathbf{x}$, with $\mathbf{x}=A\mathbf{s}$, hence $W = A^{-1}$.  

Finding $W$ thereby recovers the matrix of independent sources $\mathbf{s}$.  
In our example, the different sources are the voices of our guests. Nevertheless, recovery is subject to certain ambiguities.


# 3.3 Ambiguities of ICA  

ICA has two main ambiguities.

# 3.3.1 Permutation ambiguity  

Let’s assume $P$ is a permutation matrix (i.e., a matrix with for each row and
each column exactly one 1. If $\mathbf{z}$ is a vector, $P\mathbf{z}$ is another vector for which
the coordinates of  $\mathbf{z}$ are permuted. Thus if we are only given X,$\mathbf{X}$, it would be
impossible to distinguish $W$ and $PW$.

# 3.3.2 Sign and Scale Ambiguity

If A was replaced by $2A$ and $S$ was replaced by $\mathbf{S/2}$, then our final result would
still be the same for $\mathbf{W}$. More broadly, if our matrix $A$ is scaled by a factor
α and the matrix of sources s is scaled by a factor 1/α, then it is not possible
only given $\mathbf{X}$ to know it has happened.

# 3.4 Finding W

The algorithm used to find  $\mathbf{W}$ contains five main steps. Note: there are multiple
algorithms that offer solutions to find back  $\mathbf{W}$, here we are going to discuss
an algorithm by Bell and Sejnowski. We will give an interpretation of their
algorithm as a method using the maximum likelihood estimator.

# 3.4.1 Step 1: Assume that the sources follow a non-gaussian distribution
Let us assume that the density of each source si is given by ps(x) and that the
joint distribution of the sources s is given by:
$p(s) = \displaystyle \prod_{j=1}^{d} p_s\bigl(s_j\bigr).$

# 3.4.2 Step 2: Change of variable – express $\mathbf{p(x)}$
Since $s$ =$\mathbf{Wx}$, the density of $x$ becomes:
$p(x) \;=\; p(s)\,\lvert\det(W)\rvert \;=\; \displaystyle \prod_{j=1}^{d} p_s\!\bigl(w_j^{\mathsf{T}} x\bigr)\,\lvert\det(W)\rvert.$

# 3.4.3 MLE in order to find W
The MLE is a method used to recover the value of an estimator. The main
idea is to find the value of your estimator for which the likelihood value is at its
maximum. . The likelihood function $\displaystyle \mathcal{L}(\theta) \;=\; \prod_{t=1}^{T} p\bigl(x^{(t)} \mid \theta\bigr)$
is a function which computes how well the statistical model measures fits the
observed data, it is derived from the joint probability of the random variable
which presumemably generated the data. In our case the joint probability if
given below :
$p(x) = p(s)\,\lvert\det(W)\rvert = \displaystyle \prod_{j=1}^{d} p_s\!\bigl(w_j^{\top} x\bigr)\,\lvert\det(W)\rvert$
We compute the log-likelihood since it ”transforms” the multiplication by a sum
and sums are easier to derive. We then perform the gradient descent algorithm
to find the  $\mathbf{W}$ that maximizes the likelihood.

# 3.4.4 Step 5: Recover sources
Once the algorithm converges:
$\mathbf{s}^{(i)} = W\,\mathbf{x}^{(i)}$

# 4 Combining models
In the current state-of-the-art terms of EEG preprocessing, researchers use
pipelines of filters. These pipelines have different layers, each with its filtering
method, and thus dedicated purpose. To illustrate this idea of pipeline, we will
discuss the Harvard Automated Processing Pipeline for Electroencephalography
(HAPPE), which is Harvard’s main pipeline for EEG-signal preprocessing.

# 4.1 Step 1: Basic filtering cleaning
The basic steps of the pipeline include a bandpass filter (Band-pass filtering is a method that excludes electrical activity above and below certain
frequency thresholds, outside the range in which the brain typically operates), a removal of the
frequencies of electric activities made by the device that records the EEG, and
removal of bad channels.

4.2 Step 2: ICA
For our EEG channels we perform an ICA, having as output a set of source
vectors $\mathcal{S}_{I}$ where :

$\mathcal{S}_{I} \;=\; \{\, s_{i1},\, s_{i2},\, \dots,\, s_{ij},\, \dots,\, s_{it} \,\}$
Each vector $s_i \in \mathbb{R}^n$ represents a source from the recorded electric activity.

# 4.3 Step 3: wt on the different sources of the ICA
For each source $s_{ij} \in \mathcal{S}_{I}$ , we apply a Wavelet Transform :

$\mathcal{W}_{\psi}[\bm{s}_{i}](a, b)
 = \int_{-\infty}^{\infty}
   \bm{s}_{i}(t)\,\frac{1}{\sqrt{|a|}}\,
   \psi\!\left(\frac{t-b}{a}\right)\,dt$

where ψ is the mother wavelet, a is the scale (inverse frequency), and b is the
translation (time shift). This decomposition allows us to remove artifacts from each source. Then all the components are of the time series and are translated back into EEG format using a method by Castellanos and Makarov, 2006.

# 4.4 Step 4: ICA + DNN for noise sources identification
On these EEG sources, we perform an ICA. Then for each of the ICA sources
we compute these 6 features:
$\displaystyle
\mathbf{s}_{k} \;=\;
\begin{bmatrix}
\text{Mean Local Skewness}^{\,1} \\[4pt]
\text{Alpha Power}^{\,2} \\[4pt]
\lambda^{\,3} \\[4pt]
\text{Fit Error}^{\,4} \\[4pt]
\text{Range Within Pattern}^{\,5} \\[4pt]
\text{Current Density Norm}^{\,6}
\end{bmatrix}$
1Detects temporal outliers in the time series.
2Average log power in the 8–13 Hz alpha band.
3Deviation from the 1/f spectral profile.
4Error of spectral fit in 8–15 Hz range.
5Topographic spread across scalp.
6Inverse model complexity estimate.
