---
title: Why we don't use python native enums
date: 2020-11-17
render_with_liquid: false
---
{% raw %}

## Problem 1: no semantics

The fundamental problem with enums is that they don't have a semantic meaning for the left and right side. Let's look at an example:


```python
class Fruits(Enum):
    apple = 'Apple'
```

It's not at all clear why the cases of `apple` and `Apple` are different here, and what does the difference in case mean? Which of those two do we store in the database for example? Which do we show to the user?

Our experience over the years has made us believe that naming things helps, but subtle names help very little. We've tried naming the user facing string `label` and `title`. Both those are no good and are frequently misunderstood. We've settled for `display_name` as hard to misunderstand. 

The example above written with tri.tokens becomes:

```python
class Fruits(TokenContainer):
    apple = Token(display_name='Apple')
```

The only problem here is that the word `apple` still has no name associated with it. We think this is an ok trade off, and we call this string the "name", or sometimes "code name". This is the string that goes into the database. Never anything else!

## Problem 2: Hard to add data

With python enums it's difficult to add additional data for the cases. You can use tuples but it has the same problem of no semantics but it gets worse the bigger the tuple is. This is an example from the official documentation:


```python
class Planet(Enum):
    MERCURY = (3.303e+23, 2.4397e6)
    VENUS   = (4.869e+24, 6.0518e6)
    EARTH   = (5.976e+24, 6.37814e6)
    MARS    = (6.421e+23, 3.3972e6)
    JUPITER = (1.9e+27,   7.1492e7)
    SATURN  = (5.688e+26, 6.0268e7)
    URANUS  = (8.686e+25, 2.5559e7)
    NEPTUNE = (1.024e+26, 2.4746e7)
    def __init__(self, mass, radius):
        self.mass = mass       # in kilograms
        self.radius = radius   # in meters
```

It's impossible to understand the definition of the data without reading the constructor (and the constructor is a bit weird too as `self` here are the cases, not the `Planet` class!). The constructor then changes this positional chaos to the named members `mass` and `radius`. In [tri.token](https://tritoken.readthedocs.io/en/latest/) this would be:


```python
class Planet(Token):
    mass = TokenAttribute()
    radius = TokenAttribute()


class Planets(TokenContainer):
    MERCURY = Planet(mass=3.303e+23, radius=2.4397e6)
    VENUS   = Planet(mass=4.869e+24, radius=6.0518e6)
    EARTH   = Planet(mass=5.976e+24, radius=6.37814e6)
    MARS    = Planet(mass=6.421e+23, radius=3.3972e6)
    JUPITER = Planet(mass=1.9e+27,   radius=7.1492e7)
    SATURN  = Planet(mass=5.688e+26, radius=6.0268e7)
    URANUS  = Planet(mass=8.686e+25, radius=2.5559e7)
    NEPTUNE = Planet(mass=1.024e+26, radius=2.4746e7)
```

This has clear semantics for each row and removes the need for the constructor on the Enum class.

Another common solution to the problem above is to have the data for mass and radius somewhere else. This results in several dicts you need to reconcile and validate.

## Problem 3: scales badly for sparse data

We have many cases with sparse data. This is what it would look with enums:

```python
class Fields(Enum):
    party_group_name = (default, None, None, None, None, 'rec_party', default, None, None, None)
```

`None` here means it doesn't exist and the sentinel `default` means to automatically generate the default. In tri.token this would be:

```python
class Fields(TokenContainer):
    party_group_name = Field(total_download_name, dw_name="rec_party")
````

`total_download_name` here is a special sentinel value so we can shorten `total_download_name=default` to just `total_download_name`.

This problem grows with each case of the enum. As of this writing the `Fields` container from this example has 486 cases, making the sparse data issue much worse. 

## Problem 4: dangerous to work around these problems

One could make all the cases for an Enum into dicts:

```python
class Fields(Enum):
    party_group_name = dict(
        total_download_name=True, 
        dw_name="rec_party",
    )
    
    instrument_type = dict()
    agreement_curr = dict(
        file_column
    )
```

This doesn't work though because all empty dicts are the same so if you add `avg_mtm_diff_usd = dict()` now data is thrown away silently.


## Summary

Python native enums are great for what they were designed to do, but we've found that they are limited and don't allow you to grow the complexity and usage in a sane way. We developed tri.token before python enums and were hoping we could throw away tri.token and replace it with enums, but unfortunately this wasn't the case. 

{% endraw %}
