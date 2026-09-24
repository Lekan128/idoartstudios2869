import { Link } from "react-router-dom";
import posts from "../data/posts.json";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
}

export default function Blog() {
  const list = posts as Post[];

  return (
    <div className="mx-auto min-h-[50vh] max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl lg:text-5xl">Blog</h1>

      {list.length === 0 ? (
        <p className="mt-6 text-neutral-600">
          New posts are on the way. Check back soon.
        </p>
      ) : (
        <ul className="mt-8 max-w-3xl space-y-6">
          {list.map((post) => (
            <li key={post.slug} className="border-b border-pink-100 pb-6">
              <Link to={`/blog/${post.slug}`} className="text-xl font-bold text-neutral-900 hover:text-pink-600">
                {post.title}
              </Link>
              <p className="mt-2 text-neutral-600">{post.excerpt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
