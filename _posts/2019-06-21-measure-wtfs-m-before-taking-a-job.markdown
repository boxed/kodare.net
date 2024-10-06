---
title:	"Measure WTFs/m before taking a job"
date:	2019-06-21
tags: [programming]
---

If you haven't seen the classic comic (originally by [Thom Holwerda](http://www.osnews.com/story/19266/WTFs_m)), here it is:

![](/img/1*FqDN_tGNYrHX9WGnesB30g.png)

The trouble with this measurement is that you're often not faced with the actual number of WTFs/minute until you've already started the new job. This seems unfortunate. So I built a tool for this: [RandomPlaceInCode](https://github.com/boxed/RandomPlaceInCode). It is what the name says it is: it randomly selects a place in a given code base. The idea being that before you take a job somewhere, ask to spend some time with a developer on their code (on an air gapped machine in a room in their office presumably) and run this program a few times and discuss what you find at each site.

Just looking at the expression on the developers face should give you some hint probably. You shouldn't stop until you find at least one WTF/icky/legacy piece of code that the developer doesn't like. This shouldn't be hard. No code base is without them and if the developer claims there isn't, well that's weird and requires an explanation too.
