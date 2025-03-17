import React from 'react';
import popular1 from '../../assets/images/popular-1.jpg'
import blog2 from '../../assets/images/blog-2.jpg'
import blog3 from '../../assets/images/blog-3.jpg'
import avatar1 from '../../assets/images/author-avatar.png'
import { IoTimeOutline, IoArrowForwardOutline } from 'react-icons/io5';

const BlogPostSection = () => {
  const blogPosts = [
    {
      id: 1,
      image: popular1,
      date: '04 Dec',
      time: '10:30 AM',
      author: {
        name: 'Jony bristow',
        avatar: avatar1,
        title: 'Admin'
      },
      title: 'A good traveler has no fixed plans and is not intent on arriving.'
    },
    {
      id: 2,
      image: blog2,
      date: '04 Dec',
      time: '10:30 AM',
      author: {
        name: 'Jony bristow',
        avatar: avatar1,
        title: 'Admin'
      },
      title: 'A good traveler has no fixed plans and is not intent on arriving.'
    },
    {
      id: 3,
      image: blog3,
      date: '04 Dec',
      time: '10:30 AM',
      author: {
        name: 'Jony bristow',
        avatar: avatar1,
        title: 'Admin'
      },
      title: 'A good traveler has no fixed plans and is not intent on arriving.'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <p className="text-center text-yellow-500 text-5xl font-['Comforter_Brush'] mb-2">From The Blog Post</p>
        <h2 className="text-center text-3xl font-medium font-['Abril_Fatface'] text-gray-800 mb-12">
          Latest News & Articles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg overflow-hidden shadow-lg">
              <div className="relative">
                <a href="#">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-64 object-cover"
                  />
                </a>
                <span className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-2 rounded-md flex items-center">
                  <IoTimeOutline className="mr-1" />
                  <time>{post.date}</time>
                </span>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <figure className="w-8 h-8 rounded-full overflow-hidden">
                      <img 
                        src={post.author.avatar} 
                        alt={post.author.name} 
                        className="w-full h-full object-cover"
                      />
                    </figure>
                    <div>
                      <a href="#" className="text-gray-700 font-medium hover:text-teal-600">
                        {post.author.name}
                      </a>
                      <p className="text-sm text-gray-500">{post.author.title}</p>
                    </div>
                  </div>
                  <time className="text-sm text-gray-500">{post.time}</time>
                </div>

                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  <a href="#" className="hover:text-teal-600 transition duration-300">
                    {post.title}
                  </a>
                </h3>

                <a 
                  href="#" 
                  className="inline-flex items-center text-teal-600 font-bold hover:text-gray-800 transition duration-300"
                >
                  <span>Read More</span>
                  <IoArrowForwardOutline className="ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPostSection;