import { Button, ButtonGroup } from 'react-bootstrap';
import Link from 'next/link';
import styles from '../styles/PostsPager.module.scss';

export default function PostsPager({ authorSlug, categorySlug, hasMore, hasPrevious, page, search }) {
    const articlesPath = '/articles';
    const pathnameBase = categorySlug
        ? `${articlesPath}/topic/${categorySlug}`
        : authorSlug
        ? `${articlesPath}/author/${authorSlug}`
        : articlesPath;

    const paths = {
        hasMorePath: {
            pathname: hasMore && !search ? `${pathnameBase}/${page + 1}` : search ? articlesPath : '#',
        },
        hasPreviousPath: {
            pathname: hasPrevious && !search ? `${pathnameBase}/${page - 1}` : search ? articlesPath : '#',
        },
    };

    if (search) {
        paths.hasMorePath.query = { page: page + 1, search };
        paths.hasPreviousPath.query = { page: page - 1, search };
    }

    return (
        <div>
            {(hasMore || hasPrevious) && (
                <nav className={styles.pagination}>
                    <ButtonGroup>
                        <Link href={paths.hasMorePath} passHref>
                            <Button disabled={!hasMore} variant={hasMore ? 'primary' : 'outline-secondary'}>
                                Older
                            </Button>
                        </Link>

                        <Link href={paths.hasPreviousPath} passHref>
                            <Button disabled={!hasPrevious} variant={hasPrevious ? 'primary' : 'outline-secondary'}>
                                Newer
                            </Button>
                        </Link>
                    </ButtonGroup>
                </nav>
            )}
        </div>
    );
}
