# NIST Information Types CIA Impact Levels - Auto-Population Template

## What We've Accomplished

✅ **Complete Auto-Population**: All NIST SP 800-60 information types now have default CIA (Confidentiality, Integrity, Availability) impact levels.

✅ **Smart Defaults**: Impact levels are assigned based on information type categories:
- **C.2.x categories** (Management and Support): Generally Low-Moderate impact with special handling for sensitive areas
- **C.3.x categories** (Operational Support): Generally Low-Moderate impact
- **D.x categories** (Mission-Based): Generally Moderate impact with High impact for security-sensitive categories

✅ **Auto-Population on Selection**: When you select a NIST information type, the CIA impact levels are automatically populated in the dropdowns.

✅ **Manual Override Capability**: You can manually adjust any CIA impact level after selection to match your specific organizational requirements.

✅ **User Guidance**: Added helpful notification explaining that values are auto-populated from NIST guidance and can be manually adjusted.

## How to Use

1. **Navigate to System Categorization** in the SRTM tool
2. **Add Information Types** using the interface
3. **Select NIST Category** from the dropdown - CIA values will auto-populate
4. **Review and Adjust** the CIA impact levels as needed for your specific system
5. **Save** your categorization

## Default CIA Mappings Applied

### Management and Support Information Types (C.2.x)
- **Security-related** (Personnel Security, Information Security): High/High/Low or High/High/Moderate
- **Financial-related** (Payments, Financial Management): Moderate/High/Low
- **IT-related** (IT Infrastructure, System Maintenance): Moderate/High/Moderate
- **General Management**: Low/Moderate/Low

### Operational Support Information Types (C.3.x)
- **Standard Default**: Low/Moderate/Low

### Mission-Based Information Types (D.x)
- **Defense/Intelligence/Security**: High/High/High (for critical security operations)
- **Emergency/Disaster Response**: Low/High/High (availability critical)
- **General Mission**: Moderate/Moderate/Moderate

## Next Steps for Manual Adjustment

You should now review each information type and adjust the CIA impact levels based on:

1. **Your Organization's Risk Tolerance**
2. **Specific System Requirements**
3. **Regulatory Compliance Requirements**
4. **Business Impact Analysis Results**
5. **Stakeholder Input**

## Key NIST SP 800-60 Categories with Pre-populated Values

The following categories now have default CIA values that you can review and adjust:

- **C.2.1 Controls and Oversight** - Low/Moderate/Low
- **C.2.2 Regulatory Development** - Low/Moderate/Low
- **C.2.3 Planning and Budgeting** - Low/Moderate/Low
- **C.2.4 Internal Risk Management** - Moderate/High/Moderate
- **C.2.5 Revenue Collection** - Moderate/High/Low
- **C.3.1 Administrative Management** - Low/Moderate/Low
- **C.3.2 Financial Management** - Low/Moderate/Low
- **D.1 Defense and National Security** - Moderate/Moderate/Moderate
- **D.2 Homeland Security** - Moderate/Moderate/Moderate
- And many more...

## Files Modified

- `types/srtm.ts` - Added CIA impact level fields to NIST interfaces
- `components/SystemCategorization.tsx` - Added auto-population logic and user guidance
- `utils/populateCIA.js` - Utility script for bulk CIA value assignment

## Technical Implementation

The system now automatically populates CIA values when you select a NIST information type, making the categorization process much faster while still allowing for manual customization based on your specific requirements.

The application is running at: http://10.5.1.17:4000