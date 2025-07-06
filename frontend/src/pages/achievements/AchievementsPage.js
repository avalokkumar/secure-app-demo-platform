import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Tab, Tabs, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import AchievementBadge from '../../components/achievements/AchievementBadge';
import Certificate from '../../components/achievements/Certificate';

/**
 * Achievements Page
 * 
 * Displays user achievements, badges, and certificates
 */
const AchievementsPage = () => {
  const { currentUser } = useAuth();
  const [userAchievements, setUserAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [selectedTab, setSelectedTab] = useState('all');

  // Mock achievements data - in a real app this would come from an API
  useEffect(() => {
    const fetchAchievements = async () => {
      setIsLoading(true);
      try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock achievements data
        const achievements = [
          {
            id: 'a1',
            title: 'Security Novice',
            description: 'Complete your first security module',
            type: 'bronze',
            category: 'progress',
            icon: 'bi-shield',
            unlocked: true,
            dateUnlocked: '2025-06-15T10:30:00'
          },
          {
            id: 'a2',
            title: 'Code Defender',
            description: 'Find 5 code vulnerabilities',
            type: 'security',
            category: 'security',
            icon: 'bi-code-slash',
            unlocked: true,
            dateUnlocked: '2025-06-16T15:45:00'
          },
          {
            id: 'a3',
            title: 'SQL Injection Expert',
            description: 'Complete the SQL Injection module with 100% score',
            type: 'module',
            category: 'modules',
            icon: 'bi-database-fill',
            unlocked: true,
            dateUnlocked: '2025-06-18T09:15:00'
          },
          {
            id: 'a4',
            title: 'XSS Defender',
            description: 'Complete the XSS module with 100% score',
            type: 'module',
            category: 'modules',
            icon: 'bi-code-square',
            unlocked: false,
            progress: 60
          },
          {
            id: 'a5',
            title: 'Security Specialist',
            description: 'Complete 5 security modules',
            type: 'silver',
            category: 'progress',
            icon: 'bi-shield-lock',
            unlocked: false,
            progress: 40
          },
          {
            id: 'a6',
            title: 'CSRF Guardian',
            description: 'Complete the CSRF module with 100% score',
            type: 'module',
            category: 'modules',
            icon: 'bi-window',
            unlocked: false,
            progress: 0
          },
          {
            id: 'a7',
            title: 'Authentication Master',
            description: 'Complete the Authentication & Identity module with 100% score',
            type: 'module',
            category: 'modules',
            icon: 'bi-person-lock',
            unlocked: false,
            progress: 25
          },
          {
            id: 'a8',
            title: 'Security Mentor',
            description: 'Help 5 other students with security questions',
            type: 'gold',
            category: 'community',
            icon: 'bi-people',
            unlocked: false
          },
          {
            id: 'a9',
            title: 'Encryption Specialist',
            description: 'Successfully complete all encryption exercises',
            type: 'security',
            category: 'security',
            icon: 'bi-lock',
            unlocked: false,
            progress: 15
          }
        ];
        
        setUserAchievements(achievements);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  // Filter achievements based on selected tab
  const filteredAchievements = userAchievements.filter(achievement => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'unlocked') return achievement.unlocked;
    if (selectedTab === 'locked') return !achievement.unlocked;
    return achievement.category === selectedTab;
  });

  // Handler for viewing certificates
  const handleViewCertificate = (moduleTitle) => {
    setSelectedCertificate({
      title: moduleTitle,
      userName: currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name}` : currentUser?.username || 'Student',
      issueDate: new Date().toISOString().split('T')[0],
      id: `CERT-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`
    });
    setShowCertificateModal(true);
  };

  // Certificates data - in a real app this would come from an API
  const certificates = [
    {
      id: 'c1',
      moduleTitle: 'SQL Injection Security',
      completedDate: '2025-06-18',
      score: 95
    }
  ];

  return (
    <Container className="py-4">
      <h2 className="mb-2">Achievements & Certificates</h2>
      <p className="text-muted mb-4">
        Track your progress and earn recognition for mastering security concepts.
      </p>

      <Row className="mb-4">
        <Col>
          <Tabs 
            activeKey={selectedTab} 
            onSelect={(key) => setSelectedTab(key)}
            className="mb-4"
          >
            <Tab eventKey="all" title="All Badges" />
            <Tab eventKey="unlocked" title="Unlocked" />
            <Tab eventKey="locked" title="Locked" />
            <Tab eventKey="modules" title="Modules" />
            <Tab eventKey="security" title="Security" />
            <Tab eventKey="progress" title="Progress" />
            <Tab eventKey="community" title="Community" />
          </Tabs>
        </Col>
      </Row>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading achievements...</p>
        </div>
      ) : filteredAchievements.length > 0 ? (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {filteredAchievements.map((achievement) => (
            <Col key={achievement.id}>
              <AchievementBadge
                title={achievement.title}
                description={achievement.description}
                icon={achievement.icon}
                type={achievement.type}
                unlocked={achievement.unlocked}
                progress={achievement.progress}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info">
          No achievements found in this category. Complete security modules and exercises to earn badges!
        </Alert>
      )}

      {/* Certificates Section */}
      <h3 className="mt-5 mb-3">Your Certificates</h3>
      <Row>
        {certificates.length > 0 ? (
          certificates.map(cert => (
            <Col key={cert.id} md={6} xl={4} className="mb-4">
              <Card className="certificate-card h-100">
                <Card.Body className="d-flex flex-column">
                  <div className="mb-3 d-flex">
                    <div className="certificate-icon me-3">
                      <i className="bi bi-award fs-1 text-primary"></i>
                    </div>
                    <div>
                      <Card.Title>{cert.moduleTitle}</Card.Title>
                      <Card.Subtitle className="text-muted mb-2">
                        Completed on {cert.completedDate}
                      </Card.Subtitle>
                      <div className="small mb-2">
                        Score: <strong>{cert.score}%</strong>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <Button 
                      variant="outline-primary" 
                      onClick={() => handleViewCertificate(cert.moduleTitle)}
                    >
                      <i className="bi bi-eye me-2"></i>
                      View Certificate
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <Alert variant="info">
              You haven't earned any certificates yet. Complete full modules to earn certificates!
            </Alert>
          </Col>
        )}
      </Row>

      {/* Certificate Modal */}
      <Modal
        show={showCertificateModal}
        onHide={() => setShowCertificateModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Security Certificate</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {selectedCertificate && (
            <Certificate
              title={selectedCertificate.title}
              userName={selectedCertificate.userName}
              issueDate={selectedCertificate.issueDate}
              certificateId={selectedCertificate.id}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCertificateModal(false)}>
            Close
          </Button>
          <Button variant="primary">
            <i className="bi bi-download me-2"></i>
            Download PDF
          </Button>
          <Button variant="outline-primary">
            <i className="bi bi-share me-2"></i>
            Share
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AchievementsPage;
