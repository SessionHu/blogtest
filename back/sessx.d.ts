interface PostsIndexYearly {
  year: number,
  posts: PostsIndexItem[]
}

interface PostsIndexItem {
  type: 'post' | 'note',
  title: string,
  fname: `${string}.${string}`,
  time: `${string}-${string}-${string}T${string}:${string}`,
  category: string,
  image: string,
  tags: string[]
}

interface SSGCache {
  postsindex?: PostsIndexYearly[],
  basehtml?: string
}
