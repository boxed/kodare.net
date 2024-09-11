---

title:	"Why we wrote a new form library for Django"
date:	2024-09-11
---


Django comes with a form library, and yet we wrote [a total replacement library](https://docs.iommi.rocks/en/latest/forms.html) as part of [iommi](https://docs.iommi.rocks/) ([GitHub link](https://github.com/iommirocks/iommi)). This might seem silly, but we struggled for years to *not* make our own form library. At a certain point we had to admit the truth: that Django forms were fundamentally not usable for what we wanted to do. 

The path to iommi forms had two paths that eventually converged:

1. Complicated forms with a lot of conditional configuration
2. Programmatically building forms

For complicated forms we tried writing a class that inherited from Django's `Form` that dealt with the limitations and issues we had. The complexity of this class grew quite fast to become a mess that we eventually only used in a few places. We realized pretty fast that this path was not sustainable.
 
When [we built our `Table` system](https://kodare.net/2024/09/03/admin-replacement.html), we also added filtering, where we programmatically built forms. To do this in Django forms, one needs to create a class at runtime with the `type()` constructor, itself quite nasty, and we had to work around various other issues which meant this was a lot of code to do comparatively little.
 
At this point we already had the dual-use `Table` class that could be used programmatically (`my_table = Table(...conf...)`) and declaratively (`class MyTable(Table): ...conf...`, read more about it [here](https://docs.iommi.rocks/en/latest/equivalency.html)), so we knew this was not just possible, but would solve our issues. One week in 2015 as I was fighting yet another bug caused by our use of Django forms, I finally got fed up. That weekend I wrote the first prototype of what is now the forms part of [iommi](https://docs.iommi.rocks/). 
 
After the initial version was implemented into our table system, and it surpassed the old Django forms based implementation in features and stability, I turned my gaze towards the general forms issues we had throughout the product, and slowly started to replace Django forms with the new forms system.

A few years into this I knew we had succeeded when I overhead a colleague open up a view to work on a bug ticket and mutter "ugh, Django forms". 


## The problems with Django forms

This is a partial list based on my poor memory. I haven't used Django forms for something like 10 years at this point, so it's quite hard to remember all the problems. The basic theme is "death by a thousand paper cuts", or in other words: it was just a lot of small things that added up. But there was a LOT of small things, some of which combined with each other to become more than the sum of their parts. That's not what you want from problems :P

The biggest general issue is that configuration is not co-located with the field definitions. `clean_*` is bad (there are validators, but the old `clean_*` is not deprecated, and is used in the docs still). Putting conditional logic in the constructor or the view is also quite bad, although less bad as it will often not fail silently like `clean_*` will.
 
All the issues I list here are fixed in iommi forms. 
 
### The complete list of gripes


1. The models `verbose_name` sometimes ended up in the form automatically, sometimes not. I never figured out the problem, but it lead to a lot of duplicate string literals: once in the model and once in some form.

1. Rendering was a mess. With the new template based rendering in Django 5 it's supposedly better now, but it seems still quite crude compared to iommi. Customization often leads to copy-pasting the original template to a new file, hiding the important difference between the default and the original in the noise of the common. Custom rendering often lead to listing out the fields manually in templates, making it easy to have the template and the form out of sync. It's especially annoying if you want to insert just a little bit of html in the middle of the form, or add a single CSS class to an input or label.

1. Conditional include/exclude of fields requires modifying the `fields` attribute of a form. Either by adding entries, or by removing them. This being done either in the constructor or after the object is created. 

1. Conditional configuration of anything is quite messy, with a lot of non-localized code.

1. Implicit template names are bad. The pattern of implicitly generating template names leads to it being very hard to figure out if a template is used or not, which leads to a fear of deleting any template, which leads to dead templates lying around forever.

1. Silent failures when miss-spelling things, like `get_form`, `clean_*` etc. A silent failure for a `clean_*` when renaming a field could be a disaster if the clean function is a part of access control.

1. The widget configuration system means you have to write entire classes for trivial configuration, further moving the wanted config away from the field definition itself.

1. `Textarea` is a widget. If you put it inside your form it's silently ignored (my PR to fix this was rejected).

1. Foreign keys map to a widget that drops the entire related field into the html. This default creates time bombs throughout your code. Same issue with M2Ms. In iommi we use select2 in ajax mode by default.
 
1. The `<form>` tag isn't rendered, which is annoying, but it also means file uploads contain an extra foot gun where beginners don't know about `enctype` and can't get anything to work because it fails silently.

1. No CSRF rendered by default, see above. 

1. Passing `request.GET`/`request.POST` in the constructor is confusing for beginners, causes bugs when the view codes if statement for the request method and the code that passes the data to the form are out of sync. 

1. Programmatically creating a form via `type()` is horrible.

1. Edge case: Be able to tell the difference between initial load and a submitted form. This is surprisingly tricky as a form with just one checkbox can be submitted as zero GET params if the checkbox is not set, in some browsers. 

1. Multiple forms on a page is awkward. Prefixes have to be set, and if you forget it, it might work for a while and cause hard to detect issues much later when a simple field is added that happen to collide.

1. Be able to have multiple forms in one view and know which form is being POSTed too is left as an exercise for the reader. 

1. Nested forms are not a thing. They're also not a thing in HTML, so implementing them is rather awkward, but it's a useful feature.

1. Having to manually wire through request, or request.user via the constructor and then alter fields to get the correct data is error-prone.

1. Pre-filling field values based on GET params is surprisingly useful, and not something Django forms does. 

Some things on this list are trivial, some are a really big deal. All are reasons to try iommi :P
