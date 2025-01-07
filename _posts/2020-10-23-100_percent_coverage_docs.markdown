---
title: 100% coverage, of documentation!
date: 2020-10-23
render_with_liquid: false
tags: [programming, python, documentation, iommi]
author: Anders Hovmöller
---
The last few months I've been writing a lot of documentation for [iommi](https://docs.iommi.rocks). This is a library that is a big compatibility break and cleanup of three previous libraries (tri.form, tri.query and tri.table), so a big part of fixing the docs have consisted in updating really old code examples to correspond to the new APIs.

{% raw %}

It became clear to me that code examples that aren't even executed can be very wrong, so I came to the idea of running all the code in tests. I had done something very similar twice before with [pytest-readme](https://github.com/boxed/pytest-readme) and [midje-readme](https://github.com/boxed/midje-readme) but that was just for the readme, now I needed something much more ambitious. 

The basic idea is pretty simple: for every [reST](https://www.writethedocs.org/guide/writing/reStructuredText/) document in `docs/`, generate a pytest test file that contains all the code examples, and then execute that. But as always the devil is in the details. 

## Sections -> tests

I took the decision to make every subsection of the docs into a separate test. This would make the test output easier to read I thought, but more importantly it would make sure that the examples of each section was stand alone and wouldn't be accidentally coupled with other sections. An example is the section `How do I reorder columns?` that produces the pytest test function `test_how_do_i_reorder_columns`.

## Imports and other setup

The first thing I had to do was to have a way to insert imports at the top of the generated test files. Luckily for me reST treats unknown blocks as comments (although I have been very frustrated by this in other situations!), so I could just make up my own block type. This would look like this:

```rst
.. imports
    from datetime import date
```

My test file generator would just dedent `imports` blocks one step, and the normal Sphinx rendering would ignore these so they wouldn't be shown in the documentation itself. I also added a bunch of commonly used imports to all files so I didn't need to write an `imports` block in most files.

## Success!

At this stage I already found many syntax errors due to mismatched parenthesis, brackets and curly brackets, and quite a few other problems. But many of the examples contained functions, and I was only checking that those functions could be defined, not that they could be executed. I was pretty sure I still had lots of bugs hiding here. Next step was to collect coverage!

## Coverage

As the generated tests were a standard pytest suite I could use pytest-coverage, specifying the generated directory as what the coverage should report on. I had a lot less than 100% coverage at this point, but I could use the coverage html report to quickly work through the missing coverage.

## Test specific code

Some code samples could be adjusted to be executed or could be updated to contain asserts, but for the vast majority of the samples that would make the documentation worse as you got irrelevant asserts on top of the things you wanted. To deal with this I introduced a new reST block type which the generator program output unchanged into the test files, but Sphinx ignored. This would look like this:

```rst
.. code:: python

    def index(request):
        class IndexPage(BasePage):
            body = ...
        return IndexPage(parts__subtitle__children__text='Still rocking...')

.. test

    index(req('get'))
```

Going through the coverage report and doing similar things like this brought me very close to 100% coverage.

## Doctest style examples

In a few places we had doctest style examples:

```rst
.. code:: pycon

    >>> render_attrs(Namespace(foo='bar'))
    ' foo="bar"'
```

The first hard part was to find that the correct code type for these blocks was "pycon"! After that I had to change the test generator to handle these blocks so that the above code ends up as:

```python
    tmp = render_attrs(Namespace(foo='bar'))
    assert tmp == ' foo="bar"'
```

## Line numbers

Something I learned from my previous projects was the importance of making the line numbers in the generated test files match the line numbers of the examples in the original documentation. This makes it much easier to work with as you don't need to look at the generated test files anymore and you don't need to figure out where that failing test comes from in the docs. 

The approach is to enumerate the lines of the reST files and then store the line number in addition to the transformed line. When writing the test file I can just do:

```python
while line_number > current_line:
    write('\n')
```

This is a best effort approach, as you could have the first code example so early that there isn't any space to fill. It hasn't happened to any code in iommi, and it should probably not be a big problem as it should sort itself out later down in the file. But it can be good to be aware of.

## Hacks!

I had this example:

```python
Table(
    auto__model=Artist,
    columns__name__cell__format=lambda value, **_: f'{value} !!!',
)
```

I wanted to get to that object, but adding `t = ` in front of it will make the documentation worse. What am a programmer to do? Redundant parenthesis of course! 

```rst
.. test

    t = (

.. code:: python

    Table(
        auto__model=Artist,
        columns__name__cell__format=lambda value, **_: f'{value} !!!',
    )


.. test

    )
```

Another useful hack was for a part where the documentation listed the valid keyword arguments to a function. I wanted to make sure that if we added kwargs the tests for the documentation would fail. I came up with this:

```rst
.. test

    expected = """

.. code:: python

    request        WSGIRequest
    table          Table
    column         Column
    traversable    Column
    value          str
    row            Artist

.. test

    """
```

Then I could parse that string to get the names of the kwargs and their types and assert that it was correct.

## Summary

The code to do all this is available in the [iommi repository on github](https://github.com/TriOptima/iommi/blob/master/docs/make_docs_test_files.py). It's under a very open license, so feel free to use it yourself.

At the end of this we have 100% coverage on all code samples in our [iommi documentation](https://docs.iommi.rocks), which I think is pretty cool.

{% endraw %}
