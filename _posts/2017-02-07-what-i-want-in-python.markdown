---
title:	"What I want in Python"
date:	2017-02-07
tags: [programming, python]
author: Anders Hovmöller
---

  This is sort of a follow-up to "[Python is still my first language, but…](https://medium.com/@boxed/why-python-is-still-my-first-choice-9780b4f4b2c?source=linkShare-8ad86cc82e5f-1486473582)"

Some of these are easy, some are hard, some might require a transition almost as bad as 2->3 :P

* Keyword arguments by default. You should have to opt in to positional arguments.
* Features to make keyword arguments not just easier, but just as easy as positional arguments. The right thing should be the easy thing! Calling a keyword argument only function like this "foo(a, b, c)" should mean the same as "foo(a=a, b=b, c=c)" instead of just being a crash. This would remove a big chunk of the brevity advantage of positional arguments.
* Immutability by default, with a good transform system (something like [instar](https://github.com/boxed/instar)) while still being super simple to drop back down to mutability. Something like {} for immutable dict and !{} for mutable maybe.
* Declaring functions as pure and having that checked at compile/import time would be great. By pure I don't mean crazy FP style all the way through but just doesn't modify non-local state.
* A sane way to extend classes. The string/bytes classes don't have "remove prefix if present" (and suffix variant) which I want. There's no good place to put stuff like this.
* A memory model that does the right thing regarding threads: any memory you want to change in multiple threads should have to be explicitly marked. You shouldn't be able to accidentally write to the same data with two threads unsynchronized. [PyParallel](http://pyparallel.org) seems to be doing this and getting sort of rid of the GIL limitations at the same time.
* Having a symbol inside a namespace with the same name as the namespace should be banned. datetime.datetime is an abomination :P Most of this is fixed by just having types with proper casing: datetime.DateTime. Pity this wasn't fixed in Python 3.
* A good native GUI lib that the community stands behind. Should be desktop and mobile.
* A really good and comprehensive story for running in the browser. Something that can compete with React, Elm, ClojureScript, etc.
* Better documentation. The documentation is pretty complete and comprehensive but it's written in the form of a book. It should be optimized for reference use and for googling instead (or *also* rendered for reference/google, as in having two different renderings). When googling a function you end up on a page with the entire module, so now you have to search in-page (which most people don't know how to do on iPhones), then to add insult to injury that function has 7 arguments and they are not listed with a description but there's a huge wall of text where the explanation of those parameters are explained somewhere. God help you if you try to use in-page search because you will probably end up somewhere random on the page far away from the function you looked at because it's the entire modules documentation. We shouldn't allow PHP to kick our asses so badly!
Grab bag of some random annoying things:

* ISO8601 parsing. And I mean the entire spec (except the repeating stuff maybe) not just one format.
* A better import hook system. Import hooks do like 10 things. Instead of having a system where each import hook does everything there should be discrete steps that can be hooked separately. And the default implementation must be programmatically callable. This part of Python is a great example of where OOP really falls flat for code reuse and customizability.
* Include some more must have libs like requests (preferably in a way that still allows requests to evolve faster than the release cycle of CPython).
* Official sanctioning, bundling and promotion of tox.
* Local bundle caching in pip. We go out to the internet like crazy for no reason. Java and Maven does this better than Python.
* Better contribution model. At least for documentation it should be much simpler to contribute.
* Repr on lambdas should be the entire source code.
* Regex literals. It's common enough that it's nice to be able to grep for them, and it would make mutation testing more powerful since we can mutate regexes correctly instead of just thinking they are strings.
* "File-like" is not documented explicitly.
* PEP8 line lengths. We've had soft line break technology for decades now. (The "forums and stuff doesn't handle it" argument is the funniest to me: that's an argument against significant white space too :P)
* Something switch-like could clean up some long if-elif-else chains.
* 1-tuples should require parenthesis. It's way too easy to screw this up by mistake and way too hard to find out what went wrong when you did. It's just not worth it.
* \+ for string concatenation isn't great.
* Book publishers taking "Python" literally and putting snakes on the cover. Ophidiophobia (the abnormal fear of snakes) is the most common phobia with something like 30% of adults affected. That's a lot of people to alienate. More covers making obscure Monty Python references would be better.
* Better tooling for declarative programming in the standard lib. The point being that being in the standard lib would promote the use of those tools. I like. tri.declarative and tri.token, because me and a colleague wrote them :P
