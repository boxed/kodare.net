---
title:	"A nice testing environment"
date:	2019-11-20
tags: [programming, testing]
author: Anders Hovmöller
---

At work we have a testing environment that is pretty nice. I'll describe it to hopefully spark some ideas for how you can improve your system. The basic requirements we've had for many years is:

* Changes go through code review.
* Changes are tested against our automated test suite.
* Changes are either approved by a second person (4-eye approval) or manually tested.
* Developers press merge on their own tickets when they feel ready

So far so standard. The way our testing environment is built and we get feedback from it is the secret sauce. The high level view:

* All changes that have successfully run tests and have at least one approval and no `needs work` are merged into a branch.
* This branch is force pushed to the server so we can look at it if we need to.
* When the branch is changed we deploy it automatically to the testing environment, running migrations if needed.

This means it's very easy to remove a change from the test environment: just click `needs work` on it. This way we don't have a queue, which is very important because we're a pretty big team, and we then also don't have to do trunk based development where we would end up with broken code on the trunk and not being able to safely deploy. 

The thing that makes this system really shine is all the little niceties:

* Changes that are merged go automatically into "ready for deploy" in JIRA.
* We have a bot user that assigns itself to changes when the issue is marked as "ready for test" in JIRA so you can see at a glance if you forgot to do this without clicking through to JIRA.
* The bot user presses approve on issues when the JIRA status is resolved, again so you don't need to go to JIRA.
* Git conflicts in requirements are handled with a special merge algorithm so changes don't step on each other just because the git merge logic is too simple/paranoid.
* When there are conflicts between changes, the branch building bot posts a comment on the change with detailed information, aborts that merge and continues on. This means again that one conflict doesn't stop anyone else from working. The bot also assigns itself to the ticket and presses `needs work`.
* After a merge: if the tests succeed on the production branch, the `deploy` branch is moved forward. This means our `deploy` branch is safe to deploy. (Well, it's not known to be unsafe at least!)

In addition to all of this, we are heavy users of a little tool I've written called [DevBar](https://github.com/boxed/devbar). It's a macOS<sup>1</sup> menu bar app that talks to a server which collects data from various sources and displays them for you. It will show:

* If you forgot to put your change into either 4-eye or set the JIRA issue to "ready for test".
* If you have failing tests on a change.
* If someone has marked your change `needs work`. This includes the bot mentioned above!.
* How many changes are waiting for code review. We don't assign users for review so this is especially handy since our code review tool doesn't really handle this way of working.
* If any changes are marked as being something that should be manually tested but can be tested by some other member of the development team. This can speed up manual testing.
* If a change is ready for merge.
* If you have a change marked as work in progress. 
* If some JIRA issue you're assigned on has a status that doesn't make sense.

Then we also have a few more statuses in the DevBar which are very nice:

* If there is a production crash that no one is looking at.
* If there is a crash in the testing environment no one is looking at.
* If there are questions in our support chat that haven't been dealt with.

## Summary

This is a workflow we've refined over several years and it's very nice. I hope you've found something on this list that you can implement in your workflow to make life easier.

<sup>1</sup> We have linux and windows clients too, but they're a little more experimental at the moment.
