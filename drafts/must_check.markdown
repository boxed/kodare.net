---

title:	"Permissions in Django: must_check"
date:	2024-09-27
---

I worked on a code base with custom access control that was also quite critical to get right. Penetration testers sometimes found issues in the access control logic, which was unfortunately not very surprising as doing the right thing was more work than doing the wrong thing.  Even worse, some parts of the code base were very complex so figuring out which code path would do the access control was difficult itself.
 
The first big change we made was to build an access control abstraction via decorators where path components (e.g. `customer_id`) were decoded into proper Django model instances and checked for access on the way in. This meant that the easy thing became the correct thing. 
 
Pseudo code before:

```py
def some_view(request, customer_id):
	customer = Customer.objects.get(pk=customer_id)
	if not customer.has_access(request.user):
		raise AcccessDeniedException()
	...
```

After:

```py
@permissions.customer
def some_view(request, customer):
	...
```

This was a big win for code size/DRY, but it also made it easier to write the correct code, and auditing the code for access control was much easier (in iommi this pattern is extracted into the path decoders themselves, removing the need for the decorator).

    
## Trouble brewing 

We went through the code base and replaced all the old usages with the new and even found a few places with incorrect access control before the penetration testers did. We were very happy with this.

But there was a problem. Some views were big. Very big. And their logic was a big sprawling tree that was very hard to follow. AND access control was done conditionally deep inside the call tree. Auditing the code was very hard and after going through it I came out the other side only being 90% sure it was correct, and maybe 50% sure any such correctness could survive changes to the code. 

These views could maybe be cleaned up, but they had run in production for years, weren't changed very often, and were business critical, so it didn't make much sense to try to refactor and potentially break them. Reading the code it wasn't obvious that a refactor wouldn't end up with the same problem with hard to audit logic anyway. The code was complex because the business rules were complex. 
    
## A New Hope

The requirement for a solution was:

- We must be able to audit the code and quickly determine that access control is being done. Preferably just looking at the decorators should be enough. 
- We must never leak customer data between customers 
- It must be easy to add to the existing views, not require big rewrites

The system we came up with was a decorator `must_check`:
    
```py
    @permissions.must_check('foo')
def some_view(request):
	...
	check('foo', statement_to_check_access)
```

The fancy thing is that `check` can be called anywhere in the entire call tree from the view. The decorator `must_check` adds its argument (the name of the check) onto a request local dict with the value `False` if not present, and `check()` sets the value to `True`. The final detail is that after the view returns, the decorator will go through the dict and validate that all values are `True`, and if there is any `False` value it crashes.
 
Essentially `must_check` is a promise that we can be confident is either upheld by some code doing the access control, or at least that no data will leak, and we'll get a crash in sentry.

It turned out that the old access control logic was correct, as we never got a failed check for the several years I still worked there afterward, and with that check in place I sleep better knowing that it's very hard to make a mistake that will leak data in the future. 
