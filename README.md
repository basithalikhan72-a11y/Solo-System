# Solo System — downloadable starter project

A mobile-first, installable-web-app starter inspired by RPG quest systems. It includes:
- Dark blue holographic-style dashboard
- Suggested quests that the player approves
- Quest completion, XP, levels, streak tracking, and attribute stats
- Missed-quest recovery and valid-exception handling
- Weekly boss checklist and XP reward
- Manual screen-time logging and local settings
- Local browser storage and basic offline caching

## Important: phone app control is NOT implemented in this web starter

A website/PWA cannot reliably inspect other apps' usage or block apps across iOS and Android. This project deliberately does not pretend otherwise. Its screen-time log is manual.

### What is needed for real device integration

**iPhone / iOS**
- A native iOS app using Apple's FamilyControls, ManagedSettings, and DeviceActivity frameworks.
- The app must request the appropriate Family Controls capability/entitlement and ask the device owner for authorization. Distribution can require Apple's approval of the entitlement.
- App selection and restrictions happen through Apple's supported Screen Time APIs; this cannot be added by a simple website.

Official Apple documentation:
https://developer.apple.com/documentation/screentimeapidocumentation
https://developer.apple.com/documentation/familycontrols

**Android**
- A native Android app can request usage access and query UsageStatsManager for app usage.
- The user must explicitly grant Usage Access in system settings; declare the relevant usage permission in the manifest.
- Blocking selected apps needs a separate, carefully designed implementation and is not guaranteed by UsageStatsManager alone. Accessibility-based approaches have significant policy and privacy constraints, so this starter does not enable or hide such access.

Official Android documentation:
https://developer.android.com/reference/android/app/usage/UsageStatsManager

## Run it

### Quick preview
Open `index.html` in a browser. Core quests and local saving work, but offline installation/service worker needs HTTPS or localhost.

### Install to phone
1. Host the folder on an HTTPS static host (or run it from a local development server).
2. Open the URL in Safari on iPhone or Chrome on Android.
3. iPhone: Share → Add to Home Screen. Android: browser menu → Install app / Add to Home screen.
4. This installs the web version only; it does not grant system-wide app usage or blocking controls.

## Data and safety
- Progress is stored locally in that browser/device using localStorage. It does not sync automatically between devices.
- Reset removes local progress.
- Missed quests do not trigger physical punishment, money penalties, or dangerous challenges.
- Use valid exceptions for illness, emergencies, essential communication, and rest.
- Notifications and native app-control integrations are not yet included.

## Next engineering phase
To deliver the full cross-platform app, build native Android and iOS shells with separate platform modules, secure local storage, notification scheduling, explicit permissions, and a clear setup flow. Test on physical devices and confirm Apple entitlements before promising iPhone app blocking.
