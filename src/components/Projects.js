import { Badge, Button, Card, Col, Nav, Row } from 'react-bootstrap';
import { useState } from 'react';
import styles from '../styles/Projects.module.scss';

export default function Projects({ projects }) {
    const defaultCategory = { eventKey: 'all', name: 'All' };
    const [currentCategoryEventKey, setCurrentCategoryEventKey] = useState(defaultCategory.eventKey);

    const categories = projects
        .map(project => project.projectCategories.nodes[0].name)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort();

    const displayedProjects =
        currentCategoryEventKey !== defaultCategory.eventKey
            ? projects.filter(project => project.projectCategories.nodes[0].name === currentCategoryEventKey)
            : projects;

    return (
        <section>
            <h2>Projects</h2>

            <Nav variant="tabs" defaultActiveKey={defaultCategory.eventKey}>
                <Nav.Item>
                    <Nav.Link
                        eventKey={defaultCategory.eventKey}
                        onSelect={eventKey => setCurrentCategoryEventKey(eventKey)}
                    >
                        {defaultCategory.name}
                    </Nav.Link>
                </Nav.Item>

                {categories.map(category => (
                    <Nav.Item key={category}>
                        <Nav.Link eventKey={category} onSelect={eventKey => setCurrentCategoryEventKey(eventKey)}>
                            {category}
                        </Nav.Link>
                    </Nav.Item>
                ))}
            </Nav>

            <div>
                {displayedProjects.map(project => (
                    <Card
                        key={project.id}
                        className={`w-100 pb-4 mt-4 border-top-0 border-left-0 border-right-0 border-bottom ${styles.projectCard}`}
                    >
                        <Row noGutters>
                            {project.featuredImage && (
                                <Col md="3">
                                    <Card.Img
                                        className={styles.projectThumbnail}
                                        src={project.featuredImage.node.mediaItemUrl}
                                        alt={project.title}
                                    />
                                </Col>
                            )}

                            <Col md>
                                <Card.Body className={`py-md-0 px-0${project.featuredImage ? ' px-md-4' : ''}`}>
                                    <h5>{project.title}</h5>
                                    <div>
                                        <Badge variant="info" className={`mr-2 font-weight-bold ${styles.projectTag}`}>
                                            {project.projectCategories.nodes[0].name}
                                        </Badge>

                                        {project.projectTags.nodes.length &&
                                            project.projectTags.nodes.map(tag => (
                                                <Badge
                                                    key={tag.id}
                                                    variant="secondary"
                                                    className={`mr-2 font-weight-bold ${styles.projectTag}`}
                                                >
                                                    {tag.name}
                                                </Badge>
                                            ))}
                                    </div>

                                    {/* eslint-disable-next-line react/no-danger */}
                                    <div className="mt-2" dangerouslySetInnerHTML={{ __html: project.content }} />
                                </Card.Body>
                            </Col>

                            <Col md="3" className="text-md-right">
                                {project.project.previewType && (
                                    <span className="d-md-block pb-1 mb-1 mr-2 mr-mb-0 ml-mb-2">
                                        <a href={project.project.previewLink} target="_blank" rel="noreferrer">
                                            <Button variant="primary">{project.project.previewType}</Button>
                                        </a>
                                    </span>
                                )}

                                {project.project.downloadLink && (
                                    <span className="d-md-block pb-1 mb-1 mr-2 mr-mb-0 ml-mb-2">
                                        <a href={project.project.downloadLink} target="_blank" rel="noreferrer">
                                            <Button variant="primary">Download</Button>
                                        </a>
                                    </span>
                                )}

                                {project.project.sourceLink && (
                                    <span className="d-md-block pb-1 mb-1 mr-2 mr-mb-0 ml-mb-2">
                                        <a href={project.project.sourceLink} target="_blank" rel="noreferrer">
                                            <Button variant="primary">Source</Button>
                                        </a>
                                    </span>
                                )}
                            </Col>
                        </Row>
                    </Card>
                ))}
            </div>
        </section>
    );
}
