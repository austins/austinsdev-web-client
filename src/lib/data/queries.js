import { gql } from "graphql-request";

// Fragments
const commentFieldsFragment = gql`
    fragment commentFields on Comment {
        id
        databaseId
        parentId
        content
        author {
            node {
                name
                ... on User {
                    avatar(size: 42) {
                        url
                        width
                        height
                    }
                    slug
                    posts(where: { status: PUBLISH }, first: 1) {
                        nodes {
                            id
                        }
                    }
                }
            }
        }
        dateGmt
    }
`;

export const commentNodeFieldsFragment = gql`
    ${commentFieldsFragment}

    fragment commentNodeFields on Comment {
        ...commentFields
        replies(first: 100, where: { order: ASC, orderby: COMMENT_DATE_GMT }) {
            edges {
                node {
                    ...commentFields
                }
            }
        }
    }
`;

// Queries
export const headerMenuQuery = gql`
    query {
        menu(id: "header", idType: NAME) {
            menuItems(first: 100) {
                nodes {
                    id
                    parentId
                    label
                    url
                }
            }
        }
    }
`;

export const pagePathsQuery = gql`
    query {
        pages(first: 100, where: { status: PUBLISH }) {
            nodes {
                slug
                modifiedGmt
            }
        }
    }
`;

export const postPathsQuery = gql`
    query {
        posts(first: 100, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
            nodes {
                uri
                modifiedGmt
            }
        }
    }
`;

export const pageQuery = gql`
    query ($slug: ID!) {
        page(id: $slug, idType: URI) {
            title
            content
            seo {
                fullHead
                opengraphDescription
            }
        }
    }
`;

export const projectsQuery = gql`
    query {
        projects(first: 100, where: { orderby: { field: TITLE, order: ASC } }) {
            nodes {
                id
                content
                title
                featuredImage {
                    node {
                        sourceUrl(size: THUMBNAIL)
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
`;

export const postsQuery = gql`
    query (
        $categorySlug: String
        $authorSlug: String
        $search: String
        $size: Int!
        $offset: Int
        $withContent: Boolean = false
    ) {
        generalSettings {
            description
        }
        posts(
            where: {
                status: PUBLISH
                orderby: { field: DATE, order: DESC }
                categoryName: $categorySlug
                authorName: $authorSlug
                search: $search
                offsetPagination: { size: $size, offset: $offset }
            }
        ) {
            pageInfo {
                offsetPagination {
                    hasMore
                    hasPrevious
                }
            }
            edges {
                node {
                    id
                    slug
                    dateGmt
                    title
                    excerpt
                    content @include(if: $withContent)
                    author {
                        node {
                            name
                            slug
                        }
                    }
                    categories {
                        nodes {
                            name
                            slug
                        }
                    }
                    featuredImage {
                        node {
                            sourceUrl(size: THUMBNAIL)
                        }
                    }
                }
            }
        }
    }
`;

export const postQuery = gql`
    ${commentNodeFieldsFragment}

    query ($slug: ID!) {
        post(id: $slug, idType: SLUG) {
            id
            databaseId
            status
            title
            content
            dateGmt
            author {
                node {
                    name
                    slug
                    description
                    avatar(size: 60) {
                        url
                        width
                        height
                    }
                }
            }
            categories {
                nodes {
                    name
                    slug
                }
            }
            commentCount
            commentStatus
            comments(first: 100, where: { order: ASC, orderby: COMMENT_DATE_GMT, parent: 0 }) {
                edges {
                    node {
                        ...commentNodeFields
                    }
                }
            }
            seo {
                fullHead
                opengraphDescription
            }
        }
    }
`;
