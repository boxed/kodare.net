---
title:	"Good Workflows 🏈"
date:	2019-06-21
tags: [programming]
---

We use BitBucket Server at work for code reviews and JIRA for issue tracking. They are ok, but the workflow is a bit... icky. For example, in BitBucket after you've completed a code review you can either select "needs work" or "approved". But "needs work" seems a bit harsh when you only had a question, so people don't use it. But this means the ticket is still in the "someone needs to review this" bucket, which creates extra work when others look at it and see that there's a comment... over and over and over. The more developers you have the worse this becomes. It's basically a polling loop running for each developer multiplied by open pull requests. Running polling loops in human brains isn't good for productivity or happiness!

JIRA has similar issues and the "solution" they've implemented is to send tons of notification mails. This is not a good solution because notifications are about changes, not the current state. But I don't care if the ticket went from open to resolved to open to resolved to open. I care that it's open. Now. Especially when coming back from a vacation one has to deal with this by deleting all mails from JIRA and BitBucket because they are useless in bulk, and then you inevitably miss the one mail in that pile that told you that you need to respond to something. The workflow for that is that hopefully someone notices and taps you on the shoulder. 

The basic mistake here is that there is no concept of "who has the ball?" You don't really want a "needs work" button, you want a comment field plus a "now the developer has the ball again" button. And then you need a tool to give you a current list of all things (PRs, issues, whatever) you have the ball on (we have one: [DevBar](https://github.com/boxed/devbar) + some proprietary and team specific logic). We are working around these limitations the best we can, but ultimately we can't rename the "needs work" button so people still don't want to press it because it's a bit rude. 

## A plea

If you write an application with some kind of workflow in it, consider the concept of "who has the ball" as the primary unit of interaction. Think of machines as things that can "have the ball", for example "waiting for tests to run", "waiting for deploy", "closed" can be considered places where the ball is at.
