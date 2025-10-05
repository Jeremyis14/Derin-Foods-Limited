import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

export default function ReviewsPage() {
  const reviews = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Food Blogger',
      content: 'The quality of ingredients is exceptional! I can taste the difference in every bite. Highly recommend their organic range.',
      rating: 5,
      date: '2 days ago'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Home Chef',
      content: 'Great selection of international ingredients. The delivery was fast and everything was well-packaged.',
      rating: 4,
      date: '1 week ago'
    },
    {
      id: 3,
      name: 'Amina Yusuf',
      role: 'Nutritionist',
      content: 'As a nutritionist, I appreciate the focus on healthy, organic options. My clients love the quality!',
      rating: 5,
      date: '2 weeks ago'
    },
    {
      id: 4,
      name: 'David Miller',
      role: 'Restaurant Owner',
      content: 'We source most of our ingredients from here. Consistent quality and reliable delivery.',
      rating: 5,
      date: '3 weeks ago'
    },
    {
      id: 5,
      name: 'Emily Rodriguez',
      role: 'Home Cook',
      content: 'Love the variety and quality. The only downside is that some items are often out of stock.',
      rating: 4,
      date: '1 month ago'
    },
    {
      id: 6,
      name: 'James Wilson',
      role: 'Food Critic',
      content: 'Impressive selection of artisanal products. The customer service is top-notch as well!',
      rating: 5,
      date: '1 month ago'
    }
  ];

  const RatingStars = ({ rating }) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <FiStar 
          key={i}
          className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl"
          >
            What Our Customers Say
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4"
          >
            Don't just take our word for it - hear what our customers have to say about us.
          </motion.p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index % 3) }}
              className="flex flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg">
                  {review.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">{review.name}</h3>
                  <p className="text-sm text-gray-500">{review.role}</p>
                </div>
              </div>
              <div className="mt-4">
                <RatingStars rating={review.rating} />
                <p className="mt-3 text-gray-600">{review.content}</p>
                <p className="mt-3 text-sm text-gray-400">{review.date}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Write a Review
          </motion.button>
        </div>
      </div>
    </div>
  );
}
