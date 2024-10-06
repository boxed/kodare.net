---
title:	"Mutation vs Property Based testing"
date:	2019-04-10
tags: [programming, python, testing, mutation-testing]
---

I came across [this article by Hillel Wayne](https://www.hillelwayne.com/post/contract-examples/) about using Property Based testing to find a bug in a mode function (finding the most common element). The function to test is this:

```python
def mode(l):  
    max = None  
    count = {}  
    for x in l:  
        if x not in count:  
            count[x] = 0  
            count[x] += 1  
    if not max or count[x] > count[max]:  
        max = x  
    return max
```

The first definition of a property based test in the article is:

```python
@given(lists(integers(), min_size=1))  
def test_mode(l):  
    x = mode(l)  
    assert l.count(x) >= l.count(l[0])
```
This finds the bug, in fairly short time: ~3 seconds when I tried. Not so bad! Now let's compare this with mutation testing. I'm using mutmut (full disclosure: I'm the author). Mutmut runs for 16 seconds and finds 3 surviving mutants. 16 seconds sounds like a lot compared to the 3s above, but let's remember that we didn't have to write the test above either, and I'll bet you can't come up with that test AND write it correctly in under 16 seconds!

To run mutation testing, we need some testing so I added a trivial case:

```python
def test_a():  
    assert mode([1, 2, 4, 4]) == 4
```

#### A little detour on performance

It's also a bit unfortunate that mutmut spawns a new pytest process for each mutant, and that pytest has 0.7s overhead. In normal operation this is unfortunate, in this specific case it looks really really bad. I can configure mutmut like this:

```ini
[mutmut]  
runner = python -c "from src.mode import mode; assert mode([1, 2, 4, 4]) == 4"
```

…and get the time for the full run down to less than a second. This is an annoying performance advantage property based testing has (because it imports pytest once only), that has nothing to do with the problem domain itself, but more about the implementation details and big overhead of pytest.

#### The mutants

Let's start with the first mutant:

```diff
     count = {}
     for x in l:
         if x not in count:
-            count[x] = 0
+            count[x] = 1
         count[x] += 1
         if not max or count[x] > count[max]:
             max = x
```
This mutant is a false positive, because we don't actually care that the counts are correct, just that they are correct *relative* to each other so we can start at any random integer and it'll work fine. But this is also a case of mutation testing telling us that this code isn't elegant. We can remove that entire line, and the `if` above it if we replace `count = {}` with `count = defaultdict(int)` This will remove the mutant *and* simplify the code. Win win.

Moving on to the next mutant:


```diff
     for x in l:
         if x not in count:
             count[x] = 0
-        count[x] += 1
+        count[x] += 2
         if not max or count[x] > count[max]:
             max = x
     return max
```
That's also a false positive, same as above. Next mutation:

```diff
         if x not in count:
             count[x] = 0
         count[x] += 1
-        if not max or count[x] > count[max]:
+        if not max or count[x] >= count[max]:
             max = x
     return max
```
Also a false positive. We don't really care if we return the first or last object in mode([1, 1, 1]).

Well this was a bust for mutmut! 😢 Turns out this shows a hole in mutmut. It's missing a mutation type, namely replacing None with some other falsy value, maybe `""`:

```diff
 def mode(l):
-    max = None
+    max = ""
     count = {}
     for x in l:
         if x not in count:
```

There's even a TODO note in the code to fix this from before the code was public. I forgot about it because it wasn't in the issue tracker. Oops! I fixed this so if you try mutmut 1.5.0 now it will find this bug.

#### The advantage of mutation testing over property based testing

The nice thing mutation testing has over property based testing is that it's an enumeration of a finite and fairly small problem domain. Property based testing is an exploration of an infinite problem space, which means you don't really know if you're done and you most likely need to white box it anyway. Let's take an extreme example of the above code where I've fixed the bug and introduced a pathological case (highlighted):

```diff
 def mode(l):
+    if l == list(range(100)):
+        return -1
     max = None
     count = {}
     for x in l:
         if x not in count:
             count[x] = 0
         count[x] += 1
         if max is None or count[x] > count[max]:
             max = x
     return max
```

The property based test that found this before, now doesn't. We can tell hypothesis to try more examples:

```python
@given(lists(integers(), min_size=1))  
@settings(max_examples=50000)  
def test_mode(l):  
    x = mode(l)  
    assert l.count(x) >= l.count(l[0])
```

The default is 500, so I've increased it by two orders of magnitude. Now the property based tests take *1 minute* to run and they don't find the bug.

Now let's see what mutmut does. It's super not happy with this code! It will tell you it could produce these mutants:

```diff
# mutant 2
 def mode(l):
-    if l == list(range(100)):
+    if l == list(range(101)):
         return -1
 
     max = None

# mutant 3
 def mode(l):
     if l == list(range(100)):
-        return -1
+        return +1
 
     max = None
     count = {}

# mutant 4
 def mode(l):
     if l == list(range(100)):
-        return -1
+        return -2
 
     max = None
     count = {}
```

Now, obviously in this case a simple coverage report would also show you something was amiss, but if we change that if to:

```python
if l == list(range(100)): 
    return -1
```

then the coverage report won't help you anymore. Unless you turn on branch coverage, which you should!

I hope you'll try mutation testing on your libraries. For most projects it's as easy as:

> pip install mutmut  
> mutmut run

Mutmut figures out where your code and tests are automatically and just runs.
