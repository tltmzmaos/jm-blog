---
title: "Building a Windows Installer for Offline Field Deployment"
description: "How I introduced a WiX-based Windows installer for deploying field software to air-gapped environments, and the unexpected challenges along the way."
pubDate: 2026-02-10
author: "Jongmin Lee"
tags: ["Software Engineering", ".NET", "Best Practices"]
draft: false
---

## Context

I develop an equipment orchestration service in the Lab Automation space. The application is built with .NET 8.0 and React+Vite — an offline web application deployed to Windows Server machines connected to each automation instrument.

Recently, customers' network security policies have become increasingly strict. Most field sites are now air-gapped environments where internet connectivity simply cannot be expected. This made our existing deployment approach unsustainable.

## Problem

Our deployment process evolved through three stages, each addressing the limitations of the previous one.

### Stage 1: Remote Access + GitHub Build

Initially, a developer would remotely access the field PC, connect to the internet, pull the tagged release source from GitHub, build it, and run the service. This required field engineers to set up internet connectivity first, and the build process itself had to be handled by a developer.

### Stage 2: Binary Distribution

As more sites went offline, we switched to distributing pre-built binaries directly. But this introduced a different problem: the deployment procedure required detailed step-by-step guides. Where to place the files, in what order to run things, how to handle existing files — the number of steps field engineers had to follow was significant.

### Stage 3: Installer

What we actually needed was a one-click deployment. Hand off an installer file, and the field engineer just runs it. That's it.

## Exploration

There were a few options for building Windows installers.

| Tool | Characteristics | Assessment |
|------|----------------|------------|
| **WiX Toolset** | MSI-based, XML configuration, CI/CD friendly | Good for cross-team consistency and extensibility |
| **Inno Setup** | Script-based, lightweight, quick to set up | Suitable for simple cases but limited extensibility |
| **VS Installer Projects** | Visual Studio integrated, GUI-based configuration | Unusable — main development environment is macOS |

VS Installer Projects was ruled out immediately since it requires Visual Studio, and our primary development environment is macOS. Inno Setup could get something working quickly, but it would be harder to maintain consistency with other teams.

I went with WiX. Other teams in the organization were already using it, so it made sense for consistency. The XML-based configuration also integrates well with GitHub Actions, and the toolset is extensible enough to handle future growth.

## Implementation

The core challenge was designing the GitHub Actions workflow.

The installer capability was newly added, which means previously released tag versions don't have any WiX configuration in their source. But if we can only build installers for new versions going forward, that's a problem — various versions are running across different field sites.

Here's how I designed the workflow to solve this:

1. Trigger the workflow with a desired tag version as input
2. Validate that the tag corresponds to an actual released version
3. In the GitHub Actions Windows runner, check out the **source code from the specified tag version**
4. Simultaneously, pull the **WiX configuration files from the latest branch**
5. Build the application from the tag version source, then generate the installer using the latest WiX configuration
6. Store the completed installer as a workflow artifact

This approach gives us backward compatibility without modifying any past releases. The WiX configuration only needs to be maintained on the latest branch, yet any previously released tag version can be packaged into an installer.

## Challenges

Building the installer itself was just the starting point. There were more considerations than I initially expected.

### Application Lifecycle

The application isn't registered as a Windows service — it runs as a desktop program, launched via a shortcut. Each time it starts, it spins up the services it needs. The installer had to set up the shortcut, ensure the correct startup behavior, and handle cleanup on uninstall.

### File Paths

Installation paths, configuration file locations, log directories — all of these needed explicit decisions. When deploying manually, we could handle paths flexibly. With an installer, everything must be precisely defined upfront.

### Preserving Existing Deployments

When upgrading an environment that's already running, existing configurations and data must not be wiped out. Fortunately, we scoped this iteration to exclude database changes, which kept the problem manageable.

### Validation

Validation consumed the most time by far. I tested on an actual Windows laptop — installing, uninstalling, and upgrading across multiple versions, over and over. This is an area that's difficult to cover with automated tests, so manual verification was unavoidable.

## Results

After introducing the installer, deployment time dropped by roughly 90%. I didn't measure the absolute numbers precisely, but the previous process — from establishing remote access to building and running the service — collapsed down to "hand off the installer file, run it." The difference is substantial.

More importantly, the deployment ownership shifted. What used to require a developer to handle directly can now be done by a field engineer simply running the installer.

## What's Next

There's still an open item. Since we use EF Core, schema changes require database migrations. How to incorporate DB migration into the installer process — especially in an offline environment — is a problem I haven't solved yet. That will be the next challenge to tackle.

## Reflection

I initially thought of this as a straightforward task — "just build an installer." In practice, there were far more considerations: application lifecycle management, file path design, preserving existing environments, and extensive validation. Even if I did this again, I'd probably go through similar trial and error, though having the experience now, I might explore other installer tools next time around.

If you're dealing with offline deployment and considering an installer, I'd recommend adopting one sooner rather than later. That said, every organization has different deployment procedures and policies, so the specific pain points you encounter may differ from mine. The key insight is that it's hard to predict where the challenges will come from — so budget generous time for validation.
