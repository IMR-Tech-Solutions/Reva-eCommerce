import { useState } from "react";

interface Post {
  id: number;
  day: string;
  month: string;
  category: string;
  title: string;
  excerpt: string;
  img: string;
  pinned: boolean;
  page: number;
}

interface BlogDetailProps {
  post: Post;
  onBack: () => void;
}

const allPosts: Post[] = [
  // PAGE 1
  {
    id: 1,
    day: "11",
    month: "FEB",
    category: "News",
    title: "Discover tools to bust your productivity in 2021, hot..",
    excerpt:
      "Mauris at malesuada ligula. Cras odio est, fringilla nec bibendum at, semper feugiat ex. Morbi..",
    img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80",
    pinned: true,
    page: 1,
  },
  {
    id: 2,
    day: "04",
    month: "FEB",
    category: "Insights",
    title: "An important message from our CEO. Paul Dumbrell. 2020 new..",
    excerpt:
      "Leverage agile frameworks to provide a robust synopsis for high level overviews. Iterative..",
    img: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&q=80",
    pinned: false,
    page: 1,
  },
  {
    id: 3,
    day: "20",
    month: "FEB",
    category: "Events",
    title: "Coronavirus stimulus package & instant asset write..",
    excerpt:
      "Bring to the table win-win survival strategies to ensure proactive domination. At the end of..",
    img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80",
    pinned: false,
    page: 1,
  },
  {
    id: 4,
    day: "20",
    month: "FEB",
    category: "Events",
    title: "How to get maximum from pressure washers, tips and tricks..",
    excerpt:
      "Efficiently unleash cross-media information without cross-media value. Quickly maximize timely..",
    img: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80",
    pinned: false,
    page: 1,
  },
  {
    id: 5,
    day: "20",
    month: "FEB",
    category: "Insights",
    title: "Top 10 must have tools in your tool pack, check the new..",
    excerpt:
      "Completely synergize resource taxing relationships via premier niche markets. Professionally..",
    img: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80",
    pinned: false,
    page: 1,
  },
  {
    id: 6,
    day: "20",
    month: "JAN",
    category: "Information",
    title: "Check our new collection of tools accessories, hot sale!",
    excerpt:
      "Objectively innovate empowered manufactured products whereas parallel platforms. Holisticly..",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    pinned: false,
    page: 1,
  },
  // PAGE 2
  {
    id: 7,
    day: "20",
    month: "FEB",
    category: "Partners",
    title: "125 mm and on batteries: TOP-5 small battery grinders,..",
    excerpt:
      "Capitalize on low hanging fruit to identify a ballpark value added activity to beta test...",
    img: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=600&q=80",
    pinned: false,
    page: 2,
  },
  {
    id: 8,
    day: "20",
    month: "FEB",
    category: "Insights",
    title: "2020 new power tools pack tested! Check our results only..",
    excerpt:
      "Podcasting operational change management inside of workflows to establish a framework. Taking..",
    img: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&q=80",
    pinned: false,
    page: 2,
  },
  {
    id: 9,
    day: "20",
    month: "FEB",
    category: "Global World",
    title: "Professionals insights for 5 important tips before buying..",
    excerpt:
      "Collaboratively administrate empowered markets via plug-and-play networks. Dynamically..",
    img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
    pinned: false,
    page: 2,
  },
  {
    id: 10,
    day: "20",
    month: "JAN",
    category: "Information",
    title: "Before any project, take care of your safety. Check new..",
    excerpt:
      "Proactively envisioned multimedia based expertise and cross-media growth strategies...",
    img: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&q=80",
    pinned: false,
    page: 2,
  },
  {
    id: 11,
    day: "20",
    month: "JAN",
    category: "Global World",
    title: "Air compressors. How to choose the best one, check..",
    excerpt:
      "Phosfluorescently engage worldwide methodologies with web-enabled technology. Interactively..",
    img: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80",
    pinned: false,
    page: 2,
  },
  {
    id: 12,
    day: "20",
    month: "JAN",
    category: "Insights",
    title: "Get ready for summer sale! Mega sale for power tools!",
    excerpt:
      "Collaboratively administrate turnkey channels whereas virtual e-tailers. Objectively seize..",
    img: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80",
    pinned: false,
    page: 2,
  },
];

function BlogDetail({ post, onBack }: BlogDetailProps) {
  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <button
          onClick={onBack}
          className="text-[#FFB700] font-semibold mb-6 flex items-center gap-1 hover:underline text-sm sm:text-base"
        >
          ← Back to Blog
        </button>
        <img
          src={post.img}
          alt={post.title}
          className="w-full h-48 sm:h-64 md:h-72 object-cover rounded-md mb-6"
        />
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-[#FFB700] text-xs sm:text-sm font-semibold border border-[#FFB700] rounded-full px-3 py-1">
            {post.category}
          </span>
          <span className="text-gray-400 text-xs sm:text-sm">
            {post.day} {post.month}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-snug">
          {post.title}
        </h1>
        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
          {post.excerpt} Lorem ipsum dolor sit amet, consectetur adipiscing
          elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
          laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
          in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
    </div>
  );
}

function SingleBlogPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const visiblePosts = allPosts.filter((p: Post) => p.page === currentPage);

  if (selectedPost !== null) {
    return (
      <BlogDetail post={selectedPost} onBack={() => setSelectedPost(null)} />
    );
  }

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Page Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">
          Blog
        </h1>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {visiblePosts.map((post: Post) => (
            <div
              key={post.id}
              className="bg-white border border-gray-100 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image with date badge */}
              <div className="relative">
                <img
                  src={post.img}
                  alt={post.title}
                  className="w-full h-44 sm:h-52 md:h-56 object-cover"
                />
                <div className="absolute top-3 left-3 bg-[#FFB700] text-black font-extrabold text-center px-2 sm:px-3 py-1.5 sm:py-2 rounded leading-tight min-w-[44px] sm:min-w-[52px]">
                  <div className="text-lg sm:text-2xl leading-none">
                    {post.day}
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold tracking-wider">
                    {post.month}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#FFB700] text-xs font-semibold border border-[#FFB700] rounded-full px-2 sm:px-3 py-0.5">
                    {post.category}
                  </span>
                  <svg
                    className={
                      "w-4 h-4 " +
                      (post.pinned ? "text-gray-500" : "text-gray-200")
                    }
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 3H8L6 8l2 1-3 5h4v7h2v-7h4l-3-5 2-1z" />
                  </svg>
                </div>
                <h2 className="text-gray-900 font-bold text-sm sm:text-base leading-snug mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <button
                  onClick={() => setSelectedPost(post)}
                  className="text-[#FFB700] text-xs sm:text-sm font-semibold hover:text-[#CC9200] flex items-center gap-1 transition-colors"
                >
                  Read more{" "}
                  <span className="text-sm sm:text-base leading-none">›</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center gap-1 mt-8 sm:mt-10">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-gray-300 rounded text-gray-500 hover:border-[#FFB700] hover:text-[#FFB700] disabled:opacity-30 transition-colors text-sm"
          >
            ‹
          </button>

          {[1, 2].map((pg: number) => (
            <button
              key={pg}
              onClick={() => setCurrentPage(pg)}
              className={
                "w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border rounded font-semibold text-xs sm:text-sm transition-colors " +
                (currentPage === pg
                  ? "border-gray-900 bg-white text-gray-900"
                  : "border-gray-300 text-gray-500 hover:border-[#FFB700] hover:text-[#FFB700]")
              }
            >
              {pg}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(2, p + 1))}
            disabled={currentPage === 2}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-gray-300 rounded text-gray-500 hover:border-[#FFB700] hover:text-[#FFB700] disabled:opacity-30 transition-colors text-sm"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

export default SingleBlogPage;
