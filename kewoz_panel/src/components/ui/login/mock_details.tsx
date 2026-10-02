

import React, { useEffect } from "react";
import Hello from '/assets/wave.png'
import Mock_details_image from '/assets/mock_details_background.png'
import { useProjectConfigStore } from "@/stores/useProjectConfigStore";

function mock_details() {
  const { config, isLoading, error, fetchConfig } = useProjectConfigStore()

  useEffect(() => {
    if (!config) {
      fetchConfig();
    }
  }, [config, fetchConfig]);
  return (
    <div
      className="relative top-0 left-0 flex items-center justify-center  text-black  w-full h-screen lg:h-full lg:block  bg-primary "
    // style={{background:"linear-gradient(213deg, #6C47B7 -27.59%, #341F60 105.15%)"}}
    >
      {/* Blended Foreground Image */}
      {/* Background Blend */}
      <div className="absolute inset-0 flex items-center justify-center opacity-50">
        <img
          // src="/assets/mock_details_background.png"
          src={Mock_details_image}

          className="object-cover w-full h-full"
          alt="Blended Background"
        />
      </div>

      {/* Decorative Elements */}
      {/* <div className="absolute bottom-0">
        <img 
          src={IMAGES.ui.icons.google} // Replace with your curves image path in config
          className="2xl:w-[800px] 2xl:h-[800px] xl:w-[600px] xl:h-[600px]" 
          alt="Decorative curves"
        />
      </div> */}

      {/* Top Right Decor */}
      {/* <div className="absolute top-28 right-[-80px]">
        <img 
          src={IMAGES.ui.icons.github} // Replace with your top right image path
          className="w-56 h-56" 
          alt="Top right decoration"
        />
      </div> */}

      {/* Decorative Stars */}
      {/* <div className="absolute 2xl:top-72 2xl:left-20 lg:left-10 lg:bottom-96">
        <img 
          src={IMAGES.ui.icons.microsoft} // Replace with your star1 image path
          className="w-28 h-28" 
          alt="Decorative star 1"
        />
      </div>

      <div className="absolute 2xl:top-[350px] 2xl:right-[456px] lg:right-[200px] lg:bottom-[350px] xl:right-[250px]">
        <img 
          src={IMAGES.ui.avatar.default} // Replace with your star2 image path
          className="w-20 h-20" 
          alt="Decorative star 2"
        />
      </div> */}

      {/* <div className="absolute 2xl:bottom-[350px] 2xl:right-48 lg:right-20 lg:bottom-[250px]">
        <img 
          src={IMAGES.ui.avatar.placeholder} // Replace with your star3 image path
          className="w-16 h-16" 
          alt="Decorative star 3"
        />
      </div>  */}

      {/* Text Overlay */}
      <div className="relative z-10 px-6 text-left 2xl:top-[520px] lg:top-[520px] xl:top-[500px] left-16">
        <div className="flex gap-2 place-items-center">
          <h1 className="font-semibold text-left 2xl:text-5xl lg:text-5xl xl:text-3xl font-poppins">Hola</h1>
          <img src={Hello} alt="hola" className="w-6 h-6" />

        </div>
        <div className="py-4 text-left">
          <p className="max-w-md 2xl:text-xl lg:text-xl xl:text-base ">Olvídate de las tareas manuales y repetitivas</p>
          <p className="max-w-md 2xl:text-xl lg:text-xl xl:text-base">de marketing. Sé más productivo gracias</p>
          <p className="max-w-md 2xl:text-xl lg:text-xl xl:text-base">a la automatización y ahorra mucho</p>
          <p className="max-w-md 2xl:text-xl lg:text-xl xl:text-base">tiempo</p>
        </div>
      </div>


      <p className="absolute bottom-10 w-full text-center left-1/2 transform -translate-x-1/2 text-opacity-[41%]">
        {config?.copyright_text}
      </p>
    </div>
  );
}

export default mock_details;
