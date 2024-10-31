---
title: Django clean urls.py
date: 2024-10-31
tags: [programming, python, django]
---


Managing URL mappings in Django can become a bit of a mess as a project grows, and you often end up with many tabs in your editor named `urls.py` which is not very helpful. In several discussions on the [Unofficial Django Discord](https://unofficial-django-discord.github.io/), [cb109](https://github.com/cb109) kept mentioning that he's got a single big `urls.py` file. At some point I started noticing every time I navigated to the wrong `urls.py` and how I got a little annoyed every time. 

I made the switch to one big file to see how I liked it, and I am very happy I did. It's much nicer, and my work project isn't super large, so it's only ~630 lines anyway. It's much nicer to find stuff and add new path mappings. Highly recommend. 



## Nesting

After doing this a while I noticed that this pattern came up frequently:

```python
path('projects/<project_pk>/', ProjectPage().as_view()),
path('projects/<project_pk>/duplicate/', duplicate_project),
path('projects/<project_pk>/ev/', ev_index),
path('projects/<project_pk>/ev/edit/', ev_edit),
...
```

[Işık](https://github.com/isik-kaplan) reminded me that `include()` in Django can clean that up:

```python
path('projects/<project_pk>/', include([
    path('', ProjectPage().as_view()),
    path('duplicate/', duplicate_project),
    path('ev/', ev_index),
    path('ev/edit/', ev_edit),
])),
...
```

Not super clean, but better. I also didn't like the verboseness of the [iommi](https://docs.iommi.rocks/) views like `ProjectPage().as_view()` which also felt a bit messy, so after a while I wrote this:

```python
def path(path, view_or_list, kwargs=None):
    if isinstance(view_or_list, list):
        assert kwargs is None
        return orig_path(path, include(view_or_list))
    elif isinstance(view_or_list, type):
        return orig_path(path, view_or_list().as_view(), kwargs=kwargs)
    else:
        try:
            return orig_path(path, view_or_list.as_view(), kwargs=kwargs)
        except AttributeError:
            return orig_path(path, view_or_list, kwargs=kwargs)
```


Now the same path mapping can look like this:

```python
path('projects/<project_pk>/', [
    path('', ProjectPage),
    path('duplicate/', duplicate_project),
    path('ev/', [
        path('', ev_index),
        path('edit/', ev_edit),
    ]),
]),
...
```

The code above is hereby released in the public domain. Try it and see how you like it.
