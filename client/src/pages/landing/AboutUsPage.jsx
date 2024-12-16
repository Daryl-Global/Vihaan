import React from "react";

const AboutUsPage = () => {
   return (
    <div>
      <Navbar />

      <header className="bg-gradient-to-r from-gray-700 to-gray-900 text-white py-10 md:py-20">
        <div className="container mx-auto text-center p-2 bg-black bg-opacity-20 backdrop-blur-xl rounded-lg drop-shadow-xl md:w-2/3 ">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Welcome to Vihaan Honda
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Your premier destination for Honda bikes and accessories.
          </p>
          <button
            onClick={() => navigate("/inventory")}
            className="px-6 py-3 bg-white text-gray-700 font-bold rounded-full hover:bg-gray-200"
          >
            Explore Inventory
          </button>
        </div>
      </header>

      <section className="py-8 md:py-16 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1569098335617-1d742b45e3a9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1260&q=80"
                alt="Latest Models"
                className="rounded-lg shadow-md"
              />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center md:text-left">
                Discover the Latest Models
              </h2>
              <p className="text-base md:text-lg mb-6 text-center md:text-left">
                Browse our extensive collection of the newest Honda bikes, including sports, touring, and adventure models.
              </p>
              <div className="text-center md:text-left">
                <button
                  onClick={() => navigate("/models")}
                  className="px-4 py-2 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-800"
                >
                  View Models
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-16 bg-gray-100">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1515777315835-281b94c9589f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1260&q=80"
                alt="Service and Maintenance"
                className="rounded-lg shadow-md"
              />
            </div>
            <div className="md:order-first">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center md:text-right">
                Expert Service and Maintenance
              </h2>
              <p className="text-base md:text-lg mb-6 text-center md:text-right">
                Keep your bike in top condition with our certified service center. From routine maintenance to repairs, we've got you covered.
              </p>
              <div className="text-center md:text-right">
                <button
                  onClick={() => navigate("/service")}
                  className="px-4 py-2 bg-gray-700 text-white font-bold rounded-md hover:bg-gray-800"
                >
                  Book Service
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add more sections as needed for accessories, promotions, and events */}
    </div>
  );
};


export default AboutUsPage;
