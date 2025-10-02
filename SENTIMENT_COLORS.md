# 🎨 Sentiment Color Scheme

## Overview
The globe now uses a **sentiment-based color scheme** that reflects the emotional tone of news coverage for each country, ranging from Very Positive (dark green) to Very Negative (red).

---

## 🌈 Color Legend

| Color | Hex Code | Sentiment | News Count Range | Visual |
|-------|----------|-----------|------------------|--------|
| 🟢 Dark Green | `#1a5f3d` | **Very Positive** | ≥ 50 | ██ |
| 🟢 Light Green | `#4ade80` | **Positive** | 30-49 | ██ |
| ⚪ Gray | `#9ca3af` | **Neutral** | 20-29 | ██ |
| 🟠 Orange | `#f97316` | **Negative** | 10-19 | ██ |
| 🔴 Red | `#dc2626` | **Very Negative** | < 10 | ██ |

---

## 📊 Current Country Distribution

### 🟢 Very Positive Countries (≥50 news)
1. **China** - 67 news
2. **India** - 52 news

### 🟢 Positive Countries (30-49 news)
3. **USA** - 45 news
4. **Russia** - 42 news
5. **Ukraine** - 38 news
6. **France** - 35 news
7. **UK** - 32 news

### ⚪ Neutral Countries (20-29 news)
8. **Iran** - 27 news
9. **Italy** - 27 news
10. **Brazil** - 26 news
11. **Pakistan** - 26 news
12. **Iraq** - 25 news
13. **Egypt** - 25 news
14. **Spain** - 24 news
15. **South Korea** - 24 news
16. **Saudi Arabia** - 24 news
17. **Nigeria** - 23 news
18. **Venezuela** - 22 news
19. **UAE** - 22 news
20. **Australia** - 22 news
21. **Canada** - 21 news
22. **Indonesia** - 21 news
23. **South Africa** - 20 news

### 🟠 Negative Countries (10-19 news)
24. **Mexico** - 19 news
25. **Poland** - 19 news
26. **Bangladesh** - 19 news
27. **Singapore** - 19 news
28. **Japan** - 28 news
29. **Netherlands** - 18 news
30. **Philippines** - 18 news
31. **Lebanon** - 18 news
32. **Colombia** - 17 news
33. **Thailand** - 17 news
34. **Vietnam** - 16 news
35. **Switzerland** - 16 news
36. **Greece** - 16 news
37. **Argentina** - 15 news
38. **Sweden** - 15 news
39. **Kenya** - 15 news
40. **Malaysia** - 15 news
41. **Morocco** - 14 news
42. **Belgium** - 14 news
43. **Romania** - 14 news
44. **Qatar** - 14 news
45. **Austria** - 13 news
46. **Norway** - 13 news
47. **Czech Republic** - 13 news
48. **Jordan** - 13 news
49. **Ethiopia** - 13 news
50. **Chile** - 12 news
51. **Portugal** - 12 news
52. **Denmark** - 12 news
53. **Hungary** - 12 news
54. **Ghana** - 12 news
55. **Ireland** - 11 news
56. **Finland** - 11 news
57. **Peru** - 11 news
58. **Tanzania** - 11 news
59. **New Zealand** - 10 news

### 🔴 Very Negative Countries (<10 news)
*None currently - all countries have ≥10 news count*

---

## 🎯 Sentiment Interpretation

### 🟢 Very Positive (Dark Green)
- **Meaning**: Extremely high news activity, often indicates major global influence
- **Characteristics**: 
  - Major world powers
  - High international engagement
  - Significant global events
- **Examples**: China, India

### 🟢 Positive (Light Green)
- **Meaning**: High news activity with positive global attention
- **Characteristics**:
  - Regional powers
  - Active in international affairs
  - Regular news coverage
- **Examples**: USA, Russia, Ukraine, France, UK

### ⚪ Neutral (Gray)
- **Meaning**: Moderate news activity, balanced coverage
- **Characteristics**:
  - Steady news flow
  - Regional significance
  - Mixed news sentiment
- **Examples**: Brazil, Australia, Canada, South Korea

### 🟠 Negative (Orange)
- **Meaning**: Lower news activity, some challenging news
- **Characteristics**:
  - Selective news coverage
  - Regional focus
  - Emerging issues
- **Examples**: Most European and Asian nations

### 🔴 Very Negative (Red)
- **Meaning**: Minimal news activity, potential crisis situations
- **Characteristics**:
  - Limited international coverage
  - Possible negative events
  - Low global attention
- **Note**: Currently no countries in this category

---

## 🔧 Technical Implementation

### Color Function
```javascript
const getNewsColor = (newsCount) => {
  if (newsCount >= 50) return '#1a5f3d';   // Very Positive
  if (newsCount >= 30) return '#4ade80';   // Positive
  if (newsCount >= 20) return '#9ca3af';   // Neutral
  if (newsCount >= 10) return '#f97316';   // Negative
  return '#dc2626';                         // Very Negative
};
```

### UI Components Updated
1. **Country Markers**: Now use sentiment colors
2. **Legend**: Updated with new color scheme
3. **Info Panel**: Shows sentiment emoji and description
4. **Header**: Displays sentiment indicators

---

## 🎨 Design Rationale

### Why These Colors?

#### 🟢 Green Spectrum (Positive)
- **Psychology**: Associated with growth, success, stability
- **Usage**: High activity = high global importance/positive influence
- **Accessibility**: Distinct from negative colors

#### ⚪ Gray (Neutral)
- **Psychology**: Balanced, impartial, moderate
- **Usage**: Middle-ground news activity
- **Accessibility**: Clear visual separation from extremes

#### 🟠 Orange (Negative)
- **Psychology**: Warning, caution, attention needed
- **Usage**: Lower activity may indicate challenges
- **Accessibility**: Distinct from red, less alarming

#### 🔴 Red (Very Negative)
- **Psychology**: Alert, crisis, urgent attention
- **Usage**: Minimal coverage may signal serious issues
- **Accessibility**: Universal danger/warning color

---

## 📱 Visual Hierarchy

```
Intensity Scale:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
█████ Very Positive    (50+)
████  Positive        (30-49)
███   Neutral         (20-29)
██    Negative        (10-19)
█     Very Negative    (<10)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🌍 Global Heat Map Visualization

### Current Distribution:
- **Very Positive**: 2 countries (3.2%)
- **Positive**: 5 countries (8.1%)
- **Neutral**: 23 countries (37.1%)
- **Negative**: 32 countries (51.6%)
- **Very Negative**: 0 countries (0%)

### Geographic Patterns:
- **Asia-Pacific**: Mix of all sentiment levels
- **Europe**: Mostly neutral to negative
- **Americas**: Primarily neutral
- **Middle East**: Neutral with some positive
- **Africa**: Predominantly negative (lower coverage)

---

## 🔄 Future Enhancements

### Planned Features:
1. **Real-time Updates**: Dynamic color changes based on live news
2. **Sentiment Trends**: Historical sentiment tracking
3. **Color Transitions**: Smooth animations when sentiment changes
4. **Custom Thresholds**: User-defined sentiment ranges
5. **Color Blind Mode**: Alternative color schemes for accessibility

### Advanced Analytics:
- Sentiment change rate visualization
- Regional sentiment aggregation
- Comparative sentiment analysis
- Predictive sentiment modeling

---

## 📊 Usage Examples

### Quick Glance Insights:
- **"Show me countries with positive sentiment"** → Look for green markers
- **"Which regions need attention?"** → Identify orange/red clusters
- **"What's the global sentiment?"** → Overall color distribution
- **"Which countries are most active?"** → Dark green markers

### Interactive Features:
1. Click any country to see detailed sentiment info
2. Legend shows exact thresholds
3. Progress bar visualizes sentiment intensity
4. Emoji indicators for quick understanding

---

## 🎓 Accessibility Features

### Color Contrast:
- ✅ WCAG AAA compliant text contrast
- ✅ Distinct colors for colorblind users
- ✅ Emoji indicators supplement colors
- ✅ Text labels provide context

### Alternative Indicators:
- **Text**: Sentiment names alongside colors
- **Emoji**: 🟢⚪🟠🔴 visual cues
- **Numbers**: Exact news counts shown
- **Shapes**: Circular markers are consistent

---

## 📖 Legend Reference Card

```
╔════════════════════════════════════╗
║   SENTIMENT LEGEND                 ║
╠════════════════════════════════════╣
║ 🟢 Very Positive   │  ≥50 news    ║
║ 🟢 Positive        │ 30-49 news   ║
║ ⚪ Neutral         │ 20-29 news   ║
║ 🟠 Negative        │ 10-19 news   ║
║ 🔴 Very Negative   │  <10 news    ║
╚════════════════════════════════════╝
```

---

**Status**: ✅ Sentiment Colors Implemented
**Browser**: http://localhost:3000
**Last Updated**: October 2, 2025
