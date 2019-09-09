---

title:	"The missing mutant — a performance bug we missed"
date:	2018-11-18
---

We recently performed a profiling run of our batch processing pipeline and we discovered that the `__hash__` method of the `Frozen` class (a part of tri.struct) was taking quite a lot of time. This was surprising in multiple ways:

1. We didn't think we used it much
2. It shouldn't be hashing a lot because it caches the results
3. The entire tri.struct package is mutation tested with zero surviving mutants (using [mutmut](https://github.com/boxed/mutmut/)).

After some looking through where it was called from we saw that point 1 was an incorrect assumption. We did use it indirectly a lot via `FrozenStruct` and then `Token` (from [tri.token](https://github.com/trioptima/tri.token)). But these are static structures, basically enums on steroids. They should hash once and then be done, but we had millions of calls to `__hash__`, not hundreds. Obviously assumption 2 is wrong and mutation testing didn't catch it. The code looks like this:

```python
def __hash__(self):  
    hash_key = '_hash' # pragma: no mutate  
    try:  
        _hash = self[hash_key]  
    except KeyError:  
        _hash = hash(  
            tuple(
                (k, self[k])   
                for k in sorted(self.keys())
            )
        )  
    dict.__setattr__(self, hash_key, _hash)  
    return _hash
```

Since this is an implementation of a frozen object, i.e. an object that is supposed to be immutable, we can't just use `settattr` like normal, that's why we're doing the strange little dance of explicitly calling `dict.__setattr__`. The problem here is the getting of the value inside the try. It will always raise `KeyError`! So changing `_hash = self[hash_key]` to `_hash = self[None]` wouldn't change the behavior.

The fix is pretty simple: use `dict.__getattribute__` instead of `self[` (and catch `AttributeError` instead of `KeyError`).

The more important and interesting question is: why didn't mutation testing find this? Well, turns out there just was no mutation from `a[b]` to `a[None]`. But now there is! Mutmut 1.0 released today contains this new mutation. Rerunning the mutation tests on the previous tri.struct code finds this mutant and when we fix the bug and add a test for it the mutant is killed.

*Update: after a lot of problems I have finally managed to run this bug via the other two python mutation testers Cosmic Ray and mutpy. None of them finds this mutant as of 2018–11–23.*

