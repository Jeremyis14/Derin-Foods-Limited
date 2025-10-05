import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiStar, FiMapPin, FiPackage, FiTrash2 } from 'react-icons/fi';
import ReviewForm from './ReviewForm';
import ConfirmModal from './ConfirmModal';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_REVIEWS = [
  {
    id: 1,
    name: "Omotola Johnson",
    location: "London, UK",
    image: "https://images.unsplash.com/photo-1602342323893-b11f757957c9?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 5,
    text: "The authentic Nigerian spices from Derin Foods bring back memories of home. The quality is exceptional, and delivery was faster than expected!",
    product: "Jollof Rice Mix"
  },
  {
    id: 2,
    name: "Michael Abiodun",
    location: "Toronto, Canada",
    image: "https://images.unsplash.com/photo-1594564190328-0bed16a89837?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 5,
    text: "Never had Nigerian food before, but the meal kits made it so easy to prepare. The flavors are incredible! Highly recommend the Egusi soup kit.",
    product: "Egusi Soup Kit"
  },
  {
    id: 3,
    name: "Muyiwa Daniels",
    location: "Dubai, UAE",
    image: "https://plus.unsplash.com/premium_photo-1690359589674-b85931ae8d28?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 5,
    text: "The packaging is excellent, everything arrives fresh. The Suya spice is perfectly blended - just like what I remember from Lagos!",
    product: "Suya Spice"
  }
];

const ReviewCard = ({ review, onDelete }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white rounded-xl p-6 shadow-xl border border-green-100 relative"
  >
    <button
      onClick={() => onDelete(review.id)}
      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 
                 rounded-full hover:bg-red-50 transition-colors"
      aria-label="Delete review"
    >
      <FiTrash2 />
    </button>
    
    <div className="flex items-start gap-4">
      <img
        src={review.image}
        alt={review.name}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div>
        <h3 className="font-semibold text-gray-900">{review.name}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiMapPin className="text-green-600" />
          <span>{review.location}</span>
        </div>
      </div>
    </div>
    
    <div className="mt-4">
      <div className="flex items-center gap-1 mb-2">
        {[...Array(review.rating)].map((_, i) => (
          <FiStar key={i} className="text-yellow-400 fill-current" />
        ))}
      </div>
      <p className="text-gray-600">{review.text}</p>
    </div>
    
    <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
      <FiPackage />
      <span>{review.product}</span>
    </div>
  </motion.div>
);

export default function Reviews() {
  const sectionRef = useRef(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [reviews, setReviews] = useState(() => {
    const savedReviews = localStorage.getItem('derinFoodsReviews');
    return savedReviews ? JSON.parse(savedReviews) : DEFAULT_REVIEWS;
  });
  const [deleteReviewId, setDeleteReviewId] = useState(null);

  const handleSubmitReview = (newReview) => {
    const reviewWithId = {
      ...newReview,
      id: Date.now(),
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
      date: new Date().toISOString()
    };
    setReviews(prevReviews => [reviewWithId, ...prevReviews]);
  };

  useEffect(() => {
    localStorage.setItem('derinFoodsReviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(".reviews-header", {
        scrollTrigger: {
          trigger: ".reviews-header",
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8
      });

      // Reviews grid animation
      gsap.from(".review-card", {
        scrollTrigger: {
          trigger: ".reviews-grid",
          start: "top 70%",
        },
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleDeleteReview = (reviewId) => {
    setDeleteReviewId(reviewId);
  };

  const confirmDelete = () => {
    setReviews(prevReviews => 
      prevReviews.filter(review => review.id !== deleteReviewId)
    );
    setDeleteReviewId(null);
  };

  return (
    <div ref={sectionRef} className="min-h-screen pt-20">
      <section className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reviews-header text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Read genuine reviews from customers worldwide who've experienced 
              the authentic taste of Nigeria through Derin Foods.
            </p>
          </div>

          <div className="reviews-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <ReviewCard 
                  review={review} 
                  onDelete={handleDeleteReview}
                />
              </div>
            ))}
          </div>

          <motion.div className="text-center mt-16">
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-green-600 text-white px-8 py-3 rounded-full 
                       font-medium hover:bg-green-700 transition-colors"
            >
              Write a Review
            </button>
          </motion.div>

          <ReviewForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleSubmitReview}
          />

          <ConfirmModal
            isOpen={deleteReviewId !== null}
            onClose={() => setDeleteReviewId(null)}
            onConfirm={confirmDelete}
            message="Are you sure you want to delete this review? This action cannot be undone."
          />
        </div>
      </section>
    </div>
  );
}