---
title: "July 9 - the dashboard learned to reach my phone: an installable app with tiered alerts"
date: 2026-07-09
topics: ["Homelab", "Self-hosting", "PWA", "iOS", "Push notifications", "Reliability", "Monitoring"]
summary: "Turned the fleet dashboard into an installable phone app with alerts tiered by urgency, a critical channel that survives the app itself failing, and a dead-man's switch that can announce its own death."
---

The thing that clicked today: a dashboard I have to remember to open is only half a monitoring system. The other half is it reaching out to me. So I turned the fleet dashboard into an app I can install on my phone, and taught it to send the right alert at the right urgency.

## Built / shipped

An installable app on my phone and tablet. The dashboard is now something I add to my home screen and open like any other app, touch-first, not a link I have to dig up.

Alerts sorted by urgency, not by event. I did not want every little thing buzzing my phone, so I split alerts into tiers: a quiet activity feed I read when I open the app, normal notifications for job outcomes, an approval tier for things waiting on my tap, and a critical wake-me tier for real emergencies. Only the ones that earn a buzz get one.

A critical channel that survives the app failing. The most important alerts do not depend on my phone app working, because that app is exactly what might be broken. They ride a separate, reliable notification service so a true emergency still gets through.

A dead-man's switch. The whole system checks in with an outside service on a schedule. If my setup goes fully dark, the check-ins stop, and that silence is what triggers the alert. The system can tell me when it has died, which is the one message a dead system normally cannot send.

## Problems & fixes

Phone push is quietly fragile. Notifications to a phone app can silently stop working: the subscription expires without warning and the phone reports success to nothing. I moved to a more robust delivery method, made the app re-register itself every time I open it, and added a weekly self-test so a dead channel announces itself instead of failing in silence.

Do not blast the phone with history. The first time I wired up the watcher that turns fleet events into alerts, it wanted to notify me about every job that had ever run. I made it mark everything already in the past as seen before it starts, so it only speaks up for what happens from now on.

A health check that hurt the thing it checked. One monitor was running a heavy test on the machine it watched every minute, which added the very load that helped push that machine into a heat shutdown. I swapped it for a cheap read of a status the machine already tracks itself.

## Decisions

One notification voice per app, so tier by urgency. A phone app really only gets one notification identity, so the honest design is to sort by how badly I need to know and keep the low-value stuff to a silent feed.

Critical alerts go out-of-band on purpose. The wake-me tier deliberately does not rely on my own hardware or app, because the whole point is that it fires when those are the things that failed.

## Learned

The hardest alert to send is "I am down." Everything else is easy by comparison. The only reliable way to catch total failure is to notice an expected signal going missing, not to wait for the dead thing to speak.

A monitor should never add load to what it monitors. Prefer reading a value the target already computes over running your own probe on it.

## Still open / next

The alerting is solid now, so the rest is feel: smoother touch gestures on the phone, and a couple of quieter fleet health signals I have not wired in yet.
