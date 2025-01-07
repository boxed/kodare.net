---
title:	"Python is still my first choice, but…"
date:	2016-12-22
tags: [programming, python]
author: Anders Hovmöller
---

  Hold on to your hats, this is going to be all over the place.

### Background

I've been doing Python professionally for soon 6 years now. Before that I did C++ professionally for 9 years. My wife thinks I've gone from a super Python fanboy to someone who complains about it a fair bit, so here's some of the things that have made me long for other languages, and some things I really wish were fixed in Python.

First some things I miss from other languages when doing Python:

### Java

I miss the obviousness. "a = b - c" can mean only one thing because you have no operator overloading and no properties. Auto boxing screwed this up a bit though. The handling of circular dependencies is also something that is clearly superior to Python.

### Objective-C

I miss categories (a sane way to extend types). A lot. Always naming arguments is pretty great too.

### JavaScript

I miss running in the browser. There are Python-in-the-browser systems but none has any real mind share and afaik there is no comprehensive framework to build apps with any of them.

### Clojure

I miss the concurrency stuff, reagent, immutability by default. I also miss a good standardized build/test/run entrypoint like leiningen.

### Swift

I miss keyword arguments by default. Sane way to extend types. Speed with almost no effort.

### Elm

I miss a really good browser side story (it falls down in some areas, but it's still pretty compelling).

### What I miss from Python in other languages

* The sheer magnitude and kindness that goes into the standard library. rsplit and lsplit taking an argument for maximum number of splits is my favorite example. It's a super tiny thing but makes life so much easier in so many places. Convenience functions are in fact convenient :P
* The size of the third party library ecosystem. There is really not much of a competition. It's almost the super set of libs written in Python, Fortran and C plus a few ones in other languages. People are writing great pythonic wrappers for non-Python libraries with amazing frequency.
* Significant whitespace. I would also accept that the compiler checked that the indents and braces lined up (if there are indents). I just don't trust indents that a human wrote and a computer hasn't checked anymore.
* Code that reads as English to a surprisingly large extent. Instead of C's "x? y : z" you get "y if x else z" which I find super nice. List comprehensions are also very readable compared to many other languages.
* Python hits a sweet spot between restrictive and flexible for my taste. Lisps are too wild west and C isn't flexible enough.
* Some languages don't have the full set of the primitive data structures dict, list, set. To me that's just crazy.

Any or all of the above (except the size of the third party ecosystem) is enough to make me reject a language without much other consideration. Some languages have convinced me to overlook some of those points for other advantages (Clojure and Elm being good examples) and I'll consider them for specific use cases. JavaScript is the only language I will use that fails on ALL points, spectacularly, because you really don't have much choice in using it.

### Conclusion

For the time being the only thing other languages can compete on for me are doing things differently or targeting places where Python is weak, since they can't catch up on third party libraries any time soon. I will continue to try new languages but from past experience I'll probably keep coming back to Python pretty quickly.
