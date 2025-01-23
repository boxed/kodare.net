---
title: Strip spaces
date: 2025-01-23
tags: [programming, python, django, iommi]
author: Anders Hovmöller
---

<style>
.language-plaintext {
    white-space: pre;
}
</style>

When I joined TriOptima back in 2010, a common pattern emerged where names of things were slightly off because of stray whitespaces. Sometimes we had duplicates like `"foo"`, `"foo "` and `" foo"` in the database. Sometimes we couldn't find stuff in logs because you searched for `"foo was deleted"`, when actually you had to search for `"foo  was deleted"` (notice the double space!). Sorting was "broken" because `" foo"` and `"foobar"` are not next to each other. And more issues that I can't remember...

It was *everywhere*, causing problems across the entire code base. Each individual issue was easily fixed by cleaning up the data, but it added up to an annoying support burden. My fix at the time was to make a function that took a [Django](https://djangoproject.com) `Form` instance and returned a new instance with space stripping on all fields. Something like:

```py
form = auto_strip(Form(...))
```

After I added that to every single Django form in the entire code base that slow and steady trickle of bugs and annoyances just stopped. From seeing a few a month consistently to zero for the next ~9 years. Even better: I never got a complaint about it.

This was fixed in Django 1.9 after some fierce debating back and forth ("will *never* happen" was uttered). In [iommi](ttps://docs.iommi.rocks/) forms we've had this since the beginning, which turns out to be a few months ahead of when Django took this decision (although it was tri.form and not iommi back then).


## Just when you think you're out

Unfortunately the story doesn't end here. I started getting this issue again, and it took me a while to realize it's because of SPA-like pages that uses Pydantic serializers instead of a form library. To solve this I added this base class for my schemas:

```py
class Schema(ninja.Schema):
    @validator('*')
    def strip_spaces(cls, v: Any) -> Any:
        if isinstance(v, str) and '\n' not in v:
            return v.strip(' ')
        return v
```

The reason I'm not stripping spaces if the text contains a newline is to avoid situations where you have multiline text fields with indented code. Maybe it's just programmers who will care, but we tend to care a lot :P

Modifying data silently and by default like this sounds like a bad idea and I also get a little pit in my stomach when I think about it with that frame of mind, but this specific case seems like all win and no downside from my 14 years of experience doing it.
