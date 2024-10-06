---
title:	"How to build an alternate Django admin in only 10 years"
date:	2024-09-03
tags: [programming, python, django, iommi]
---


In "[So you want a new admin?](https://jacobian.org/2016/may/26/so-you-want-a-new-admin/)" Jacob Kaplan-Moss writes about the cost and manpower it took to design the Django Admin system. TLDR: The original version was built by a team of 5 people working tightly with users for over a year, then it has been polished for over a decade after that. He estimates $1 million dollars to design a new one.

After having built an [alternative admin](https://docs.iommi.rocks/en/latest/admin.html), I can say that his order of magnitude estimation for effort is pretty spot on, even though we took a very different route to get to the same endpoint!

So how in the world did we end up writing an alternative admin system for Django?
 
First of all, by not trying. 

[Johan Lübcke](https://github.com/jlubcke) and me worked on a big app that was at the time something like 10 years old. It was chock-full of HTML tables. Just tables everywhere. The procedure to make a new view started by copy-pasting an existing view+template and modifying it. 
 
Making a view like this was error-prone and slow, and there even was running joke that we implemented views like this:

- they ask for a table
- we build a table
- they ask for sortable columns
- we fix sortable columns
- they ask for filters
- we add filters
- they ask for CSV/Excel export
- we make the CSV/Excel export

Always the same requests, always the same order. There was a lot of work required to build each of these features, so we didn't do it all from the start. As the tables were rendered with html templates, there were also common errors like headers and columns not matching, because the access control code differed. You had to be very careful to change two places in the code and keep them in sync, a pretty clear DRY violation.
 
One day me and Johan got fed up with this and started to refactor and clean up the code base. The good thing here was that we had a *lot* of tables with special requirements, so as we refactored, we started with the easy ones, and when we were done with all the ones that fit our current design, we expanded the scope and made a new run through the entire code base. In essence, we had a decade of built-up design requirements, that could stand in for the tight feedback loop with users Jacob writes about in his article.

The first version of our HTML table library was born in 2014. Work on the Django admin started in 2004. We are 10 years behind at this point and so far we don't even know that we are in the race!

The filtering GUI was initially build with Django forms, but it was harder and harder to add features as Django forms is not designed to be used programmatically, and it had many other limitations that we were hitting. I got fed up one day and over a weekend wrote a new form library. Initially it only needed to handle our use case for the forms for filtering of a table, but we quickly expanded the scope to be a full form library.

A different team in the company had a [pyparsing](https://pyparsing-docs.readthedocs.io/) based advanced query language that they donated to us for integration into our library (a feature the Django admin still does not have).
 
At some point I noticed that we had a great form library and a great table library, both capable of taking the Django model definitions and doing the right thing to get tables and forms from them automatically. I joked that we could make an admin replacement with the tools we had. 
 
The joke stayed a joke for a long time but slowly turned from a joke to a serious idea, until one day we wrote a prototype. We came back to this idea a few times, throwing out the old code and starting fresh. In 2020 the first real version was added to the repo. 

Since the underlying abstractions of forms and tables were so polished and powerful, our admin code is tiny. At the time of writing, our entire admin implementation is 649 lines. Compare this to the Django admin implementation which is 8013 lines of Python, 17872 lines of JavaScript, 4062 lines CSS, and 1222 lines HTML. 

649 lines vs 31169!

During this journey we broke backwards compatibility really hard twice and renamed the library each time: tri.tables -> tri.table/tri.form/tri.query/tri.declarative -> [iommi](https://docs.iommi.rocks). The last step was the most radical where we went all out in fixing all the flaws we had discovered over the years (and there were a lot). 
 
It really did take an enormous effort over a long period of time to write a replacement Django admin, just like Jacob warned us.
 
It's very similar to how SSDs finally beat hard drives: not by going against them directly, but by doing something else for many years and catching up only incidentally. 
