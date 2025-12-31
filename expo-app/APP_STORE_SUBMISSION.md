# App Store Submission Guide - Pyramid Push

## Generated Assets

All assets are in `expo-app/app-store-assets/out/`:

### Screenshots (4 per device size)
- `screenshots/67/` - iPhone 15 Pro Max (6.7")
- `screenshots/65/` - iPhone 11 Pro Max (6.5") 
- `screenshots/55/` - iPhone 8 Plus (5.5")

Each folder contains:
1. `1.png` - Idle state ("100 Push-ups. One Workout.")
2. `2.png` - Working state ("Audio-guided reps")
3. `3.png` - Rest state ("Smart rest timers")
4. `4.png` - Finished state ("Track your progress")

### App Preview Video
- `preview.mp4` - 30 second preview (6.7" format)

---

## App Store Connect Submission

### 1. App Information

**Name:** Pyramid Push

**Subtitle:** 100 Push-ups. One Workout.

**Category:** Health & Fitness

**Age Rating:** 4+

### 2. Description

```
Do 100 push-ups in a single workout.

The pyramid method is simple: start small, build to a peak, then work back down. You do sets of 1, 2, 3... up to your peak (like 10), then 9, 8, 7... back down to 1. Before you know it, you've done 100 push-ups.

HOW IT WORKS
• Audio cues for every rep - just listen and push
• Smart rest timers - short breaks when it's easy, longer when it's hard
• Adjustable peak - start at 5 and work your way up to 10+
• Track your volume - see your total reps add up

NO EQUIPMENT. NO EXCUSES.
Your floor. Your arms. That's it.

We didn't invent the pyramid. We just made it impossible to mess up.

Proven for 70+ years.
```

### 3. Keywords

```
pushups,workout,fitness,exercise,bodyweight,strength,training,home workout,no equipment,pyramid
```

### 4. What's New (Version 1.0.0)

```
Initial release! Do 100 push-ups with audio-guided pyramid training.
```

### 5. URLs

**Privacy Policy:** https://pyramidpush.app/privacy (update with your actual URL)

**Support URL:** https://pyramidpush.app/support (or your email)

**Marketing URL:** https://pyramidpush.app (optional)

### 6. App Privacy

**Data Collection:** None

The app does not collect any user data. All settings are stored locally on device.

Privacy Nutrition Label:
- Data Not Collected

---

## Build & Submit Steps

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Configure EAS Build
```bash
cd expo-app
eas build:configure
```

### 4. Create Production Build
```bash
eas build --platform ios --profile production
```

### 5. Submit to App Store
```bash
eas submit --platform ios
```

Or manually:
1. Download the .ipa from EAS dashboard
2. Upload via Transporter app or App Store Connect

---

## Before You Submit Checklist

- [ ] Apple Developer account active ($99/year)
- [ ] App icon is 1024x1024 (check `assets/pyramid-push-pro.png`)
- [ ] Privacy policy URL is live
- [ ] Support email/URL ready
- [ ] Test on real device via TestFlight first
- [ ] Screenshots uploaded for all required sizes
- [ ] App preview video uploaded (optional but recommended)
- [ ] All metadata filled in App Store Connect

---

## TestFlight First (Recommended)

1. Build for TestFlight:
```bash
eas build --platform ios --profile preview
```

2. Submit to TestFlight:
```bash
eas submit --platform ios --profile preview
```

3. Test on real devices
4. When ready, build production and submit for review

---

## Review Tips

- App should work offline
- Audio should work with silent mode off
- Keep screen on during workout (wake lock implemented)
- Review usually takes 24-48 hours
- Respond quickly to any reviewer questions

Good luck! 🚀
