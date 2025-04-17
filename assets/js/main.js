
(function() {
  "use strict";
  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init typed.js
   */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped) {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

 
  new PureCounter();


  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Init swiper sliders
   */
  // s

  // window.addEventListener("load", initSwiper);

  /**
   * Initiate glightbox
   */
  // const glightbox = GLightbox({
  //   selector: '.glightbox'
  // });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

})();

// const apiKey = "sk-kma7SihCNhXvbqBH3t1xCrDjHuWKpiYJHILb2InXM47eUW8M"; // Replace with your Stability AI API key


// async function generateImage() {
//   const prompt = document.getElementById("prompt").value;
//   if (!prompt) {
//     alert("Please enter a description!");
//     return;
//   }

//   const apiUrl = "https://api.stability.ai/v2beta/stable-image/generate/core";
//   // Replace with your Stability AI API key

//   const formData = new FormData();
//   formData.append("prompt", prompt);
//   formData.append("output_format", "png");

//   try {
//     const response = await fetch(apiUrl, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${apiKey}`,
//         Accept: "image/*", // Request the raw image
//       },
//       body: formData,
//     });

//     if (!response.ok) {
//       throw new Error(`Error: ${response.status}`);
//     }

//     const blob = await response.blob();
//     const imageUrl = URL.createObjectURL(blob);

//     // Display the generated image
//     document.getElementById("generated-image").src = imageUrl;
//   } catch (error) {
//     console.error("Error generating image:", error);
//     alert("Something went wrong. Please try again.");
//   }
// }
// async function generateBlinkShotImage() {
//   const prompt = document.getElementById("prompt").value;

//   if (!prompt) {
//     alert("Please enter a description!");
//     return;
//   }

//   const apiUrl = "http://localhost:3000/api/generateImages";
//   const userAPIKey = "YOUR_API_KEY"; // Replace with your API key

//   try {
//     console.log("Sending request to API..."); // Debugging line
//     const response = await fetch(apiUrl, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         prompt,
//         userAPIKey,
//         iterativeMode: false, // Adjust based on your needs
//       }),
//     });

//     console.log("Response status:", response.status); // Debugging line
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error(`Error from API: ${errorText}`);
//       alert(`Error: ${response.status} - ${errorText}`);
//       return;
//     }

//     const data = await response.json();
//     console.log("Response data:", data); // Debugging line

//     const imageUrl = `data:image/png;base64,${data.b64_json}`;
//     document.getElementById("generated-image").src = imageUrl;
//     document.getElementById("image-container").style.display = "block";
//   } catch (error) {
//     console.error("Error generating image:", error.message);
//     alert(`Something went wrong: ${error.message}`);
//   }
// }