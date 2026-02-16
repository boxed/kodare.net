---
title: AI and readable APIs
date: 2026-02-16
tags: [programming, python, django, iommi, documentation]
author: Anders Hovmöller
---
In the AI age the importance of readable APIs goes up, as this can mean the difference between not reading the code because it's too much, and easily reading it to verify it is correct because it's tiny. It's been pretty clear that one of the superpowers of AI development is that it happily deals with enormous amounts of boilerplate and workarounds in a way that would drive a human insane. But we need to be careful of this, and notice that this is what is happening.

High level APIs with steep learning curves (like [iommi](https://iommi.rocks)) are now just as easy to use as simpler APIs, since the cost of initial learning is moved from the human to the AI. Since we also invested heavily in great error messages and validating as much as possible up front, the feedback to the AI models is great. We've been banging the drum of "no silent fixes!" for a decade, and nothing kills human or AI productivity as silent failures. 

This is the time to focus our attention as humans to making APIs that are succinct and clear. It was vital before, but it's growing in importance for every day.
