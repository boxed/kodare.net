---
title:	"Suggestions for a better Python 2->3 story"
date:	2016-12-21
tags: [programming, python]
author: Anders Hovmöller
---

  There's been a lot of gnashing of teeth over the transition to Python 3. It's just not as easy as one would like. Here's my wish list for how this could be better. There would need to be:

* Python 2.8 with a focus on ONLY Python 3 transition features
* Transition features as needed also added to the next version of Python 3
* Maybe a Python 2.7 release that just allows, but doesn't implement the new future imports, to move older code bases along smoother. This is a bit of a paranoid move, but might be good :P

### New string prefix: "s"

There's `u` for unicode/str and `b` for str/bytes, but it'd be nice to have `s` for str/str. It's rare, but it's super annoying to deal with. For example `__name__` on functions must be str/str so I have to write `str(something)` if I have a `from __future__ import unicode_literals`, but then I have to write a comment to say I really mean it so no one accidentally changes it with 2->3 tooling or manually because it looks wrong. An `s` prefix would be much nicer.

### Make six part of the standard lib

I think the community has settled on this now. It's time to set a clear standard going forward. Or if the core team likes futurize better, choose that. The important thing is to forcefully push people forward and lower the barrier.

### Expand six

Six currently doesn't cover mock and csv for example. This has bitten us at work. Stuff like this would be great if it was included in six to make everyones transition smoother. For CSV we use csv342 to manage the transition.

### New __future__ imports

* `from __future__ import unicode_bytes_incompatible`: this would makes str and unicode concats etc hard errors in the given file.
* `from __future__ import open`: turn `open()` in Python2 to `io.open`. Maybe even a `from __future__ import builtins` that updates all builtins.
* `from __future__ import six_moves`: hard errors with help on what to do when you try to import stuff you should have imported via six.moves.
* `from __future__ import *`: we are getting a LOT of these future imports now, time to add the nuclear option. This also makes sense when starting a new file since you're just trying to avoid accidentally writing incompatible stuff.

### Conclusion

I believe the core Python team could do a lot more for the ease of transition with relatively few changes. This is a good thing and shows the amount of work that has gone into this. For small libs it's already easy to make the change to running on both 2 and 3, it's the big code bases that have the most to gain from better transition tools.
