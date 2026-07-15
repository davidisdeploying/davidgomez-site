---
title: "May 10 - my cloud capstone: pricing, deploying, and auto-scaling a web app on AWS"
date: 2026-05-10
topics: ["AWS", "Cloud", "High availability", "Auto-scaling", "Cost estimation", "Multi-cloud"]
summary: "My cloud course capstone made me do the whole job, price an architecture before building it, stand it up on AWS, make it survive load, and move its data to a second cloud."
---

The thing that clicked today: my cloud course capstone made me do the whole job, price an architecture before building it, stand it up on AWS, make it survive load, and move its data to a second cloud, and that end-to-end sweep is what turned cloud from concepts into something I have actually done.

## Built / shipped

Priced the architecture before building it. The first deliverable was not code, it was a monthly cost estimate: two web servers behind a load balancer, a managed database, secrets storage, and the data-transfer costs, all pinned to one region. Landing on a realistic monthly number (a couple hundred dollars, dominated by data transfer out) before touching a console is a discipline I had not practiced, and it changes how you design.

Deployed it for real on AWS. A web server running a small address-book app, moved off a local database onto a managed database instance, with the network split into public and private subnets and the database credentials held in a secrets service rather than in the code.

Made it highly available and auto-scaling. This is the heart of it: a load balancer in front, a launch template describing a server, and an auto-scaling group set to keep two servers and grow to four, driven by average CPU. Then I load-tested it hard enough to watch it scale out on its own and serve traffic through the load balancer's address.

Took the data multi-cloud. The finale moved the database's contents from AWS into a second cloud provider: dump the database, stage it in AWS object storage, and copy it across into the other cloud's storage. One app, two clouds.

## Problems & fixes

Not every zone runs every machine. One availability zone in the region did not support the small instance type I was using, so including it in the auto-scaling group quietly broke things. Excluding it fixed it, and it taught me that "the region" is really a set of zones with their own quirks.

Permissions are part of the architecture. The role my servers ran under did not always have permission to read the secret holding the database password. Making sure the running instances could actually get their credentials drove home that identity and permissions are not an afterthought, they are load-bearing.

## Decisions

Estimate first, build second. Doing the pricing exercise before the deployment was worth it. Knowing what an architecture costs, and what drives the cost, is part of designing it well, not a formality.

Managed over hand-rolled. Using a managed database, a managed load balancer, and a managed secrets store instead of standing each up by hand is the point of cloud: lean on the primitives so the design is about how they fit together.

## Learned

High availability is a shape, not a feature. Two servers behind a load balancer, in an auto-scaling group, across zones, is a shape you compose from primitives. Watching it scale out under real load made the abstract idea concrete.

The homelab and the cloud are the same instincts at different scales. Everything I later did at home (redundancy, failover, watching a system under load, health checks) is the same thinking this capstone taught me on cloud primitives. That is why I keep pointing my work toward cloud: it is where these instincts belong at scale.

## Still open / next

This was a course capstone, a learning build, not a production system I run. The next step is the obvious one: put these patterns to work on something real, at cloud scale.
