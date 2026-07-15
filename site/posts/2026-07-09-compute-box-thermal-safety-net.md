---
title: "July 9 - a compute box hitting 115°C, and the safety net that let it run hot but safe"
date: 2026-07-09
topics: ["Homelab", "Reliability", "Hardware", "Monitoring", "Linux", "Self-hosting"]
summary: "My busiest compute machine was cooking itself under real load, so instead of just turning the work off, I built layers of protection that let it keep running without frying."
---

The thing that clicked today: my busiest compute machine was cooking itself under real load, so instead of just turning the work off, I built layers of protection that let it keep running without frying.

## Built / shipped

Found the machine running dangerously hot. Under a real machine-learning workload the processor was hitting 108 to 115°C with thousands of throttle events. Stopping the workload dropped it under 50°C at idle, which proved the load was the driver, not the room.

Forced the fans to full and fixed a boot bug. I set the fans to run flat out as a fail-safe, and fixed a bug that kept the fan-control service from surviving a reboot (it was comparing two versions of the same device path that differed only by a prefix).

Added a hard safety net. A guard now stops the heavy workload automatically if the processor stays above a set temperature, and never silently restarts it. A separate probe reports real fan speeds, temperatures, and throttle counts to my dashboard.

Capped the power draw. Fans alone could not make the load safe, because the cooling has a physical defect. I applied a processor power cap and watched temperatures plateau in the 60s to 70s under the same workload that had spiked past 100°C minutes earlier. Slow but safe.

## Problems & fixes

A fix that is not made permanent silently reverts. Days later I found the power cap gone: I had applied it as a live setting but never made it survive a reboot, so a restart wiped it. The guard had fired twice in the meantime, which told me the cooling problem was still very much live.

I blamed the wrong workload. The heat trips at the same time each morning turned out not to be the machine-learning work at all, but an unrelated nightly maintenance job pinning every core for several minutes. I fixed it at the source by capping that job's CPU share instead of papering over it with the guard.

## Decisions

Layer the protection. A hard-stop guard, full-speed fans, and a power cap are three independent nets, and I would rather over-protect a machine with a known defect than trust any single one.

Keep the guard. When I was tempted to pull the safety net and run at full power, the fact that it had genuinely fired twice was the argument to leave it in place.

## Learned

A live setting is not a fix until it survives a reboot. The power cap was proven safe but reverted because it was never persisted, which is the difference between a validated recipe and an enforced one.

A monitor should read a value the target already tracks, not run its own heavy probe on it. One of my health checks was itself adding load to the machine it watched.

## Still open / next

The real fix is physical: the cooler needs a hands-on inspection. Until then the guard is the honest backstop.
