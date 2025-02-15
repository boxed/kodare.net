---
title: Bookmarklets, defaults-from-GET, and iommi
date: 2025-02-15
tags: [programming, python, django]
author: Anders Hovmöller
---

Phil Gyford [wrote an article](https://www.gyford.com/phil/writing/2025/02/14/django-admin-bookmarklet/) about how nice it is that the Django admin pre-populates inputs from the GET parameters if there are any. This can be used for bookmarklets as in his examples, or just general bookmarks where you can quickly go to a page with parts of a form prefilled. 

Another very useful case for this pattern is to have a link on one page of your product with a link to a create form with prefilled data based on the context of the page you linked from. Like having an artist page with a link to the create album page with the artist filled in. 

The Django admin does this, but Django forms do not. Because Django forms have an API that takes a dict for the data and not the request object itself, it can't be retrofitted to have this feature either. It's a nice example of where limiting the API surface area also limits future development.
 
In iommi, defaults-from-GET is the default for all forms. So if you build with iommi you get this feature across your product for free, not just in the admin. We even handle the edge cases for you like when you have a GET form, and you supply parameters via GET, so the form needs to know if this is from some URL or from a submit of the form. This is handled in iommi for you transparently.
