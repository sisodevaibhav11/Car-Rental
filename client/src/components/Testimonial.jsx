import React from 'react'
import { motion } from "framer-motion"

const Testimonial = () => {

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.25
            }
        }
    }

    const card = {
        hidden: { opacity: 0, y: 50 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center m-12"
        >

            <h1 className="text-4xl font-bold max-w-[740px] mb-[72px]">
                What our Customers say
                <p>share their experiences</p>
            </h1>

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="flex flex-wrap items-center justify-center gap-4"
            >

                {/* Card 1 */}
                <motion.div
                    variants={card}
                    whileHover={{ scale: 1.05 }}
                    className="flex flex-col items-center bg-white px-3 py-8 rounded-lg border border-gray-300/80 max-w-[272px] text-sm text-center text-gray-500"
                >

                    <div className="relative mb-4">
                        <img
                            className="h-16 w-16 rounded-full"
                            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/userImage/userImage1.png"
                            alt="user"
                        />
                    </div>

                    <p>
                        “Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.”
                    </p>

                    <p className="text-lg text-gray-800 font-medium mt-5">
                        Donald Jackman
                    </p>

                    <p className="text-xs">Content Creator</p>

                </motion.div>

                {/* Card 2 */}
                <motion.div
                    variants={card}
                    whileHover={{ scale: 1.05 }}
                    className="flex flex-col items-center bg-white px-3 py-8 rounded-lg border border-gray-300/80 max-w-[272px] text-sm text-center text-gray-500"
                >

                    <div className="relative mb-4">
                        <img
                            className="h-16 w-16 rounded-full"
                            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/userImage/userImage2.png"
                            alt="user"
                        />
                    </div>

                    <p>
                        “Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.”
                    </p>

                    <p className="text-lg text-gray-800 font-medium mt-5">
                        Richard Nelson
                    </p>

                    <p className="text-xs">Content Writer</p>

                </motion.div>

                {/* Card 3 */}
                <motion.div
                    variants={card}
                    whileHover={{ scale: 1.05 }}
                    className="flex flex-col items-center bg-white px-3 py-8 rounded-lg border border-gray-300/80 max-w-[272px] text-sm text-center text-gray-500"
                >

                    <div className="relative mb-4">
                        <img
                            className="h-16 w-16 rounded-full"
                            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/userImage/userImage3.png"
                            alt="user"
                        />
                    </div>

                    <p>
                        “Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.”
                    </p>

                    <p className="text-lg text-gray-800 font-medium mt-5">
                        James Washington
                    </p>

                    <p className="text-xs">Content Marketing</p>

                </motion.div>

            </motion.div>
        </motion.div>
    )
}

export default Testimonial