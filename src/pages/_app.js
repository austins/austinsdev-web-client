import '../styles/ClientApp.scss';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Container } from 'react-bootstrap';
import { ApolloProvider, gql } from '@apollo/client';
import App from 'next/app';
import get from 'lodash/get';
import Moment from 'react-moment';
import SimpleReactLightbox from 'simple-react-lightbox';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { apolloClient, mapMenuItemsChildrenToParents } from '../lib/data/apollo';
import Header from '../components/Header';
import Footer from '../components/Footer';

function ClientApp({ Component, pageProps, menuItems }) {
    const router = useRouter();

    const handleRouteChangeComplete = url => {
        if (process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_TRACKING_ID) {
            window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_TRACKING_ID, {
                page_path: url,
            });
        }
    };

    useEffect(() => {
        router.events.on('routeChangeComplete', handleRouteChangeComplete);

        return () => {
            router.events.off('routeChangeComplete', handleRouteChangeComplete);
        };
    }, [router.events]);

    return (
        <ApolloProvider client={apolloClient}>
            <SimpleReactLightbox>
                <Header menuItems={menuItems} />

                <main id="main">
                    <div id="main-inner">
                        <Container className="py-3">
                            <Component {...pageProps} />
                        </Container>
                    </div>
                </main>

                <Footer />
            </SimpleReactLightbox>
        </ApolloProvider>
    );
}

ClientApp.getInitialProps = async appContext => {
    const appProps = await App.getInitialProps(appContext);

    // Query for initial data.
    const { data } = await apolloClient.query({
        query: gql`
            query {
                menus(where: { slug: "header" }) {
                    nodes {
                        menuItems {
                            nodes {
                                key: id
                                parentId
                                title: label
                                url
                            }
                        }
                    }
                }
            }
        `,
    });

    // Get menu items.
    let menuItems = get(data.menus, 'nodes[0].menuItems.nodes', []);
    if (menuItems.length) menuItems = mapMenuItemsChildrenToParents(menuItems);

    return {
        ...appProps,
        menuItems,
    };
};

Moment.globalFilter = date => {
    if (date.startsWith('a ')) return `1 ${date.slice(1)}`;

    return date;
};

export default ClientApp;
