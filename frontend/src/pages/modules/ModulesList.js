import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Form, InputGroup, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ModuleService from '../../services/ModuleService';

const ModulesList = () => {
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const navigate = useNavigate();

  // Fetch modules data
  const fetchModules = async (page = 1, filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page,
        per_page: 9,
        ...filters
      };
      
      const response = await ModuleService.getModules(params);
      
      setModules(response.items);
      setTotalPages(response.pagination.total_pages);
      setCurrentPage(response.pagination.page);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError('Failed to load modules. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchModules();
  }, []);

  // Handle filter changes
  const handleFilterChange = () => {
    const filters = {};
    
    if (difficulty) {
      filters.difficulty = difficulty;
    }
    
    // Reset to first page when filters change
    fetchModules(1, filters);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // In a real implementation, we would add search functionality to the API
    // For now, we'll just filter client-side
    console.log("Search functionality would filter by:", searchTerm);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    const filters = {};
    if (difficulty) {
      filters.difficulty = difficulty;
    }
    
    fetchModules(page, filters);
  };

  // Handle difficulty filter changes
  useEffect(() => {
    handleFilterChange();
  }, [difficulty]);

  const navigateToModule = (moduleId) => {
    navigate(`/modules/${moduleId}`);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Security Modules</h2>
      </div>

      {/* Filters and search */}
      <div className="mb-4">
        <Row>
          <Col md={6} lg={4}>
            <Form onSubmit={handleSearch}>
              <InputGroup>
                <Form.Control
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="submit" variant="primary">
                  Search
                </Button>
              </InputGroup>
            </Form>
          </Col>
          
          <Col md={4} lg={3} className="mt-3 mt-md-0">
            <Form.Select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      {/* Modules grid */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading modules...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : modules.length === 0 ? (
        <div className="text-center py-5">
          <p>No modules found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <Row xs={1} md={2} lg={3} className="g-4 mb-4">
            {modules.map((module) => (
              <Col key={module.id}>
                <Card className="h-100 module-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                      <Badge 
                        bg={getBadgeColor(module.difficulty)}
                        className="text-capitalize"
                      >
                        {module.difficulty}
                      </Badge>
                      <small className="text-muted">{module.lesson_count} lessons</small>
                    </div>
                    <Card.Title>{module.name}</Card.Title>
                    <Card.Text className="text-muted">
                      {module.description}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer className="border-0 bg-white">
                    <Button 
                      variant="primary" 
                      className="w-100"
                      onClick={() => navigateToModule(module.id)}
                    >
                      View Module
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First 
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                
                {[...Array(totalPages)].map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                
                <Pagination.Next 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last 
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Helper function to get badge color based on difficulty
const getBadgeColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return 'success';
    case 'intermediate':
      return 'warning';
    case 'advanced':
      return 'danger';
    default:
      return 'primary';
  }
};

export default ModulesList;
