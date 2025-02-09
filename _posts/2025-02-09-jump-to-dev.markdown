---
title: Jump to dev
date: 2025-02-09
tags: [programming, python, django]
author: Anders Hovmöller
---

At [Dryft](https://dryft.se) I have the luxury of a small production database, so I can mirror prod to my local dev machine in ~3 minutes. I use this a lot to get quick local reproduction of issues. I used to copy-paste the relevant URL part to my local dev and felt quite happy with it. Then I realized that I could just paste the entire URL after `http://localhost:8000/`! My browser autocompleted that part anyway, and URLs like `http://localhost:8000/https://[...]` are obviously invalid for normal uses cases, so can cleanly be made to just strip out the domain part and redirect.   

This is the middleware I came up with to do this:

```py
def domain_strip_middleware(get_response):

    def domain_strip_middleware_inner(request):
        if not settings.DEBUG:
            return get_response(request)

        m = re.match(
            r'/https?://(?P<domain>[^/]*)(?P<path>/.*)', 
            request.get_full_path()
        )
        if m:
            return HttpResponseRedirect(m.groupdict()['path'])

        return get_response(request)

    return domain_strip_middleware_inner
```
