# austinsdev-web-client

The frontend for _[Austin's Dev](https://austinsdev.com)_, powered by Next.js, React, GraphQL with graphql-request and SWR, and Bootstrap.

The goal of this project is to abstract the frontend away from WordPress, improve performance (such as time to first byte), eliminate the usage of frontend plugins that slow down WordPress, and allow further customization for the intended website.

Pages are statically generated at build-time except for certain dynamic pages (search, preview, RSS feed, server sitemap). They may be server-side rendered during revalidation or if a requested page doesn't exist. This app is required to be rebuilt when the code is updated. Content changed in the WordPress backend relies on Incremental Static Regeneration.

## Requirements

- Node.js (LTS v16.13.1 is the minimum version necessary)
- A backend powered by WordPress with these plugins at the minimum:
  - [WPGraphQL](https://wordpress.org/plugins/wp-graphql/), [WPGraphQL Offset Pagination](https://github.com/valu-digital/wp-graphql-offset-pagination), [Custom Post Type UI](https://wordpress.org/plugins/custom-post-type-ui/), [Advanced Custom Fields](https://wordpress.org/plugins/advanced-custom-fields/), [WPGraphQL for Advanced Custom Fields](https://github.com/wp-graphql/wp-graphql-acf), [Yoast SEO](https://wordpress.org/plugins/wordpress-seo/), and [WPGraphQL Yoast SEO Addon](https://wordpress.org/plugins/add-wpgraphql-seo/). 

## Development

1. Create a `.env.local` file (see the provided example file) with the required environment variables set.
2. Run the development server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

Preferably, configure your IDE to run `eslint --fix` on save for file extensions: `{**/*,*}.{js,ts,jsx,tsx}` and prettier on code reformat and save for file extensions: `{**/*,*}.{js,ts,jsx,tsx,json,css,scss}`.

## Deployment

For a self-hosted server, it should be configured with Linux, Docker, and [webhook](https://github.com/adnanh/webhook). Docker must be configured as a swarm with a service for this app to handle rolling updates without build conflicts and load balancing.

The service must have three environment variables configured: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_GRAPHQL_URL`, and `NEXT_PUBLIC_GOOGLE_ANALYTICS_TRACKING_ID`. Optionally, a bind mount targeting `/app/.next/cache` can be added to persist cached images.

In this repo, a GitHub Actions workflow builds a Docker image, pushes it to a private registry, and posts to a webhook on the server that pulls the latest image and updates the Docker service. This process allows for continuous deployment.

## License

See LICENSE file in this repo.

This app has been developed by Austin S.

You may contribute code to this app. You may fork, modify, and use this app as a basis for your own project. You may not use the name and content of _Austin's Dev_ for any derivatives of this project.
