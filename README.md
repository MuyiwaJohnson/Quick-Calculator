# 🧮 QuickCalc - Smart Web Calculator Extension

> **Just double-click a number, and it's done.** A powerful, floating calculator extension that makes web calculations effortless.

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-blue?logo=google-chrome)](https://chrome.google.com/webstore)
[![Firefox Add-ons](https://img.shields.io/badge/Firefox%20Add--ons-Install-orange?logo=firefox-browser)](https://addons.mozilla.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

### 🎯 **Smart Number Detection**
- **Double-click any number** on any webpage to add it to your calculator
- Supports numbers with **commas**, **decimals**, and **currency symbols**
- **Visual feedback** with animated number indicators
- **Smart positioning** - calculator appears near your cursor

### 🧮 **Powerful Calculator**
- **5 Operations**: Addition (+), Subtraction (-), Multiplication (×), Division (÷), Percentage (%)
- **Real-time calculations** with instant results
- **History tracking** - see all your calculations at a glance
- **Undo functionality** - easily reverse mistakes
- **Copy to clipboard** - formatted results ready to paste

### 🎨 **Modern UI/UX**
- **Floating calculator** that follows your cursor
- **Draggable interface** - position it anywhere on screen
- **Smooth animations** powered by Framer Motion
- **Dark theme** with elegant styling
- **Responsive design** that adapts to content

### ⌨️ **Keyboard Shortcuts**
- **Ctrl+Z** - Undo last operation
- **Ctrl+R** - Reset calculator
- **Escape** - Close calculator

### 🔧 **Smart Features**
- **Auto-hide** when not in use
- **Persistent state** - remembers your calculations
- **Overflow protection** - prevents calculation errors
- **Error handling** - graceful handling of invalid operations

## 🚀 Installation

### From Source
```bash
# Clone the repository
git clone https://github.com/yourusername/cursor-simple-calc-ext.git
cd cursor-simple-calc-ext

# Install dependencies
pnpm install

# Development
pnpm dev

# Build for production
pnpm build
```

### Browser Installation
1. Build the extension: `pnpm build`
2. Open your browser's extension management page
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` folder

## 📖 Usage

### Basic Usage
1. **Click the extension icon** to open the calculator
2. **Double-click any number** on the webpage
3. **Watch it appear** in your calculator with visual feedback
4. **Change operations** using the operation buttons
5. **Copy results** with the copy button

### Advanced Usage
- **Drag the calculator** to reposition it
- **Use keyboard shortcuts** for quick actions
- **View calculation history** in the scrollable list
- **Undo mistakes** with Ctrl+Z or the undo button

### Supported Number Formats
- `123` - Plain numbers
- `1,234` - Numbers with commas
- `123.45` - Decimal numbers
- `$123.45` - Currency (number part extracted)
- `123%` - Percentages (number part extracted)

## 🛠️ Development

### Tech Stack
- **Framework**: React 19 + TypeScript
- **Build Tool**: WXT (Web Extension Toolkit)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Project Structure
```
entrypoints/
├── background/          # Background script
├── content/            # Content script (main calculator)
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   └── utils/          # Utility functions
└── popup/              # Extension popup (settings)
```

### Key Components
- **`ContentCalculatorUI`** - Main calculator interface
- **`CursorShadow`** - Floating calculator container
- **`useCalculator`** - Calculator logic and state management
- **`TotalDisplay`** - Results display with formatting
- **`HistoryList`** - Calculation history component

### Development Commands
```bash
# Start development server
pnpm dev

# Build for Chrome
pnpm build

# Build for Firefox
pnpm build:firefox

# Create distribution zip
pnpm zip

# Type checking
pnpm compile
```

## 🎯 Features in Detail

### Smart Number Extraction
The extension uses advanced regex patterns to detect and extract numbers from any webpage text, handling various formats including:
- International number formats
- Currency symbols
- Percentage signs
- Decimal separators

### Real-time Calculations
- **Instant feedback** when numbers are added
- **Visual operation indicators** with color coding
- **Error handling** for division by zero and overflow
- **Precision handling** for large numbers

### Responsive Design
- **Adaptive positioning** - calculator stays within viewport
- **Smart flipping** - appears above cursor when space is limited
- **Touch-friendly** - works on touch devices
- **Accessible** - keyboard navigation support

## 🔧 Configuration

### Calculator Settings
- **Default operation**: Choose your preferred starting operation
- **History limit**: Set maximum number of history items
- **Overflow protection**: Enable/disable large number warnings
- **Currency format**: USD or NGN support

### UI Customization
- **Theme**: Dark theme (light theme coming soon)
- **Position**: Remember calculator position
- **Size**: Adjustable calculator dimensions
- **Animations**: Smooth motion effects

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful component and function names
- Add JSDoc comments for complex functions
- Ensure responsive design works on all screen sizes
- Test on multiple browsers

## 🐛 Known Issues

- **Firefox**: Some animation differences due to browser limitations
- **Safari**: Limited support for certain CSS features
- **Mobile**: Touch interactions may need refinement

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **WXT** for the excellent extension development toolkit
- **Framer Motion** for smooth animations
- **Tailwind CSS** for the beautiful styling system
- **Lucide React** for the elegant icons

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/cursor-simple-calc-ext/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/cursor-simple-calc-ext/discussions)
- **Email**: your-email@example.com

---

**Made with ❤️ for developers who love efficiency**

*QuickCalc - Because every number deserves to be calculated.*
