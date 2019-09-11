---

title:	"Keyword argument confusion in Python"
date:	2017-05-09
---

(If you read this and feel more confused, that means you now know more, it IS confusing!)

There's a lot of confusion among Python programmers on what exactly "keyword arguments" are. Let's go through some confusions. This is a statement I've come across:


> If you somehow are writing for a Python 3 only codebase, I highly recommend making all your keyword arguments keyword only, especially keyword arguments that represent "options".There are many problems with this sentence. The first is that this is mixing up "arguments" (i.e. things at the call site) and "parameters" (i.e. things you declare when defining a function). So:

```python
def foo(a, b): # <- a and b are "parameters" or "formal arguments"  
    passfoo(1, 2) # <- 1 and 2 are arguments to foo, that match a and b
```

This confusion is common among programmers. I also use the word "argument" when I mean "parameter", because normally in conversation we can tell the difference in context. Even the documentation in the Python standard library uses these as synonyms.

The code above is the basic case with normal parameters and positional arguments. But we were talking about keyword arguments so let's talk about those too:

```python
def bar(
        a,    # <- this parameter is a normal python parameter
        b=1,  # <- this is a parameter with a default value
        *,    # <- all parameters after this are keyword only
        c=2,  # <- keyword only argument with default value
        d):   # <- keyword only argument without default value
    pass
```
So far so good. Now, let's think about the statement we started with:


> I highly recommend making all your keyword arguments keyword onlyThat implies there are keyword arguments that are not keyword *only* arguments. That's sort of correct, but also very wrong. Let's have some examples of usages of bar :

```python
bar(1)         # one positional argument
bar(1, 2)      # two positional arguments
bar(a=1)       # one keyword argument
bar(a=1, b=2)  # two keyword arguments
bar(1, d=2)    # one positional and one keyword argument
```
The trick here is to realize that a "keyword argument" is a concept of the call site*, not* the declaration. But a "keyword only argument" is a concept of the declaration, not the call site. Super confusing!

There are also parameters that are positional only. The function sum in the standard library is like this: according to the documentation it looks like this: `sum(iterable[, start])` But there's a catch!

```
>>> sum(iterable=[1, 2])  
Traceback (most recent call last):  
File "<stdin>", line 1, in <module>  
TypeError: sum() takes no keyword arguments
```

And the start parameter can't be used as a keyword argument either, even though it's optional!

### Recap

(I'm using "argument" here even though "parameter" or "formal argument" would be more correct, but the Python standard library uses these all as synonyms so I will too, so my wording matches the documentation.)

Python functions can have:

* Arguments that can be used both as positional and keyword arguments (this is the most common case)
* Arguments that can be used both as positional and keyword arguments with default values (or just "arguments with default values")
* Positional only arguments (like the first argument tosum, this is uncommon and can only be achieved by functions implemented in C)
* Positional only arguments with default values (like above, only for C)
* Optional positional only arguments (2nd argument to sum, like above, only for C)
* Keyword only arguments
* Keyword only arguments with default values
* Arbitrary positional arguments (`*args`)
* Arbitrary keyword arguments (`**kwargs`)

When calling Python functions you can have:

* Positional arguments
* Keyword arguments

It's very simple at the call site, but a lot more complex at the function definition, and how call site arguments are mapped to the declaration is quite complex.

### Summary

Python appears simple because most of these rules and distinctions are so well thought out that many programmers can go years in a professional career and believe defaults arguments and keyword arguments are the same, and never get bitten by this incorrect belief.

