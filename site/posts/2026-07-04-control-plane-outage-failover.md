---
title: "July 4 - the night my control-plane machine died and I failed the homelab over to a standby"
date: 2026-07-04
topics: ["Homelab", "Reliability", "Incident response", "Failover", "Monitoring", "Self-hosting"]
summary: "I caused an outage by running a heavy job on the one machine that holds everything together, then spent the night proving my failover plan actually works."
---

The thing that clicked today: I caused an outage by running a heavy job on the one machine that holds everything together, then spent the night proving my failover plan actually works.

## Built / shipped

Failed the whole control plane over to a standby. The small always-on machine that runs my homelab's control plane (the automation relay, the dashboard, the public tunnel) went hard-down. Instead of waiting to physically reboot it, I promoted a standby machine I had kept around, moving the public tunnel, the relay, and the dashboard onto it and bringing most of the public surface back within a few hours.

Rebuilt the dashboard from its own build history. The dashboard's code lived only on the dead machine's SD card, nowhere else. I reconstructed it from scratch on the standby by replaying my recorded build history in order, even recovering missing font files out of those records because they existed nowhere else on disk.

Kept working the whole time. My notes are replicated across several machines, so even with the fleet severed I kept full access and wrote up the incident as it unfolded.

## Problems & fixes

I caused it. The trigger was mine: I launched a heavy audit job directly on the control-plane machine, on top of the services it was already running, and starved it into a lock-up. Lesson learned the hard way: heavy work does not belong on the box that holds everything together.

The rebuilt site kept erroring. After redeploying the reconstructed dashboard, the public address returned errors. The cause was a bind mismatch: the service was listening only on loopback, but the tunnel reaches it on a different interface. Binding to all interfaces fixed it, safe here because the access gate refuses unauthenticated requests anyway. That became a standing failover checklist item.

## Decisions

Prove the plan under real failure, not in a drill. I had a failover design on paper. Rather than treat the outage as pure damage, I used it to exercise that design for real, which is the only test that counts.

Recover, do not wait. Promoting the standby beat sitting on my hands until someone could physically power-cycle the dead box.

## Learned

A standby that impersonates the dead machine can hide that it is dead. The rebuilt dashboard showed the dead machine as healthy and green, because its health check was now being answered by the standby, not the dead box. A health check has to prove the physical machine is alive, not just that the services usually hosted there are reachable. I would never have seen that gap without the outage.

## Still open / next

The dead machine still needs its power-cycle and a proper look, and the monitoring needs a true per-box liveness check so a dead machine can never read as green again.
