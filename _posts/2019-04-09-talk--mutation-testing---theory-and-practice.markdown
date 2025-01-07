---
title:	"Talk: Mutation Testing – Theory and Practice"
date:	2019-04-09
tags: [programming, python, testing, mutation-testing]
author: Anders Hovmöller
---

  I did a talk about mutation testing that is now [up on youtube](https://www.youtube.com/watch?v=yI8Yje1XDkk). It's pretty short at ~20 minutes excluding the live demo.

As is often the case, the live demo didn't go very well. I managed to figure out the problem: the library I worked on has Cython parts and I didn't force it to use the pure python version of the code. If I did it again I would first delete all the .so files and it would work fine 🤷‍♂️

Hope you like the rest of the talk!
