---
title: Don't automate screenshots, automate iframes
date: 2025-01-14
tags: [programming, python, django, iommi, documentation]
author: Anders Hovmöller
---

There's a lot of tools out there to automate taking screenshots for documentation of web apps/libraries. Screenshots are certainly sometimes a good idea, but they have some serious downsides:

- As you're sending pixels instead of text, screen readers don't work
- Screenshots adjust badly to zoom levels
- Responsive layouts don't work
- Automatic dark mode selection doesn't work
- They are larger to download
- They are hard to generate
- They are slow to generate

When writing the iommi documentation I realized that I can bypass all that by using embedded iframes instead of screenshots. Instead of spinning up a headless Chrome, writing playwright/selenium automation and suffering through all that, I can render the page I am documenting like normal, and save the html to disk, which is then linked to with an iframe. It required some custom tooling, but [check out the iommi cookbook](https://docs.iommi.rocks/en/latest/cookbook_tables.html) for examples and I think you'll agree the results are pretty great. 


Here's a sample test from the cookbook that generates the iframe, and then the rST file for the docs:

```py
def test_how_do_you_turn_off_pagination(small_discography):
    # language=rst
    """
    How do you turn off pagination?
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    Specify `page_size=None`:
    """

    table = Table(
        auto__model=Album,
        page_size=None,
    )

    # @test
    show_output(table)
    # @end
    
```

The `show_output` command handles all the saving to the right filename. Our custom tooling then weaves that together in the rST output to produce the iframe. 

We write all our documentation as tests first, and sometimes the documentation is all the tests we need for new features. But the details of that is the topic for another blog post 😜
