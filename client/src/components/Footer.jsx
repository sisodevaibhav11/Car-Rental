import React from 'react'
import { assets } from '../assets/assets'
import { motion } from "framer-motion"

const Footer = () => {

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className='text-gray-500/80 pt-8 px-6 md:px-16 lg:px-24 xl:px-32'
    >

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className='flex flex-wrap justify-between gap-12 md:gap-6'
      >

        {/* Logo Section */}
        <motion.div variants={item} className='max-w-80'>
          <img src={assets.logo} alt="logo" className='mb-4 h-8 md:h-9' />

          <p className='text-sm'>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          </p>

          <div className='flex items-center gap-3 mt-4'>

            <motion.svg whileHover={{ scale: 1.2 }} className="w-6 h-6 cursor-pointer" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.75 2A5.75 5.75 0 002 7.75v8.5A5.75 5.75 0 007.75 22h8.5A5.75 5.75 0 0022 16.25v-8.5A5.75 5.75 0 0016.25 2h-8.5z" />
            </motion.svg>

            <motion.svg whileHover={{ scale: 1.2 }} className="w-6 h-6 cursor-pointer" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.5 9H15V6.5h-1.5c-1.933 0-3.5 1.567-3.5 3.5v1.5H8v3h2.5V21h3v-7.5H16l.5-3h-3z" />
            </motion.svg>

            <motion.svg whileHover={{ scale: 1.2 }} className="w-6 h-6 cursor-pointer" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 5.92a8.2 8.2 0 01-2.36.65A4.1 4.1 0 0021.4 4a8.27 8.27 0 01-2.6 1A4.14 4.14 0 0016 4a4.15 4.15 0 00-4.15 4.15c0 .32.04.64.1.94a11.75 11.75 0 01-8.52-4.32 4.14 4.14 0 001.29 5.54" />
            </motion.svg>

          </div>
        </motion.div>

        {/* Company */}
        <motion.div variants={item}>
          <p className='text-lg text-gray-800'>COMPANY</p>
          <ul className='mt-3 flex flex-col gap-2 text-sm'>
            <li><a href="#">About</a></li>
            <li><a href="#">Home</a></li>
            <li><a href="#">Browse Cars</a></li>
            <li><a href="#">List Your Car</a></li>
          </ul>
        </motion.div>

        {/* Support */}
        <motion.div variants={item}>
          <p className='text-lg text-gray-800'>SUPPORT</p>
          <ul className='mt-3 flex flex-col gap-2 text-sm'>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Safety Information</a></li>
            <li><a href="#">Cancellation Options</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </motion.div>

        {/* Newsletter */}
        <motion.div variants={item} className='max-w-80'>
          <p className='text-lg text-gray-800'>STAY UPDATED</p>

          <p className='mt-3 text-sm'>
            Subscribe to our newsletter for inspiration and special offers.
          </p>

          <div className='flex items-center mt-4'>
            <input
              type="text"
              className='bg-white rounded-l border border-gray-300 h-9 px-3 outline-none'
              placeholder='Your email'
            />

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className='flex items-center justify-center bg-black h-9 w-9 rounded-r'
            >
              →
            </motion.button>
          </div>
        </motion.div>

      </motion.div>

      <hr className='border-gray-300 mt-8' />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className='flex flex-col md:flex-row gap-2 items-center justify-between py-5'
      >

        <p>© {new Date().getFullYear()} PrebuiltUI. All rights reserved.</p>

        <ul className='flex items-center gap-4'>
          <li><a href="#">Privacy</a></li>
          <li><a href="#">Terms</a></li>
          <li><a href="#">Sitemap</a></li>
        </ul>

      </motion.div>

    </motion.div>
  )
}

export default Footer