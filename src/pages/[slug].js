import { gql, useQuery } from 'urql';
import Error from 'next/error';
import Projects from '../components/Projects';
import HeadWithTitle from '../components/HeadWithTitle';
import styles from '../styles/Page.module.scss';
import { getUrqlClient, wrapUrqlClient } from '../lib/data/urql';
import LoadingSpinner from '../components/LoadingSpinner';
import { pageQuery, projectsQuery } from '../lib/data/queries';

const portfolioSlug = 'portfolio';
const getPageQueryVars = slug => ({ slug });

function Page({ slug, projects }) {
    const [result] = useQuery({ query: pageQuery, variables: getPageQueryVars(slug) });
    const { data, fetching, error } = result;

    if (fetching) return <LoadingSpinner />;
    if (error) return <Error statusCode={500} title="Error retrieving page" />;

    const page = data.pageBy;
    if (!page) return <Error statusCode={404} title="Page not found" />;

    return (
        <div>
            <HeadWithTitle title={page.title} innerHTMLString={page.seo.fullHead} />

            <h1>{page.title}</h1>

            <div className="clearfix">
                {/* eslint-disable-next-line react/no-danger */}
                <div className={styles.pageContent} dangerouslySetInnerHTML={{ __html: page.content }} />
            </div>

            {projects && <Projects projects={projects} />}
        </div>
    );
}

export async function getStaticProps({ params }) {
    const { slug } = params;

    const { urqlClient, ssrCache } = getUrqlClient();

    await urqlClient.query(pageQuery, getPageQueryVars(slug)).toPromise();

    // If portfolio page, get projects.
    let projects = null;
    if (slug === portfolioSlug) {
        const { data: projectsData } = await urqlClient.query(projectsQuery).toPromise();
        if (projectsData && projectsData.projects.nodes.length) projects = projectsData.projects.nodes;
    }

    return {
        props: { urqlState: ssrCache.extractData(), slug, projects },
        revalidate: Number(process.env.REVALIDATION_IN_SECONDS),
    };
}

export async function getStaticPaths() {
    const { urqlClient } = getUrqlClient();
    const { data } = await urqlClient
        .query(
            gql`
                query {
                    pages(first: 100, where: { status: PUBLISH }) {
                        nodes {
                            slug
                        }
                    }
                }
            `
        )
        .toPromise();

    const pages = data.pages.nodes;

    const paths = pages.map(page => ({
        params: { slug: page.slug },
    }));

    return { fallback: 'blocking', paths };
}

export default wrapUrqlClient(Page);
