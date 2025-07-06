import React from 'react';
import { Card } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Achievement Badge Component
 * 
 * Displays a visual achievement badge with icon, title and description
 */
const AchievementBadge = ({ title, description, icon, type, unlocked, progress }) => {
  // Badge variants based on type
  const badgeVariants = {
    bronze: {
      bgColor: '#cd7f32',
      textColor: '#ffffff',
      shadowColor: 'rgba(205, 127, 50, 0.5)'
    },
    silver: {
      bgColor: '#c0c0c0', 
      textColor: '#ffffff',
      shadowColor: 'rgba(192, 192, 192, 0.5)'
    },
    gold: {
      bgColor: '#ffd700',
      textColor: '#212529',
      shadowColor: 'rgba(255, 215, 0, 0.5)'
    },
    security: {
      bgColor: '#20b2aa',
      textColor: '#ffffff',
      shadowColor: 'rgba(32, 178, 170, 0.5)'
    },
    module: {
      bgColor: '#0d6efd',
      textColor: '#ffffff',
      shadowColor: 'rgba(13, 110, 253, 0.5)'
    },
    expert: {
      bgColor: '#dc3545',
      textColor: '#ffffff',
      shadowColor: 'rgba(220, 53, 69, 0.5)'
    }
  };
  
  // Use default if type not recognized
  const variant = badgeVariants[type] || badgeVariants.bronze;
  
  // Style for locked vs unlocked badges
  const lockedStyle = unlocked 
    ? {} 
    : { 
        filter: 'grayscale(1)', 
        opacity: 0.6,
        backgroundColor: '#6c757d',
        borderColor: '#6c757d'
      };
  
  return (
    <Card 
      className="achievement-badge h-100"
      style={{
        ...lockedStyle,
        borderColor: unlocked ? variant.bgColor : undefined,
        transition: 'all 0.3s ease'
      }}
    >
      <div 
        className="badge-icon text-center py-4"
        style={{
          backgroundColor: unlocked ? variant.bgColor : undefined,
          color: variant.textColor,
          boxShadow: unlocked ? `0 5px 15px ${variant.shadowColor}` : 'none'
        }}
      >
        <i className={`bi ${icon} fs-1`}></i>
        {progress !== undefined && progress < 100 && (
          <div className="progress mt-2 mx-auto" style={{ width: '60%', height: '5px' }}>
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{ width: `${progress}%` }}
              aria-valuenow={progress} 
              aria-valuemin="0" 
              aria-valuemax="100"
            ></div>
          </div>
        )}
      </div>

      <Card.Body className="text-center">
        <Card.Title className="mb-2">{title}</Card.Title>
        <Card.Text className="text-muted small">
          {description}
        </Card.Text>
        
        {!unlocked && (
          <span className="badge bg-secondary mt-2">Locked</span>
        )}
      </Card.Body>
    </Card>
  );
};

AchievementBadge.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['bronze', 'silver', 'gold', 'security', 'module', 'expert']).isRequired,
  unlocked: PropTypes.bool,
  progress: PropTypes.number
};

AchievementBadge.defaultProps = {
  unlocked: false
};

export default AchievementBadge;
