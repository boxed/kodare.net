---
title:	"Sanity system"
date:	2024-04-30
tags: [programming, python, django]
author: Anders Hovmöller
---

At TriOptima we built a system we called the sanity system, where we would put data checks. When I started the green field project at [Dryft](httsp://dryft.se) this system was one of the first things I added (in addition to the Sentry-[Devbar](https://github.com/boxed/DevBar) integration) .

The idea is super simple: you have a `sanity.py` file and all functions that start with `check_` are collected into the sanity list. You then have two ways to run this:


- Go to some url which runs all the checks and shows the results in a table. `/sanity/` for example.
- Run this every night from cron or [Urd](https://github.com/boxed/urd) and post an error in [Sentry](https://sentry.io) if any of the checks fail.


This is the [iommi](https://docs.iommi.rocks/) view: 

```py
def sanity(request, name=None):
    assert name.startswith('check_')
    from . import sanity
    check = getattr(sanity, name)
    result = check()

    if isinstance(result, QuerySet):
        result = Table(
            title='', 
            auto__rows=result, 
            columns__id__include=True,
        )
    else:
        result = html.div(
            result,
            attrs__style={'white-space': 'pre-wrap'},
        )

    def fix(**_):
        check(fix=True)
        return redirect('.')

    return Page(
        title=f'Sanity {name}',
        parts__result=result,
        parts__fix=Form(
            actions__submit=dict(
                post_handler=fix,
                display_name='Fix',
            ),
            include=inspect.signature(check).parameters
        )
    )
```

This is the Urd task:

```py
@schedulable_task
def sanity_checks(log_error=True, heartbeat=lambda: None):
    unused(heartbeat)
    from . import sanity
    checks = {
        k: v
        for k, v in sanity.__dict__.items()
        if k.startswith('check_') and callable(v)
    }

    results = {k: check() for k, check in checks.items()}

    failed_results = {k: v for k, v in results.items() if v}

    error_string = ''.join(
        f'{k}:\n\n{v}\n\n\n' 
        for k, v in failed_results.items()
    )
    if log_error and error_string:
        log.error(error_string)

    return results
```


Checks return empty string if there isn't anything to report, otherwise they return a string describing what needs to be fixed. A sample check:

```py
def check_default_owner_valid():
    return '\n'.join([
        x.name for x in Department.objects.filter(
            Q(default_owner__end_date__lt=now()) |
            Q(default_owner__is_active=False)
        )
    ])
```
