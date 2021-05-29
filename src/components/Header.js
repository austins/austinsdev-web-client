import { Button, Container, Form, FormControl, InputGroup, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import Link from 'next/link';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import HeaderMenuItemLink from './HeaderMenuItemLink';
import styles from '../styles/Header.module.scss';

export default function Header({ menuItems }) {
    const router = useRouter();

    const search = e => {
        e.preventDefault();

        const searchValue = e.target.search.value.trim();
        if (searchValue.length) {
            router.push({ pathname: '/articles', query: { search: searchValue } });
            e.target.search.value = '';
        }
    };

    return (
        <header>
            <Navbar className={styles.navbarBackgroundColor} variant="dark" expand="lg">
                <Container>
                    <Link href="/" passHref>
                        <Navbar.Brand>
                            <img
                                src="/assets/images/logo-light.png"
                                alt={process.env.NEXT_PUBLIC_SITE_NAME}
                                className={styles.logoImage}
                            />
                        </Navbar.Brand>
                    </Link>

                    <Navbar.Toggle aria-controls="navbar-nav" />

                    <Navbar.Collapse id="navbar-nav">
                        <Nav className="mr-auto">
                            {!menuItems.length ? (
                                <HeaderMenuItemLink href="/">
                                    <a className="nav-link">Home</a>
                                </HeaderMenuItemLink>
                            ) : (
                                menuItems.map(menuItem => {
                                    if (!menuItem.children.length) {
                                        return (
                                            <HeaderMenuItemLink key={menuItem.key} href={menuItem.url}>
                                                <a
                                                    className="nav-link"
                                                    target={menuItem.isExternal ? '_blank' : '_self'}
                                                >
                                                    {menuItem.title}
                                                </a>
                                            </HeaderMenuItemLink>
                                        );
                                    }

                                    return (
                                        <NavDropdown key={menuItem.key} id={menuItem.key} title={menuItem.title}>
                                            {menuItem.children.map(childMenuItem => (
                                                <HeaderMenuItemLink key={childMenuItem.key} href={childMenuItem.url}>
                                                    <NavDropdown.Item
                                                        target={childMenuItem.isExternal ? '_blank' : '_self'}
                                                    >
                                                        {childMenuItem.title}
                                                    </NavDropdown.Item>
                                                </HeaderMenuItemLink>
                                            ))}
                                        </NavDropdown>
                                    );
                                })
                            )}
                        </Nav>

                        <Form onSubmit={search} inline>
                            <InputGroup>
                                <FormControl
                                    type="text"
                                    name="search"
                                    placeholder="Search articles"
                                    className={styles.searchInput}
                                    required
                                />

                                <InputGroup.Append>
                                    <Button type="submit" variant="primary">
                                        <FontAwesomeIcon icon={faSearch} />
                                    </Button>
                                </InputGroup.Append>
                            </InputGroup>
                        </Form>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}
