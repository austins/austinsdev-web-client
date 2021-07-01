import { gql } from 'graphql-request';
import Projects from '../components/Projects';
import HeadWithTitle from '../components/HeadWithTitle';
import { pageQuery, projectsQuery } from '../lib/data/queries';
import { graphqlFetcher } from '../lib/data/fetchers';
import Page from '../components/Page';

const portfolioSlug = 'portfolio';

export default function SinglePage({ pageData, projectsData }) {
    const page = pageData.pageBy;

    let projects = null;
    if (projectsData && projectsData.projects.nodes.length) projects = projectsData.projects.nodes;

    return (
        <>
            <HeadWithTitle title={page.title} innerHTMLString={page.seo.fullHead} />

            <Page page={page} parseContent />

            {projects && <Projects projects={projects} />}
        </>
    );
}

export async function getStaticProps({ params }) {
    const { slug } = params;

    const pageData = await graphqlFetcher(pageQuery, { slug });

    if (!pageData.pageBy) return { notFound: true };

    // If portfolio page, get projects.
    let projectsData = null;
    if (slug === portfolioSlug) projectsData = await graphqlFetcher(projectsQuery);

    return {
        props: { pageData, projectsData },
        revalidate: Number(process.env.REVALIDATION_IN_SECONDS),
    };
}

export async function getStaticPaths() {
    const pageData = await graphqlFetcher(gql`
        query {
            pages(first: 100, where: { status: PUBLISH }) {
                nodes {
                    slug
                }
            }
        }
    `);

    const pages = pageData.pages.nodes;

    const paths = pages.map(page => ({
        params: { slug: page.slug },
    }));

    return { fallback: 'blocking', paths };
}
