---
title: Documentation that is never wrong
date: 2025-08-08
tags: [programming, python, django, iommi, documentation]
author: Anders Hovmöller
---

The iommi docs are more correct than most projects because we take a different approach to documentation: part of the test suite *is* the documentation. Let's look at an example:


```py
def test_grouped_fields():
    # language=rst
    """
    .. _group-fields:

    How do I group fields?
    ~~~~~~~~~~~~~~~~~~~~~~

    .. uses Field.group

    Use the `group` field:
    """

    form = Form(
        auto__model=Album,
        fields__year__group='metadata',
        fields__artist__group='metadata',
    )

    # @test
    show_output(form)
    # @end
```

This ends up as this documentation:

![2025-08-05-documentation-that-is-never-wrong.png](/img/2025-08-05-documentation-that-is-never-wrong.png)


This is a normal test that runs with the normal test suite, with some additional markup: 

- The triple quoted strings that are declared with `# language=rst` are included in the docs.
- Code is by default included in the documentation
- You can exclude code with `# @test`/`# @end` for checks you don't want to include in the docs
- `show_output` renders some HTML output into a file that is then shown inline in the finished docs
- The `.. uses` command is used to mark what features this test uses so the examples are automatically linked from the reference API docs

With this infrastructure in place, some fixes or features can be implemented with all the required tests written as the documentation with no additional tests. This radically incentivises writing docs compared to duplicating work across tests and docs.
