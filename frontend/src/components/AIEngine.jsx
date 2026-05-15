import { useEffect, useState } from "react";

import axios from "axios";

const AIEngine = ({
  datasetData,
  setAIResults
}) => {

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (!datasetData) return;

    generateInsights();

  }, [datasetData]);

  // =====================================================
  // GENERATE AI INSIGHTS
  // =====================================================

  const generateInsights = async () => {

    setLoading(true);

    try {

      const response = await axios.post(

        "http://localhost:8000/api/ai/recommendations",

        {

          file_path:
            datasetData.metadata.file_path,

          schema:
            datasetData.schema,

          metadata:
            datasetData.metadata

        }

      );

      setAIResults(response.data);

    } catch (err) {

      console.error(
        "AI Engine Error:",
        err
      );

    } finally {

      setLoading(false);

    }

  };

  return null;
};

export default AIEngine;