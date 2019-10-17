---

title:	"When DRY fails"
date:	2019-10-17
---

Don't Repeat Yourself, or DRY, is one of the core principles of programming. It's part of what makes software powerful: it's avoiding duplication of effort when writing the code, but it also makes sure that when a bug is found it's fixed everywhere. It also applies to data: if you need to change something, you want to be sure you've changed it, and not just one copy (this is sometimes called "single source of truth"). It's generally agreed to be A Good Thing (it can be misused, but let's leave that for now).

## But what if you can't be DRY?

There are many situations where DRY just isn't feasible. Here are some:

- There are serious performance implications
- It makes the code more complex, not less
- You need to keep some data in many places for redundancy (backups or cloud storage for example) 
- You need the same data/code in different programming languages
- The data/code is spread over multiple companies

Whatever the reason may be, it happens and it's not always possible to avoid repeating yourself.

The problem with DRY as a principle is that it lacks an else clause. It's like:

```
if feasible:
    DRY!
```

This type of code should make you go WAT, but when it's taught in school in the form of English we often miss the glaring hole in the principle: [what about the else clause](/2019/06/21/the-else-statement-smell.html)? What do we do when the DRY principle can't be applied? 

## DRYER (DRY Else Reconcile)!

So let's fix the code:

```
if feasible:
    DRY!
else:
    reconcile!
```

When DRY fails, you reconcile. The simplest form of a reconciliation is to just write a test that reads data A and data B and fails with a diff if they are out of sync. The data doesn't need to be identical (and probably can't be, otherwise it wouldn't be a DRY violation in the first place), so the test will need to transform A and B into some common format to be able to compare.

Notice how the last paragraph always talks about data, never code. It's because code is a pain to reconcile, but data is fairly easy. If your code isn't declarative when you have a DRY violation you might be in trouble. Reconciling code can be having a great test suite (100% coverage, 100% [mutation tested](https://mutmut.readthedocs.io) ideally) that you can run on both pieces of code. 

## These are not reconciliations

I'll start with some things that are not valid reconciliation methods. 

* Synchronization is not reconciliation. It never checks the full state of the data, instead monitoring for add/delete/change and propagating those. This isn't good enough because you will lose an event and now you're out of sync and you won't recover. Sync is good for fast change propagation but you need periodic full reconciliation too. 
* Copying the entire dataset from A to B, overwriting Bs data is not reconciliation. It can work, but it can hide problems you probably should look at. Like why did B diverge when A was unchanged? It can also be a usability problem because someone changes B and at some point becomes surprised and frustrated because their changes are now gone. 
* Being disciplined and always changing both places is not reconciliation. If it's not done by a computer it won't work or scale. Never send a man to do a machines job.
* Comparing e.g. checksums on the entire dataset and sounding an alarm if they are different is not reconciliation. This might be a good start but reconciliation means saying _what_ is wrong not just _that_ it's wrong. 

## What is reconciliation?

Reconciliation is:

* Checking all the data
* Checking it regularly 
* Reporting all discrepancies
* Reporting fine grained discrepancies
* Partial reconciliations where you're missing one or more of the points above can still be hugely useful of course. Start small!

## Blame the system, not the user

Every time you make a code change and forgot to update some other place that needs to be updated in sync, don't think "oh silly me, I forgot" but instead "it's bad that the compilation/tests didn't fail". The same goes for data. This type of thinking takes practice, but I think it's generally a good idea to defaulting to blaming the system when the user screws up. This attitude makes for good systems without lots of sharp edges in the long run.
