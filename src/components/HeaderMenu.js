import HeaderMenuItemLink from "./HeaderMenuItemLink";
import { Button, Form, FormControl, InputGroup, Nav, Navbar, NavDropdown, Spinner } from "react-bootstrap";
import styles from "../styles/HeaderMenu.module.scss";
import { useRouter } from "next/router";
import get from "lodash/get";
import has from "lodash/has";
import isObject from "lodash/isObject";
import useSWR from "swr";
import { headerMenuQuery } from "../lib/data/queries";
import { graphqlFetcher } from "../lib/data/fetchers";
import { mapMenuItemsChildrenToParents } from "../lib/data/helpers";
import { MagnifyingGlass } from "phosphor-react";
import isJSON from "validator/lib/isJSON";
import { useEffect, useState } from "react";

export default function HeaderMenu() {
    const router = useRouter();

    const [searching, setSearching] = useState(false);
    const stopSearching = () => setSearching(false);

    useEffect(() => {
        router.events.on("routeChangeComplete", stopSearching);
        router.events.on("routeChangeError", stopSearching);

        return () => {
            router.events.off("routeChangeComplete", stopSearching);
            router.events.off("routeChangeError", stopSearching);
        };
    }, [router]);

    // Get header menu data from localStorage.
    // This requires importing this component dynamically with no SSR as this only works in the browser.
    let fallbackHeaderMenuData = {};
    const headerMenuDataCache = localStorage.getItem("headerMenuData");
    if (headerMenuDataCache && isJSON(headerMenuDataCache)) {
        const parsedHeaderMenuDataCache = JSON.parse(headerMenuDataCache);
        if (isObject(parsedHeaderMenuDataCache) && has(parsedHeaderMenuDataCache, "menu.menuItems.nodes"))
            fallbackHeaderMenuData = parsedHeaderMenuDataCache;
    }

    const { data: headerMenuData } = useSWR(headerMenuQuery, graphqlFetcher, {
        fallbackData: fallbackHeaderMenuData,
        revalidateOnMount: true,
        onSuccess: (fetchedHeaderMenuData) =>
            localStorage.setItem("headerMenuData", JSON.stringify(fetchedHeaderMenuData)),
    });

    let menuItems = get(headerMenuData ?? {}, "menu.menuItems.nodes", []);
    if (menuItems.length) menuItems = mapMenuItemsChildrenToParents(menuItems);

    const search = (e) => {
        e.preventDefault();

        const searchValue = e.target.search.value.trim();
        if (searchValue.length) {
            setSearching(true);
            router.push({ pathname: "/articles", query: { search: searchValue } });
            e.target.search.value = "";
        }
    };

    return (
        <>
            <Navbar.Toggle aria-controls="navbar-collapse" />

            <Navbar.Collapse id="navbar-collapse">
                <Nav>
                    {menuItems.length > 0 &&
                        menuItems.map((menuItem) => {
                            if (!menuItem.children.length) {
                                return (
                                    <HeaderMenuItemLink key={menuItem.id} href={menuItem.url}>
                                        <Nav.Link target={menuItem.isExternal ? "_blank" : "_self"}>
                                            {menuItem.label}
                                        </Nav.Link>
                                    </HeaderMenuItemLink>
                                );
                            }

                            return (
                                <NavDropdown key={menuItem.id} id={menuItem.id} title={menuItem.label}>
                                    {menuItem.children.map((childMenuItem) => (
                                        <HeaderMenuItemLink key={childMenuItem.id} href={childMenuItem.url}>
                                            <NavDropdown.Item target={childMenuItem.isExternal ? "_blank" : "_self"}>
                                                {childMenuItem.label}
                                            </NavDropdown.Item>
                                        </HeaderMenuItemLink>
                                    ))}
                                </NavDropdown>
                            );
                        })}
                </Nav>

                <Form onSubmit={search} className="d-flex ms-auto">
                    <InputGroup>
                        <FormControl
                            type="text"
                            name="search"
                            placeholder="Search articles"
                            className={styles.searchInput}
                            required
                        />

                        <Button type="submit" variant="primary">
                            {searching ? (
                                <>
                                    <span className="visually-hidden">Searching...</span>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                </>
                            ) : (
                                <>
                                    <span className="visually-hidden">Search</span>
                                    <MagnifyingGlass weight="fill" aria-hidden="true" />
                                </>
                            )}
                        </Button>
                    </InputGroup>
                </Form>
            </Navbar.Collapse>
        </>
    );
}
