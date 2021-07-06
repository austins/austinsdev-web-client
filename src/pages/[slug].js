import Projects from "../components/Projects";
import HeadWithTitle from "../components/HeadWithTitle";
import { pagePathsQuery, pageQuery, projectsQuery } from "../lib/data/queries";
import { graphqlFetcher } from "../lib/data/fetchers";
import Page from "../components/Page";

const portfolioSlug = "portfolio";

export default function SinglePage({ pageData, projectsData }) {
    const { page } = pageData;

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

    if (!pageData.page) return { notFound: true };

    // If portfolio page, get projects.
    let projectsData = null;
    if (slug === portfolioSlug) projectsData = await graphqlFetcher(projectsQuery);

    return {
        props: { pageData, projectsData },
        revalidate: Number(process.env.REVALIDATION_IN_SECONDS),
    };
}

export async function getStaticPaths() {
    const pageData = await graphqlFetcher(pagePathsQuery);

    const pages = pageData.pages.nodes;

    const paths = pages.map((page) => ({
        params: { slug: page.slug },
    }));

    return { fallback: "blocking", paths };
}
