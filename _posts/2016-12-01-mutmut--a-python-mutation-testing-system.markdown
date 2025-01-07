---
title:	"Mutmut: a Python mutation testing system"
date:	2016-12-01
tags: [programming, python, testing, mutation-testing]
author: Anders Hovmöller
---

Skip to "How hard can it be?" if you don't care about the background.

### What is mutation testing?

Mutation testing is a way to be reasonably certain your code actually tests the full behavior of your code. Not just touches all lines like a coverage report will tell you, but actually tests all behavior, and all weird edge cases. It does this by changing the code in one place at a time, as subtly as possible, and running the test suite. If the test suite *succeeds *it counts as a failure, because it could change the code and your tests are blissfully unaware that anything is amiss.

Examples of mutations are changing "<" to "<=". If you haven't checked the exact boundary condition in your tests, you might have 100% code coverage but you won't survive mutation testing.

### Background

I wanted to try out mutation testing for libraries I build in Python so I looked at what was available. I had some ideas for ways of radically speeding up mutation testing based on what [pytest-testmon](https://github.com/tarpas/pytest-testmon) does and adding some ideas of my own on top.

Googling showed me two alternatives:

* Mutpy: a simple system developed as a thesis. Not maintained anymore.
* Cosmic Ray: actively developed.
Both these are Python 3 only which is a bit sad because I'm still on Python 2 for work at least for a year more. But I could live with that since the libs are Python 2 and 3.

Cosmic Ray seemed the more promising so I tried installing it but after struggling just to get the dependencies installed I decided that if it's this hard just to install it probably won't be practical. I looked into the code a bit to see if I could use just the mutation parts as a library but it looked to me like a big monolithic system so I gave up on that.

Next I looked at mutpy. This code is radically smaller and simpler but after struggling to refactor it in some ways to make it even simpler I thought to myself:

### How hard can it be?

Turns out, not that bad! Mostly the building blocks are already available.

I decided that I absolutely wanted a feature both Cosmic Ray and mutpy lacked: being able to apply a mutation on a source file and not screw up the entire file. Cosmic Ray and mutpy use Pythons built in AST library but it has the unfortunate property of not representing formatting in the AST, making it impossible to just dump the AST back out and get the original file. So if I can't use Pythons own AST, what then? Enter [baron](http://baron.pycqa.org/en/latest/), an independently developed Python->AST library specifically created to be able to round trip without changing your source files. Baron doesn't support all of Python 3 syntax yet unfortunately, but it looks like people are working on it.

[EDIT: Since this article I've replaced Baron with Parso and now I fully support Python 3!]

My battle plan was this:

1. Make a mutate function that receives source code and can mutate everything relevant (so you can get a count of available mutations) or a specific mutation specified by an index.
2. Make an import hook so that the file you want to mutate is mutated in memory on the way from disk. This will enable parallelization.
3. Pytest plugin that sets up the import hook and enables you to specify what mutation you want.
4. Make a small command line program that runs through the mutations and checks the output from tests. It should also be able to apply a specific mutation on disk, so when you find an interesting one you can see very easily what the mutant was.

**Point 1** was fairly easy: basically I needed to make sure all AST node types were either not mutated (because it doesn't make sense) or mutated in the most nasty way I could think of. In this step I ran through the code of lots of big open source projects (e.g. django and numpy). I found some parse bugs in baron at this step, but nothing that impacted the code I wanted to run mutation testing on. I just reported the bugs and moved on.

**Point 2** was nasty. It turns out the import hook system in python is pretty shit. The default behavior to load from the filesystem isn't in the list of hooks because it's in C code somewhere, so you can't base an importer on it. That would be ok if the design was ok, but unfortunately the import hook system works like this: Python asks one import hook at a time to import the module. That sounds simple and simple is often good, but importing actually contains these steps:

1. Find the source file
2. Read the source file
3. Convert the source file from text to a runnable module

And all importers must do ALL of the steps. So the zip file importer must do the steps that are the same as the default and it can't just call into the default loader because it doesn't exist as python code. And it also means that if I want to intercept between step 2 and 3 on ALL importers I have to *reimplement all importers*.

This obviously sucks (and might not even be possible, for systems with their own custom importers), but even worse is that implementing an import hook correctly at all is a lot of nontrivial code that is a bloody beast to get right. Supposedly this is somewhat better in python 3 with importlib, so I found a [backport of it to python 2](https://bitbucket.org/ericsnowcurrently/importlib2/) but it was broken. I managed to hack around the crashes but in the end I didn't get my import hook working with that either. I [asked for help on reddit](https://www.reddit.com/r/Python/comments/5e0yfn/import_hook_help_for_mutation_testing_lib/) too, to no avail.

After several hours of fighting this fight I gave up (for now) and just went with disk based mutation. It's not great because it can't be run in parallel but at least it works and it's super simple. It's also very flexible with regards to which test runner you use, since you don't need any plugins that would have to be made for pytest, nose, unittest, etc, one by one. Giving up on this means **Point 3** becomes moot, so that's great.

Basically I should have made this thing first anyway, because it's very good to have :P

**Point 4** was pretty easy. The hardest was finding out how to nicely output continual progress updates on the console :P

### So where do I stand now?

We've run mutmut on [tri.declarative](https://github.com/trioptima/tri.declarative/) and [tri.struct](https://github.com/trioptima/tri.struct) at work and it found several things we didn't test as thoroughly as we thought, even though we had 100% coverage on our tests. For tri.declarative it also found a piece of dead code and an error in correctly creating a plural in an error message. It clearly improved our test suite, even though it didn't find any bugs.

You can probably just [run mutmut right now](https://github.com/boxed/mutmut). It's a pretty simple piece of code and for it to work with your test runner it just requires that it has an exit code of zero for success and anything else for failure. It's pretty slow obviously since it's not parallelized at all and it has to run the entirety of whatever test suite you specify for every mutation (and there are many!).

### What's next?

I still have some work to do. Using pytest-testmon is still on my list, as is solving the import hook system to enable parallelization. Those things alone should be able to give me orders of magnitude faster tests. The goal is to keep the super simple system I have now so that there's always a simple to debug and adapt system that you can use for weird scenarios or debugging.

I also have some ideas for pytest-testmon like being able to keep a central database shared between developers, which could also be used for mutmut so if someone has already tried running a specific mutation for a specific version of a file, you don't have to.
