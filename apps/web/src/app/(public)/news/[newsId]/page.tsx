const NewsPage = async ({ params }: { params: Promise<{ newsId: string }> }) => {
  const { newsId } = await params;

  return <div>News Page - {newsId}</div>;
};

export default NewsPage;
