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
