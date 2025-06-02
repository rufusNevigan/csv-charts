# CSV Charts

A modern, desktop-only single-page application for creating interactive bar charts from CSV data.

## Features

- 📊 **Interactive Charts**: Upload CSV files and instantly visualize data as bar charts
- 🎯 **Column Selection**: Choose X and Y axes from your data columns
- 🔍 **Smart Detection**: Automatically detects numeric columns for chart axes
- 🛡️ **Data Validation**: Handles duplicate headers and enforces row limits
- 🎛️ **Filtering**: Apply simple filters to your data before charting
- ⚡ **Real-time Updates**: See changes immediately as you adjust settings
- 🎨 **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Modern Browser** (Chrome, Firefox, Safari, Edge - latest versions)

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/csv-charts.git
   cd csv-charts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (enforces 250KB gzip limit) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint with zero warnings policy |
| `npm run format` | Format code with Prettier |
| `npm test` | Run unit tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run end-to-end tests with Playwright |

## Testing

### Unit Tests
We use **Vitest** and **React Testing Library** for component testing:
```bash
npm test
```

### End-to-End Tests
**Playwright** tests cover the complete user journey:
```bash
npm run test:e2e
```

## Building for Production

The build process includes bundle size analysis and enforcement:

```bash
npm run build
```

- Bundle size is limited to **250KB gzipped**
- Build will fail if the limit is exceeded
- Bundle analysis report is generated at `dist/bundle-analysis.html`

## Usage

1. **Upload CSV**: Drag and drop or click to select a CSV file
2. **Column Detection**: The app automatically detects numeric columns
3. **Customize Chart**: Use the dropdowns to select X and Y axes
4. **Filter Data**: Apply simple filters like `age > 25` or `name == "John"`
5. **Reset**: Use the reset button to start over with new data

### CSV Requirements

- **Headers**: First row should contain column names
- **Format**: Standard CSV format with comma separators
- **Size Limit**: Maximum 50,000 rows (10,000 after filtering)
- **Encoding**: UTF-8 encoding recommended

### Example CSV
```csv
name,age,salary,department
John,25,50000,Engineering
Jane,30,60000,Marketing
Bob,35,55000,Engineering
```

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (CDN)
- **Charts**: Recharts
- **CSV Parsing**: Papa Parse
- **State Management**: React Context + useReducer
- **Testing**: Vitest + React Testing Library + Playwright

### Project Structure
```
src/
├── components/           # React components
│   ├── ChartCanvas.tsx  # Main chart rendering
│   ├── ColumnSelector.tsx # X/Y axis selection
│   ├── FilePicker.tsx   # CSV file upload
│   ├── FilterBuilder.tsx # Data filtering UI
│   └── ...
├── context/             # React Context providers
├── utils/               # Utility functions
│   ├── parseCsv.ts     # CSV parsing logic
│   ├── detectColumns.ts # Column type detection
│   └── logger.ts       # Console logging
└── __tests__/          # Unit tests
```

## Limitations

- **Desktop Only**: No mobile responsive design
- **Local Processing**: All data processing happens in the browser
- **File Size**: Limited to 50,000 rows for performance
- **Chart Types**: Currently supports bar charts only
- **Browser Storage**: No data persistence between sessions

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes following the existing code style
4. Run tests: `npm test && npm run test:e2e`
5. Commit using conventional commits: `feat: add new feature`
6. Push and create a pull request

### Code Quality

- **ESLint**: Airbnb configuration with TypeScript support
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks for linting and testing
- **TypeScript**: Strict type checking

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

## Performance

- Bundle size: ~158KB gzipped
- Initial load: < 2 seconds on fast 3G
- File parsing: < 1 second for 10K rows
- Chart rendering: < 500ms for 1K data points

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### v0.1.0 (2024)
- Initial release
- CSV upload and parsing
- Interactive bar charts
- Column selection and filtering
- Error handling and validation
- Production build optimization
