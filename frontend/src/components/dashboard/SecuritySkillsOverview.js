import React from 'react';
import { Card, ProgressBar, Row, Col } from 'react-bootstrap';

/**
 * Security Skills Overview Component
 * 
 * Displays a visual summary of the user's security skills across different categories
 * based on their module completion data
 * 
 * @param {Object} props - Component props
 * @param {Array} props.moduleProgress - Array of user module progress
 */
const SecuritySkillsOverview = ({ moduleProgress }) => {
  // Calculate security skills based on module progress and categories
  const calculateSkills = () => {
    // Default skills categories
    const skills = {
      'Authentication & Identity': { progress: 0, count: 0, modules: [] },
      'Web Application Security': { progress: 0, count: 0, modules: [] },
      'Network Security': { progress: 0, count: 0, modules: [] },
      'Code Security': { progress: 0, count: 0, modules: [] },
      'Operating System Security': { progress: 0, count: 0, modules: [] }
    };
    
    // Assign modules to categories based on name or type
    moduleProgress.forEach(item => {
      const moduleName = item.module.name.toLowerCase();
      const moduleDescription = (item.module.description || '').toLowerCase();
      
      // Determine category based on module name and description keywords
      let category = 'Web Application Security'; // Default category
      
      // Check for keywords to categorize
      if (moduleName.includes('sql') || moduleName.includes('injection') || moduleName.includes('xss') || 
          moduleName.includes('csrf')) {
        category = 'Web Application Security';
      } else if (moduleName.includes('authentication') || moduleName.includes('identity') || 
                moduleName.includes('password') || moduleName.includes('access control')) {
        category = 'Authentication & Identity';
      } else if (moduleName.includes('network') || moduleName.includes('dns') || 
                moduleName.includes('mitm') || moduleName.includes('ssl')) {
        category = 'Network Security';
      } else if (moduleName.includes('code') || moduleName.includes('buffer') || 
                moduleName.includes('overflow') || moduleName.includes('execution')) {
        category = 'Code Security';
      } else if (moduleName.includes('os') || moduleName.includes('system') || 
                moduleName.includes('privilege') || moduleName.includes('kernel')) {
        category = 'Operating System Security';
      }
      
      // Add module to the appropriate category
      if (skills[category]) {
        skills[category].modules.push({
          id: item.module.id,
          name: item.module.name,
          progress: item.completion_percentage
        });
        
        skills[category].progress += item.completion_percentage;
        skills[category].count += 1;
      }
    });
    
    // Calculate average progress for each skill category
    Object.keys(skills).forEach(key => {
      if (skills[key].count > 0) {
        skills[key].progress = Math.round(skills[key].progress / skills[key].count);
      }
    });
    
    return skills;
  };
  
  const skills = calculateSkills();
  
  // Function to determine progress bar variant based on progress percentage
  const getProgressVariant = (progress) => {
    if (progress < 30) return 'danger';
    if (progress < 70) return 'warning';
    return 'success';
  };

  return (
    <Card className="mb-4 security-skills-card">
      <Card.Header className="bg-transparent border-bottom">
        <h5 className="mb-0">Security Skills Overview</h5>
      </Card.Header>
      <Card.Body>
        {Object.keys(skills).map(skillName => (
          <Row key={skillName} className="mb-3">
            <Col xs={12} md={4} className="mb-2 mb-md-0 d-flex align-items-center">
              <span className="skill-name">{skillName}</span>
            </Col>
            <Col xs={12} md={8}>
              <div className="d-flex justify-content-between mb-1">
                <small>{skills[skillName].count > 0 ? `${skills[skillName].progress}%` : 'Not started'}</small>
                <small>{skills[skillName].count} module{skills[skillName].count !== 1 ? 's' : ''}</small>
              </div>
              <ProgressBar 
                now={skills[skillName].progress} 
                variant={getProgressVariant(skills[skillName].progress)}
                className="skill-progress-bar"
              />
            </Col>
          </Row>
        ))}
      </Card.Body>
      <Card.Footer className="bg-transparent text-muted small">
        <i className="bi bi-info-circle me-1"></i>
        Skills overview is based on your progress in related security modules
      </Card.Footer>
    </Card>
  );
};

export default SecuritySkillsOverview;
