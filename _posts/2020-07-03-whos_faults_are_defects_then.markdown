---
title: Who's fault are defects then?
date: 2020-07-03
render_with_liquid: false
tags: [programming, python, testing]
---


Hillel Wayne wrote an article [Defects are not the fault of programmers](https://buttondown.email/hillelwayne/archive/defects-are-not-the-fault-of-programmers/) which is really good and you should read it. The title is a bit unfortunate though as it implies programmers are never at fault, which I don't think he believes. The kicker line is this:

> defects are complicated properties of systems

I agree with this 100%. But what systems should we look at then? Hillel stops short here. [His analysis of one critical failure](https://www.hillelwayne.com/post/stamping-on-eventstream/) points to some very specific causes, and there were many, but just saying "systems" and waving your hands doesn't help much either. Which systems? Where do faults lie more generally? 

## The real causes of defects are legion.

People want simple answers: it's always the organization! it's always the programmer! it's human frailty! That type of stuff. But the world isn't simple like that. 

Defects are caused by many things. Here's a list I managed to come up with:

* programs
* programming languages
* programming language tooling
* individual programmers
* managers
* product owners
* the computer hardware
* the factory that built the computer
* companies
* users
* communities
* societies
* nations
* natural languages
* human genetics

Often it's a combination of all of the above to some degree. Sometimes it's just one and then it might be solvable. But the difficulty in solving the underlying reasons goes up quite a bit the further down the list you go. Natural languages for example have a huge impact on programming languages. Mostly it is English we're talking about here, and English is quite a messy and complex language.

The truth here is that we need to accept reality for what it is. Complicated. Messy. Confusing. 
 
This isn't a good chant. It's not a good pithy tweet. It's not a good slogan you can build an army of forceful followers around. 

But it is the truth.

## What can we do?

If we accept the truth, we must also take a good look at how much we have power over any of the root causes. Say a big expensive production incident was caused by 50% a funny quirk of English, 10% human nature, 20% lacking education of the programmer, 20% the existing code. We obviously can't go anything about English, so it doesn't matter at all if it was 50% of the problem. We can't touch it, so move on! Human nature? Same thing. Lack of education can be solved, but is potentially un-done every time a new hire comes on board. We're left with the last 20%: the existing code. This is where we have power so this is where we can make a change. 

This is why programmers suggest testing as the solution for pretty much anything. Not because it's lack of testing was the problem, but because it's often the only attack surface available.

We shouldn't just "not blame programmers", that's also too simplistic. We as programmers should own that we made mistakes, that we didn't fight back against the organization, or whatever. I think a good culture is one where no one points a finger, but where people own the mistakes by saying "my bad!" and trying to help fix it if they can. 

We are not blameless, nor are we only to blame. 
