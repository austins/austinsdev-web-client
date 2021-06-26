import { gql } from 'graphql-request';
import Projects from '../components/Projects';
import HeadWithTitle from '../components/HeadWithTitle';
import styles from '../styles/Page.module.scss';
import { pageQuery, projectsQuery } from '../lib/data/queries';
import { graphqlFetcher } from '../lib/data/fetchers';

const portfolioSlug = 'portfolio';

export default function Page({ pageData, projectsData }) {
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
