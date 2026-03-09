import { ReviewModel } from "src/review/review.model";

export function reviewsSorting(reviews: (ReviewModel & { createdAt: Date })[]) {
  return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
