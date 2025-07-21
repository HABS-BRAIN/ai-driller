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

