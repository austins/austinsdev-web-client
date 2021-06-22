import Error from 'next/error';
import useSWR from 'swr';
import { gql } from 'graphql-request';
import memoize from 'fast-memoize';
import Projects from '../components/Projects';
import HeadWithTitle from '../components/HeadWithTitle';
import styles from '../styles/Page.module.scss';
import LoadingSpinner from '../components/LoadingSpinner';
import { pageQuery, projectsQuery } from '../lib/data/queries';
import { graphqlFetcher } from '../lib/data/fetchers';

const portfolioSlug = 'portfolio';
const getPageQueryVars = memoize(slug => ({ slug }));

export default function Page({ slug, initialPageData, initialProjectsData }) {
    const { data: pageData, error: pageError } = useSWR([pageQuery, getPageQueryVars(slug)], graphqlFetcher, {
        initialData: initialPageData,
    });

    const { data: projectsData, error: projectsError } = useSWR(
        slug === portfolioSlug ? projectsQuery : null,
        graphqlFetcher,
        { initialData: initialProjectsData }
    );

    if ((!pageError && !pageData) || (slug === portfolioSlug && !projectsError && !projectsData))
        return <LoadingSpinner />;

    if (pageError || projectsError) return <Error statusCode={500} title="Error retrieving page" />;

    const page = pageData.pageBy;

    let projects = null;
    if (projectsData && projectsData.projects.nodes.length) projects = projectsData.projects.nodes;

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

    const initialPageData = await graphqlFetcher(pageQuery, getPageQueryVars(slug));

    if (!initialPageData.pageBy) return { notFound: true };

    // If portfolio page, get projects.
    let initialProjectsData = null;
    if (slug === portfolioSlug) initialProjectsData = await graphqlFetcher(projectsQuery);

    return {
        props: { slug, initialPageData, initialProjectsData },
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
