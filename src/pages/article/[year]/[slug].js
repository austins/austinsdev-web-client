import isInt from "validator/lib/isInt";
import has from "lodash/has";
import useSWR from "swr";
import HeadWithTitle from "../../../components/HeadWithTitle";
import { postPathsQuery, postQuery } from "../../../lib/data/queries";
import { graphqlFetcher } from "../../../lib/data/fetchers";
import Post from "../../../components/Post";
import dynamic from "next/dynamic";

const Comments = dynamic(() => import("../../../components/Comments"));

const getPostQueryVars = (slug) => ({ slug });

export default function SinglePost({ slug, fallbackPostData }) {
    const isCommentStatusOpen = fallbackPostData.post.commentStatus === "open";

    const { data, mutate } = useSWR([postQuery, getPostQueryVars(slug)], graphqlFetcher, {
        fallbackData: fallbackPostData,
        revalidateOnMount: isCommentStatusOpen, // Since we have Incremental Static Regeneration, the page may be cached, so we should refetch the latest comments data.
    });

    // Disable error checking for now since revalidateOnMount causes error to be thrown on fast refreshes.
    // if (error) return <Error statusCode={error.statusCode} />;

    // Disable data loading check for now since fallbackData is populated.
    // if (!data) return <LoadingSpinner />;

    const { post } = data;

    return (
        <>
            <HeadWithTitle
                title={post.title}
                description={post.seo.opengraphDescription}
                innerHTMLString={post.seo.fullHead}
            >
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/themes/prism.min.css"
                    integrity="sha512-tN7Ec6zAFaVSG3TpNAKtk4DOHNpSwKHxxrsiw4GHKESGPs5njn/0sMCUMl2svV4wo4BK/rCP7juYz+zx+l6oeQ=="
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />

                <script
                    defer
                    src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/components/prism-core.min.js"
                    integrity="sha512-TbHaMJHEmRBDf9W3P7VcRGwEmVEJu7MO6roAE0C4yqoNHeIVo3otIX3zj1DOLtn7YCD+U8Oy1T9eMtG/M9lxRw=="
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />

                <script
                    defer
                    src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/plugins/autoloader/prism-autoloader.min.js"
                    integrity="sha512-sv0slik/5O0JIPdLBCR2A3XDg/1U3WuDEheZfI/DI5n8Yqc3h5kjrnr46FGBNiUAJF7rE4LHKwQ/SoSLRKAxEA=="
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />
            </HeadWithTitle>

            <Post post={post} parseContent />

            <hr className="mt-5 mb-4" />

            <Comments isCommentStatusOpen={isCommentStatusOpen} postData={data} postMutate={mutate} />
        </>
    );
}

export async function getStaticProps({ params }) {
    const { year, slug } = params;

    if (!isInt(year, { allow_leading_zeroes: false })) return { notFound: true };

    const fallbackPostData = await graphqlFetcher(postQuery, getPostQueryVars(slug));
    if (
        !has(fallbackPostData, "post.id") ||
        new Date(`${fallbackPostData.post.dateGmt}Z`).getUTCFullYear() !== Number.parseInt(year, 10)
    ) {
        return { notFound: true };
    }

    return { props: { year, slug, fallbackPostData }, revalidate: Number(process.env.REVALIDATION_IN_SECONDS) };
}

export async function getStaticPaths() {
    const postsData = await graphqlFetcher(postPathsQuery);

    const posts = postsData.posts.nodes;

    const paths = posts.map((post) => {
        const pathSplit = post.uri.split("/");
        const year = pathSplit[2];
        const slug = pathSplit[3];

        return {
            params: { slug, year },
        };
    });

    return { fallback: "blocking", paths };
}
