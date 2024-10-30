---
title: Running a million empty tests
tags: [programming, python]
---

This question popped up on the Django Discord:

>    Any other tips on how you're running 2,105 tests in less than 2 minutes? My new project's suite of 75 tests is already taking 30 seconds. 

I thought that surely running a million empty tests would be pretty fast, making a point about it's "not the amount of tests, but what the tests are doing". So I created a file with a million empty tests:


```py
with open('tests.py', 'w') as f:
    for i in range(1_000_000):
        f.write(f'def test_{i}():\n    pass\n')
```


And ran this with pytest:


> 5 minutes

That... seemed a bit much to me. Maybe it was just all the printing? `-q` doesn't remove the output per test unfortunately, and `pytest tests.py -q --assert=plain 2>&1 >/dev/null` didn't change the runtime.

I tried the same file with my own test runner hammett:

> 22 seconds

That's better. I wonder what the absolute minimum theoretical time is? After all, hammett is loading the file, inspecting it to find all functions and executing them all, collecting the results and printing a dot in the terminal for each test. 
 
I thought the absolute theoretical would be to just execute `python tests.py`:

> 8.4 seconds

Hmm.,. that seems like a lot to me. 
 
Hammett has a 100% quiet mode `-q`, that must surely be faster than the normal:

> 12.9s

Indeed. That's nice.
 
It is now that I rerun pytest to check what happens and I notice that it peaks at:

> 4.25 gig RAM

That's a lot. Hammett?

> 1.07 gig RAM

Hmm... this is very weird.

`python tests.py`

> 2.7 gig RAM

What?!

I wonder.... if... `python -m tests`:

> 1.1 seconds
> ~500 meg RAM

The difference between `python -m tests` and `python tests.py` is remarkable. 
 
After asking on the Python Discord ConfusedReptile told me that it's the bytecode caching that I missed. Deleting `__pycache__` and running `python -m tests` will make it as slow as `python tests.py`.

Going back with this knowledge, if I remove `__pycache__` first, hammett now goes from 12 seconds to 20 as you would expect. 

So the lesson here is that the parsing of the Python source file can dominate your test execution time if the parsing is needed and the tests are very fast. 
