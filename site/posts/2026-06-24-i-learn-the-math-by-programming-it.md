---
title: "June 24 - I learn the math by programming it: a TI-84 library and going back to school"
date: 2026-06-24
topics: ["Education", "CS50x", "Self-study", "Programming", "TI-84", "Algebra"]
summary: "I went back to school as an adult and started teaching myself computer science through CS50x. Somewhere in the middle of College Algebra I figured out the trick that works for me: I don't really understand a thing until I've programmed it. So I built a small library of TI-84 calculator programs, and the building is what taught me the math."
---

The thing that clicked today: I don't learn a thing by reading it twice, I learn it by building it, and a College Algebra class turned out to be the proof. I'm back in school as an adult, which is a strange and good thing to admit in public. Two tracks are running at once: a self-paced Intro to IT course where I read the material and take open-book milestones, and CS50x, Harvard's intro to computer science, which I'm working through on my own clock toward a certificate. Quietly underneath both of them is College Algebra, which is not my first run at it.

## Built / shipped

A small library of programs for my TI-84, the same graphing calculator I had as a kid, written on a real keyboard and pushed over a USB cable in a few seconds. Over the course of College Algebra I built a vertex finder, a rational-zero candidate generator, a radical simplifier, synthetic division, polynomial long division, Cramer's rule, end-behavior, and the distance formula, a couple dozen little programs by the end.

## Problems & fixes

College Algebra is not my first run at it, and reading the material twice was never what got it to stick. What actually worked, and what I only figured out partway through this pass, is that I don't really understand a thing until I've programmed it. So instead of re-reading a section a third time, I started building a small TI-84 program for whatever concept wasn't landing, and that's what finally made it stick.

## Decisions

CS50x is structured as weeks: Scratch first, then C for most of the run, then a pivot to Python, then SQL and a little web. Doing it in C first is the point: by the time Python shows up in week six, all the hard ideas already live in your head and the new language is just nicer clothing on them.

CS50 only sanctions its own AI tutor, a rubber duck that will ask you questions and explain errors but flatly refuses to write your code. So the way I use any AI around the course is the same: explain the concept, interpret the error, never hand me the answer. It keeps me inside the spirit of the thing, and it turns out a tutor that won't just tell you is a better tutor anyway.

The rule I hold myself to on the TI-84 programs: they're for homework and for checking my own work, never a way to skip showing the steps, and before any proctored test I ask my instructor what's allowed and clear them if I should. The programs don't take the test for me. They just made sure I understood the material well enough to write them.

## Learned

Here's the thing nobody tells you: writing the program is the studying. To program a vertex finder I had to actually hold vertex form in my hands, the whole `a(x - h)^2 + k` of it. To write the rational-zero candidate generator I had to genuinely understand the theorem, that the candidates are every factor of the constant over every factor of the leading coefficient. To make a radical simplifier I had to think hard about prime factorization, which I thought I already understood and did not. Synthetic division, polynomial long division, Cramer's rule, end-behavior, the distance formula, each one went from a procedure I half-remembered to a thing I could explain to a machine, which is a much higher bar. If I want to understand something, I should try to build it.

## Still open / next

Both tracks keep running: the Intro to IT milestones, CS50x's later weeks, and the rest of College Algebra, with the TI-84 library growing alongside whatever the next unit needs.
