# Pinterest Aspect Ratio Filter - Chrome Extension

A Chrome extension that filters Pinterest images based on their aspect ratios. Perfect for finding images with specific dimensions like YouTube thumbnails (16:9), square images (1:1), or portrait images (9:16).

## Features

- **Real-time Filtering**: Automatically filters images as you browse Pinterest (feed, search results, boards)
- **Multiple Filter Modes**:
  - **Hide**: Completely removes non-matching images
  - **Blur**: Blurs non-matching images with a lock icon
  - **Dim**: Dims non-matching images with a "Filtered" label
- **Preset Aspect Ratios**:
  - 16:9 (YouTube/Widescreen)
  - 4:3 (Traditional TV)
  - 1:1 (Square)
  - 4:5 (Instagram Portrait)
  - 9:16 (Stories/Reels)
  - 2:3 (Pinterest Standard)
  - 3:4 (Portrait)
  - 5:4 (Medium Format)
- **Custom Ratios**: Add your own custom aspect ratios
- **Tolerance Control**: Adjust tolerance (0-20%) for slight variations in aspect ratios
- **Easy Toggle**: Quickly enable/disable filtering

## Installation

### Developer Mode Installation (Recommended for Testing)

1. **Download the Extension**
   - Clone or download this repository to your local machine

2. **Open Chrome Extensions Page**
   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Or go to Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `pinterest-aspect-ratio-filter` folder
   - The extension will appear in your extensions list

5. **Pin the Extension** (Optional)
   - Click the puzzle piece icon in Chrome's toolbar
   - Click the pin icon next to "Pinterest Aspect Ratio Filter"

## Usage

1. **Open Pinterest**
   - Navigate to any Pinterest page (pinterest.com)

2. **Configure Filters**
   - Click the extension icon in your toolbar
   - Select your preferred filter mode (Hide/Blur/Dim)
   - Check the aspect ratios you want to allow
   - Adjust tolerance if needed

3. **Add Custom Ratios** (Optional)
   - Enter width and height values
   - Click "Add" to create a custom ratio
   - Your custom ratios will be saved

4. **Browse Pinterest**
   - The extension automatically filters images based on your settings
   - Images matching your selected ratios will be shown normally
   - Non-matching images will be hidden, blurred, or dimmed

5. **Toggle On/Off**
   - Use the "Filter Active/Inactive" button to quickly enable/disable filtering

## How It Works

The extension:
1. Detects all images on Pinterest pages
2. Calculates each image's aspect ratio (width ÷ height)
3. Compares against your selected ratios (with tolerance)
4. Applies the chosen filter mode to non-matching images
5. Continuously monitors for new images as you scroll

## Permissions

The extension requires:
- **Access to pinterest.com**: To detect and filter images
- **Storage**: To save your filter preferences

## Tips

- **Tolerance**: Set a higher tolerance (10-15%) if you want to be less strict about exact ratios
- **Multiple Ratios**: Select multiple ratios to see a variety of image formats
- **Custom Ratios**: Use custom ratios for specific project requirements
- **Performance**: The "Hide" mode provides the best performance as it removes elements from the page

## Troubleshooting

**Images not filtering:**
- Refresh the Pinterest page after changing settings
- Make sure the filter is active (green toggle button)
- Check that you have at least one aspect ratio selected

**Extension not working:**
- Ensure you're on pinterest.com
- Try reloading the extension from chrome://extensions/
- Clear browser cache and reload Pinterest

**Custom ratios not saving:**
- Make sure to enter valid positive numbers
- Click "Save Settings" after adding custom ratios

## Privacy

This extension:
- Works entirely locally in your browser
- Does not collect or transmit any data
- Only accesses Pinterest pages when you visit them
- Stores settings locally in Chrome's sync storage

## Support

For issues or feature requests, please create an issue in the repository.

## License

MIT License - Feel free to modify and distribute as needed.