import { useEffect, useState } from "react";

import axios from "axios";

const AIEngine = ({
  datasetData,
  setAIResults,
  aiResultsSourcePath,
  setAIResultsSourcePath,
  setAILoading
}) => {

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (!datasetData) return;

    if (
      aiResultsSourcePath &&
      aiResultsSourcePath === datasetData.metadata.file_path
    ) {
      return;
    }

    generateInsights();

  }, [datasetData, aiResultsSourcePath]);

  // =====================================================
  // GENERATE AI INSIGHTS
  // =====================================================

  const generateInsights = async () => {

    setLoading(true);
    if (setAILoading) setAILoading(true);

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
      if (setAIResultsSourcePath) {
        setAIResultsSourcePath(datasetData.metadata.file_path);
      }

    } catch (err) {

      console.error(
        "AI Engine Error:",
        err
      );

    } finally {

      setLoading(false);
      if (setAILoading) setAILoading(false);

    }

  };

  return null;
};

export default AIEngine;