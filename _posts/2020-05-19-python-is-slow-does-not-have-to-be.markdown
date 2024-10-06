---
title: Python is slow - it doesn't have to be
date: 2020-05-19 
render_with_liquid: false
tags: [programming, python]
---

This is a bit of a rant, be warned.

Let me state first that I work in python professionally, I have made many open source contributions, and I do all my hobby projects in python. I love python. 

But it's slow.

It's a common theme on forums like reddit where people say you can't use python because it's slow. Yes, we all know python is slow. But we also know that the thing that normally makes things slow isn't the language, but the algorithm. 

Yes, the language python is very slow compared to C, but that's *not* 99% of why python is slow in practice. Python is slow because many, if not most, python programmers don't care or understand the big picture performance implications of what they are doing. This is mostly ok when writing a web app, but it can have big performance implications if you're writing a library used by a thousand or a hundred thousand or even a million people. 

Let's look at some practical examples of python being slow:

The tools shown here:

* pip is the tool you use to install python libraries
* virtualenv is the tool to create a contained environment so you don't install all packages globally
* pytest is the most widely used test library (maybe unittest from the standard library is more used, but it's at least very close)

I'm picking these tools because these are the first interactions most people have with python, and it's something we professionals interact with on a daily basis.


```
> time pip --version
0.34 seconds

> time virtualenv -p (which python3) venv
6.24 seconds

> time pytest  # in an EMPTY directory
0.32 seconds

> time pip install pytest  # already installed!!!
0.85 seconds
````

These are generous measurements as they are in a fresh environment and with warm caches (I measured over 15s for virtualenv with cold disk caches). If you have a virtual environment with a lot of dependencies the time for `pip install` (again not doing anything) grows. A lot. I measured 2.1s in another project.

The algorithms are the problem here, not python. I mean, when we solve the algorithm problems THEN the language will be the problem and it can never be as fast as a much faster language, but we are an order of magnitude away from that almost everywhere.

I can't stress this enough: the base toolchain of python is an order of magnitude slower than it needs to be. Sometimes more.

## Imports

The idiomatic way to do imports in python is a big problem. In python to use say requests you'd do `import requests` at the top of the file, and most people would think that this is free or close to free. In python it's not free at all, and in fact requests import urllib2 which is the slow part. So people think the import of requests if free, and the authors of requests think the import of urllib2 is free. It's like this everywhere: thousands of people all thinking imports are free. They are not.

The most egregious is a pattern I've seen a few times which is:

```
try:
	import numpy
	NUMPY_AVAILABLE = True
except ImportError:
	NUMPY_AVAILABLE = False
```

and that runs _on import_. When do we use that flag in the library? Often _never_, and numpy is super expensive to import. 200ms on my machine. So we have a huge hit of startup performance of your app for a feature that is not used in the startup path and in many cases not at all.

This is extremely frustrating when developing as you can be restarting the process once a minute on average the entire working day. 

I was glad to see a year back or so that pytz stopped parsing their entire timezone database on import. That cut ~100ms from the startup of Django (arguably the most popular web framework). Now think about how many kWh that little change will save over 10 years. Every time a test is run, every time a web worker is started, on every site that uses Django. And that's just for Django! Lots of other libraries and programs use pytz.

## Death by a thousand paper cuts

The other problem is that people think "oh it's only 10ms on startup, it's no big deal", but if that startup is performed millions of times a day that's suddenly real numbers. This is true for imports, but it's true of many more things too. And the follow up problem is that people think "it's only 10ms more" after having introduced 100 such slow downs already. So now you're just adding 10ms on top of 1 second, which is just 1%. No big deal! So now it's ok to add 10ms more, it's just below 1%. Every time you make it slower, it becomes cheaper, in percent, to make it even slower.

Please don't use this type of logic!

The example for pip install above is a good case study. Loading a dict from disk and checking if it contains the string "pytest" would be less time than the startup time of python (which is ~30ms). But that's not what pip is doing, it's running through the file system and even loading python files to get their version numbers (why? I didn't ask about them! and why aren't they stored in an efficient format anyway?).

In pytest we have a similar problem where performance regressions have been introduced a thousand times, and now everything is slow and there is no obvious way how to get out of this situation. I have contributed some patches, but most of the gains I've made have been wiped out because of other changes that went in while I was working to get the optimizations in!

In the end I gave up on submitting patches and built a new test runner called [hammett](https://github.com/boxed/hammett/) that is somewhat pytest compatible but is way faster. And I do mean [WAY faster](https://github.com/boxed/test-benchmarks). I have hopes that if there is an alternative out there people can see there is a different possible universe where things aren't slow.

## How do we make python faster?

We need to _care_. 

We need to learn that imports are not free.

We need to look at the basic building blocks of the entire ecosystem and either fix the performance problems in basic programs and libraries or replace them. 

We need to measure.

Some places to start:
* pytest: join me in using hammett instead, or urge massive breaks in backwards compatibility in pytest in favor of performance
* pip: at least cache some results! I should be able to run "pip install -r requirements.txt" before every command I execute and not notice it
* virtualenv: I haven't looked into this, but it seems like writing 1218 files totalling 11.6MB should be possible to speed up, or avoid doing some of that work
* Write benchmarks: this is maybe the simplest. You can benchmark tools against comparable tools for other languages for example. We should at least know if we are a hundred times slower than for example java.


## UPDATE:

Turns out the virtualenv guys were already on top of this! Version 20 now takes 0.8s to do the same thing as before took 6.4. The virtualenv team deserves high praise for this!
