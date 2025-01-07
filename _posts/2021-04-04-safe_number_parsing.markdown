---
title: Safe number parsing
date: 2021-04-04 
tags: [programming, python, testing, mutation-testing]
author: Anders Hovmöller
---

`12.34` is *not* `1234`. I don't care if your thousand separator is `.`

At a previous job we had an incident once with too loose number parsing. This is my advice on how to parse numbers when it matters. First I'm going to describe how our existing number parsing failed (after running successfully in production for 14 years!), then how we solved it. 

## Almost good parsing == bad parsing

The basic problem is that number formatting is far from agreed upon. These are examples of the *same number*:

- `123456.78`
- `123456,78`
- `123,456.78` 
- `123 456,78`
- `123.456,78`
- `123'456,78`
- `123'456.78`
- `123.456'78`
- `123,456·78`
- `12,3456.78`  <- Chinese usage of ten thousands separator!
- `123_456.78`  <- many programming languages including Python

The parser we used handled most of these cases with these simple rules:
- A configuration option to select comma or period as decimal separator
- Throw away comma if period is the decimal separator, and throw away period if comma is the thousands separator
- Throw away space (and non-breaking space) and `'`

## The incident

The configuration for decimal separator was incorrect for one file format for one customer. This caused numbers like `123,45` to be parsed as `12345`. That's two orders of magnitude. Quite bad, but that's not the bad part. `123.456.789,12` would be parsed as `123.45678912`. These broken numbers trickled through various systems causing trouble for our customers.

This configuration choice was made by many different people, many times a day. This mistake was made many times, and caught and fixed many times before there were big consequences for our customers. But eventually your luck runs out. 

## The systematic problems

Problem 1: These mistakes were not considered a flaw of the system, but as human error. This type of thinking leads to a dangerous situation where humans must always be flawless and if they are not it's the humans who are to blame. This thinking guarantees failure. 

Problem 2: The team using the system were too distant from the developers. We had many small scale projects to try to fix this and every time developers spent time with the other team we found many problems with the system. 

## The fix

The configuration option was kept. But instead of throwing away thousands separators, we validated that they come in groups of three (we didn't bother supporting Chinese style ten thousands separators). We also validated that you can't have a thousands separator *after* the decimal separator. After this change any mistake in setting the decimal separator is immediately caught as an error, instead of causing data quality errors downstream.

Changing the way parsing numbers is done in a service which is critically important for the entire financial system was scary though. This was by far the most scary change I had made to the product in several years. Failure was not an option. 

To make sure this went smoothly I improved the test suite with adversarial examples that the old code failed on, and manually tried a bunch of big datasets and checked the results. After this was done I still didn't feel comfortable with this change! The next step was that I wrote [an implementation](https://github.com/boxed/scientist) of the Ruby library [Scientist](https://github.com/github/scientist), which I ran through my mutation tester [mutmut](https://github.com/boxed/mutmut). This was used to run both the old and the new code for all numbers in production, but using the results from the old code. Any different results between the old and the new parsers was logged. This approach found one minor issue with my new code, and many issues with the old code. After a few days I was confident that the new code would fix much more than it could break and I switched over. It has been running for two years without problems.


## Python int() and float() are potentially dangerous

Float and int Parsing in Python 3 was changed to be the same as the programming language:

```pycon
>>> int('123_45_6_7_8')
12345678
>>> float('123_45_6_7_8.1_4_5')
12345678.145
```
This dangerous change was introduced with little discussion. Be careful when using this as a parsing method.
