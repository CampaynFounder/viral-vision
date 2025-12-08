# Open Graph Image Setup

## Image Requirements

1. **File Name**: `og-image.png` (or `og-image.jpg`)
2. **Location**: `/public/og-image.png`
3. **Recommended Size**: 1200x630 pixels (1.91:1 aspect ratio)
4. **Format**: PNG or JPG

## What's Been Updated

✅ **Metadata in `app/layout.tsx`**:
- Title changed to: "Soft Life Software to get the Hyper Realistic AI Influencer bag."
- Added Open Graph tags for social media sharing
- Added Twitter Card metadata
- OG image path configured as `/og-image.png`

✅ **Manifest updated**:
- Updated app name to "VVS Prompts"

## Next Steps

1. Save your logo image as `og-image.png` in the `/public` folder
2. Ensure the image is 1200x630 pixels for optimal social media display
3. The image will automatically be used for:
   - Facebook/LinkedIn shares
   - Twitter cards
   - Other social media platforms

## Testing

After adding the image, test the OG tags using:
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

