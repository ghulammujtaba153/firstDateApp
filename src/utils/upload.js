import axios from "axios";

const upload = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "crowdfunding");

  try {
    const res = await axios.post("https://api.cloudinary.com/v1_1/dzxeejcgl/upload", data);

    const { url } = res.data;
    return url;
  } catch (err) {
    console.log(err);
  }
};





export default upload;




// import axios from "axios";

// const upload = async (file: any) => {
//   const data = new FormData();
//   data.append("file", file);
//   data.append("upload_preset", "crowdfunding");

//   try {
//     const res = await axios.post(
//       "https://api.cloudinary.com/v1_1/dzxeejcgl/raw/upload", // 👈 use raw instead of image
//       data
//     );

//     // Cloudinary returns "secure_url" for public access
//     const { secure_url } = res.data;
//     return secure_url;
//   } catch (err) {
//     console.error(err);
//   }
// };

// export default upload;
