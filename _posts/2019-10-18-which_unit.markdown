---
title:	"Unit tests are nice... but WHICH unit?"
date:	2019-10-18
tags: [programming, python, testing, pytest, mutation-testing]
---

I've recently begun to be bothered by a pattern I haven't really thought about before: unit tests are just a pile of stuff to the side of your code and aren't connected to the *unit* they are supposed to test (at least in any unit testing system I've seen, examples to the contrary are welcome!). 

Why is this a problem? Well for me it seems like if I have a "unit" of some kind, let's say a function, then I would like to be able to run the tests for that function. I might currently know which tests to run, but storing that data in your brain doesn't scale even to yourself in a few weeks. In well structured code I might be able to just run the tests for that module, but then I'll be testing all the other functions I didn't change. If I have a tool that does coverage analysis to know which tests touch the function, I can run those. But some of those tests might surely be *indirect* uses of the function and are irrelevant. Or at least less relevant and should be run after.
 
This pattern has been bothering me more and more because I maintain a [mutation tester](https://mutmut.readthedocs.io/) and a problem I have there is that running time scales exponentially with the size of the code base. It really doesn't matter how fast your tests are, the exponential curve will get you. The only mitigation strategy I've seen is to break the code base up into smaller and smaller repositories. This seems like overkill to me, and isn't good marketing for mutation testing: "just break out every function into it's own repo!" ... yea no thanks. 

Many mutation testers have a system that looks at coverage data to cut down on running irrelevant tests, but that's a band aid. It scales better, but it has the same problem. If we change a function `f()` then we should run the tests for function `f()`, not the tests for `f()` PLUS all the tests for all functions that call `f()` (well.. unless we really do want to do that because we're paranoid). Think of it this way: what if the entire standard library test suite was also included? Maybe `f()` calls a function that calls a function that calls the `startswith()` method on a string? If we change `startswith()` should we rerun the tests for `f()`? Probably not! 

The reason coverage based mutation testing works is because it takes a VERY bad situation and turns it into a bad situation. An improvement sure, but still bad. We don't really want to know which tests directly, indirectly, or accidentally, hit some function. We want to know which tests *test that function*. If we are serious about thorough tests then the tests for a unit should test that unit exhaustively. That's what mutation testing is all about!

I've written a little hack for pytest that sort of does this but extremely naively. It's called [pytest-test-this](https://github.com/boxed/pytest-test-this).
