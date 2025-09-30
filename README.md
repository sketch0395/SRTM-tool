# Security Requirements Traceability Matrix (SRTM) Tool

A comprehensive Next.js application for managing NIST-compliant security requirements and traceability. This tool helps organizations systematically document system design, perform NIST 800-60 categorization, generate NIST 800-53 security controls, and track implementation through traceability matrices.

## Features

### Workflow-Driven Process

The tool implements a structured workflow following NIST best practices:

1. **Design Elements** → 2. **NIST 800-60 Categorization** → 3. **NIST 800-53 Requirements** → 4. **STIG Requirements** → 5. **Traceability Matrix**

### Core Components

- **Design Elements Management**: Document system components, modules, interfaces, services, databases, and APIs with detailed metadata
- **NIST 800-60 Categorization**: Perform system categorization based on information types and security objectives (Confidentiality, Integrity, Availability)
  - Official NIST table format output
  - Export categorization results as PNG
  - Automatic baseline selection (Low/Moderate/High)
- **NIST 800-53 Requirements**: Auto-generated security control requirements based on system categorization
  - All 20 control families (AC, AU, AT, CM, CP, IA, IR, MA, MP, PS, PE, PL, PM, RA, CA, SC, SI, SA, SR, PT)
  - Accordion-grouped by family for easy navigation
  - Validated against official NIST SP 800-53B baselines
  - 141 controls for Low, 253 for Moderate, 336 for High
- **STIG Family Recommendations**: View recommended STIG families based on your design elements
- **STIG Requirements Management**: Load and manage detailed STIG requirements for specific security domains
- **Traceability Matrix**: Link security requirements to design elements with visual matrix and list views

### Key Capabilities

- **Auto-Generation**: Automatically generate NIST 800-53 requirements based on categorization
- **Official NIST Compliance**: All baselines validated against NIST SP 800-53 Rev 5 and NIST SP 800-53B
- **Matrix View**: Visual representation of requirement-to-design traceability
- **List View**: Detailed view of all traceability links
- **Export/Import**: Save and load workflows as JSON files
- **Coverage Tracking**: Monitor requirement coverage and traceability percentages
- **Progress Indicators**: Visual workflow progress on each tab

## Technology Stack

- **Framework**: Next.js 15.5.4 with TypeScript 5
- **Styling**: Tailwind CSS 3.3.3
- **Icons**: Lucide React 0.263.1
- **Export**: html2canvas for PNG export
- **State Management**: React 18 Hooks

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

### Recommended Workflow

Follow the tabs in order for the best experience:

#### 1. Design Elements
- Document all system components (Frontend, Backend, Database, API, etc.)
- Specify component types, technologies, and ownership
- Add descriptions and security considerations
- Use the workflow progress indicator to track completion

#### 2. NIST 800-60 Categorization
- Click "Add System Categorization" to create a new categorization
- Select information types (e.g., Privacy Information, Financial Information)
- Set security impact levels for Confidentiality, Integrity, and Availability
- Review the official NIST table format output
- Export categorization as PNG if needed
- System automatically determines baseline (Low/Moderate/High)

#### 3. NIST 800-53 Requirements
- Requirements are automatically generated when you navigate from categorization
- View controls grouped by family in accordion format
- Use "Expand All" / "Collapse All" for easier navigation
- Review all applicable controls for your baseline level
- All controls validated against NIST SP 800-53B official publication

#### 4. STIG Recommendations (Optional)
- View recommended STIG families based on your design elements
- See applicable STIGs for your technology stack
- Get guidance on which STIGs to implement

#### 5. STIG Requirements (Optional)
- Select and load specific STIG families
- Manage detailed STIG requirements for compliance
- Track STIG implementation status

#### 6. Traceability Matrix
- Link security requirements to design elements
- **Matrix View**: See all requirements with their coverage status
- **List View**: Manage individual traceability links
- Track coverage percentage
- Identify gaps in requirement coverage

### Data Management

#### Save Workflow
- Click the "Save Workflow" button in the header
- Downloads a JSON file with all your work
- Includes design elements and categorizations
- Timestamped filename for version control

#### Load Workflow
- Click "Upload Workflow" and select a previously saved JSON file
- Automatically navigates to the appropriate workflow step
- Preserves all design elements and categorizations

#### Clear Workflow
- Use "Clear Workflow" to reset all data
- Returns to the Design Elements tab
- Requires confirmation to prevent accidental data loss

## Data Model

The application manages the following entity types:

1. **System Design Elements**: Architecture components with type, technology, and security metadata
2. **System Categorizations**: NIST 800-60 information type categorizations with CIA impact levels
3. **Security Requirements**: NIST 800-53 control requirements (auto-generated from categorization)
4. **STIG Requirements**: Detailed STIG implementation requirements organized by family
5. **Traceability Links**: Relationships linking requirements to design elements

### NIST Control Families

The tool supports all 20 NIST SP 800-53 Rev 5 control families:

- **AC** - Access Control
- **AU** - Audit and Accountability  
- **AT** - Awareness and Training
- **CM** - Configuration Management
- **CP** - Contingency Planning
- **IA** - Identification and Authentication
- **IR** - Incident Response
- **MA** - Maintenance
- **MP** - Media Protection
- **PS** - Personnel Security
- **PE** - Physical and Environmental Protection
- **PL** - Planning
- **PM** - Program Management
- **RA** - Risk Assessment
- **CA** - Assessment, Authorization, and Monitoring
- **SC** - System and Communications Protection
- **SI** - System and Information Integrity
- **SA** - System and Services Acquisition
- **SR** - Supply Chain Risk Management
- **PT** - PII Processing and Transparency

### Baseline Control Counts

- **Low Baseline**: 141 controls
- **Moderate Baseline**: 253 controls  
- **High Baseline**: 336 controls

All baselines validated against NIST SP 800-53B official publication.

## NIST Standards Compliance

This tool implements guidance from:

- **NIST SP 800-53 Rev 5**: Security and Privacy Controls for Information Systems and Organizations
- **NIST SP 800-53B**: Control Baselines for Information Systems and Organizations
- **NIST SP 800-60 Vol 1 Rev 1**: Guide for Mapping Types of Information and Information Systems to Security Categories

## Project Structure

```
SRTM-tool/
├── app/
│   ├── page.tsx          # Main application with tab navigation
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── DesignElementForm.tsx        # Design elements management
│   ├── SystemCategorization.tsx     # NIST 800-60 categorization
│   ├── RequirementForm.tsx          # NIST 800-53 requirements display
│   ├── StigFamilyRecommendations.tsx # STIG recommendations
│   ├── StigManagement.tsx           # STIG requirements management
│   └── TraceabilityMatrix.tsx       # Traceability tracking
├── types/
│   └── srtm.ts           # TypeScript interfaces
├── utils/
│   ├── nistBaselines.ts              # Official NIST control baselines
│   ├── detailedStigRequirements.ts   # STIG requirement definitions
│   └── stigFamilyRecommendations.ts  # STIG recommendations logic
└── README.md
```

## Data Validation & Accuracy

### NIST 800-53 Control Baselines

All control baselines have been validated against the official NIST SP 800-53B publication diagrams:

- **Low Baseline**: 141 controls validated against Figure 3-1 (Control Baselines - Families AC through MP)
- **Moderate Baseline**: 253 controls validated across Figures 3-1, 3-2, 3-3
- **High Baseline**: 336 controls validated across all official baseline diagrams

Each control family has been cross-referenced with the official NIST documentation to ensure 100% accuracy and compliance.

### NIST 800-60 Categorization

The categorization process follows the official NIST SP 800-60 Vol 1 Rev 1 guidance:
- Information type selection matches Table D-1 through D-13
- Impact level determination follows Tables 3-3 and 3-5 format
- Security categorization follows the high-water mark principle

## Use Cases

This tool is ideal for:

- **Security Compliance Teams**: Document NIST 800-53 compliance for authorization packages
- **System Architects**: Track security requirements throughout system design
- **Security Engineers**: Map controls to implementation components
- **Auditors**: Verify traceability between requirements and implementations
- **DevSecOps Teams**: Integrate security requirements into development workflows

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Make your changes
4. Ensure all NIST validations remain accurate
5. Run linting (`npm run lint`)
6. Commit your changes (`git commit -m 'Add improvement'`)
7. Push to the branch (`git push origin feature/improvement`)
8. Submit a pull request

### Development Guidelines

- Maintain NIST compliance accuracy
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Keep components modular and reusable
- Update README for any new features

## License

This project is licensed under the MIT License.