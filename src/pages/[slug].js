import { gql } from '@apollo/client';
import { apolloClient } from '../lib/data/apollo';
import Projects from '../components/Projects';
import HeadWithTitle from '../components/HeadWithTitle';

export default function Page({ page, slug, projects }) {
    return (
        <div>
            <HeadWithTitle title={page.title} innerHTMLString={page.seo.fullHead} />

            <h1>{page.title}</h1>

            <div className="clearfix">
                {/* eslint-disable-next-line react/no-danger */}
                <div dangerouslySetInnerHTML={{ __html: page.content }} />
            </div>

            {slug === 'portfolio' && projects && <Projects projects={projects} />}
        </div>
    );
}

export async function getStaticProps({ params }) {
    const { slug } = params;

    const { data } = await apolloClient.query({
        query: gql`
            query ($slug: String!) {
                pageBy(uri: $slug) {
                    title
                    content
                    seo {
                        fullHead
                    }
                }
            }
        `,
        variables: { slug },
    });

    const page = data.pageBy;
    if (!page) return { notFound: true };

    // Get projects for portfolio page.
    let projects = null;
    if (slug === 'portfolio') {
        const { data: projectsData } = await apolloClient.query({
            query: gql`
                query {
                    projects(first: 100, where: { orderby: { field: TITLE, order: ASC } }) {
                        nodes {
                            id
                            content
                            title
                            featuredImage {
                                node {
                                    mediaItemUrl
                                }
                            }
                            project {
                                downloadLink
                                previewLink
                                previewType
                                sourceLink
                            }
                            projectCategories(where: { orderby: NAME }) {
                                nodes {
                                    name
                                }
                            }
                            projectTags(where: { orderby: NAME }) {
                                nodes {
                                    id
                                    name
                                }
                            }
                        }
                    }
                }
            `,
        });

        if (projectsData.projects && projectsData.projects.nodes.length) projects = projectsData.projects.nodes;
    }

    return {
        props: { page, projects, slug },
        revalidate: Number(process.env.REVALIDATION_IN_SECONDS),
    };
}

export async function getStaticPaths() {
    const { data } = await apolloClient.query({
        query: gql`
            query {
                pages(where: { status: PUBLISH }) {
                    nodes {
                        slug
                    }
                }
            }
        `,
    });

    const pages = data.pages.nodes;

    const paths = pages.map(page => ({
        params: { slug: page.slug },
    }));

    return { fallback: 'blocking', paths };
}
