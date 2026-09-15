import { Link, useParams } from "react-router-dom";
import posts from "../data/posts.json";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = (posts as Post[]).find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-neutral-900">Post not found</h1>
        <Link to="/blog" className="mt-4 inline-block text-pink-600 hover:underline">
          ← Back to blog
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold text-neutral-900">{post.title}</h1>
      <p className="mt-4 whitespace-pre-line text-neutral-700">{post.content ?? post.excerpt}</p>
    </article>
  );
}
