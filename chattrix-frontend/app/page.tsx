'use client'
import { useState, useEffect } from "react";
import axios from "axios";
export default function Home(): JSX.Element {
  const [data, setData] = useState<any>("");

  const fetchData = async () => {
    try {
      const response = await axios.get("https://chattrix-backend.test/api/register");
      setData(response.data);
    }
    catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        // Handle HTTP errors (like 4xx or 5xx)
        console.error("Error fetching data:", error.response.data);
      } else {
        // Handle network errors or other issues
        console.error("An unexpected error occurred:", error.message);
      }
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log(data);
  }, [data]);
  return (
    <main>


    </main>
  );
}