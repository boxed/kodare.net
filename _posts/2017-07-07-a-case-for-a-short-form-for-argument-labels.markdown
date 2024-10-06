---
title:	"A case for a short form for argument labels"
date:	2017-07-07
tags: [programming, python]
---

  This article is based on statistics I've collected on Swift and my anecdotal experience with Python. I haven't collected statistics on Python because it's a lot more messy to do so than with Swift.

### Labels are great

Labels for arguments (or "keyword arguments" as they are called in Python) are something I use as much as I can. I find they increase the robustness of the code in the face of changes like removing arguments and other refactorings. That's one reason I've always defended Objective-C in arguments (so many people hate the square brackets!), and it's nice to see this significant advantage being moved forward to Swift, and even improved (although swift removes the labels when using functions as variables which is weird and I think grossly mistaken).

In Python you have this dichotomy in that you get both keyword arguments and positional arguments by default when declaring a function. Mostly this is good because you get labels everywhere but it can be a bit confusing to beginners of the language.

### Labels have a problem

The problem with labeling everything is verbosity. One tends to end up with a lot more characters than using positional arguments. In Python this creates a pressure to prefer positional because it's shorter to type and read. I've seen lots of code that looks like:

```python
foo(bar, baz)
```

when it would be better if it was:

```python
foo(bar=bar, baz=baz)
```

In Swift you don't get the choice but always have to write the latter (with = exchanged for : but otherwise it's the same).

At this point you might think "why is that better?" In Python it's important to avoid subtle bugs after refactoring for example, and it also makes it vastly easier to refactor when you are sure your call sites will crash if they are incorrect and not just pass variables into the wrong input of a function. In statically typed languages this is less of a problem because of types, but they only protect you fully from mistakes if all the argument types are unique, now and in the future. Names are always unique.

### How big is the problem?

I'm going to define "the problem" as


> How often do people write overly verbose code or use hacks to cut down on verbosity in ways that hurt the robustness to changes or readability?Since you always have to write the labels in Swift, it's very easy to find out how often this happens. Because you don't need to in Python, I'd have to look at all call sites and compare them to the matching signature, which is a bit of a pain in a dynamic language such as Python, so I've opted to just do the analysis on Swift and assume it's much worse for Python :P

### Analysis

I've used some super hacky code based on regexes to find these problems in a bunch of open source Swift projects. [The source is on GitHub](https://github.com/boxed/Swift-keyword-arguments-research). I've classified the problems into different buckets:

1. Matching: the label and argument matches exactly (ignoring case), e.g. "foo: foo"
2. Partial: the argument is contained within the label, e.g. "fromFoo: foo". This is to cover older Objective-C style APIs where the name of the function spills over into the labels. This category probably includes some false positives, I didn't look too closely.
3. One character prefix: e.g. "foo: f"
4. One character: e.g. "foo: w"
5. Non-matching: e.g. "foo: bar" or "foo: 1"
I consider classes 1, 2 and 3 to be problematic. Class 4 is obviously problematic in itself in most cases.

I ran this code on 11 apps and 10 libraries (including Swift itself). The full results are [on GitHub](https://github.com/boxed/Swift-keyword-arguments-research), but the short of it is that the results range from 34% (Charts) to 13% (FlappySwift) for categories 1–3 combined. For the full matching category (1 above) it ranges from 20% (Charts) and 2.3% (FlappySwift).

I was expecting libs to have more matching labels and arguments due to higher abstractions and games to have the lowest due to having lots of setup and hard coding of values. The first is clearly wrong, but the second seems at least plausible.

### What to do?

I really like the solution OCaml has: labeled arguments look like "~label: value" but there's a short form "~label_and_value". That syntax won't work for Python and Swift obviously but it's nice in that it shows that it's still labeled argument while removing redundancy. I'd like to see something like that in Swift and Python. Maybe `foo(:bar)` (as a short form for `foo(bar:bar)`) for Swift and `foo(=bar)` (as a short form for `foo(bar=bar)`) for Python.

This seems rather feasible because both my suggested syntaxes are invalid or call site errors in Swift and Python today so they wouldn't break existing code.
