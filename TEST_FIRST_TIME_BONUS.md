# Testing First-Time Bonus Credit Feature

## How to Test the First-Time User Bonus

### Prerequisites
1. You need to be on the `/generate/refine` page
2. You need to have selected an aesthetic, shot type, and wardrobe
3. The first prompt should cost 10 credits (you start with 5)

### Step-by-Step Testing

#### Option 1: Test as Anonymous User (No Login)

1. **Clear localStorage to reset bonus status:**
   ```javascript
   // Open browser console (F12) and run:
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Set initial credits to 5:**
   ```javascript
   localStorage.setItem("credits", "5");
   localStorage.setItem("totalGenerations", "0");
   ```

3. **Navigate to the app:**
   - Go to `/generate`
   - Enter some input text
   - Click "Manifest"
   - Select aesthetic, shot type, wardrobe
   - Click "Continue"

4. **Expected Behavior:**
   - Modal should appear with:
     - 🎁 Gift icon animation (spring animation)
     - "First-Time Bonus!" heading
     - Credit breakdown showing:
       - Current Credits: 5
       - Required: 10
       - After Bonus: 10
     - Checkbox to accept bonus
     - "Claim Bonus & Generate" button (disabled until checkbox checked)
     - "Maybe Later" button

5. **Test the animations:**
   - Modal should fade in with scale animation
   - Gift icon should spring into view
   - Checkbox should trigger haptic feedback when clicked
   - Button should enable/disable based on checkbox state

#### Option 2: Test as Logged-In User

1. **Clear user-specific bonus status:**
   ```javascript
   // Replace 'your-user-id' with actual user ID
   const userId = 'your-user-id';
   localStorage.removeItem(`firstTimeBonusReceived_${userId}`);
   localStorage.removeItem(`firstLogin_${userId}`);
   localStorage.setItem("credits", "5");
   localStorage.setItem("totalGenerations", "0");
   ```

2. **Follow steps 3-5 from Option 1**

### Testing the Micro-Animations & Delight Features

#### 1. Modal Entrance Animation
- **What to look for:**
  - Backdrop fades in (opacity 0 → 1)
  - Modal scales up from 0.95 → 1.0
  - Modal slides up (y: 20 → 0)
  - All animations should be smooth (300ms duration)

#### 2. Gift Icon Animation
- **What to look for:**
  - Icon starts at scale 0 (invisible)
  - Springs into view with bounce effect
  - Uses spring physics (stiffness: 200, damping: 15)
  - Should feel playful and delightful

#### 3. Haptic Feedback
- **When it triggers:**
  - Clicking the checkbox
  - Clicking "Claim Bonus & Generate"
  - Should feel like a gentle vibration (hapticMedium)

#### 4. Button States
- **Disabled state:**
  - Opacity: 0.5
  - Cursor: not-allowed
  - Button text: "Claim Bonus & Generate"
  
- **Enabled state:**
  - Opacity: 1.0
  - Cursor: pointer
  - Hover effect: darker champagne color
  - Shadow: shadow-lg

#### 5. Credit Display Animation
- **What to look for:**
  - Credit numbers should be clearly visible
  - "After Bonus" should highlight in champagne color
  - Smooth transitions when credits update

### Quick Test Script

Run this in your browser console to quickly reset and test:

```javascript
// Reset everything for testing
localStorage.clear();
sessionStorage.clear();

// Set up first-time user state
localStorage.setItem("credits", "5");
localStorage.setItem("totalGenerations", "0");

// Reload the page
window.location.reload();
```

Then:
1. Go to `/generate`
2. Enter input and proceed to refine page
3. Select aesthetic, shot type, wardrobe
4. Click "Continue"
5. Modal should appear!

### Troubleshooting

**Modal doesn't appear:**
- Check that `totalGenerations === 0`
- Check that `credits < creditCost.totalCost` (should be 5 < 10)
- Check that bonus hasn't been received: `localStorage.getItem("firstTimeBonusReceived_anonymous")` should be null
- Check browser console for errors

**Modal appears but animations don't work:**
- Check that Framer Motion is loaded
- Check browser console for errors
- Try hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

**Credits not updating after claiming bonus:**
- Check that `grantFirstTimeBonus` is being called
- Check localStorage: `localStorage.getItem("credits")` should be "10"
- Check that `firstTimeBonusReceived_*` key is set

### Expected User Flow

1. **User starts with 5 credits** (initial state)
2. **User selects options** that cost 10 credits total
3. **User clicks "Continue"**
4. **Modal appears** with delightful animations
5. **User checks the checkbox** (haptic feedback)
6. **User clicks "Claim Bonus & Generate"**
7. **Credits update to 10** (5 + 5 bonus)
8. **Generation proceeds**
9. **After generation, credits are 0** (10 - 10 = 0)
10. **User must upgrade** to generate more prompts

### Visual Delight Features

- ✨ Spring animation on gift icon
- 🎨 Smooth fade-in backdrop with blur
- 💫 Scale and slide-up modal entrance
- 🎯 Haptic feedback on interactions
- 🌟 Champagne/gold color scheme
- 📊 Clear credit breakdown visualization
- ✅ Interactive checkbox with visual feedback
- 🎁 Gift emoji and iconography

