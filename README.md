# Security Requirements Traceability Matrix (SRTM) Tool

A comprehensive Next.js application with Tailwind CSS for managing security requirements traceability matrices. This tool helps organizations track relationships between security requirements, system design elements, and test cases.

## Features

### Core Components

- **Security Requirements Management**: Track and manage security requirements with categories, priorities, and statuses
- **System Design Elements**: Manage components, modules, interfaces, services, databases, and APIs
- **Test Cases**: Create and track security test cases with different types and methods
- **Traceability Links**: Establish relationships between requirements, design elements, and test cases
- **Dashboard**: Overview of your SRTM with key metrics and status indicators

### Key Capabilities

- **Matrix View**: Visual representation of traceability relationships
- **List View**: Detailed view of all traceability links
- **CRUD Operations**: Full create, read, update, and delete functionality for all entities
- **Coverage Tracking**: Monitor requirement coverage and traceability percentages
- **Status Management**: Track progress through various workflow states
- **Priority Management**: Organize work by priority levels

## Technology Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SRTM-tool
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Usage

### Dashboard
- View overall SRTM statistics and metrics
- Monitor requirement status and test case progress
- Get quick insights into traceability coverage

### Security Requirements
- Add new security requirements with categories (Authentication, Authorization, Encryption, etc.)
- Set priorities (High, Medium, Low) and track status
- Link to standards and regulations (NIST, ISO 27001, etc.)

### System Design Elements
- Document system components, modules, and interfaces
- Specify technologies and ownership
- Organize by type (Component, Module, Interface, Service, Database, API)

### Test Cases
- Create comprehensive test cases for security validation
- Support multiple test types (Unit, Integration, Security, Performance, Acceptance)
- Track test methods (Automated, Manual, Semi-Automated)
- Monitor test execution status

### Traceability Matrix
- **Matrix View**: See all requirements with their linked design elements and test cases
- **List View**: Detailed view of individual traceability relationships
- Create links between requirements, design elements, and test cases
- Track coverage metrics and identify gaps

## Data Model

The application manages four main entity types:

1. **Security Requirements**: Core security requirements with metadata
2. **System Design Elements**: Architecture components and modules
3. **Test Cases**: Verification and validation test cases
4. **Traceability Links**: Relationships between the above entities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.