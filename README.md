# ThinkDrink - Cocktail Explorer 🍸

A modern, mood-based cocktail recommendation app inspired by the Moodagent interface. Find your perfect drink based on your current mood with interactive sliders and smart recommendations.

![ThinkDrink App](https://img.shields.io/badge/Status-Live-brightgreen)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![PWA](https://img.shields.io/badge/PWA-Enabled-blue)
![iOS Ready](https://img.shields.io/badge/iOS-Ready-purple)

## ✨ Features

### 🎚️ **Interactive Mood Sliders**
- **6 mood dimensions**: Energetic, Relaxed, Romantic, Adventurous, Celebratory, Cozy
- **1-10 scale**: Fine-tune your preferences
- **Real-time updates**: See recommendations change as you slide
- **Reset & Random**: Quick controls for exploration

### 🧠 **Smart Recommendations**
- **Weighted algorithm**: Considers both your preferences and drink scores
- **Multi-mood matching**: Find drinks that match multiple moods
- **Anti-preference**: Avoid drinks with unwanted mood characteristics
- **Dynamic scoring**: Best matches highlighted automatically

### 📱 **Modern Interface**
- **Moodagent-inspired design**: Clean, intuitive interface
- **Glassmorphism effects**: Beautiful blur and transparency
- **Responsive design**: Works on all devices
- **PWA ready**: Install as a mobile app

### 🍹 **Rich Cocktail Database**
- **122+ cocktails** with detailed information
- **Complete recipes**: Ingredients, instructions, glassware
- **Mood scoring**: Each drink rated for 6 mood dimensions
- **Spirit categorization**: Filter by Vodka, Rum, Gin, Whiskey, Tequila, Brandy, Liqueur
- **Difficulty levels**: Easy, Medium, Hard

## 🚀 Quick Start

### Option 1: Live Demo
Visit the live app: [ThinkDrink App](https://your-github-pages-url.com)

### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/craigjd77/thinkdrink.git
cd thinkdrink

# Start local server
python3 -m http.server 8080
# or
npx serve .

# Open in browser
open http://localhost:8080
```

## 📱 Mobile App (iOS)

This web app can be converted to an iOS app using Capacitor:

```bash
# Install Capacitor
npm install -g @capacitor/cli

# Add iOS platform
npx cap add ios

# Build and open in Xcode
npx cap build ios
npx cap open ios
```

## 🎯 How It Works

1. **Adjust Mood Sliders**: Set your current mood preferences (1-10 scale)
2. **Get Recommendations**: See cocktails that match your mood profile
3. **Explore Details**: Tap any drink for full recipe and instructions
4. **Save Favorites**: Heart drinks you love for quick access
5. **Try Random**: Discover new drinks with random mood combinations

## 🏗️ Architecture

```
thinkdrink-app/
├── index.html          # Main app structure
├── styles.css          # Glassmorphism styling
├── script.js           # Mood logic & recommendations
├── data/
│   └── drinks.json     # Cocktail database (122+ drinks)
├── manifest.json       # PWA configuration
├── sw.js              # Service worker
└── package.json        # Capacitor setup
```

## 🔧 Technical Details

- **Pure JavaScript**: No frameworks, fast and lightweight
- **Local Storage**: Saves favorites and recent picks
- **Progressive Web App**: Installable on mobile devices
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Keyboard navigation and screen reader friendly

## 📊 Database Schema

Each cocktail includes:
```json
{
  "id": 1234,
  "name": "Cocktail Name",
  "spirit": "Vodka",
  "difficulty": "Medium",
  "description": "Brief description",
  "ingredients": ["ingredient1", "ingredient2"],
  "instructions": "Step-by-step recipe",
  "glass": "Cocktail Glass",
  "garnish": "Lime wheel",
  "moods": {
    "energetic": 7,
    "relaxed": 4,
    "romantic": 6,
    "celebratory": 8,
    "cozy": 3
  },
  "fancy": 28
}
```

## 🎨 Design Philosophy

Inspired by the Moodagent app's clean, intuitive interface:
- **Glassmorphism**: Frosted glass effects with blur
- **Gradient backgrounds**: Dynamic color schemes
- **Interactive elements**: Hover effects and smooth transitions
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Generous whitespace for clarity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Moodagent**: Design inspiration for the interface
- **CocktailDB**: Recipe data and inspiration
- **Community**: All the cocktail enthusiasts who contributed recipes

---

**Made with ❤️ by Craig Dalessio**

*Find your perfect cocktail mood* 🍸✨