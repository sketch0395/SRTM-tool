const fs = require('fs');
const path = require('path');

// Script to auto-populate CIA impact levels for NIST information types
const filePath = path.join(__dirname, '../components/SystemCategorization.tsx');

// Default CIA values - you can customize these patterns based on category type
const getDefaultCIAValues = (category) => {
  // C.2.x categories (Management and Support)
  if (category.startsWith('C.2.')) {
    if (category.includes('Security') || category.includes('Personnel Security')) {
      return { confidentiality: 'High', integrity: 'High', availability: 'Low' };
    }
    if (category.includes('Financial') || category.includes('Payment')) {
      return { confidentiality: 'Moderate', integrity: 'High', availability: 'Low' };
    }
    if (category.includes('IT') || category.includes('Information Security')) {
      return { confidentiality: 'Moderate', integrity: 'High', availability: 'Moderate' };
    }
    return { confidentiality: 'Low', integrity: 'Moderate', availability: 'Low' };
  }
  
  // C.3.x categories (Operational Support)
  if (category.startsWith('C.3.')) {
    return { confidentiality: 'Low', integrity: 'Moderate', availability: 'Low' };
  }
  
  // D.x categories (Mission-Based)
  if (category.startsWith('D.')) {
    if (category.includes('Defense') || category.includes('Intelligence') || category.includes('Security')) {
      return { confidentiality: 'High', integrity: 'High', availability: 'High' };
    }
    if (category.includes('Emergency') || category.includes('Disaster')) {
      return { confidentiality: 'Low', integrity: 'High', availability: 'High' };
    }
    return { confidentiality: 'Moderate', integrity: 'Moderate', availability: 'Moderate' };
  }
  
  // Default values
  return { confidentiality: 'Low', integrity: 'Moderate', availability: 'Low' };
};

const updateFileWithCIA = () => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Pattern to match information type entries that don't have CIA values
    const patterns = [
      // Main categories without CIA values
      /({ category: "[^"]+", name: "[^"]+", description: "[^"]+")(, subtypes: \[)/g,
      // Subtypes without CIA values  
      /({ category: "[^"]+", name: "[^"]+", description: "[^"]+")( })/g
    ];
    
    patterns.forEach(pattern => {
      content = content.replace(pattern, (match, prefix, suffix) => {
        // Extract category from the match
        const categoryMatch = prefix.match(/category: "([^"]+)"/);
        if (categoryMatch) {
          const category = categoryMatch[1];
          const ciaValues = getDefaultCIAValues(category);
          const ciaString = `, \n    confidentiality: "${ciaValues.confidentiality}", integrity: "${ciaValues.integrity}", availability: "${ciaValues.availability}"`;
          return prefix + ciaString + suffix;
        }
        return match;
      });
    });
    
    fs.writeFileSync(filePath, content);
    console.log('Successfully added CIA impact levels to all NIST information types!');
    console.log('You can now manually adjust the values as needed.');
    
  } catch (error) {
    console.error('Error updating file:', error);
  }
};

updateFileWithCIA();