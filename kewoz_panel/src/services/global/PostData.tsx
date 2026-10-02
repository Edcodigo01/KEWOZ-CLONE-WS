import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const useApiPost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const postData = async (url: string, bodyData: any, contentType = "application/json") => {
    const token = localStorage.getItem("auth_token")

    try {
      setLoading(true);
      setError(null);

      const headers = { 
        "Content-Type": contentType,
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const apiUrl =  "http://62.72.36.245:3047/api/"


      const response = await axios.post(`${apiUrl}${url}`, bodyData, { headers });

      setData(response.data);
      return response.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, data, postData };
};

export default useApiPost;

