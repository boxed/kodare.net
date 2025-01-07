---
title: Status, not notifications 
date: 2021-09-10
tags: []
author: Anders Hovmöller
---

If you have email or IM notifications and think you've got a good setup, then this article is for you.

The entire software industry has largely gotten stuck in the "notifications" mindset. But what users actually want isn't notifications (even though they will ask for them!) but status. The problem is partly one of tools: we've got email and instant messaging but there are no such ubiquitous tools for status. Since email and IM are the tools we have, we fit our programs into this mold, causing users to be familiar with this approach, causing users to ask for notifications from more products, causing more users to be familiar with that workflow, causing them to ask for notifications, causing more products to add them, and on and on the feedback loop goes. 

But it's all wrong really. You don't want to know that:

- issue #3 was created
- issue #3 was assigned to you
- issue #3 was updated
- issue #3 was updated
- issue #3 was updated
- issue #3 was updated

You want to know that there is *one* issue to look at. Five out of six notifications are worthless. If the issue is deleted or fixed by someone else then you've got seven worthless notifications! 

## Aggregation

A status system should be hierarchical when there is a lot of data. Presenting e.g. unread as just an on/off state is perfectly ok if when you click on that you get the next level of the hierarchy. Maybe that's a list of the items, or maybe it's the next level of the tree. This will depend on your use case. 

## All the way and prominent

Status has to go all the way out to the user. You can't have status buried somewhere. In a browser this can mean the title or favicon of the page is updated. If the title is updated the very first character should change noticeably, don't bury it at the end where it can be cut off by a tab that isn't wide enough. 

A good tool for getting the status all the way to the user is [DevBar](https://github.com/boxed/devbar).
