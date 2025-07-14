# Game Describers Usage Guide

> For index reference format, see [../INDEX_DESCRIBER.md](../INDEX_DESCRIBER.md)  <!-- IDX-DOC-00 -->

# IDX-DOC-01: Folder Structure

*Comprehensive guide for LLMs to efficiently read, write, and maintain game documentation*

---

## 📁 Folder Structure

```
game_describers/
├── USAGE.md                    # This file - usage guide for LLMs
├── PHYSICS.md                  # Priority 1: Physics system documentation
├── RENDERING.md                # Priority 2: Rendering techniques
├── MECHANICS.md                # Priority 3: Game mechanics
├── STORYBOARDS.md              # Priority 4: Story and narrative
├── AI_SYSTEMS.md               # Priority 5: AI and mathematical systems
├── MULTIPLAYER.md              # Priority 6: Multiplayer systems
└── TEMPLATES/                  # Template files for consistency
    ├── MECHANIC_TEMPLATE.md
    ├── PHYSICS_TEMPLATE.md
    └── STORY_TEMPLATE.md
```

---

## 🎯 Purpose & Scope

### **Primary Objectives**
1. **Comprehensive Documentation**: Detailed technical specifications for all game systems
2. **LLM-Friendly Format**: Structured for efficient AI processing and generation
3. **Maintainable**: Easy to update and extend as the game evolves
4. **Reference Source**: Single source of truth for game implementation details

### **Target Audience**
- **LLMs**: Primary users for generating and updating documentation
- **Developers**: Reference for implementation details
- **Designers**: Understanding of game mechanics and systems
- **Future Contributors**: Onboarding and system understanding

---

## 📋 File Organization Standards

### **Priority System**
- **Priority 1**: Core systems (Physics, Rendering)
- **Priority 2**: Game mechanics and interactions
- **Priority 3**: Story and narrative elements
- **Priority 4**: AI and mathematical systems
- **Priority 5**: Multiplayer and networking

### **File Naming Convention**
- **UPPERCASE**: Main category files (PHYSICS.md, RENDERING.md)
- **Descriptive**: Clear, specific names
- **Consistent**: Follow established patterns

### **Section Organization**
Each file should contain:
1. **Overview**: High-level description
2. **Technical Details**: Implementation specifics
3. **Parameters**: Configurable values and ranges
4. **Examples**: Code examples and use cases
5. **Integration**: How it connects to other systems
6. **Future Plans**: Planned improvements and extensions

---

## 🤖 LLM Usage Guidelines

### **Reading Documentation**
When reading from game_describers:

1. **Start with USAGE.md**: Understand the structure and conventions
2. **Check Priority Order**: Read files in priority sequence for context
3. **Cross-Reference**: Look for integration points between systems
4. **Parameter Focus**: Pay attention to configurable values and ranges
5. **Example Analysis**: Study code examples for implementation patterns

### **Writing Documentation**
When writing to game_describers:

1. **Follow Templates**: Use provided templates for consistency
2. **Be Specific**: Include exact values, ranges, and technical details
3. **Provide Examples**: Include code snippets and use cases
4. **Cross-Reference**: Link to related systems and files
5. **Update Integration**: Ensure new content connects to existing systems

### **Maintenance Guidelines**
When updating documentation:

1. **Preserve Structure**: Maintain existing organization and formatting
2. **Version Control**: Note changes and their impact on other systems
3. **Consistency**: Ensure terminology and formatting remain consistent
4. **Completeness**: Update all related sections when making changes
5. **Validation**: Verify technical accuracy and completeness

---

## 📝 Content Standards

### **Technical Specifications**
- **Exact Values**: Use precise numbers, not approximations
- **Ranges**: Specify min/max values and acceptable ranges
- **Units**: Include units for all measurements
- **Formulas**: Provide mathematical formulas where applicable
- **Code Examples**: Include practical implementation examples

### **Formatting Standards**
- **Headers**: Use clear, hierarchical headers (##, ###, ####)
- **Code Blocks**: Use ```javascript for code examples
- **Lists**: Use consistent bullet points and numbering
- **Tables**: Use markdown tables for structured data
- **Links**: Use relative links to other files in the folder

### **Language Standards**
- **Clear**: Use precise, unambiguous language
- **Technical**: Include technical details and specifications
- **Consistent**: Use consistent terminology throughout
- **Complete**: Cover all aspects of the system
- **Accurate**: Ensure all information is technically correct

---

## 🔄 Update Workflow

### **When Adding New Systems**
1. **Create File**: Add new file following naming convention
2. **Use Template**: Start with appropriate template
3. **Fill Details**: Add comprehensive technical details
4. **Cross-Reference**: Link to related existing systems
5. **Update Index**: Add to relevant index or summary files

### **When Modifying Existing Systems**
1. **Read Current**: Understand existing documentation
2. **Plan Changes**: Identify what needs to be updated
3. **Update Content**: Make changes while preserving structure
4. **Check Integration**: Ensure changes don't break references
5. **Validate**: Verify technical accuracy and completeness

### **When Removing Systems**
1. **Identify Dependencies**: Check what references the system
2. **Update References**: Remove or update all cross-references
3. **Archive**: Consider archiving rather than deleting
4. **Document**: Note why the system was removed
5. **Clean Up**: Remove any orphaned references

---

## 📊 Quality Assurance

### **Completeness Checklist**
- [ ] All technical parameters documented
- [ ] Code examples provided
- [ ] Integration points identified
- [ ] Cross-references updated
- [ ] Future plans outlined

### **Accuracy Checklist**
- [ ] Technical specifications verified
- [ ] Code examples tested
- [ ] Parameter ranges validated
- [ ] Integration points confirmed
- [ ] Mathematical formulas checked

### **Consistency Checklist**
- [ ] Terminology consistent across files
- [ ] Formatting follows standards
- [ ] Naming conventions followed
- [ ] Structure maintained
- [ ] Links working properly

---

## 🚀 Best Practices

### **For LLMs**
1. **Read First**: Always read existing documentation before writing
2. **Understand Context**: Consider how systems interact
3. **Be Precise**: Use exact values and technical details
4. **Provide Examples**: Include practical implementation examples
5. **Maintain Structure**: Follow established organization patterns

### **For Developers**
1. **Reference Regularly**: Use documentation for implementation guidance
2. **Update Promptly**: Keep documentation current with code changes
3. **Validate Changes**: Test documentation accuracy after updates
4. **Contribute**: Add missing details and examples
5. **Review**: Periodically review and improve documentation

---

## 📚 Template Usage

### **Using Templates**
1. **Copy Template**: Start with appropriate template file
2. **Fill Sections**: Complete all required sections
3. **Customize**: Adapt to specific system requirements
4. **Validate**: Ensure all required information is included
5. **Integrate**: Connect to existing documentation

### **Creating Templates**
1. **Identify Pattern**: Find common structure in existing files
2. **Extract Sections**: Identify standard sections and format
3. **Create Template**: Build reusable template file
4. **Document Usage**: Explain how to use the template
5. **Maintain**: Keep templates current with best practices

---

*This usage guide should be updated whenever new patterns or requirements emerge in the documentation system.* 