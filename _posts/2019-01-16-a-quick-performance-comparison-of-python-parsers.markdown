---
title:	"A quick performance comparison of Python parsers"
date:	2019-01-16
tags: [programming, python]
author: Anders Hovmöller
---

After my last [performance measurement of Python code formatters](https://medium.com/@boxed/a-quick-performance-comparison-of-python-code-formatters-3a89478da8b8) I got curious about the parsing part. I've been using [parso](https://github.com/davidhalter/parso) as my parser/AST library for my mutation tester [mutmut](https://mutmut.readthedocs.io) so I was curious about how it stacks up performance wise. The test scenario is the same as in the last article: a 240kloc dry lines proprietary code base.

I tried the built in ast module, even though it's not really relevant for many use cases because it throws away comments and formatting. But it does give a good baseline of performance. The other ones I tried are lib2to3, parso obviously, and blacks vendored fork of lib2to3.

### Results

* ast: 3s !!!
* lib2to3: 1.1m (and it fails on some files)
* blacks fork of lib2to3: 1.2m
* parso: 46s

The most obvious thing is obviously that the built in ast module is extremely fast. Not surprising since it's hand optimized C code but still the contrast is jarring.

As a big fan of parso I was very happy to see it get out ahead here. In my opinion parso has a much nicer API than lib2to3 so it's good news that the nicer API is also the fastest.

I was a bit surprised that blacks lib2to3 fork was that slow. If you remembered from the last article Black formats this code in 46s, so how can just the parsing by itself take 1.2m? I looked at the code and the reason is that Black runs a process pool to run everything in parallel. If I turn that off it clocks in at 2.8m.

It's really a pity that lib2to3 was developed instead of expanding the ast module to preserve formatting I think. Now we get this duplication of effort and the full AST libraries are much slower than they need to be.
